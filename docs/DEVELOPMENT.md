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
   ```bash
   git clone https://github.com/yourusername/mailsentra.git
   cd mailsentra
   ```

2. **Backend Setup**:
   ```bash
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
   ```

3. **Frontend Setup**:
   ```bash
   cd ../frontend
   
   # Install dependencies
   npm install
   
   # Install development tools
   npm install -D eslint prettier
   
   # Create .env file
   cp .env.example .env
   # Edit .env with API URL
   ```

### IDE Setup

**VS Code Recommended Extensions**:
- Python
- Pylance
- ESLint
- Prettier
- Docker
- GitLens

**VS Code Settings** (`.vscode/settings.json`):
```json
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
```

---

## Project Structure

### Backend Structure

```
backend/
â”œâ”€â”€ alembic/                    # Database migrations
â”‚   â”œâ”€â”€ versions/               # Migration files
â”‚   â”œâ”€â”€ env.py                  # Alembic environment
â”‚   â””â”€â”€ script.py.mako         # Migration template
â”‚
â”œâ”€â”€ app/
â”‚   â”œâ”€â”€ __init__.py
â”‚   â”œâ”€â”€ config.py              # Configuration management
â”‚   â”œâ”€â”€ database.py            # Database connection
â”‚   â”œâ”€â”€ dependencies.py        # FastAPI dependencies
â”‚   â”‚
â”‚   â”œâ”€â”€ models/                # SQLAlchemy models
â”‚   â”‚   â”œâ”€â”€ __init__.py
â”‚   â”‚   â”œâ”€â”€ user.py
â”‚   â”‚   â”œâ”€â”€ spam_log.py
â”‚   â”‚   â”œâ”€â”€ feedback.py
â”‚   â”‚   â””â”€â”€ email.py
â”‚   â”‚
â”‚   â”œâ”€â”€ routes/                # API endpoints
â”‚   â”‚   â”œâ”€â”€ __init__.py
â”‚   â”‚   â”œâ”€â”€ auth.py           # Authentication
â”‚   â”‚   â”œâ”€â”€ analyze.py        # Email analysis
â”‚   â”‚   â”œâ”€â”€ logs.py           # Log management
â”‚   â”‚   â”œâ”€â”€ feedback.py       # Feedback system
â”‚   â”‚   â”œâ”€â”€ retrain.py        # Model retraining
â”‚   â”‚   â”œâ”€â”€ metrics.py        # Analytics
â”‚   â”‚   â””â”€â”€ admin.py          # Admin operations
â”‚   â”‚
â”‚   â”œâ”€â”€ services/              # Business logic
â”‚   â”‚   â”œâ”€â”€ __init__.py
â”‚   â”‚   â”œâ”€â”€ model_service.py  # ML operations
â”‚   â”‚   â”œâ”€â”€ preprocessing.py  # Text preprocessing
â”‚   â”‚   â”œâ”€â”€ auth_service.py   # Auth logic
â”‚   â”‚   â””â”€â”€ email_service.py  # Email operations
â”‚   â”‚
â”‚   â””â”€â”€ utils/                 # Utilities
â”‚       â”œâ”€â”€ __init__.py
â”‚       â”œâ”€â”€ logger.py         # Logging config
â”‚       â””â”€â”€ security.py       # Security helpers
â”‚
â”œâ”€â”€ dataset/                   # Training data
â”‚   â”œâ”€â”€ SMSSpamCollection     # Raw dataset
â”‚   â””â”€â”€ readme
â”‚
â”œâ”€â”€ ml_models/                 # Trained models
â”‚   â””â”€â”€ spam_model.pkl
â”‚
â”œâ”€â”€ tests/                     # Unit tests
â”‚   â”œâ”€â”€ __init__.py
â”‚   â”œâ”€â”€ test_auth.py
â”‚   â”œâ”€â”€ test_model.py
â”‚   â””â”€â”€ test_api.py
â”‚
â”œâ”€â”€ main.py                    # Application entry point
â”œâ”€â”€ train_model.py            # Model training script
â”œâ”€â”€ retrain_service.py        # Retraining service
â”œâ”€â”€ requirements.txt          # Dependencies
â”œâ”€â”€ .env                      # Environment variables
â””â”€â”€ alembic.ini              # Alembic configuration
```

### Frontend Structure

```
frontend/
â”œâ”€â”€ public/                   # Static assets
â”‚   â”œâ”€â”€ favicon.ico
â”‚   â””â”€â”€ robots.txt
â”‚
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ components/          # React components
â”‚   â”‚   â”œâ”€â”€ auth/
â”‚   â”‚   â”‚   â”œâ”€â”€ Login.jsx
â”‚   â”‚   â”‚   â”œâ”€â”€ Register.jsx
â”‚   â”‚   â”‚   â””â”€â”€ ProtectedRoute.jsx
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ dashboard/
â”‚   â”‚   â”‚   â”œâ”€â”€ Dashboard.jsx
â”‚   â”‚   â”‚   â”œâ”€â”€ AnalyzeEmail.jsx
â”‚   â”‚   â”‚   â”œâ”€â”€ LogsTable.jsx
â”‚   â”‚   â”‚   â””â”€â”€ StatsCard.jsx
â”‚   â”‚   â”‚
â”‚   â”‚   â””â”€â”€ common/
â”‚   â”‚       â”œâ”€â”€ Navbar.jsx
â”‚   â”‚       â”œâ”€â”€ Toast.jsx
â”‚   â”‚       â””â”€â”€ Loading.jsx
â”‚   â”‚
â”‚   â”œâ”€â”€ context/            # React context
â”‚   â”‚   â”œâ”€â”€ AuthContext.jsx
â”‚   â”‚   â””â”€â”€ ToastContext.jsx
â”‚   â”‚
â”‚   â”œâ”€â”€ services/           # API services
â”‚   â”‚   â”œâ”€â”€ api.js
â”‚   â”‚   â”œâ”€â”€ authService.js
â”‚   â”‚   â””â”€â”€ logsService.js
â”‚   â”‚
â”‚   â”œâ”€â”€ utils/              # Helper functions
â”‚   â”‚   â”œâ”€â”€ constants.js
â”‚   â”‚   â””â”€â”€ helpers.js
â”‚   â”‚
â”‚   â”œâ”€â”€ App.jsx             # Main component
â”‚   â”œâ”€â”€ main.jsx            # Entry point
â”‚   â””â”€â”€ index.css           # Global styles
â”‚
â”œâ”€â”€ package.json            # Dependencies
â”œâ”€â”€ vite.config.js         # Vite configuration
â”œâ”€â”€ tailwind.config.js     # Tailwind configuration
â””â”€â”€ .env                   # Environment variables
```

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
```python
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
```

**Formatting**:
```bash
# Format code with Black
black app/

# Check with flake8
flake8 app/ --max-line-length=88

# Type checking
mypy app/
```

### JavaScript/React (Frontend)

**Style Guide**: Airbnb JavaScript Style Guide

**Key Rules**:
- Use 2 spaces for indentation
- Use functional components with hooks
- PropTypes or TypeScript for type checking
- Use async/await over promises

**Example**:
```javascript
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
```

**Formatting**:
```bash
# Format with Prettier
npm run format

# Lint with ESLint
npm run lint

# Fix linting issues
npm run lint:fix
```

### Commit Messages

Follow Conventional Commits:

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Maintenance tasks

**Examples**:
```
feat(auth): add password reset functionality
fix(api): resolve CORS issue for production
docs(readme): update installation instructions
test(model): add unit tests for preprocessing
```

---

## Git Workflow

### Branch Strategy

```
main              # Production-ready code
  â”‚
  â”œâ”€â”€ develop     # Integration branch
  â”‚     â”‚
  â”‚     â”œâ”€â”€ feature/user-profile
  â”‚     â”œâ”€â”€ feature/email-attachments
  â”‚     â””â”€â”€ bugfix/login-error
  â”‚
  â””â”€â”€ hotfix/security-patch
```

### Workflow Steps

1. **Create Feature Branch**:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/my-new-feature
   ```

2. **Make Changes and Commit**:
   ```bash
   git add .
   git commit -m "feat(feature): add new feature"
   ```

3. **Push to Remote**:
   ```bash
   git push origin feature/my-new-feature
   ```

4. **Create Pull Request**:
   - Go to GitHub
   - Create PR from `feature/my-new-feature` to `develop`
   - Fill out PR template
   - Request review

5. **After Approval**:
   ```bash
   git checkout develop
   git pull origin develop
   git merge feature/my-new-feature
   git push origin develop
   ```

### Pre-commit Hooks

Install pre-commit hooks:

```bash
# Install pre-commit
pip install pre-commit

# Install hooks
pre-commit install
```

`.pre-commit-config.yaml`:
```yaml
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
```

---

## Testing

### Backend Testing

**Run All Tests**:
```bash
cd backend
pytest tests/ -v
```

**Run with Coverage**:
```bash
pytest tests/ --cov=app --cov-report=html
```

**Test Structure**:
```python
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
```

### Frontend Testing

**Run Tests**:
```bash
cd frontend
npm test
```

**Test Example** (using Vitest):
```javascript
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
```

---

## Debugging

### Backend Debugging

**VS Code Launch Configuration** (`.vscode/launch.json`):
```json
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
```

**Debug Logging**:
```python
import logging

logger = logging.getLogger(__name__)

# In your code
logger.debug(f"Processing email: {email_id}")
logger.info(f"Analysis completed: {result}")
logger.error(f"Error occurred: {str(e)}")
```

### Frontend Debugging

**React DevTools**: Install browser extension

**Console Logging**:
```javascript
console.log('State:', state);
console.error('Error:', error);
console.table(data);
```

**VS Code Debugger** (`.vscode/launch.json`):
```json
{
  "name": "Chrome: Frontend",
  "type": "chrome",
  "request": "launch",
  "url": "http://localhost:5173",
  "webRoot": "/frontend/src"
}
```

---

## Database Management

### Creating Migrations

```bash
cd backend

# Auto-generate migration
alembic revision --autogenerate -m "Add new column to users table"

# Review generated file in alembic/versions/
# Edit if necessary

# Apply migration
alembic upgrade head
```

### Manual Migration

```bash
# Create empty migration
alembic revision -m "custom migration"
```

Edit the generated file:
```python
def upgrade():
    op.add_column('users', sa.Column('phone', sa.String(20), nullable=True))
    op.create_index('idx_users_phone', 'users', ['phone'])

def downgrade():
    op.drop_index('idx_users_phone')
    op.drop_column('users', 'phone')
```

### Database Commands

```bash
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
```

### Seeding Data

Create `scripts/seed_data.py`:
```python
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
```

Run: `python scripts/seed_data.py`

---

## Common Tasks

### Adding a New API Endpoint

1. **Create route handler** (`app/routes/new_feature.py`):
   ```python
   from fastapi import APIRouter, Depends
   from app.dependencies import get_current_user
   
   router = APIRouter(prefix="/api/feature", tags=["feature"])
   
   @router.get("/")
   async def get_features(current_user = Depends(get_current_user)):
       return {"features": []}
   ```

2. **Register in main.py**:
   ```python
   from app.routes import new_feature
   
   app.include_router(new_feature.router)
   ```

3. **Add tests** (`tests/test_new_feature.py`)

4. **Update API documentation**

### Adding a New Database Model

1. **Create model** (`app/models/new_model.py`):
   ```python
   from sqlalchemy import Column, Integer, String, DateTime
   from app.database import Base
   
   class NewModel(Base):
       __tablename__ = "new_models"
       
       id = Column(Integer, primary_key=True, index=True)
       name = Column(String(100), nullable=False)
       created_at = Column(DateTime, default=datetime.utcnow)
   ```

2. **Import in models/__init__.py**:
   ```python
   from .new_model import NewModel
   ```

3. **Create migration**:
   ```bash
   alembic revision --autogenerate -m "add new_models table"
   alembic upgrade head
   ```

### Adding a New Frontend Component

1. **Create component** (`src/components/NewComponent.jsx`):
   ```javascript
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
   ```

2. **Add styles** (in component or separate CSS file)

3. **Import and use** in parent component

4. **Add tests**

### Updating Dependencies

**Backend**:
```bash
# Update all packages
pip list --outdated
pip install --upgrade package-name

# Update requirements.txt
pip freeze > requirements.txt
```

**Frontend**:
```bash
# Check outdated packages
npm outdated

# Update package
npm update package-name

# Update all packages
npm update
```

---

## Performance Profiling

### Backend Profiling

Use `py-spy` for profiling:
```bash
pip install py-spy

# Profile running application
py-spy top --pid <process-id>

# Generate flame graph
py-spy record -o profile.svg -- python main.py
```

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

FastAPI auto-generates docs at `/docs` and `/redoc`

---

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [Pytest Documentation](https://docs.pytest.org/)

---

For deployment instructions, see [Deployment Guide](DEPLOYMENT.md)
