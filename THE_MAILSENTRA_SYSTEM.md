# The MailSentra System
## Complete Technical Documentation

This document explains how MailSentra works from architecture to implementation, covering how each component functions and how they integrate to create a production-ready spam detection system.

---

## Table of Contents

1. System Architecture Overview
2. Backend Architecture and Components
3. Machine Learning Pipeline
4. Frontend Architecture
5. Database Design and Models
6. Authentication and Security
7. API Design and Request Flow
8. Performance Optimization
9. Deployment Architecture

---

## 1. System Architecture Overview

MailSentra follows a three-tier architecture:

```
Client (React) → API Layer (FastAPI) → Data Layer (PostgreSQL/SQLite)
                      ↓
              ML Service (Scikit-learn)
```

### Component Interaction Flow

When a user analyzes an email:

1. **Frontend** sends POST request to `/api/analyze` with email text
2. **FastAPI** validates request, authenticates user via JWT
3. **Model Service** loads pre-trained model from disk (singleton pattern)
4. **Preprocessor** cleans and normalizes email text
5. **Vectorizer** converts text to numerical features (TF-IDF)
6. **Model** predicts spam/ham with confidence score
7. **Database** stores analysis result in spam_logs table
8. **Response** returns classification result to frontend

### Technology Stack

- **Backend**: FastAPI (Python 3.13+), SQLAlchemy ORM, Alembic migrations
- **ML**: Scikit-learn (Naive Bayes), NLTK (preprocessing), TF-IDF vectorization
- **Frontend**: React 18, Vite, Tailwind CSS, Recharts
- **Database**: PostgreSQL (production), SQLite (development)
- **Authentication**: JWT tokens, bcrypt password hashing

---

## 2. Backend Architecture and Components

### Directory Structure

```
backend/app/
├── models/          # SQLAlchemy ORM models (database schema)
├── routes/          # API endpoint handlers
├── services/        # Business logic (ML, preprocessing, auth)
├── utils/           # Utilities (security, sanitization, logging)
├── config.py        # Configuration management
├── database.py      # Database connection and session management
└── dependencies.py  # FastAPI dependency injection
```

### Core Components

#### 2.1 Configuration System (`app/config.py`)

Centralized configuration using Pydantic Settings:

```python
class Settings(BaseSettings):
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./spam_detector.db")
    BACKEND_CORS_ORIGINS: List[str] = os.getenv("BACKEND_CORS_ORIGINS", "...").split(",")
```

**Key Features**:
- Environment variable loading with defaults
- Production validation (fails if SECRET_KEY not set)
- Type-safe configuration with Pydantic

#### 2.2 Database Layer (`app/database.py`)

SQLAlchemy connection management:

```python
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

**How it works**:
- Creates database engine with connection pooling
- Session factory for database sessions
- Dependency injection pattern for FastAPI routes
- Automatic session cleanup after request

#### 2.3 Request Flow

```
HTTP Request
    ↓
FastAPI Router (routes/*.py)
    ↓
Dependency Injection (get_current_user, get_db)
    ↓
Service Layer (services/*.py)
    ↓
Database Operation (models/*.py via SQLAlchemy)
    ↓
Response Serialization (Pydantic models)
    ↓
HTTP Response
```

---

## 3. Machine Learning Pipeline

### 3.1 Model Service (`app/services/model_service.py`)

Singleton pattern ensures model loaded once at startup:

```python
class SpamDetectionModel:
    def __init__(self, model_path: str = "ml_models/spam_model.pkl"):
        self.model = None
        self.vectorizer = None
        self.metadata = None
        self.load_model()
    
    def predict(self, email_text: str) -> Dict[str, Any]:
        # 1. Preprocess email
        preprocessed = email_preprocessor.preprocess_email(email_text)
        
        # 2. Vectorize text
        text_vectorized = self.vectorizer.transform([processed_text])
        
        # 3. Predict
        prediction = self.model.predict(text_vectorized)[0]
        probabilities = self.model.predict_proba(text_vectorized)[0]
        
        # 4. Return result
        return {"result": prediction, "confidence": max(probabilities)}
```

**Key Points**:
- Model loaded once at application startup
- In-memory prediction (no disk I/O per request)
- Returns confidence scores for uncertainty handling

### 3.2 Preprocessing Pipeline (`app/services/preprocessing.py`)

Text normalization pipeline:

```python
def preprocess_email(email_content: str) -> Dict[str, Any]:
    # Step 1: Remove HTML tags
    step1 = remove_html(email_content)
    
    # Step 2: Remove URLs
    step2 = remove_urls(step1)
    
    # Step 3: Remove email addresses
    step3 = remove_emails(step2)
    
    # Step 4: Convert to lowercase
    step4 = to_lowercase(step3)
    
    # Step 5: Remove symbols
    step5 = remove_symbols(step4)
    
    # Step 6: Remove stopwords
    step6 = remove_stopwords(step5)
    
    # Step 7: Tokenize
    tokens = tokenize(step6)
    
    return {"final_processed_text": step6, "tokens": tokens}
```

**Why each step**:
- HTML removal: Emails often contain HTML formatting
- URL removal: Spam emails frequently contain URLs
- Lowercase: Normalize text for consistent feature extraction
- Symbol removal: Focus on words, not punctuation
- Stopword removal: Common words don't help classification
- Tokenization: Break text into individual words

### 3.3 Training Process

Model training workflow:

1. **Load Dataset**: CSV with `label` and `message` columns
2. **Preprocess**: Apply same preprocessing pipeline
3. **Feature Extraction**: TF-IDF vectorization (5000 features, 1-2 grams)
4. **Train Model**: Multinomial Naive Bayes classifier
5. **Evaluate**: Calculate accuracy, precision, recall
6. **Serialize**: Save model, vectorizer, and metadata to pickle file

**Model Storage Format**:
```python
{
    'model': <NaiveBayesClassifier>,
    'vectorizer': <TfidfVectorizer>,
    'version': '1.0.0',
    'accuracy': 0.9534,
    'algorithm': 'MultinomialNB',
    'trained_at': '2025-01-XX'
}
```

### 3.4 Retraining with Feedback

Continuous learning process:

1. Collect user feedback (misclassified samples)
2. Combine with original training dataset (prevents catastrophic forgetting)
3. Retrain model on combined dataset
4. Validate performance improvement
5. Deploy new model version

**Why combine datasets**: Prevents model from "forgetting" original patterns when learning new ones.

---

## 4. Frontend Architecture

### 4.1 Component Structure

```
frontend/src/
├── components/
│   ├── auth/        # Login, Register, ProtectedRoute
│   ├── dashboard/   # AnalyzeEmail, LogsTable, StatsCard
│   ├── admin/       # AdminPanel components
│   └── common/      # Navbar, Toast, ErrorBoundary
├── pages/           # Page-level components
├── context/         # React Context (Auth, Toast)
├── services/        # API client functions
└── utils/           # Helpers, constants, formatters
```

### 4.2 State Management

React Context for global state:

```javascript
// AuthContext.jsx
const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(localStorage.getItem('token'))
    
    const login = async (email, password) => {
        const response = await authService.login(email, password)
        setToken(response.access_token)
        localStorage.setItem('token', response.access_token)
        // ... fetch user data
    }
    
    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}
```

**Why Context**: Simple state management without Redux complexity, sufficient for this application.

### 4.3 API Client (`services/api.js`)

Centralized HTTP client:

```javascript
import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json'
    }
})

// Request interceptor: Add JWT token
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Response interceptor: Handle errors
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            // Redirect to login
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)
```

### 4.4 Responsive Design

Mobile-first approach with Tailwind CSS:

```javascript
// AdminPage.jsx - Responsive chart
const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

<ResponsiveContainer width="100%" height={isMobile ? 200 : 300}>
    <PieChart>
        <Pie 
            outerRadius={isMobile ? 50 : 80}
            label={isMobile ? false : labelFunction}
        />
    </PieChart>
</ResponsiveContainer>
```

**Responsive Patterns**:
- Mobile: Card layouts, smaller charts, overlay sidebar
- Desktop: Tables, larger charts, fixed sidebar
- Breakpoint: 768px (md in Tailwind)

---

## 5. Database Design and Models

### 5.1 Entity Relationship

```
User (1) ──< (N) SpamLog
User (1) ──< (N) UserFeedback
User (1) ──< (N) APIKey
SpamLog (1) ──< (N) UserFeedback
```

### 5.2 Core Models

#### User Model (`app/models/user.py`)

```python
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=get_nairobi_time)
    
    # Relationships
    spam_logs = relationship("SpamLog", back_populates="user")
    feedbacks = relationship("UserFeedback", back_populates="user")
```

**Key Design Decisions**:
- Separate `hashed_password` field (never store plaintext)
- `is_active` flag for soft deletion
- `is_admin` for role-based access control
- Timezone-aware timestamps

#### SpamLog Model (`app/models/spam_log.py`)

```python
class SpamLog(Base):
    __tablename__ = "spam_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    email_text = Column(Text, nullable=False)
    result = Column(String, nullable=False)  # "spam" or "ham"
    confidence = Column(Float, nullable=False)
    model_version = Column(String, nullable=True)
    is_correct = Column(Boolean, nullable=True)  # After feedback
    created_at = Column(DateTime(timezone=True), default=get_nairobi_time)
    
    user = relationship("User", back_populates="spam_logs")
```

**Why these fields**:
- `email_text`: Store truncated version (500 chars) for history
- `confidence`: Track model certainty for analysis
- `model_version`: Track which model version made prediction
- `is_correct`: Flag for feedback-based retraining

### 5.3 Database Migrations

Alembic handles schema changes:

```bash
# Create migration
alembic revision --autogenerate -m "add_api_keys_table"

# Apply migration
alembic upgrade head

# Rollback
alembic downgrade -1
```

**Migration Structure**:
```python
def upgrade():
    op.create_table('api_keys',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('key', sa.String(), nullable=False),
        # ...
    )

def downgrade():
    op.drop_table('api_keys')
```

---

## 6. Authentication and Security

### 6.1 JWT Authentication Flow

```
1. User submits email/password
2. Backend verifies credentials
3. Generate JWT token with payload:
   {
     "sub": user.email,
     "is_admin": user.is_admin,
     "user_id": user.id,
     "exp": expiration_timestamp
   }
4. Return token to client
5. Client stores in localStorage
6. Client includes in Authorization header: "Bearer <token>"
7. Backend validates token on each request
```

### 6.2 Password Hashing (`app/utils/security.py`)

```python
from passlib.context import CryptContext

pwd_context = CryptContext(
    schemes=["pbkdf2_sha256", "bcrypt"],
    deprecated="auto"
)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
```

**Security Features**:
- Uses pbkdf2_sha256 (primary) or bcrypt (legacy support)
- Automatic salt generation
- One-way hashing (cannot reverse)

### 6.3 Input Sanitization (`app/utils/sanitize.py`)

Prevents XSS and injection attacks:

```python
def sanitize_text(text: str, max_length: Optional[int] = None) -> str:
    # Escape HTML entities
    sanitized = html.escape(text)
    
    # Remove script tags
    sanitized = re.sub(r'<script[^>]*>.*?</script>', '', sanitized)
    
    # Remove event handlers
    sanitized = re.sub(r'on\w+\s*=', '', sanitized)
    
    return sanitized
```

### 6.4 Security Headers

Middleware adds security headers to all responses:

```python
class SecurityHeadersMiddleware:
    async def __call__(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Strict-Transport-Security"] = "max-age=31536000"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        return response
```

**What each header does**:
- `X-Content-Type-Options`: Prevents MIME type sniffing
- `X-Frame-Options`: Prevents clickjacking
- `Strict-Transport-Security`: Forces HTTPS
- `Content-Security-Policy`: Restricts resource loading

### 6.5 Rate Limiting

SlowAPI limits request frequency:

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@router.post("/analyze")
@limiter.limit("60/minute")
def analyze_email(request: Request, ...):
    # ...
```

**Protection**:
- 60 requests per minute per IP
- Prevents brute force attacks
- Protects against DoS

---

## 7. API Design and Request Flow

### 7.1 RESTful Endpoint Structure

```
/api/auth/
    POST /register      # Create new user
    POST /login         # Authenticate, get JWT
    GET  /me            # Get current user info
    POST /logout        # Invalidate session

/api/analyze
    POST /analyze       # Classify email as spam/ham

/api/logs
    GET  /logs          # Get user's analysis history
    GET  /logs/{id}     # Get specific log
    DELETE /logs/{id}   # Delete log

/api/feedback
    POST /feedback      # Submit correction
    GET  /feedback      # Get user feedback

/api/admin/
    GET  /users         # List all users (admin only)
    GET  /stats         # System statistics
    GET  /spam-logs     # All spam logs
```

### 7.2 Request/Response Flow Example

**Analyze Email Request**:

```http
POST /api/analyze HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "email_text": "Congratulations! You've won $1,000,000!"
}
```

**Response**:

```json
{
  "result": "spam",
  "confidence": 0.9534,
  "is_spam": true,
  "message": "Email classified as SPAM with 95.34% confidence",
  "model_version": "1.0.0",
  "processed_text": "congratulations won",
  "original_length": 45,
  "processed_length": 20
}
```

### 7.3 Error Handling

Standardized error responses:

```python
try:
    # Business logic
except HTTPException:
    raise  # Re-raise FastAPI exceptions
except Exception as e:
    logger.error(f"Unexpected error: {e}")
    raise HTTPException(
        status_code=500,
        detail="Internal server error"
    )
```

**Error Response Format**:
```json
{
  "detail": "Error message describing what went wrong"
}
```

---

## 8. Performance Optimization

### 8.1 Model Caching

Model loaded once at startup, reused for all predictions:

```python
# Global singleton instance
spam_model = SpamDetectionModel()

# Loaded once at application startup
# All requests use same instance (no reload overhead)
```

**Performance Impact**:
- Startup: ~1-2 seconds to load model
- Per-request: <50ms prediction time
- Memory: ~50-100MB for model in RAM

### 8.2 Database Optimization

**Indexes**:
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_spam_logs_user_id ON spam_logs(user_id);
CREATE INDEX idx_spam_logs_created_at ON spam_logs(created_at DESC);
```

**Query Optimization**:
- Use `filter()` instead of loading all records
- Pagination with `offset()` and `limit()`
- Eager loading relationships when needed

**Example Optimized Query**:
```python
# Bad: Loads all logs
logs = db.query(SpamLog).all()

# Good: Paginated, filtered
logs = db.query(SpamLog)\
    .filter(SpamLog.user_id == user_id)\
    .order_by(SpamLog.created_at.desc())\
    .offset(skip)\
    .limit(limit)\
    .all()
```

### 8.3 Frontend Optimization

**Code Splitting**:
- React Router lazy loading
- Component-level code splitting
- Dynamic imports for heavy components

**Asset Optimization**:
- Vite build optimization
- Tree shaking (removes unused code)
- Minification and compression

**Caching Strategy**:
- API responses cached in React state
- localStorage for user data
- No unnecessary re-renders (React.memo)

### 8.4 API Response Times

Typical response times:

- Authentication: 50-100ms
- Email analysis: 100-200ms (includes ML prediction)
- Log retrieval: 50-150ms (depends on data size)
- Admin stats: 200-500ms (aggregation queries)

**Bottlenecks**:
- Database queries (mitigated with indexes)
- ML prediction (optimized with caching)
- Network latency (minimized with connection pooling)

---

## 9. Deployment Architecture

### 9.1 Development Setup

```
Local Machine
├── Frontend (Vite dev server :5173)
├── Backend (Uvicorn :8000)
└── SQLite Database (file-based)
```

### 9.2 Production Architecture

```
Internet
    ↓
Load Balancer / Reverse Proxy (Nginx)
    ↓
┌─────────────────┬─────────────────┐
│  Frontend       │  Backend API    │
│  (Static Files) │  (FastAPI)      │
│  Nginx/S3       │  Gunicorn       │
└─────────────────┴─────────────────┘
                      ↓
              PostgreSQL Database
                      ↓
              ML Models (File Storage)
```

### 9.3 Environment Configuration

**Development** (`.env`):
```
DATABASE_URL=sqlite:///./spam_detector.db
SECRET_KEY=dev-secret-key-min-32-chars
ENVIRONMENT=development
```

**Production** (Environment Variables):
```
DATABASE_URL=postgresql://user:pass@host:5432/db
SECRET_KEY=<generated-secure-key-32+chars>
ENVIRONMENT=production
BACKEND_CORS_ORIGINS=https://yourdomain.com
```

### 9.4 Docker Deployment

**docker-compose.yml**:
```yaml
services:
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: mailsentra
      POSTGRES_USER: mailsentra
      POSTGRES_PASSWORD: ${DB_PASSWORD}
  
  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://mailsentra:${DB_PASSWORD}@db:5432/mailsentra
      SECRET_KEY: ${SECRET_KEY}
    depends_on:
      - db
  
  frontend:
    build: ./frontend
    environment:
      VITE_API_URL: http://backend:8000
```

---

## 10. System Integration Points

### 10.1 How Components Work Together

**Complete Request Flow**:

```
1. User enters email in React form
   ↓
2. Frontend sends POST /api/analyze with JWT token
   ↓
3. FastAPI receives request
   ↓
4. Dependency injection: get_current_user validates JWT
   ↓
5. Dependency injection: get_db provides database session
   ↓
6. Route handler calls spam_model.predict(email_text)
   ↓
7. Model service preprocesses text
   ↓
8. Model service vectorizes text
   ↓
9. Model service runs prediction
   ↓
10. Route handler saves result to database
   ↓
11. Route handler returns JSON response
   ↓
12. Frontend receives response, updates UI
```

### 10.2 Data Flow

**Training Data Flow**:
```
CSV Dataset → Preprocessing → Vectorization → Model Training → Serialization → Model File
```

**Prediction Data Flow**:
```
Email Text → Preprocessing → Vectorization → Model Prediction → Database Storage → API Response
```

**Feedback Loop**:
```
User Feedback → Database Storage → Feedback Collection → Retraining → New Model Version
```

---

## 11. Key Design Decisions

### Why FastAPI?
- Async support for high concurrency
- Automatic API documentation (OpenAPI/Swagger)
- Type safety with Pydantic
- Fast performance (comparable to Node.js)

### Why Naive Bayes?
- Fast training and prediction
- Works well with text classification
- Low memory footprint
- Easy to interpret and debug

### Why React?
- Component reusability
- Rich ecosystem
- Virtual DOM for performance
- Excellent developer experience

### Why PostgreSQL?
- ACID compliance
- Advanced features (JSON, full-text search)
- Scalability
- Strong community support

---

## 12. System Limitations and Future Improvements

### Current Limitations

1. **Model**: Naive Bayes is simple but may not capture complex patterns
2. **Scalability**: Single server deployment (no horizontal scaling yet)
3. **Real-time**: No WebSocket support for live updates
4. **Caching**: No Redis cache layer
5. **Monitoring**: Basic logging, no advanced metrics

### Potential Improvements

1. **Advanced ML**: Deep learning models (LSTM, Transformers)
2. **Microservices**: Split into separate services
3. **Caching**: Redis for frequently accessed data
4. **Queue System**: Celery for async tasks (retraining)
5. **Monitoring**: Prometheus + Grafana for metrics
6. **CDN**: CloudFront for static assets
7. **Load Balancing**: Multiple backend instances

---

## Conclusion

MailSentra demonstrates a complete full-stack ML application with:

- Clean architecture and separation of concerns
- Production-ready security practices
- Efficient ML pipeline with continuous learning
- Responsive frontend with modern UX
- Scalable database design
- Comprehensive API design

The system is designed to be maintainable, secure, and performant while remaining understandable and extensible.

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-XX  
**System Version**: 1.0.0

