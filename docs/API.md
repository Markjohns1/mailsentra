# API Reference

Complete API documentation for MailSentra backend services.

**Base URL**: `http://localhost:8000` (development)

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

**Endpoint**: `POST /api/auth/register`

**Request Body**:
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response** (201 Created):
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "is_active": true,
  "is_admin": false,
  "created_at": "2025-10-26T10:30:00Z"
}
```

**Validation Rules**:
- Username: 3-50 characters, alphanumeric with underscores
- Email: Valid email format
- Password: Minimum 8 characters, at least one uppercase, one lowercase, one number

---

### Login

Authenticate and receive JWT access token.

**Endpoint**: `POST /api/auth/login`

**Request Body** (form-urlencoded):
```
username=john@example.com
password=SecurePass123!
```

**Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Token Expiration**: 30 minutes (configurable)

---

### Get Current User

Retrieve authenticated user information.

**Endpoint**: `GET /api/auth/me`

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "is_active": true,
  "is_admin": false,
  "created_at": "2025-10-26T10:30:00Z"
}
```

---

### Logout

Invalidate current session (client-side token removal).

**Endpoint**: `POST /api/auth/logout`

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "message": "Successfully logged out"
}
```

---

## Email Analysis

### Analyze Email

Classify email as spam or ham using ML model.

**Endpoint**: `POST /api/analyze`

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "email_text": "Congratulations! You've won ,000,000. Click here to claim your prize now!"
}
```

**Response** (200 OK):
```json
{
  "id": 123,
  "result": "spam",
  "confidence": 0.9534,
  "email_text": "Congratulations! You've won...",
  "analyzed_at": "2025-10-26T10:35:22Z"
}
```

**Result Values**:
- `spam`: Email classified as spam
- `ham`: Email classified as legitimate

**Confidence Score**: Float between 0.0 and 1.0 (higher = more confident)

---

## Logs Management

### Get Analysis Logs

Retrieve paginated list of user's email analyses.

**Endpoint**: `GET /api/logs`

**Headers**:
```
Authorization: Bearer {token}
```

**Query Parameters**:
- `page` (optional): Page number, default: 1
- `per_page` (optional): Items per page, default: 20, max: 100
- `result` (optional): Filter by result (`spam` or `ham`)
- `search` (optional): Search in email text

**Example Request**:
```
GET /api/logs?page=1&per_page=20&result=spam
```

**Response** (200 OK):
```json
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
```

---

### Get Single Log

Retrieve specific analysis log by ID.

**Endpoint**: `GET /api/logs/{log_id}`

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "id": 123,
  "email_text": "Congratulations! You've won...",
  "result": "spam",
  "confidence": 0.9534,
  "analyzed_at": "2025-10-26T10:35:22Z",
  "feedback_given": false,
  "user_id": 1
}
```

---

### Delete Log

Delete specific analysis log.

**Endpoint**: `DELETE /api/logs/{log_id}`

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "message": "Log deleted successfully"
}
```

---

## Feedback System

### Submit Feedback

Correct misclassified email to improve model.

**Endpoint**: `POST /api/feedback`

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "log_id": 123,
  "correct_label": "ham"
}
```

**Valid Labels**: `spam`, `ham`

**Response** (200 OK):
```json
{
  "id": 45,
  "log_id": 123,
  "correct_label": "ham",
  "submitted_at": "2025-10-26T10:40:15Z",
  "message": "Feedback submitted successfully"
}
```

---

### Get User Feedback

Retrieve all feedback submitted by user.

**Endpoint**: `GET /api/feedback`

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
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
```

---

## Admin Operations

**Note**: All admin endpoints require admin privileges (`is_admin: true`).

### Retrain Model

Trigger model retraining with user feedback data.

**Endpoint**: `POST /api/retrain`

**Headers**:
```
Authorization: Bearer {admin_token}
```

**Request Body** (optional):
```json
{
  "min_feedback_count": 50
}
```

**Response** (200 OK):
```json
{
  "message": "Model retraining initiated",
  "feedback_count": 127,
  "previous_accuracy": 0.9534,
  "new_accuracy": 0.9621,
  "model_version": "v1.2",
  "trained_at": "2025-10-26T11:00:00Z"
}
```

---

### Get All Users

List all registered users (admin only).

**Endpoint**: `GET /api/admin/users`

**Headers**:
```
Authorization: Bearer {admin_token}
```

**Query Parameters**:
- `page` (optional): Page number, default: 1
- `per_page` (optional): Items per page, default: 50

**Response** (200 OK):
```json
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
```

---

## Metrics & Monitoring

### Get System Metrics

Retrieve system-wide analytics and performance metrics.

**Endpoint**: `GET /api/metrics`

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
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
```

---

### Get User Statistics

Get statistics for current user.

**Endpoint**: `GET /api/user/stats`

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "total_analyses": 45,
  "spam_detected": 28,
  "ham_detected": 17,
  "feedback_given": 5,
  "accuracy_rate": 0.956,
  "member_since": "2025-10-26T10:30:00Z"
}
```

---

## Error Handling

### Standard Error Response

All errors follow this format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

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
```json
{
  "detail": "Could not validate credentials"
}
```

**Validation Error** (422):
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

**Rate Limit Error** (429):
```json
{
  "detail": "Rate limit exceeded. Please try again in 60 seconds."
}
```

---

## Rate Limiting

**Default Limits**:
- Authenticated users: 60 requests per minute
- Unauthenticated: 20 requests per minute

**Headers**:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1698325200
```

---

## Pagination

All list endpoints support pagination with consistent parameters:

- `page`: Page number (starts at 1)
- `per_page`: Items per page (max varies by endpoint)

Response includes:
```json
{
  "data": [...],
  "total": 156,
  "page": 1,
  "per_page": 20,
  "total_pages": 8
}
```

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
