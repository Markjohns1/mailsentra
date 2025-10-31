# MailSentra - Email Spam Detection Platform

## Project Overview
MailSentra is a full-stack email spam detection platform powered by machine learning. It features:
- **Frontend**: React + Vite on port 5000
- **Backend**: Python FastAPI on port 8000
- **Database**: PostgreSQL (Replit managed)
- **ML Model**: Scikit-learn spam classifier with 98.30% accuracy

## Architecture
- Frontend serves the web interface and proxies API requests to backend
- Backend provides REST API and ML predictions
- PostgreSQL stores user data, logs, and feedback

## Running the Application

### Development Mode

#### 1. Frontend (Already Running)
The frontend workflow is already configured and running on port 5000.
- The webview shows the frontend automatically
- Hot reload is enabled for development

#### 2. Backend
To run the backend server, open a new shell and run:
```bash
./run_backend.sh
```
Or manually:
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The backend will be available at `http://localhost:8000`
- API docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

### First Time Setup
The database migrations and ML model have already been set up:
- ✅ Database migrations applied
- ✅ ML model trained (98.30% accuracy)
- ✅ Dependencies installed

### Default Admin Account
- Email: admin@spamdetector.com
- Password: changeme123

⚠️ **Important**: Change the admin password after first login!

## Project Structure
```
.
├── frontend/          # React application (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── vite.config.js
├── backend/           # FastAPI application
│   ├── app/
│   │   ├── models/    # Database models
│   │   ├── routes/    # API endpoints
│   │   └── services/  # Business logic
│   ├── ml_models/     # Trained ML models
│   └── main.py
└── run_backend.sh     # Backend startup script
```

## Environment Configuration
- Frontend: Configured for Replit (port 5000, host 0.0.0.0)
- Backend: Uses Replit PostgreSQL database
- Environment variables are set in `backend/.env`

## Deployment
The deployment is configured to run in VM mode:
- Both frontend and backend will run together
- Backend serves on port 5000 in production
- Frontend is built as static files

## Recent Changes

### October 31, 2025 - UI Redesign & ML Fixes
- **Complete UI Transformation**: 
  - Implemented unified professional dark theme (slate-900/800 backgrounds with blue-600 accents)
  - Redesigned Login/Register pages with gradient cards and modern icons
  - Redesigned Dashboard with gradient stat cards and responsive layout
  - Updated all components (Navbar, StatsCard, AnalyzeEmail, LogsTable) for consistency
  - Created centralized theme configuration system
  - All pages now fully responsive and visually cohesive

- **Critical ML Training Fixes**:
  - Fixed catastrophic forgetting in model retraining
  - Retraining now combines feedback with original dataset (5574 base samples + feedback)
  - Added label validation and class distribution logging
  - Implemented smart stratification (disables for imbalanced tiny datasets)
  - Added comprehensive error handling and user feedback
  - Model versioning system validated and stable

- **Initial Replit Setup**:
  - Configured Vite for port 5000 with Replit proxy support
  - Updated CORS to allow all origins for Replit environment
  - Fixed database migration dependencies
  - Installed all required dependencies (Python + Node.js)
  - Trained ML model with 98.30% accuracy

## Development Notes
- Frontend proxy forwards `/api/*` requests to `http://localhost:8000`
- Backend must be running for API calls to work
- Hot reload is enabled for both frontend and backend
- Database is automatically managed by Replit

## ML Model Information
- **Algorithm**: Multinomial Naive Bayes
- **Base Dataset**: SMS Spam Collection (5,574 samples)
- **Retraining**: Combines user feedback with original dataset to prevent overfitting
- **Minimum Feedback**: 10 misclassified samples required for retraining
- **Label Validation**: Automatically normalizes 'spam', 'ham', 'not spam' labels
- **Stratification**: Intelligently disabled for tiny/imbalanced datasets to prevent errors

## Troubleshooting
- **Backend not responding**: Make sure to run `./run_backend.sh` in a separate shell
- **Database issues**: Check that DATABASE_URL environment variable is set
- **Frontend not loading**: Ensure workflow is running (it should auto-start)
