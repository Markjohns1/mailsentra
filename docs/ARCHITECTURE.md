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
- [Performance & Scalability](#performance--scalability)

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
```

### Architecture Layers

#### Client Layer
Multiple client types can access the system:
- **Browser**: Web-based interface
- **Mobile**: Native mobile applications  
- **API Client**: Direct API integration for third-party services

#### Load Balancer
- **Technology**: Nginx
- **Purpose**: Distributes incoming traffic across frontend and backend services

#### Frontend Layer
- **Framework**: React with Vite
- **Components**: React Router, Axios Client, State Management, UI Components

#### Backend Layer
- **Framework**: FastAPI
- **Services**: API Routes, Authentication, ML Service, Business Logic

#### Data Layer
- **Database**: PostgreSQL for persistent storage
- **ML Pipeline**: Scikit-learn models, vectorizers, and preprocessors

---

## Backend Architecture

### Directory Structure

```
backend/app/
│
├── models/                    # SQLAlchemy ORM models
│   ├── user.py
│   ├── spam_log.py
│   ├── feedback.py
│   └── email.py
│
├── routes/                    # API endpoint handlers
│   ├── auth.py               # Authentication endpoints
│   ├── analyze.py            # Email analysis
│   ├── logs.py               # Log management
│   ├── feedback.py           # Feedback system
│   ├── retrain.py            # Model retraining
│   ├── metrics.py            # Analytics
│   └── admin.py              # Admin operations
│
├── services/                  # Business logic layer
│   ├── model_service.py      # ML model operations
│   ├── preprocessing.py      # Text preprocessing
│   ├── auth_service.py       # Authentication logic
│   └── email_service.py      # Email operations
│
├── utils/                     # Helper functions
│   ├── logger.py             # Logging configuration
│   └── security.py           # Security utilities
│
├── config.py                  # Configuration management
├── database.py                # Database connection
└── dependencies.py            # FastAPI dependencies
```

### Request Flow

```
Client Request
    ↓
FastAPI Router (routes/)
    ↓
Authentication Middleware (dependencies.py)
    ↓
Request Validation (Pydantic)
    ↓
Business Logic (services/)
    ↓
Database Operation (models/)
    ↓
Response Serialization
    ↓
Client Response
```

### Key Components

#### Models Layer
Database models using SQLAlchemy ORM:
- **user.py**: User accounts and authentication
- **spam_log.py**: Email analysis history
- **feedback.py**: User corrections and feedback
- **email.py**: Email metadata and content

#### Routes Layer
API endpoints organized by domain:
- **auth.py**: Registration, login, token management
- **analyze.py**: Spam detection and classification
- **logs.py**: Analysis history retrieval
- **feedback.py**: User feedback submission
- **retrain.py**: Model retraining triggers
- **metrics.py**: System analytics
- **admin.py**: Administrative operations

#### Services Layer
Core business logic:
- **model_service.py**: ML model loading and predictions
- **preprocessing.py**: Text cleaning and feature extraction
- **auth_service.py**: Password hashing and token validation
- **email_service.py**: Email parsing and processing

#### Utils Layer
Shared utilities:
- **logger.py**: Centralized logging
- **security.py**: Security helpers

#### Core Configuration
- **config.py**: Environment variables and settings
- **database.py**: Database connection pooling
- **dependencies.py**: Dependency injection

### Authentication System
- **JWT-based**: Stateless token authentication
- **Password Security**: bcrypt hashing with salt
- **Token Expiration**: 30 minutes (configurable)
- **Role-Based Access**: User and Admin roles

### ML Service
- **Model**: Naive Bayes classifier
- **Vectorization**: TF-IDF (5000 features, 1-2 grams)
- **Preprocessing**: NLTK + BeautifulSoup
- **Performance**: In-memory model caching

---

## Frontend Architecture

### Directory Structure

```
frontend/src/
│
├── components/
│   ├── auth/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── ProtectedRoute.jsx
│   │
│   ├── dashboard/
│   │   ├── Dashboard.jsx
│   │   ├── AnalyzeEmail.jsx
│   │   ├── LogsTable.jsx
│   │   └── StatsCard.jsx
│   │
│   └── common/
│       ├── Navbar.jsx
│       ├── Toast.jsx
│       └── Loading.jsx
│
├── context/
│   ├── AuthContext.jsx          # Authentication state
│   └── ToastContext.jsx         # Notifications
│
├── services/
│   ├── api.js                   # Axios instance
│   ├── authService.js           # Auth API calls
│   └── logsService.js           # Logs API calls
│
└── utils/
    ├── constants.js
    └── helpers.js
```

### State Management

The application uses React Context for global state:

**AuthContext**: Manages user authentication state, login/logout methods, and token storage

**ToastContext**: Handles notification system for user feedback

Components consume these contexts to access global state and trigger actions, which then communicate with the API layer through service modules.

### Routing Structure

```
/                    → Landing/Login
/register            → User registration
/dashboard           → Protected dashboard (requires auth)
/dashboard/analyze   → Email analysis
/dashboard/logs      → Analysis history
/admin               → Admin panel (requires admin role)
```

---

## Database Design

### Entity Relationship Diagram

```
┌─────────────────┐
│      User       │
├─────────────────┤
│ id (PK)         │
│ username        │
│ email           │
│ password_hash   │
│ is_active       │
│ is_admin        │
│ created_at      │
└────────┬────────┘
         │ 1
         │
         │ N
         ▼
┌─────────────────┐
│    SpamLog      │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │──┐
│ email_text      │  │
│ result          │  │
│ confidence      │  │
│ analyzed_at     │  │
└────────┬────────┘  │
         │ 1         │
         │           │
         │ 1         │
         ▼           │
┌─────────────────┐  │
│    Feedback     │  │
├─────────────────┤  │
│ id (PK)         │  │
│ log_id (FK)     │──┘
│ user_id (FK)    │
│ correct_label   │
│ submitted_at    │
└─────────────────┘
```

### Schema Definitions

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

### Indexing Strategy

**Primary indexes** on all primary keys for fast lookups

**Foreign key indexes** on user_id and log_id for efficient joins

**Composite indexes** on frequently queried column combinations

**Timestamp indexes** for date-range queries (DESC for recent-first)

---

## ML Pipeline

### Training Pipeline

```
Data Loading
  ├─ Load SMS Spam Collection dataset
  ├─ Parse CSV format
  └─ Split train/test (80/20)
      ↓
Preprocessing
  ├─ Remove HTML tags (BeautifulSoup)
  ├─ Remove special characters
  ├─ Convert to lowercase
  ├─ Remove stopwords (NLTK)
  ├─ Tokenization
  └─ Stemming/Lemmatization
      ↓
Feature Extraction
  ├─ TF-IDF Vectorization
  ├─ Max features: 5000
  ├─ N-gram range: (1, 2)
  └─ Min/Max document frequency
      ↓
Model Training
  ├─ Algorithm: Multinomial Naive Bayes
  ├─ Hyperparameter tuning
  └─ Cross-validation (5-fold)
      ↓
Model Evaluation
  ├─ Accuracy: 95.3%
  ├─ Precision: 94.8%
  ├─ Recall: 96.1%
  └─ F1-Score: 95.4%
      ↓
Model Serialization
  ├─ Save model: spam_model.pkl
  ├─ Save vectorizer: vectorizer.pkl
  └─ Save metadata: model_info.json
```

### Prediction Pipeline

```
Input Email Text
    ↓
Preprocessing
  - Clean HTML tags
  - Normalize text
  - Tokenize
    ↓
Vectorization
  - Apply TF-IDF transform
  - Generate feature vector
    ↓
Prediction
  - Classify (spam/ham)
  - Calculate confidence
    ↓
Result
  - Label: spam/ham
  - Confidence: 0.0-1.0
```

### Retraining Process

```
Collect Feedback
  ├─ Query feedback table
  ├─ Filter by date range
  └─ Minimum threshold: 50 samples
      ↓
Prepare Dataset
  ├─ Merge with original training data
  ├─ Balance classes (spam/ham ratio)
  └─ Shuffle data
      ↓
Retrain Model
  ├─ Use same preprocessing pipeline
  ├─ Validate on holdout set
  └─ Compare performance metrics
      ↓
Deploy New Model
  ├─ Backup old model files
  ├─ Save new model files
  ├─ Update version metadata
  └─ Log performance improvements
```

---

## Security Architecture

### Authentication Flow

```
User Login Attempt
    ↓
Credentials Validation
  ├─ Verify email exists
  ├─ Compare password hash (bcrypt)
  └─ Check account status (is_active)
    ↓
JWT Token Generation
  ├─ Create payload (user_id, email, role)
  ├─ Set expiration (30 minutes)
  └─ Sign with secret key
    ↓
Token Storage
  └─ Client stores in localStorage
    ↓
Authenticated Requests
  ├─ Include token in Authorization header
  ├─ Verify signature on backend
  ├─ Check expiration
  └─ Extract user information
```

### Security Layers

#### Transport Layer Security
- HTTPS/TLS encryption for all communications
- Secure headers (HSTS, CSP, X-Frame-Options)
- Certificate management and renewal

#### Application Layer Security
- JWT token-based authentication
- bcrypt password hashing (cost factor: 12)
- CSRF protection via token validation
- Rate limiting on sensitive endpoints
- Input validation with Pydantic

#### Data Layer Security
- Parameterized queries via SQLAlchemy ORM
- SQL injection prevention
- XSS protection through input sanitization
- Encryption at rest for sensitive data
- Regular automated backups

#### Infrastructure Security
- Firewall configuration
- Network isolation (VPC)
- Security groups and access control
- DDoS protection
- Regular security audits

---

## Deployment Architecture

### Development Environment

```
┌────────────────────────────────────┐
│      Developer Machine             │
│  ┌──────────┐    ┌──────────┐    │
│  │ Frontend │    │ Backend  │    │
│  │  :5173   │    │  :8000   │    │
│  └──────────┘    └────┬─────┘    │
│                       │           │
│                  ┌────▼─────┐    │
│                  │  SQLite  │    │
│                  └──────────┘    │
└────────────────────────────────────┘
```

### Production Environment (Docker)

```
┌───────────────────────────────────────────────┐
│              Docker Host                      │
│                                               │
│  ┌────────────────────────────────────────┐  │
│  │         Docker Network                 │  │
│  │                                        │  │
│  │  ┌──────────┐   ┌──────────┐        │  │
│  │  │  Nginx   │   │ Frontend │        │  │
│  │  │ :80/443  │──►│Container │        │  │
│  │  └────┬─────┘   └──────────┘        │  │
│  │       │                              │  │
│  │       ▼                              │  │
│  │  ┌──────────┐   ┌──────────┐       │  │
│  │  │ Backend  │──►│PostgreSQL│       │  │
│  │  │Container │   │Container │       │  │
│  │  └──────────┘   └──────────┘       │  │
│  │                                     │  │
│  └─────────────────────────────────────┘  │
└───────────────────────────────────────────┘
```

### Cloud Deployment (AWS)

```
                    Route 53
                    (DNS)
                      ↓
                  CloudFront
                    (CDN)
                      ↓
         ┌────────────┴────────────┐
         │                         │
    S3 Bucket                Application
  (Frontend Static)         Load Balancer (ALB)
                                  ↓
                    ┌─────────────┴─────────────┐
                    │                           │
                ECS Task                    ECS Task
              (Backend Instance 1)       (Backend Instance 2)
                    │                           │
                    └─────────────┬─────────────┘
                                  ↓
                            RDS PostgreSQL
                         (Multi-AZ Deployment)
```

---

## Performance & Scalability

### Optimization Strategies

#### Database Optimization
- Indexes on frequently queried columns (user_id, email, analyzed_at)
- Connection pooling for efficient resource usage
- Query optimization with EXPLAIN ANALYZE
- Read replicas for scaling read operations
- Database query result caching

#### API Optimization
- Response caching with Redis (planned)
- Pagination for large result sets (limit/offset)
- Async request handling with FastAPI
- Database query batching to reduce round trips
- Gzip compression for responses

#### ML Model Optimization
- In-memory model caching (no disk I/O per request)
- Batch prediction support for multiple emails
- Model compression techniques (if needed)
- Lazy loading of model components

#### Frontend Optimization
- Code splitting by route
- Lazy loading of components
- Image and asset optimization
- Static asset CDN delivery
- Browser caching headers

### Scalability Patterns

#### Horizontal Scaling
```
Load Balancer
    │
    ├──► Backend Instance 1
    ├──► Backend Instance 2
    ├──► Backend Instance 3
    └──► Backend Instance N
            ↓
    Shared Database + Cache
```

#### Vertical Scaling
- Increase server resources (CPU, RAM)
- Database performance tuning
- Optimize model efficiency

#### Future Scalability Enhancements
- Microservices architecture for service independence
- Message queue (Celery + Redis) for async tasks
- Distributed caching layer (Redis cluster)
- Database sharding for massive datasets
- Auto-scaling groups based on metrics
- Read replicas for database read scaling

### Monitoring & Metrics

**Application Metrics**
- API endpoint response times
- Request throughput (requests/second)
- Error rates by endpoint
- Authentication success/failure rates

**Database Metrics**
- Query execution times
- Connection pool utilization
- Slow query logs
- Database size growth

**ML Model Metrics**
- Prediction latency
- Model accuracy over time
- Feedback submission rates
- False positive/negative rates

**System Metrics**
- CPU and memory usage
- Network I/O
- Disk space utilization
- Container health status

---

## Technology Decisions

### Why FastAPI?
- **Performance**: Native async/await support for high concurrency
- **Developer Experience**: Automatic API documentation (OpenAPI/Swagger)
- **Type Safety**: Pydantic integration for request/response validation
- **Modern**: Built on Python 3.7+ type hints

### Why React?
- **Component Reusability**: Build once, use everywhere
- **Ecosystem**: Rich library ecosystem and community
- **Performance**: Virtual DOM for efficient updates
- **Developer Tools**: Excellent debugging and development experience

### Why PostgreSQL?
- **Reliability**: ACID compliance for data integrity
- **Features**: Advanced features (JSON, full-text search, GIS)
- **Scalability**: Handles millions of rows efficiently
- **Community**: Strong open-source community and tooling

### Why Naive Bayes?
- **Speed**: Fast training and prediction times
- **Effectiveness**: Excellent performance on text classification
- **Simplicity**: Easy to understand and maintain
- **Resource Efficiency**: Low memory and compute requirements

---

## Disaster Recovery

### Backup Strategy

#### Database Backups
- **Frequency**: Automated daily backups at 2 AM UTC
- **Retention**: 30-day retention policy
- **Type**: Full database dumps + point-in-time recovery
- **Storage**: Off-site storage in separate region
- **Testing**: Monthly restore tests

#### Application Code
- **Version Control**: Git with tagged releases
- **Container Images**: Versioned Docker images in registry
- **Configuration**: Environment configs in secure vault

#### ML Models
- **Versioning**: Semantic versioning (v1.0.0, v1.1.0)
- **Registry**: Model files stored with metadata
- **Rollback**: Capability to revert to previous version

### Recovery Procedures

1. **Database Restoration**: Restore from latest backup or point-in-time
2. **Application Redeployment**: Deploy last known good version
3. **Model Rollback**: Revert to previous model version if needed
4. **Verification**: Run health checks and smoke tests
5. **Monitoring**: Enhanced monitoring during recovery period

### High Availability

- **Database**: Multi-AZ deployment with automatic failover
- **Application**: Multiple backend instances behind load balancer
- **Health Checks**: Automated health monitoring and alerting
- **Zero Downtime Deployments**: Rolling updates with canary releases

---

For implementation details, see [Development Guide](DEVELOPMENT.md)
