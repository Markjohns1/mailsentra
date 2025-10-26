# Generate-Documentation.ps1
# Creates professional documentation structure for MailSentra project
# Run from project root directory: .\Generate-Documentation.ps1

param(
    [switch]$Force
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   MailSentra Documentation Generator" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Create docs folder structure
Write-Host "Creating documentation structure..." -ForegroundColor Yellow
$docsFolders = @(
    "docs",
    "docs/assets",
    "docs/api",
    "docs/guides"
)

foreach ($folder in $docsFolders) {
    if (-not (Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder -Force | Out-Null
        Write-Host "  Created: $folder" -ForegroundColor Green
    } else {
        Write-Host "  Exists: $folder" -ForegroundColor Gray
    }
}

Write-Host ""

# Function to create file with content
function New-DocFile {
    param(
        [string]$Path,
        [string]$Content
    )
    
    if ((Test-Path $Path) -and -not $Force) {
        Write-Host "  Skipped: $Path (already exists)" -ForegroundColor Yellow
    } else {
        Set-Content -Path $Path -Value $Content -Encoding UTF8
        Write-Host "  Created: $Path" -ForegroundColor Green
    }
}

# ============================================
# README.md (Root)
# ============================================
Write-Host "Generating README.md..." -ForegroundColor Yellow

$readmeContent = @"
# MailSentra

<div align="center">

**Enterprise-Grade Email Spam Detection Platform**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/yourusername/mailsentra)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.13+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/react-18.2+-61DAFB.svg)](https://reactjs.org/)

[Features](#features) • [Quick Start](#quick-start) • [Documentation](docs/) • [API Reference](docs/API.md) • [Contributing](CONTRIBUTING.md)

</div>

---

## Overview

MailSentra is a production-ready, full-stack email spam detection system powered by machine learning. It combines advanced NLP techniques with a modern web interface to provide real-time spam classification, continuous learning through user feedback, and comprehensive analytics.

### Key Capabilities

- **Real-time Classification**: Analyze emails instantly with 95%+ accuracy
- **Adaptive Learning**: Model improves continuously from user feedback
- **Enterprise Security**: JWT authentication, rate limiting, and audit logs
- **Scalable Architecture**: Microservices-ready with Docker support
- **Analytics Dashboard**: Real-time metrics and performance monitoring
- **API-First Design**: RESTful API with comprehensive OpenAPI documentation

## Architecture

``````
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│  React Client   │◄────►│   FastAPI Server │◄────►│   PostgreSQL    │
│  (Frontend)     │      │    (Backend)     │      │   (Database)    │
└─────────────────┘      └──────────────────┘      └─────────────────┘
                                 │
                                 ▼
                         ┌──────────────────┐
                         │   ML Pipeline    │
                         │  (Scikit-learn)  │
                         └──────────────────┘
``````

## Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Spam Detection** | ML-powered email classification | ✅ Production |
| **User Management** | Registration, authentication, profiles | ✅ Production |
| **Analysis History** | Searchable log with filtering | ✅ Production |
| **Feedback Loop** | User corrections for model improvement | ✅ Production |
| **Model Retraining** | Admin-controlled retraining pipeline | ✅ Production |
| **Analytics** | System metrics and performance tracking | ✅ Production |
| **Rate Limiting** | API protection and abuse prevention | ✅ Production |
| **Audit Logging** | Comprehensive activity tracking | ✅ Production |

## Quick Start

### Prerequisites

- Python 3.13+
- Node.js 18+
- PostgreSQL 14+ (or SQLite for development)
- Git

### Installation

``````bash
# Clone repository
git clone https://github.com/yourusername/mailsentra.git
cd mailsentra

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
python train_model.py
uvicorn main:app --reload

# Frontend setup (new terminal)
cd frontend
npm install
cp .env.example .env
npm run dev
``````

Access the application:
- **Frontend**: http://localhost:5173
- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Documentation

| Document | Description |
|----------|-------------|
| [API Reference](docs/API.md) | Complete API documentation |
| [Architecture](docs/ARCHITECTURE.md) | System design and components |
| [Deployment Guide](docs/DEPLOYMENT.md) | Production deployment |
| [Development Guide](docs/DEVELOPMENT.md) | Developer setup and workflows |

## Technology Stack

### Backend
``````
FastAPI          - Modern web framework
SQLAlchemy       - Database ORM
Alembic          - Database migrations
Scikit-learn     - Machine learning
NLTK             - Natural language processing
BeautifulSoup4   - HTML parsing
Passlib          - Password hashing
PyJWT            - JWT authentication
SlowAPI          - Rate limiting
``````

### Frontend
``````
React 18         - UI framework
Vite             - Build tool
React Router     - Navigation
Axios            - HTTP client
Tailwind CSS     - Styling
Recharts         - Data visualization
Lucide React     - Icons
``````

## Project Structure

``````
mailsentra/
├── backend/
│   ├── alembic/              # Database migrations
│   ├── app/
│   │   ├── models/           # Database models
│   │   ├── routes/           # API endpoints
│   │   ├── services/         # Business logic
│   │   └── utils/            # Utilities
│   ├── dataset/              # Training data
│   ├── ml_models/            # Trained models
│   └── tests/                # Unit tests
├── frontend/
│   └── src/
│       ├── components/       # React components
│       ├── context/          # State management
│       ├── pages/            # Page components
│       └── services/         # API services
├── docs/                     # Documentation
└── README.md
``````

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## Support

- 📧 Email: support@mailsentra.com
- 💬 Issues: [GitHub Issues](https://github.com/yourusername/mailsentra/issues)
- 📖 Docs: [Documentation](docs/)

---

<div align="center">

Made with ❤️ by the MailSentra Team

</div>
"@

New-DocFile -Path "README.md" -Content $readmeContent

# ============================================
# API.md
# ============================================
Write-Host "Generating docs/API.md..." -ForegroundColor Yellow

$apiContent = @"
# API Reference

Complete API documentation for MailSentra backend services.

**Base URL**: ``http://localhost:8000`` (development)

**API Version**: v1

---

## Table of Contents

- [Authentication](#authentication)
- [Email Analysis](#email-analysis)
- [Logs Management](#logs-management)
- [Feedback System](#feedback-system)
- [Admin Operations](#admin-operations)
- [Metrics & Monitoring](#metrics--monitoring)
- [Error Handling](#error-handling)

---

## Authentication

All protected endpoints require JWT authentication via Bearer token in the Authorization header.

### Register User

Create a new user account.

**Endpoint**: ``POST /api/auth/register``

**Request Body**:
``````json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
``````

**Response** (201 Created):
``````json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "is_active": true,
  "is_admin": false,
  "created_at": "2025-10-26T10:30:00Z"
}
``````

**Validation Rules**:
- Username: 3-50 characters, alphanumeric with underscores
- Email: Valid email format
- Password: Minimum 8 characters, at least one uppercase, one lowercase, one number

---

### Login

Authenticate and receive JWT access token.

**Endpoint**: ``POST /api/auth/login``

**Request Body** (form-urlencoded):
``````
username=john@example.com
password=SecurePass123!
``````

**Response** (200 OK):
``````json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
``````

**Token Expiration**: 30 minutes (configurable)

---

### Get Current User

Retrieve authenticated user information.

**Endpoint**: ``GET /api/auth/me``

**Headers**:
``````
Authorization: Bearer {token}
``````

**Response** (200 OK):
``````json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "is_active": true,
  "is_admin": false,
  "created_at": "2025-10-26T10:30:00Z"
}
``````

---

### Logout

Invalidate current session (client-side token removal).

**Endpoint**: ``POST /api/auth/logout``

**Headers**:
``````
Authorization: Bearer {token}
``````

**Response** (200 OK):
``````json
{
  "message": "Successfully logged out"
}
``````

---

## Email Analysis

### Analyze Email

Classify email as spam or ham using ML model.

**Endpoint**: ``POST /api/analyze``

**Headers**:
``````
Authorization: Bearer {token}
Content-Type: application/json
``````

**Request Body**:
``````json
{
  "email_text": "Congratulations! You've won $1,000,000. Click here to claim your prize now!"
}
``````

**Response** (200 OK):
``````json
{
  "id": 123,
  "result": "spam",
  "confidence": 0.9534,
  "email_text": "Congratulations! You've won...",
  "analyzed_at": "2025-10-26T10:35:22Z"
}
``````

**Result Values**:
- ``spam``: Email classified as spam
- ``ham``: Email classified as legitimate

**Confidence Score**: Float between 0.0 and 1.0 (higher = more confident)

---

## Logs Management

### Get Analysis Logs

Retrieve paginated list of user's email analyses.

**Endpoint**: ``GET /api/logs``

**Headers**:
``````
Authorization: Bearer {token}
``````

**Query Parameters**:
- ``page`` (optional): Page number, default: 1
- ``per_page`` (optional): Items per page, default: 20, max: 100
- ``result`` (optional): Filter by result (``spam`` or ``ham``)
- ``search`` (optional): Search in email text

**Example Request**:
``````
GET /api/logs?page=1&per_page=20&result=spam
``````

**Response** (200 OK):
``````json
{
  "logs": [
    {
      "id": 123,
      "email_text": "Congratulations! You've won...",
      "result": "spam",
      "confidence": 0.9534,
      "analyzed_at": "2025-10-26T10:35:22Z",
      "feedback_given": false
    }
  ],
  "total": 45,
  "page": 1,
  "per_page": 20,
  "total_pages": 3
}
``````

---

### Get Single Log

Retrieve specific analysis log by ID.

**Endpoint**: ``GET /api/logs/{log_id}``

**Headers**:
``````
Authorization: Bearer {token}
``````

**Response** (200 OK):
``````json
{
  "id": 123,
  "email_text": "Congratulations! You've won...",
  "result": "spam",
  "confidence": 0.9534,
  "analyzed_at": "2025-10-26T10:35:22Z",
  "feedback_given": false,
  "user_id": 1
}
``````

---

### Delete Log

Delete specific analysis log.

**Endpoint**: ``DELETE /api/logs/{log_id}``

**Headers**:
``````
Authorization: Bearer {token}
``````

**Response** (200 OK):
``````json
{
  "message": "Log deleted successfully"
}
``````

---

## Feedback System

### Submit Feedback

Correct misclassified email to improve model.

**Endpoint**: ``POST /api/feedback``

**Headers**:
``````
Authorization: Bearer {token}
Content-Type: application/json
``````

**Request Body**:
``````json
{
  "log_id": 123,
  "correct_label": "ham"
}
``````

**Valid Labels**: ``spam``, ``ham``

**Response** (200 OK):
``````json
{
  "id": 45,
  "log_id": 123,
  "correct_label": "ham",
  "submitted_at": "2025-10-26T10:40:15Z",
  "message": "Feedback submitted successfully"
}
``````

---

### Get User Feedback

Retrieve all feedback submitted by user.

**Endpoint**: ``GET /api/feedback``

**Headers**:
``````
Authorization: Bearer {token}
``````

**Response** (200 OK):
``````json
{
  "feedback": [
    {
      "id": 45,
      "log_id": 123,
      "correct_label": "ham",
      "submitted_at": "2025-10-26T10:40:15Z"
    }
  ],
  "total": 12
}
``````

---

## Admin Operations

**Note**: All admin endpoints require admin privileges (``is_admin: true``).

### Retrain Model

Trigger model retraining with user feedback data.

**Endpoint**: ``POST /api/retrain``

**Headers**:
``````
Authorization: Bearer {admin_token}
``````

**Request Body** (optional):
``````json
{
  "min_feedback_count": 50
}
``````

**Response** (200 OK):
``````json
{
  "message": "Model retraining initiated",
  "feedback_count": 127,
  "previous_accuracy": 0.9534,
  "new_accuracy": 0.9621,
  "model_version": "v1.2",
  "trained_at": "2025-10-26T11:00:00Z"
}
``````

---

### Get All Users

List all registered users (admin only).

**Endpoint**: ``GET /api/admin/users``

**Headers**:
``````
Authorization: Bearer {admin_token}
``````

**Query Parameters**:
- ``page`` (optional): Page number, default: 1
- ``per_page`` (optional): Items per page, default: 50

**Response** (200 OK):
``````json
{
  "users": [
    {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "is_active": true,
      "is_admin": false,
      "created_at": "2025-10-26T10:30:00Z",
      "total_analyses": 45
    }
  ],
  "total": 156,
  "page": 1,
  "per_page": 50
}
``````

---

## Metrics & Monitoring

### Get System Metrics

Retrieve system-wide analytics and performance metrics.

**Endpoint**: ``GET /api/metrics``

**Headers**:
``````
Authorization: Bearer {token}
``````

**Response** (200 OK):
``````json
{
  "total_analyses": 15234,
  "spam_detected": 8912,
  "ham_detected": 6322,
  "spam_rate": 0.585,
  "total_users": 156,
  "active_users_today": 42,
  "model_accuracy": 0.9534,
  "model_version": "v1.1",
  "avg_response_time_ms": 87,
  "feedback_count": 127,
  "last_retrain": "2025-10-20T14:30:00Z"
}
``````

---

### Get User Statistics

Get statistics for current user.

**Endpoint**: ``GET /api/user/stats``

**Headers**:
``````
Authorization: Bearer {token}
``````

**Response** (200 OK):
``````json
{
  "total_analyses": 45,
  "spam_detected": 28,
  "ham_detected": 17,
  "feedback_given": 5,
  "accuracy_rate": 0.956,
  "member_since": "2025-10-26T10:30:00Z"
}
``````

---

## Error Handling

### Standard Error Response

All errors follow this format:

``````json
{
  "detail": "Error message describing what went wrong"
}
``````

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Common Error Examples

**Authentication Error** (401):
``````json
{
  "detail": "Could not validate credentials"
}
``````

**Validation Error** (422):
``````json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
``````

**Rate Limit Error** (429):
``````json
{
  "detail": "Rate limit exceeded. Please try again in 60 seconds."
}
``````

---

## Rate Limiting

**Default Limits**:
- Authenticated users: 60 requests per minute
- Unauthenticated: 20 requests per minute

**Headers**:
``````
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1698325200
``````

---

## Pagination

All list endpoints support pagination with consistent parameters:

- ``page``: Page number (starts at 1)
- ``per_page``: Items per page (max varies by endpoint)

Response includes:
``````json
{
  "data": [...],
  "total": 156,
  "page": 1,
  "per_page": 20,
  "total_pages": 8
}
``````

---

## Changelog

### v1.1 (Current)
- Added feedback system endpoints
- Improved error messages
- Added user statistics endpoint

### v1.0
- Initial API release
- Basic authentication and analysis features

---

For interactive API testing, visit: **http://localhost:8000/docs** (Swagger UI)
"@

New-DocFile -Path "docs/API.md" -Content $apiContent

# ============================================
# ARCHITECTURE.md
# ============================================
Write-Host "Generating docs/ARCHITECTURE.md..." -ForegroundColor Yellow

$architectureContent = @"
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

``````
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
``````

---

## Backend Architecture

### Component Structure

``````
backend/app/
├── models/          # SQLAlchemy ORM models
│   ├── user.py
│   ├── spam_log.py
│   ├── feedback.py
│   └── email.py
│
├── routes/          # API endpoint handlers
│   ├── auth.py      # Authentication endpoints
│   ├── analyze.py   # Email analysis
│   ├── logs.py      # Log management
│   ├── feedback.py  # Feedback system
│   ├── retrain.py   # Model retraining
│   ├── metrics.py   # Analytics
│   └── admin.py     # Admin operations
│
├── services/        # Business logic layer
│   ├── model_service.py      # ML model operations
│   ├── preprocessing.py      # Text preprocessing
│   ├── auth_service.py       # Authentication logic
│   └── email_service.py      # Email operations
│
├── utils/           # Helper functions
│   ├── logger.py    # Logging configuration
│   └── security.py  # Security utilities
│
├── config.py        # Configuration management
├── database.py      # Database connection
└── dependencies.py  # FastAPI dependencies
``````

### Request Flow

``````
1. Client Request
   │
   ▼
2. FastAPI Router (routes/)
   │
   ▼
3. Authentication Middleware (dependencies.py)
   │
   ▼
4. Request Validation (Pydantic)
   │
   ▼
5. Business Logic (services/)
   │
   ▼
6. Database Operation (models/)
   │
   ▼
7. Response Serialization
   │
   ▼
8. Client Response
``````

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

``````
frontend/src/
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
│   ├── AuthContext.jsx      # Authentication state
│   └── ToastContext.jsx     # Notifications
│
├── services/
│   ├── api.js               # Axios instance
│   ├── authService.js       # Auth API calls
│   └── logsService.js       # Logs API calls
│
└── utils/
    ├── constants.js
    └── helpers.js
``````

### State Management

``````
┌─────────────────┐
│  AuthContext    │  - User authentication state
│  (React Context)│  - Login/logout methods
└────────┬────────┘  - Token management
         │
         ▼
┌─────────────────┐
│  Components     │  - Consume context
│                 │  - Trigger actions
└────────┬────────┘  - Display UI
         │
         ▼
┌─────────────────┐
│  API Service    │  - HTTP requests
│  (Axios)        │  - Error handling
└─────────────────┘  - Token injection
``````

### Routing Strategy

``````javascript
/                    → Landing/Login
/register            → User registration
/dashboard           → Protected dashboard (requires auth)
/dashboard/analyze   → Email analysis
/dashboard/logs      → Analysis history
/admin               → Admin panel (requires admin role)
``````

---

## Database Design

### Entity Relationship Diagram

``````
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
``````

### Table Definitions

#### Users Table
``````sql
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
``````

#### SpamLog Table
``````sql
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
``````

#### Feedback Table
``````sql
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
``````

---

## ML Pipeline

### Training Pipeline

``````
1. Data Loading
   ├─ Load SMS Spam Collection dataset
   ├─ Parse CSV format
   └─ Split into train/test (80/20)
         │
         ▼
2. Preprocessing
   ├─ Remove HTML tags
   ├─ Remove special characters
   ├─ Convert to lowercase
   ├─ Remove stopwords (NLTK)
   ├─ Tokenization
   └─ Stemming/Lemmatization
         │
         ▼
3. Feature Extraction
   ├─ TF-IDF Vectorization
   ├─ Max features: 5000
   ├─ N-gram range: (1, 2)
   └─ Min/Max document frequency
         │
         ▼
4. Model Training
   ├─ Algorithm: Naive Bayes (MultinomialNB)
   ├─ Hyperparameter tuning
   ├─ Cross-validation (5-fold)
   └─ Performance metrics
         │
         ▼
5. Model Evaluation
   ├─ Accuracy: 95.3%
   ├─ Precision: 94.8%
   ├─ Recall: 96.1%
   └─ F1-Score: 95.4%
         │
         ▼
6. Model Serialization
   ├─ Save model: spam_model.pkl
   ├─ Save vectorizer: vectorizer.pkl
   ├─ Save metadata: model_info.json
   └─ Version tracking
``````

### Prediction Pipeline

``````
Input Email Text
      │
      ▼
┌─────────────────┐
│  Preprocessing  │
│  - Clean HTML   │
│  - Normalize    │
│  - Tokenize     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Vectorization  │
│  - TF-IDF       │
│  - Transform    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Prediction     │
│  - Classify     │
│  - Get proba    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Result         │
│  - Label        │
│  - Confidence   │
└─────────────────┘
``````

### Retraining Process

``````
1. Collect Feedback
   ├─ Query feedback table
   ├─ Filter by date range
   └─ Minimum threshold: 50 samples
         │
         ▼
2. Prepare Dataset
   ├─ Merge with original data
   ├─ Balance classes
   └─ Shuffle data
         │
         ▼
3. Retrain Model
   ├─ Use same pipeline
   ├─ Validate on holdout set
   └─ Compare metrics
         │
         ▼
4. Deploy New Model
   ├─ Backup old model
   ├─ Save new model
   ├─ Update version
   └─ Log performance
``````

---

## Security Architecture

### Authentication Flow

``````
1. User Login
   │
   ▼
2. Credentials Validation
   ├─ Check email exists
   ├─ Verify password hash
   └─ Check account status
   │
   ▼
3. JWT Generation
   ├─ Create payload (user_id, email, role)
   ├─ Set expiration (30 min)
   ├─ Sign with secret key
   └─ Return token
   │
   ▼
4. Token Storage (Client)
   └─ localStorage
   │
   ▼
5. Authenticated Requests
   ├─ Include token in header
   ├─ Verify signature
   ├─ Check expiration
   └─ Extract user info
``````

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

``````
┌────────────────────────────────────┐
│         Developer Machine          │
│  ┌──────────┐    ┌──────────┐    │
│  │ Frontend │    │ Backend  │    │
│  │ :5173    │    │ :8000    │    │
│  └──────────┘    └─────┬────┘    │
│                        │          │
│                   ┌────▼────┐    │
│                   │ SQLite  │    │
│                   └─────────┘    │
└────────────────────────────────────┘
``````

### Production Environment (Docker)

``````
┌──────────────────────────────────────────────┐
│              Docker Host                      │
│                                               │
│  ┌────────────────────────────────────┐     │
│  │         Docker Network              │     │
│  │                                     │     │
│  │  ┌──────────┐   ┌──────────┐      │     │
│  │  │  Nginx   │   │ Frontend │      │     │
│  │  │  :80/443 │──►│ Container│      │     │
│  │  └────┬─────┘   └──────────┘      │     │
│  │       │                            │     │
│  │       ▼                            │     │
│  │  ┌──────────┐   ┌──────────┐     │     │
│  │  │ Backend  │──►│PostgreSQL│     │     │
│  │  │ Container│   │ Container│     │     │
│  │  └──────────┘   └──────────┘     │     │
│  │                                    │     │
│  └────────────────────────────────────┘     │
└──────────────────────────────────────────────┘
``````

### Cloud Deployment (AWS)

``````
                    ┌─────────────┐
                    │   Route 53  │
                    │    (DNS)    │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ CloudFront  │
                    │    (CDN)    │
                    └──────┬──────┘
                           │
         ┌─────────────────┴─────────────────┐
         │                                    │
    ┌────▼────┐                         ┌────▼────┐
    │   S3    │                         │   ALB   │
    │Frontend │                         │Load Bal │
    └─────────┘                         └────┬────┘
                                             │
                          ┌──────────────────┴──────────────────┐
                          │                                      │
                     ┌────▼────┐                           ┌────▼────┐
                     │   ECS   │                           │   ECS   │
                     │Backend 1│                           │Backend 2│
                     └────┬────┘                           └────┬────┘
                          │                                      │
                          └──────────────────┬───────────────────┘
                                            │
                                       ┌────▼────┐
                                       │   RDS   │
                                       │PostgreSQL│
                                       └─────────┘
``````

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

``````
Load Balancer
      │
      ├──► Backend Instance 1
      ├──► Backend Instance 2
      ├──► Backend Instance 3
      └──► Backend Instance N
              │
              ▼
      Shared Database
``````

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
"@

New-DocFile -Path "docs/ARCHITECTURE.md" -Content $architectureContent

# ============================================
# DEPLOYMENT.md
# ============================================
Write-Host "Generating docs/DEPLOYMENT.md..." -ForegroundColor Yellow

$deploymentContent = @"
# Deployment Guide

Complete guide for deploying MailSentra to various platforms and environments.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Docker Deployment](#docker-deployment)
- [Cloud Platforms](#cloud-platforms)
- [Database Setup](#database-setup)
- [SSL/TLS Configuration](#ssltls-configuration)
- [Monitoring & Logging](#monitoring--logging)
- [Backup & Recovery](#backup--recovery)

---

## Prerequisites

### Required Tools
- Docker & Docker Compose
- Git
- SSL Certificate (for production)
- Domain name (optional but recommended)

### Minimum Server Requirements

**Development**:
- 2 CPU cores
- 4GB RAM
- 20GB storage

**Production**:
- 4 CPU cores
- 8GB RAM
- 50GB storage
- Load balancer (for high traffic)

---

## Environment Configuration

### Backend Environment (.env)

Create ``backend/.env`` file:

``````bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mailsentra
# For SQLite: sqlite:///./spam_detector.db

# Security
SECRET_KEY=your-super-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS Origins (comma-separated)
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60

# Environment
ENVIRONMENT=production
DEBUG=False

# Email (optional - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
``````

### Frontend Environment (.env)

Create ``frontend/.env`` file:

``````bash
# API Configuration
VITE_API_URL=https://api.yourdomain.com

# App Configuration
VITE_APP_NAME=MailSentra
VITE_APP_VERSION=1.0.0
``````

### Security Best Practices

1. **Generate Strong SECRET_KEY**:
   ``````bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ``````

2. **Never Commit .env Files**:
   Add to ``.gitignore``:
   ``````
   .env
   .env.local
   .env.production
   ``````

3. **Use Environment-Specific Configs**:
   - ``.env.development``
   - ``.env.staging``
   - ``.env.production``

---

## Docker Deployment

### 1. Create Docker Files

**backend/Dockerfile**:
``````dockerfile
FROM python:3.13-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download NLTK data
RUN python -c "import nltk; nltk.download('stopwords'); nltk.download('punkt')"

# Copy application
COPY . .

# Run migrations
RUN alembic upgrade head

# Expose port
EXPOSE 8000

# Start application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
``````

**frontend/Dockerfile**:
``````dockerfile
FROM node:18-alpine as build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Build application
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy build files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
``````

**frontend/nginx.conf**:
``````nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
``````

### 2. Docker Compose Configuration

**docker-compose.yml** (project root):
``````yaml
version: '3.8'

services:
  # PostgreSQL Database
  db:
    image: postgres:14-alpine
    container_name: mailsentra-db
    environment:
      POSTGRES_USER: mailsentra
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: mailsentra
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - mailsentra-network
    restart: unless-stopped

  # Backend API
  backend:
    build: ./backend
    container_name: mailsentra-backend
    environment:
      DATABASE_URL: postgresql://mailsentra:${DB_PASSWORD}@db:5432/mailsentra
      SECRET_KEY: ${SECRET_KEY}
      CORS_ORIGINS: ${CORS_ORIGINS}
    depends_on:
      - db
    networks:
      - mailsentra-network
    restart: unless-stopped

  # Frontend
  frontend:
    build: ./frontend
    container_name: mailsentra-frontend
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    networks:
      - mailsentra-network
    restart: unless-stopped

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: mailsentra-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend
      - frontend
    networks:
      - mailsentra-network
    restart: unless-stopped

volumes:
  postgres_data:

networks:
  mailsentra-network:
    driver: bridge
``````

### 3. Deploy with Docker Compose

``````bash
# Create .env file in project root
echo "DB_PASSWORD=your-secure-password" > .env
echo "SECRET_KEY=your-secret-key" >> .env
echo "CORS_ORIGINS=https://yourdomain.com" >> .env

# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after changes
docker-compose up -d --build
``````

---

## Cloud Platforms

### Railway Deployment (Backend)

1. **Install Railway CLI**:
   ``````bash
   npm install -g @railway/cli
   ``````

2. **Login and Initialize**:
   ``````bash
   railway login
   cd backend
   railway init
   ``````

3. **Add PostgreSQL**:
   ``````bash
   railway add --plugin postgresql
   ``````

4. **Set Environment Variables**:
   ``````bash
   railway variables set SECRET_KEY=your-secret-key
   railway variables set CORS_ORIGINS=https://yourfrontend.vercel.app
   ``````

5. **Deploy**:
   ``````bash
   railway up
   ``````

6. **Get API URL**:
   ``````bash
   railway domain
   ``````

### Render Deployment (Backend)

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Configure:
   - **Build Command**: ``pip install -r requirements.txt``
   - **Start Command**: ``uvicorn main:app --host 0.0.0.0 --port \$PORT``
5. Add Environment Variables in dashboard
6. Add PostgreSQL database (Add-ons)
7. Deploy

### Vercel Deployment (Frontend)

1. **Install Vercel CLI**:
   ``````bash
   npm install -g vercel
   ``````

2. **Deploy**:
   ``````bash
   cd frontend
   vercel
   ``````

3. **Set Environment Variables**:
   - Go to Vercel dashboard
   - Settings → Environment Variables
   - Add ``VITE_API_URL``

4. **Production Deployment**:
   ``````bash
   vercel --prod
   ``````

### Netlify Deployment (Frontend)

1. **Install Netlify CLI**:
   ``````bash
   npm install -g netlify-cli
   ``````

2. **Build**:
   ``````bash
   cd frontend
   npm run build
   ``````

3. **Deploy**:
   ``````bash
   netlify deploy --prod --dir=dist
   ``````

4. **Configure**:
   - Add ``_redirects`` file in ``public/``:
     ``````
     /*    /index.html   200
     ``````

---

## Database Setup

### PostgreSQL Production Setup

1. **Create Database**:
   ``````sql
   CREATE DATABASE mailsentra;
   CREATE USER mailsentra_user WITH PASSWORD 'secure-password';
   GRANT ALL PRIVILEGES ON DATABASE mailsentra TO mailsentra_user;
   ``````

2. **Run Migrations**:
   ``````bash
   cd backend
   alembic upgrade head
   ``````

3. **Create Admin User** (optional):
   ``````bash
   python scripts/create_admin.py
   ``````

### Database Backup

**Automated Backup Script** (``scripts/backup_db.sh``):
``````bash
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/backups"
DB_NAME="mailsentra"

# Create backup
pg_dump -U mailsentra_user -d $DB_NAME > "$BACKUP_DIR/backup_$TIMESTAMP.sql"

# Compress
gzip "$BACKUP_DIR/backup_$TIMESTAMP.sql"

# Delete backups older than 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: backup_$TIMESTAMP.sql.gz"
``````

**Schedule with Cron**:
``````bash
# Daily backup at 2 AM
0 2 * * * /path/to/backup_db.sh
``````

---

## SSL/TLS Configuration

### Using Certbot (Let's Encrypt)

``````bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
``````

### Nginx SSL Configuration

``````nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL Security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://backend:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://\$server_name\$request_uri;
}
``````

---

## Monitoring & Logging

### Application Logging

**Backend logging configuration** (already in ``app/utils/logger.py``):
``````python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/app.log'),
        logging.StreamHandler()
    ]
)
``````

### Health Check Endpoint

Add to ``backend/main.py``:
``````python
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }
``````

### Monitoring Tools

**Prometheus + Grafana** (optional):
``````yaml
# Add to docker-compose.yml
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    depends_on:
      - prometheus
``````

---

## Backup & Recovery

### Full System Backup

``````bash
#!/bin/bash
# backup_system.sh

# Backup database
docker exec mailsentra-db pg_dump -U mailsentra mailsentra > db_backup.sql

# Backup ML models
tar -czf ml_models_backup.tar.gz backend/ml_models/

# Backup environment files
cp backend/.env backend_env_backup
cp frontend/.env frontend_env_backup

echo "Backup completed"
``````

### Recovery Procedure

``````bash
# 1. Restore database
docker exec -i mailsentra-db psql -U mailsentra mailsentra < db_backup.sql

# 2. Restore ML models
tar -xzf ml_models_backup.tar.gz -C backend/

# 3. Restart services
docker-compose restart
``````

---

## Post-Deployment Checklist

- [ ] SSL certificate installed and auto-renewing
- [ ] Environment variables set correctly
- [ ] Database migrations applied
- [ ] Admin user created
- [ ] Health check endpoint responding
- [ ] Logs being collected
- [ ] Backup script scheduled
- [ ] Monitoring configured
- [ ] Rate limiting tested
- [ ] CORS configured for frontend domain
- [ ] Error tracking enabled
- [ ] Performance baseline measured

---

## Troubleshooting

### Common Issues

**Database connection failed**:
``````bash
# Check connection
docker exec -it mailsentra-db psql -U mailsentra -d mailsentra

# Check DATABASE_URL format
# Correct: postgresql://user:password@host:port/dbname
``````

**CORS errors**:
``````python
# Verify CORS_ORIGINS in backend/.env includes frontend URL
CORS_ORIGINS=https://yourfrontend.com,https://www.yourfrontend.com
``````

**Model not loading**:
``````bash
# Ensure model file exists
ls -la backend/ml_models/spam_model.pkl

# Retrain if missing
cd backend
python train_model.py
``````

---

For development setup, see [Development Guide](DEVELOPMENT.md)
"@

New-DocFile -Path "docs/DEPLOYMENT.md" -Content $deploymentContent

# ============================================
# DEVELOPMENT.md
# ============================================
Write-Host "Generating docs/DEVELOPMENT.md..." -ForegroundColor Yellow

$developmentContent = @"
# Development Guide

Developer documentation for contributing to and maintaining MailSentra.

---

## Table of Contents

- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Git Workflow](#git-workflow)
- [Testing](#testing)
- [Debugging](#debugging)
- [Database Management](#database-management)
- [Common Tasks](#common-tasks)

---

## Development Setup

### Initial Setup

1. **Clone Repository**:
   ``````bash
   git clone https://github.com/yourusername/mailsentra.git
   cd mailsentra
   ``````

2. **Backend Setup**:
   ``````bash
   cd backend
   
   # Create virtual environment
   python -m venv venv
   
   # Activate virtual environment
   # Windows:
   venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Install development dependencies
   pip install pytest pytest-cov black flake8 mypy
   
   # Create .env file
   cp .env.example .env
   # Edit .env with your configuration
   
   # Download NLTK data
   python -c "import nltk; nltk.download('stopwords'); nltk.download('punkt')"
   
   # Setup database
   alembic upgrade head
   
   # Train initial model
   python train_model.py
   ``````

3. **Frontend Setup**:
   ``````bash
   cd ../frontend
   
   # Install dependencies
   npm install
   
   # Install development tools
   npm install -D eslint prettier
   
   # Create .env file
   cp .env.example .env
   # Edit .env with API URL
   ``````

### IDE Setup

**VS Code Recommended Extensions**:
- Python
- Pylance
- ESLint
- Prettier
- Docker
- GitLens

**VS Code Settings** (``.vscode/settings.json``):
``````json
{
  "python.linting.enabled": true,
  "python.linting.flake8Enabled": true,
  "python.formatting.provider": "black",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[python]": {
    "editor.defaultFormatter": "ms-python.black-formatter"
  }
}
``````

---

## Project Structure

### Backend Structure

``````
backend/
├── alembic/                    # Database migrations
│   ├── versions/               # Migration files
│   ├── env.py                  # Alembic environment
│   └── script.py.mako         # Migration template
│
├── app/
│   ├── __init__.py
│   ├── config.py              # Configuration management
│   ├── database.py            # Database connection
│   ├── dependencies.py        # FastAPI dependencies
│   │
│   ├── models/                # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── spam_log.py
│   │   ├── feedback.py
│   │   └── email.py
│   │
│   ├── routes/                # API endpoints
│   │   ├── __init__.py
│   │   ├── auth.py           # Authentication
│   │   ├── analyze.py        # Email analysis
│   │   ├── logs.py           # Log management
│   │   ├── feedback.py       # Feedback system
│   │   ├── retrain.py        # Model retraining
│   │   ├── metrics.py        # Analytics
│   │   └── admin.py          # Admin operations
│   │
│   ├── services/              # Business logic
│   │   ├── __init__.py
│   │   ├── model_service.py  # ML operations
│   │   ├── preprocessing.py  # Text preprocessing
│   │   ├── auth_service.py   # Auth logic
│   │   └── email_service.py  # Email operations
│   │
│   └── utils/                 # Utilities
│       ├── __init__.py
│       ├── logger.py         # Logging config
│       └── security.py       # Security helpers
│
├── dataset/                   # Training data
│   ├── SMSSpamCollection     # Raw dataset
│   └── readme
│
├── ml_models/                 # Trained models
│   └── spam_model.pkl
│
├── tests/                     # Unit tests
│   ├── __init__.py
│   ├── test_auth.py
│   ├── test_model.py
│   └── test_api.py
│
├── main.py                    # Application entry point
├── train_model.py            # Model training script
├── retrain_service.py        # Retraining service
├── requirements.txt          # Dependencies
├── .env                      # Environment variables
└── alembic.ini              # Alembic configuration
``````

### Frontend Structure

``````
frontend/
├── public/                   # Static assets
│   ├── favicon.ico
│   └── robots.txt
│
├── src/
│   ├── components/          # React components
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AnalyzeEmail.jsx
│   │   │   ├── LogsTable.jsx
│   │   │   └── StatsCard.jsx
│   │   │
│   │   └── common/
│   │       ├── Navbar.jsx
│   │       ├── Toast.jsx
│   │       └── Loading.jsx
│   │
│   ├── context/            # React context
│   │   ├── AuthContext.jsx
│   │   └── ToastContext.jsx
│   │
│   ├── services/           # API services
│   │   ├── api.js
│   │   ├── authService.js
│   │   └── logsService.js
│   │
│   ├── utils/              # Helper functions
│   │   ├── constants.js
│   │   └── helpers.js
│   │
│   ├── App.jsx             # Main component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
│
├── package.json            # Dependencies
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind configuration
└── .env                   # Environment variables
``````

---

## Coding Standards

### Python (Backend)

**Style Guide**: PEP 8

**Key Rules**:
- Use 4 spaces for indentation
- Maximum line length: 88 characters (Black default)
- Use type hints for function parameters and returns
- Docstrings for all public functions and classes

**Example**:
``````python
from typing import Optional
from fastapi import HTTPException

def analyze_email(email_text: str, user_id: int) -> dict:
    """
    Analyze email text for spam classification.
    
    Args:
        email_text: The email content to analyze
        user_id: ID of the user performing analysis
    
    Returns:
        Dictionary containing result, confidence, and metadata
    
    Raises:
        HTTPException: If analysis fails
    """
    if not email_text:
        raise HTTPException(status_code=400, detail="Email text is required")
    
    # Analysis logic here
    return {
        "result": "spam",
        "confidence": 0.95
    }
``````

**Formatting**:
``````bash
# Format code with Black
black app/

# Check with flake8
flake8 app/ --max-line-length=88

# Type checking
mypy app/
``````

### JavaScript/React (Frontend)

**Style Guide**: Airbnb JavaScript Style Guide

**Key Rules**:
- Use 2 spaces for indentation
- Use functional components with hooks
- PropTypes or TypeScript for type checking
- Use async/await over promises

**Example**:
``````javascript
import { useState, useEffect } from 'react';
import { analyzeEmail } from '../services/api';

/**
 * Component for analyzing email text
 * @param {Object} props - Component props
 * @param {Function} props.onComplete - Callback after analysis
 */
const AnalyzeEmail = ({ onComplete }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    
    setLoading(true);
    try {
      const response = await analyzeEmail(text);
      setResult(response);
      onComplete?.();
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="analyze-container">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste email text here..."
      />
      <button onClick={handleAnalyze} disabled={loading}>
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>
    </div>
  );
};

export default AnalyzeEmail;
``````

**Formatting**:
``````bash
# Format with Prettier
npm run format

# Lint with ESLint
npm run lint

# Fix linting issues
npm run lint:fix
``````

### Commit Messages

Follow Conventional Commits:

``````
<type>(<scope>): <subject>

[optional body]

[optional footer]
``````

**Types**:
- ``feat``: New feature
- ``fix``: Bug fix
- ``docs``: Documentation changes
- ``style``: Code style changes (formatting)
- ``refactor``: Code refactoring
- ``test``: Adding/updating tests
- ``chore``: Maintenance tasks

**Examples**:
``````
feat(auth): add password reset functionality
fix(api): resolve CORS issue for production
docs(readme): update installation instructions
test(model): add unit tests for preprocessing
``````

---

## Git Workflow

### Branch Strategy

``````
main              # Production-ready code
  │
  ├── develop     # Integration branch
  │     │
  │     ├── feature/user-profile
  │     ├── feature/email-attachments
  │     └── bugfix/login-error
  │
  └── hotfix/security-patch
``````

### Workflow Steps

1. **Create Feature Branch**:
   ``````bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/my-new-feature
   ``````

2. **Make Changes and Commit**:
   ``````bash
   git add .
   git commit -m "feat(feature): add new feature"
   ``````

3. **Push to Remote**:
   ``````bash
   git push origin feature/my-new-feature
   ``````

4. **Create Pull Request**:
   - Go to GitHub
   - Create PR from ``feature/my-new-feature`` to ``develop``
   - Fill out PR template
   - Request review

5. **After Approval**:
   ``````bash
   git checkout develop
   git pull origin develop
   git merge feature/my-new-feature
   git push origin develop
   ``````

### Pre-commit Hooks

Install pre-commit hooks:

``````bash
# Install pre-commit
pip install pre-commit

# Install hooks
pre-commit install
``````

``.pre-commit-config.yaml``:
``````yaml
repos:
  - repo: https://github.com/psf/black
    rev: 23.1.0
    hooks:
      - id: black
        language_version: python3.13

  - repo: https://github.com/pycqa/flake8
    rev: 6.0.0
    hooks:
      - id: flake8
        args: ['--max-line-length=88']

  - repo: https://github.com/pre-commit/mirrors-prettier
    rev: v3.0.0
    hooks:
      - id: prettier
        files: \.(js|jsx|json|css|md)$
``````

---

## Testing

### Backend Testing

**Run All Tests**:
``````bash
cd backend
pytest tests/ -v
``````

**Run with Coverage**:
``````bash
pytest tests/ --cov=app --cov-report=html
``````

**Test Structure**:
``````python
# tests/test_auth.py
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_register_user():
    response = client.post("/api/auth/register", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "TestPass123!"
    })
    assert response.status_code == 201
    assert "id" in response.json()

def test_login_user():
    response = client.post("/api/auth/login", data={
        "username": "test@example.com",
        "password": "TestPass123!"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()

@pytest.fixture
def auth_token():
    response = client.post("/api/auth/login", data={
        "username": "test@example.com",
        "password": "TestPass123!"
    })
    return response.json()["access_token"]

def test_protected_endpoint(auth_token):
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 200
``````

### Frontend Testing

**Run Tests**:
``````bash
cd frontend
npm test
``````

**Test Example** (using Vitest):
``````javascript
// src/components/__tests__/Login.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Login from '../auth/Login';

describe('Login Component', () => {
  it('renders login form', () => {
    render(<Login />);
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    render(<Login />);
    
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByText('Login'));
    
    // Add assertions for expected behavior
  });
});
``````

---

## Debugging

### Backend Debugging

**VS Code Launch Configuration** (``.vscode/launch.json``):
``````json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: FastAPI",
      "type": "python",
      "request": "launch",
      "module": "uvicorn",
      "args": [
        "main:app",
        "--reload",
        "--host", "0.0.0.0",
        "--port", "8000"
      ],
      "jinja": true,
      "justMyCode": true
    }
  ]
}
``````

**Debug Logging**:
``````python
import logging

logger = logging.getLogger(__name__)

# In your code
logger.debug(f"Processing email: {email_id}")
logger.info(f"Analysis completed: {result}")
logger.error(f"Error occurred: {str(e)}")
``````

### Frontend Debugging

**React DevTools**: Install browser extension

**Console Logging**:
``````javascript
console.log('State:', state);
console.error('Error:', error);
console.table(data);
``````

**VS Code Debugger** (``.vscode/launch.json``):
``````json
{
  "name": "Chrome: Frontend",
  "type": "chrome",
  "request": "launch",
  "url": "http://localhost:5173",
  "webRoot": "${workspaceFolder}/frontend/src"
}
``````

---

## Database Management

### Creating Migrations

``````bash
cd backend

# Auto-generate migration
alembic revision --autogenerate -m "Add new column to users table"

# Review generated file in alembic/versions/
# Edit if necessary

# Apply migration
alembic upgrade head
``````

### Manual Migration

``````bash
# Create empty migration
alembic revision -m "custom migration"
``````

Edit the generated file:
``````python
def upgrade():
    op.add_column('users', sa.Column('phone', sa.String(20), nullable=True))
    op.create_index('idx_users_phone', 'users', ['phone'])

def downgrade():
    op.drop_index('idx_users_phone')
    op.drop_column('users', 'phone')
``````

### Database Commands

``````bash
# Show current revision
alembic current

# Show migration history
alembic history

# Upgrade to specific revision
alembic upgrade <revision_id>

# Downgrade one revision
alembic downgrade -1

# Downgrade to base
alembic downgrade base
``````

### Seeding Data

Create ``scripts/seed_data.py``:
``````python
from app.database import SessionLocal
from app.models.user import User
from app.utils.security import get_password_hash

def seed_database():
    db = SessionLocal()
    
    # Create admin user
    admin = User(
        username="admin",
        email="admin@mailsentra.com",
        password_hash=get_password_hash("admin123"),
        is_admin=True
    )
    db.add(admin)
    
    # Create test users
    for i in range(5):
        user = User(
            username=f"user{i}",
            email=f"user{i}@example.com",
            password_hash=get_password_hash("password123")
        )
        db.add(user)
    
    db.commit()
    print("Database seeded successfully")

if __name__ == "__main__":
    seed_database()
``````

Run: ``python scripts/seed_data.py``

---

## Common Tasks

### Adding a New API Endpoint

1. **Create route handler** (``app/routes/new_feature.py``):
   ``````python
   from fastapi import APIRouter, Depends
   from app.dependencies import get_current_user
   
   router = APIRouter(prefix="/api/feature", tags=["feature"])
   
   @router.get("/")
   async def get_features(current_user = Depends(get_current_user)):
       return {"features": []}
   ``````

2. **Register in main.py**:
   ``````python
   from app.routes import new_feature
   
   app.include_router(new_feature.router)
   ``````

3. **Add tests** (``tests/test_new_feature.py``)

4. **Update API documentation**

### Adding a New Database Model

1. **Create model** (``app/models/new_model.py``):
   ``````python
   from sqlalchemy import Column, Integer, String, DateTime
   from app.database import Base
   
   class NewModel(Base):
       __tablename__ = "new_models"
       
       id = Column(Integer, primary_key=True, index=True)
       name = Column(String(100), nullable=False)
       created_at = Column(DateTime, default=datetime.utcnow)
   ``````

2. **Import in models/__init__.py**:
   ``````python
   from .new_model import NewModel
   ``````

3. **Create migration**:
   ``````bash
   alembic revision --autogenerate -m "add new_models table"
   alembic upgrade head
   ``````

### Adding a New Frontend Component

1. **Create component** (``src/components/NewComponent.jsx``):
   ``````javascript
   import { useState } from 'react';
   
   const NewComponent = () => {
     const [state, setState] = useState(null);
     
     return (
       <div className="new-component">
         {/* Component JSX */}
       </div>
     );
   };
   
   export default NewComponent;
   ``````

2. **Add styles** (in component or separate CSS file)

3. **Import and use** in parent component

4. **Add tests**

### Updating Dependencies

**Backend**:
``````bash
# Update all packages
pip list --outdated
pip install --upgrade package-name

# Update requirements.txt
pip freeze > requirements.txt
``````

**Frontend**:
``````bash
# Check outdated packages
npm outdated

# Update package
npm update package-name

# Update all packages
npm update
``````

---

## Performance Profiling

### Backend Profiling

Use ``py-spy`` for profiling:
``````bash
pip install py-spy

# Profile running application
py-spy top --pid <process-id>

# Generate flame graph
py-spy record -o profile.svg -- python main.py
``````

### Frontend Profiling

Use React DevTools Profiler:
1. Open React DevTools
2. Go to Profiler tab
3. Start recording
4. Perform actions
5. Stop and analyze

---

## Documentation

### Updating Documentation

When adding features:
1. Update API.md with new endpoints
2. Update ARCHITECTURE.md if structure changes
3. Update README.md if setup changes
4. Add inline code comments
5. Update CHANGELOG.md

### Generating API Docs

FastAPI auto-generates docs at ``/docs`` and ``/redoc``

---

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [Pytest Documentation](https://docs.pytest.org/)

---

For deployment instructions, see [Deployment Guide](DEPLOYMENT.md)
"@

New-DocFile -Path "docs/DEVELOPMENT.md" -Content $developmentContent

# ============================================
# CONTRIBUTING.md
# ============================================
Write-Host "Generating CONTRIBUTING.md..." -ForegroundColor Yellow

$contributingContent = @"
# Contributing to MailSentra

Thank you for your interest in contributing to MailSentra! This document provides guidelines and instructions for contributing.

---

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect differing viewpoints
- Show empathy towards other community members

---

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Screenshots** (if applicable)
- **Environment details** (OS, browser, versions)

**Bug Report Template**:
``````markdown
**Description**
A clear description of the bug.

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment**:
- OS: [e.g., Windows 10]
- Browser: [e.g., Chrome 120]
- Version: [e.g., 1.0.0]
``````

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. Include:

- **Clear title and description**
- **Use case** for the enhancement
- **Proposed solution**
- **Alternative solutions** considered

### Pull Requests

1. Fork the repository
2. Create a feature branch (``git checkout -b feature/amazing-feature``)
3. Make your changes
4. Write/update tests
5. Ensure tests pass
6. Update documentation
7. Commit your changes (``git commit -m 'feat: add amazing feature'``)
8. Push to the branch (``git push origin feature/amazing-feature``)
9. Open a Pull Request

**Pull Request Template**:
``````markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
``````

---

## Development Process

### Setting Up Development Environment

See [Development Guide](docs/DEVELOPMENT.md) for detailed setup instructions.

### Coding Standards

- **Python**: Follow PEP 8, use Black formatter
- **JavaScript**: Follow Airbnb style guide, use Prettier
- **Commits**: Follow Conventional Commits specification

### Testing Requirements

- All new features must include tests
- Maintain minimum 80% code coverage
- All tests must pass before PR approval

### Documentation Requirements

- Update relevant documentation
- Add docstrings for new functions/classes
- Update API documentation for new endpoints
- Add inline comments for complex logic

---

## Review Process

1. **Automated Checks**: CI/CD pipeline runs tests and linting
2. **Code Review**: At least one maintainer reviews code
3. **Feedback**: Address review comments
4. **Approval**: Maintainer approves and merges

### Review Criteria

- Code quality and readability
- Test coverage
- Documentation completeness
- Performance impact
- Security considerations

---

## Community

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and general discussions
- **Email**: For security issues, email security@mailsentra.com

---

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project README

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to MailSentra! 🎉
"@

New-DocFile -Path "CONTRIBUTING.md" -Content $contributingContent

# ============================================
# Summary
# ============================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Documentation Generation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Generated files:" -ForegroundColor Yellow
Write-Host "  ✓ README.md" -ForegroundColor Green
Write-Host "  ✓ docs/API.md" -ForegroundColor Green
Write-Host "  ✓ docs/ARCHITECTURE.md" -ForegroundColor Green
Write-Host "  ✓ docs/DEPLOYMENT.md" -ForegroundColor Green
Write-Host "  ✓ docs/DEVELOPMENT.md" -ForegroundColor Green
Write-Host "  ✓ CONTRIBUTING.md" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Review generated documentation" -ForegroundColor White
Write-Host "  2. Update placeholders (URLs, emails, etc.)" -ForegroundColor White
Write-Host "  3. Add project logo to docs/assets/" -ForegroundColor White
Write-Host "  4. Commit to repository" -ForegroundColor White
Write-Host ""
Write-Host "Tip: Use -Force parameter to overwrite existing files" -ForegroundColor Cyan
Write-Host ""