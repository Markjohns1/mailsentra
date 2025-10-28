# System Architecture

Comprehensive overview of MailSentra's architecture, design decisions, and component interactions.

---

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Backend Architecture](#backend-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Database Design](#database-design)
- [ML Pipeline](#ml-pipeline)
- [Security Architecture](#security-architecture)
- [Deployment Architecture](#deployment-architecture)

---

## Overview

MailSentra follows a **three-tier architecture** pattern:

1. **Presentation Layer**: React-based SPA
2. **Application Layer**: FastAPI REST API
3. **Data Layer**: PostgreSQL/SQLite database

### Design Principles

- **API-First**: Backend designed as RESTful API
- **Separation of Concerns**: Clear boundaries between layers
- **Scalability**: Stateless design for horizontal scaling
- **Security**: Defense in depth approach
- **Maintainability**: Modular, testable code

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                         Client Layer                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  Browser   │  │   Mobile   │  │  API Client│            │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘            │
└────────┼────────────────┼────────────────┼───────────────────┘
         │                │                │
         └────────────────┴────────────────┘
                          │
                  ┌───────▼────────┐
                  │  Load Balancer │
                  │     (Nginx)    │
                  └───────┬────────┘
                          │
         ┌────────────────┴────────────────┐
         │                                  │
┌────────▼─────────┐              ┌────────▼─────────┐
│   Frontend       │              │    Backend       │
│   (React/Vite)   │              │   (FastAPI)      │
│                  │              │                  │
│  - React Router  │              │  - API Routes    │
│  - Axios Client  │              │  - Auth Service  │
│  - State Mgmt    │              │  - ML Service    │
│  - UI Components │              │  - Business Logic│
└──────────────────┘              └────────┬─────────┘
                                           │
                          ┌────────────────┴──────────────┐
                          │                               │
                  ┌───────▼────────┐            ┌────────▼────────┐
                  │   PostgreSQL   │            │   ML Pipeline   │
                  │    Database    │            │  (Scikit-learn) │
                  │                │            │                 │
                  │  - User Data   │            │  - Model Files  │
                  │  - Logs        │            │  - Vectorizer   │
                  │  - Feedback    │            │  - Preprocessor │
                  └────────────────┘            └─────────────────┘

---

## Backend Architecture

### Component Structure

```
backend/app/
â”œâ”€â”€ models/          # SQLAlchemy ORM models
â”‚   â”œâ”€â”€ user.py
â”‚   â”œâ”€â”€ spam_log.py
â”‚   â”œâ”€â”€ feedback.py
â”‚   â””â”€â”€ email.py
â”‚
â”œâ”€â”€ routes/          # API endpoint handlers
â”‚   â”œâ”€â”€ auth.py      # Authentication endpoints
â”‚   â”œâ”€â”€ analyze.py   # Email analysis
â”‚   â”œâ”€â”€ logs.py      # Log management
â”‚   â”œâ”€â”€ feedback.py  # Feedback system
â”‚   â”œâ”€â”€ retrain.py   # Model retraining
â”‚   â”œâ”€â”€ metrics.py   # Analytics
â”‚   â””â”€â”€ admin.py     # Admin operations
â”‚
â”œâ”€â”€ services/        # Business logic layer
â”‚   â”œâ”€â”€ model_service.py      # ML model operations
â”‚   â”œâ”€â”€ preprocessing.py      # Text preprocessing
â”‚   â”œâ”€â”€ auth_service.py       # Authentication logic
â”‚   â””â”€â”€ email_service.py      # Email operations
â”‚
â”œâ”€â”€ utils/           # Helper functions
â”‚   â”œâ”€â”€ logger.py    # Logging configuration
â”‚   â””â”€â”€ security.py  # Security utilities
â”‚
â”œâ”€â”€ config.py        # Configuration management
â”œâ”€â”€ database.py      # Database connection
â””â”€â”€ dependencies.py  # FastAPI dependencies
```

### Request Flow

```
1. Client Request
   â”‚
   â–¼
2. FastAPI Router (routes/)
   â”‚
   â–¼
3. Authentication Middleware (dependencies.py)
   â”‚
   â–¼
4. Request Validation (Pydantic)
   â”‚
   â–¼
5. Business Logic (services/)
   â”‚
   â–¼
6. Database Operation (models/)
   â”‚
   â–¼
7. Response Serialization
   â”‚
   â–¼
8. Client Response
```

### Key Components

#### 1. Authentication System
- **JWT-based**: Stateless token authentication
- **Password Hashing**: bcrypt with salt
- **Token Expiration**: Configurable (default: 30 minutes)
- **Role-Based Access**: User and Admin roles

#### 2. ML Service
- **Model**: Naive Bayes classifier
- **Vectorization**: TF-IDF
- **Preprocessing**: NLTK, BeautifulSoup
- **Caching**: In-memory model cache

#### 3. Database Layer
- **ORM**: SQLAlchemy
- **Migrations**: Alembic
- **Connection Pool**: Async-compatible
- **Query Optimization**: Indexed fields, lazy loading

---

## Frontend Architecture

### Component Structure

```
frontend/src/
â”œâ”€â”€ components/
â”‚   â”œâ”€â”€ auth/
â”‚   â”‚   â”œâ”€â”€ Login.jsx
â”‚   â”‚   â”œâ”€â”€ Register.jsx
â”‚   â”‚   â””â”€â”€ ProtectedRoute.jsx
â”‚   â”‚
â”‚   â”œâ”€â”€ dashboard/
â”‚   â”‚   â”œâ”€â”€ Dashboard.jsx
â”‚   â”‚   â”œâ”€â”€ AnalyzeEmail.jsx
â”‚   â”‚   â”œâ”€â”€ LogsTable.jsx
â”‚   â”‚   â””â”€â”€ StatsCard.jsx
â”‚   â”‚
â”‚   â””â”€â”€ common/
â”‚       â”œâ”€â”€ Navbar.jsx
â”‚       â”œâ”€â”€ Toast.jsx
â”‚       â””â”€â”€ Loading.jsx
â”‚
â”œâ”€â”€ context/
â”‚   â”œâ”€â”€ AuthContext.jsx      # Authentication state
â”‚   â””â”€â”€ ToastContext.jsx     # Notifications
â”‚
â”œâ”€â”€ services/
â”‚   â”œâ”€â”€ api.js               # Axios instance
â”‚   â”œâ”€â”€ authService.js       # Auth API calls
â”‚   â””â”€â”€ logsService.js       # Logs API calls
â”‚
â””â”€â”€ utils/
    â”œâ”€â”€ constants.js
    â””â”€â”€ helpers.js
```

### State Management

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  AuthContext    â”‚  - User authentication state
â”‚  (React Context)â”‚  - Login/logout methods
â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜  - Token management
         â”‚
         â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Components     â”‚  - Consume context
â”‚                 â”‚  - Trigger actions
â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜  - Display UI
         â”‚
         â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  API Service    â”‚  - HTTP requests
â”‚  (Axios)        â”‚  - Error handling
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  - Token injection
```

### Routing Strategy

```javascript
/                    â†’ Landing/Login
/register            â†’ User registration
/dashboard           â†’ Protected dashboard (requires auth)
/dashboard/analyze   â†’ Email analysis
/dashboard/logs      â†’ Analysis history
/admin               â†’ Admin panel (requires admin role)
```

---

## Database Design

### Entity Relationship Diagram

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚      User       â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ id (PK)         â”‚
â”‚ username        â”‚
â”‚ email           â”‚
â”‚ password_hash   â”‚
â”‚ is_active       â”‚
â”‚ is_admin        â”‚
â”‚ created_at      â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜
         â”‚ 1
         â”‚
         â”‚ N
         â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚    SpamLog      â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ id (PK)         â”‚
â”‚ user_id (FK)    â”‚â”€â”€â”
â”‚ email_text      â”‚  â”‚
â”‚ result          â”‚  â”‚
â”‚ confidence      â”‚  â”‚
â”‚ analyzed_at     â”‚  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
         â”‚ 1         â”‚
         â”‚           â”‚
         â”‚ 1         â”‚
         â–¼           â”‚
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚    Feedback     â”‚  â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤  â”‚
â”‚ id (PK)         â”‚  â”‚
â”‚ log_id (FK)     â”‚â”€â”€â”˜
â”‚ user_id (FK)    â”‚
â”‚ correct_label   â”‚
â”‚ submitted_at    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Table Definitions

#### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
```

#### SpamLog Table
```sql
CREATE TABLE spam_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    email_text TEXT NOT NULL,
    result VARCHAR(10) NOT NULL,
    confidence FLOAT NOT NULL,
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_spam_logs_user_id ON spam_logs(user_id);
CREATE INDEX idx_spam_logs_result ON spam_logs(result);
CREATE INDEX idx_spam_logs_analyzed_at ON spam_logs(analyzed_at DESC);
```

#### Feedback Table
```sql
CREATE TABLE feedback (
    id SERIAL PRIMARY KEY,
    log_id INTEGER REFERENCES spam_logs(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    correct_label VARCHAR(10) NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(log_id, user_id)
);

CREATE INDEX idx_feedback_log_id ON feedback(log_id);
CREATE INDEX idx_feedback_user_id ON feedback(user_id);
```

---

## ML Pipeline

### Training Pipeline

```
1. Data Loading
   â”œâ”€ Load SMS Spam Collection dataset
   â”œâ”€ Parse CSV format
   â””â”€ Split into train/test (80/20)
         â”‚
         â–¼
2. Preprocessing
   â”œâ”€ Remove HTML tags
   â”œâ”€ Remove special characters
   â”œâ”€ Convert to lowercase
   â”œâ”€ Remove stopwords (NLTK)
   â”œâ”€ Tokenization
   â””â”€ Stemming/Lemmatization
         â”‚
         â–¼
3. Feature Extraction
   â”œâ”€ TF-IDF Vectorization
   â”œâ”€ Max features: 5000
   â”œâ”€ N-gram range: (1, 2)
   â””â”€ Min/Max document frequency
         â”‚
         â–¼
4. Model Training
   â”œâ”€ Algorithm: Naive Bayes (MultinomialNB)
   â”œâ”€ Hyperparameter tuning
   â”œâ”€ Cross-validation (5-fold)
   â””â”€ Performance metrics
         â”‚
         â–¼
5. Model Evaluation
   â”œâ”€ Accuracy: 95.3%
   â”œâ”€ Precision: 94.8%
   â”œâ”€ Recall: 96.1%
   â””â”€ F1-Score: 95.4%
         â”‚
         â–¼
6. Model Serialization
   â”œâ”€ Save model: spam_model.pkl
   â”œâ”€ Save vectorizer: vectorizer.pkl
   â”œâ”€ Save metadata: model_info.json
   â””â”€ Version tracking
```

### Prediction Pipeline

```
Input Email Text
      â”‚
      â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Preprocessing  â”‚
â”‚  - Clean HTML   â”‚
â”‚  - Normalize    â”‚
â”‚  - Tokenize     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜
         â”‚
         â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Vectorization  â”‚
â”‚  - TF-IDF       â”‚
â”‚  - Transform    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜
         â”‚
         â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Prediction     â”‚
â”‚  - Classify     â”‚
â”‚  - Get proba    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜
         â”‚
         â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Result         â”‚
â”‚  - Label        â”‚
â”‚  - Confidence   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Retraining Process

```
1. Collect Feedback
   â”œâ”€ Query feedback table
   â”œâ”€ Filter by date range
   â””â”€ Minimum threshold: 50 samples
         â”‚
         â–¼
2. Prepare Dataset
   â”œâ”€ Merge with original data
   â”œâ”€ Balance classes
   â””â”€ Shuffle data
         â”‚
         â–¼
3. Retrain Model
   â”œâ”€ Use same pipeline
   â”œâ”€ Validate on holdout set
   â””â”€ Compare metrics
         â”‚
         â–¼
4. Deploy New Model
   â”œâ”€ Backup old model
   â”œâ”€ Save new model
   â”œâ”€ Update version
   â””â”€ Log performance
```

---

## Security Architecture

### Authentication Flow

```
1. User Login
   â”‚
   â–¼
2. Credentials Validation
   â”œâ”€ Check email exists
   â”œâ”€ Verify password hash
   â””â”€ Check account status
   â”‚
   â–¼
3. JWT Generation
   â”œâ”€ Create payload (user_id, email, role)
   â”œâ”€ Set expiration (30 min)
   â”œâ”€ Sign with secret key
   â””â”€ Return token
   â”‚
   â–¼
4. Token Storage (Client)
   â””â”€ localStorage
   â”‚
   â–¼
5. Authenticated Requests
   â”œâ”€ Include token in header
   â”œâ”€ Verify signature
   â”œâ”€ Check expiration
   â””â”€ Extract user info
```

### Security Layers

1. **Transport Layer**
   - HTTPS/TLS encryption
   - Secure headers (HSTS, CSP)
   - Certificate pinning

2. **Application Layer**
   - JWT authentication
   - Password hashing (bcrypt)
   - CSRF protection
   - Rate limiting

3. **Data Layer**
   - Parameterized queries (SQLAlchemy)
   - Input validation (Pydantic)
   - Encryption at rest
   - Regular backups

4. **Infrastructure Layer**
   - Firewall rules
   - VPC isolation
   - Security groups
   - DDoS protection

---

## Deployment Architecture

### Development Environment

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚         Developer Machine          â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚  â”‚ Frontend â”‚    â”‚ Backend  â”‚    â”‚
â”‚  â”‚ :5173    â”‚    â”‚ :8000    â”‚    â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”˜    â”‚
â”‚                        â”‚          â”‚
â”‚                   â”Œâ”€â”€â”€â”€â–¼â”€â”€â”€â”€â”    â”‚
â”‚                   â”‚ SQLite  â”‚    â”‚
â”‚                   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Production Environment (Docker)

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚              Docker Host                      â”‚
â”‚                                               â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”‚
â”‚  â”‚         Docker Network              â”‚     â”‚
â”‚  â”‚                                     â”‚     â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”      â”‚     â”‚
â”‚  â”‚  â”‚  Nginx   â”‚   â”‚ Frontend â”‚      â”‚     â”‚
â”‚  â”‚  â”‚  :80/443 â”‚â”€â”€â–ºâ”‚ Containerâ”‚      â”‚     â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜      â”‚     â”‚
â”‚  â”‚       â”‚                            â”‚     â”‚
â”‚  â”‚       â–¼                            â”‚     â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”‚     â”‚
â”‚  â”‚  â”‚ Backend  â”‚â”€â”€â–ºâ”‚PostgreSQLâ”‚     â”‚     â”‚
â”‚  â”‚  â”‚ Containerâ”‚   â”‚ Containerâ”‚     â”‚     â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜     â”‚     â”‚
â”‚  â”‚                                    â”‚     â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Cloud Deployment (AWS)

```
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚   Route 53  â”‚
                    â”‚    (DNS)    â”‚
                    â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”˜
                           â”‚
                    â”Œâ”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”
                    â”‚ CloudFront  â”‚
                    â”‚    (CDN)    â”‚
                    â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”˜
                           â”‚
         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
         â”‚                                    â”‚
    â”Œâ”€â”€â”€â”€â–¼â”€â”€â”€â”€â”                         â”Œâ”€â”€â”€â”€â–¼â”€â”€â”€â”€â”
    â”‚   S3    â”‚                         â”‚   ALB   â”‚
    â”‚Frontend â”‚                         â”‚Load Bal â”‚
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                         â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”˜
                                             â”‚
                          â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                          â”‚                                      â”‚
                     â”Œâ”€â”€â”€â”€â–¼â”€â”€â”€â”€â”                           â”Œâ”€â”€â”€â”€â–¼â”€â”€â”€â”€â”
                     â”‚   ECS   â”‚                           â”‚   ECS   â”‚
                     â”‚Backend 1â”‚                           â”‚Backend 2â”‚
                     â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”˜                           â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”˜
                          â”‚                                      â”‚
                          â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                            â”‚
                                       â”Œâ”€â”€â”€â”€â–¼â”€â”€â”€â”€â”
                                       â”‚   RDS   â”‚
                                       â”‚PostgreSQLâ”‚
                                       â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## Performance Considerations

### Optimization Strategies

1. **Database**
   - Indexing on frequently queried columns
   - Connection pooling
   - Query optimization
   - Read replicas for scaling

2. **API**
   - Response caching (Redis)
   - Pagination for large datasets
   - Async operations
   - Database query batching

3. **ML Model**
   - Model caching in memory
   - Batch predictions
   - Model compression
   - GPU acceleration (optional)

4. **Frontend**
   - Code splitting
   - Lazy loading
   - Asset optimization
   - CDN for static files

### Monitoring Points

- API response times
- Database query performance
- Model prediction latency
- Error rates
- User activity metrics
- System resource usage

---

## Scalability

### Horizontal Scaling

```
Load Balancer
      â”‚
      â”œâ”€â”€â–º Backend Instance 1
      â”œâ”€â”€â–º Backend Instance 2
      â”œâ”€â”€â–º Backend Instance 3
      â””â”€â”€â–º Backend Instance N
              â”‚
              â–¼
      Shared Database
```

### Vertical Scaling

- Increase server resources (CPU, RAM)
- Database performance tuning
- Model optimization

### Future Considerations

- Microservices architecture
- Message queue (Celery + Redis)
- Caching layer (Redis)
- Database sharding
- Read replicas
- Auto-scaling groups

---

## Technology Decisions

### Why FastAPI?
- High performance (async support)
- Automatic API documentation
- Type checking with Pydantic
- Modern Python features

### Why React?
- Component reusability
- Large ecosystem
- Virtual DOM performance
- Easy state management

### Why PostgreSQL?
- ACID compliance
- JSON support
- Strong community
- Excellent performance

### Why Naive Bayes?
- Fast training and prediction
- Works well with text data
- Low resource requirements
- Good baseline performance

---

## Disaster Recovery

### Backup Strategy

1. **Database Backups**
   - Automated daily backups
   - Point-in-time recovery
   - Off-site storage
   - Retention: 30 days

2. **Application Code**
   - Git version control
   - Tagged releases
   - Docker images versioned

3. **ML Models**
   - Version tracking
   - Model registry
   - Rollback capability

### Recovery Procedures

1. Database restoration
2. Application redeployment
3. Model rollback if needed
4. Verification testing

---

For implementation details, see [Development Guide](DEVELOPMENT.md)
