# MailSentra

<div align="center">

**Enterprise-Grade Email Spam Detection Platform**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/yourusername/mailsentra)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.13+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/react-18.2+-61DAFB.svg)](https://reactjs.org/)

[Features](#features) â€¢ [Quick Start](#quick-start) â€¢ [Documentation](docs/) â€¢ [API Reference](docs/API.md) â€¢ [Contributing](CONTRIBUTING.md)

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

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”      â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”      â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  React Client   â”‚â—„â”€â”€â”€â”€â–ºâ”‚   FastAPI Server â”‚â—„â”€â”€â”€â”€â–ºâ”‚   PostgreSQL    â”‚
â”‚  (Frontend)     â”‚      â”‚    (Backend)     â”‚      â”‚   (Database)    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜      â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜      â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                 â”‚
                                 â–¼
                         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                         â”‚   ML Pipeline    â”‚
                         â”‚  (Scikit-learn)  â”‚
                         â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

## Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Spam Detection** | ML-powered email classification | âœ… Production |
| **User Management** | Registration, authentication, profiles | âœ… Production |
| **Analysis History** | Searchable log with filtering | âœ… Production |
| **Feedback Loop** | User corrections for model improvement | âœ… Production |
| **Model Retraining** | Admin-controlled retraining pipeline | âœ… Production |
| **Analytics** | System metrics and performance tracking | âœ… Production |
| **Rate Limiting** | API protection and abuse prevention | âœ… Production |
| **Audit Logging** | Comprehensive activity tracking | âœ… Production |

## Quick Start

### Prerequisites

- Python 3.13+
- Node.js 18+
- PostgreSQL 14+ (or SQLite for development)
- Git

### Installation

```bash
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
```

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
```
FastAPI          - Modern web framework
SQLAlchemy       - Database ORM
Alembic          - Database migrations
Scikit-learn     - Machine learning
NLTK             - Natural language processing
BeautifulSoup4   - HTML parsing
Passlib          - Password hashing
PyJWT            - JWT authentication
SlowAPI          - Rate limiting
```

### Frontend
```
React 18         - UI framework
Vite             - Build tool
React Router     - Navigation
Axios            - HTTP client
Tailwind CSS     - Styling
Recharts         - Data visualization
Lucide React     - Icons
```

## Project Structure

```
mailsentra/
â”œâ”€â”€ backend/
â”‚   â”œâ”€â”€ alembic/              # Database migrations
â”‚   â”œâ”€â”€ app/
â”‚   â”‚   â”œâ”€â”€ models/           # Database models
â”‚   â”‚   â”œâ”€â”€ routes/           # API endpoints
â”‚   â”‚   â”œâ”€â”€ services/         # Business logic
â”‚   â”‚   â””â”€â”€ utils/            # Utilities
â”‚   â”œâ”€â”€ dataset/              # Training data
â”‚   â”œâ”€â”€ ml_models/            # Trained models
â”‚   â””â”€â”€ tests/                # Unit tests
â”œâ”€â”€ frontend/
â”‚   â””â”€â”€ src/
â”‚       â”œâ”€â”€ components/       # React components
â”‚       â”œâ”€â”€ context/          # State management
â”‚       â”œâ”€â”€ pages/            # Page components
â”‚       â””â”€â”€ services/         # API services
â”œâ”€â”€ docs/                     # Documentation
â””â”€â”€ README.md
```

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## Support

- ðŸ“§ Email: support@mailsentra.com
- ðŸ’¬ Issues: [GitHub Issues](https://github.com/yourusername/mailsentra/issues)
- ðŸ“– Docs: [Documentation](docs/)

---

<div align="center">

Made with â¤ï¸ by the MailSentra Team

</div>
