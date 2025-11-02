# MailSentra

![Python](https://img.shields.io/badge/python-3.13-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-009688.svg)
![React](https://img.shields.io/badge/React-18.2.0-61dafb.svg)
![Node](https://img.shields.io/badge/node-22.21.0-339933.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

**Enterprise-Grade Email Spam Detection Platform**

[Features](#features) • [Quick Start](#quick-start) • [Documentation](docs/) • [API Reference](docs/API.md) • [Contributing](CONTRIBUTING.md)

---

MailSentra is a production-ready, full-stack email spam detection system powered by machine learning. It combines advanced NLP techniques with a modern web interface to provide real-time spam classification, continuous learning through user feedback, and comprehensive analytics.

## ✨ Key Features

- **Real-time Classification**: Analyze emails instantly with 95%+ accuracy
- **Adaptive Learning**: Model improves continuously from user feedback
- **Enterprise Security**: JWT authentication, rate limiting, and audit logs
- **Scalable Architecture**: Microservices-ready with Docker support
- **Analytics Dashboard**: Real-time metrics and performance monitoring
- **API-First Design**: RESTful API with comprehensive OpenAPI documentation

## 🏗️ Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ React Client │◄───►│FastAPI Server│◄───►│  PostgreSQL  │
│  (Frontend)  │     │   (Backend)  │     │  (Database)  │
└──────────────┘     └──────┬───────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  ML Pipeline │
                     │(Scikit-learn)│
                     └──────────────┘
```

## 📊 Features Status

| Feature | Description | Status |
|---------|-------------|--------|
| **Spam Detection** | ML-powered email classification | ✅ Production |
| **User Management** | Registration, authentication, profiles | ✅ Production |
| **Analysis History** | Searchable log with filtering | ✅ Production |
| **Feedback Loop** | User corrections for model improvement | ✅ Production |
| **Model Retraining** | Admin-controlled retraining pipeline | ✅ Production |
| **Dataset Upload** | **NEW!** Admin upload CSV datasets for training | ✅ Production |
| **Custom Training** | **NEW!** Train models with your own datasets | ✅ Production |
| **Analytics** | System metrics and performance tracking | ✅ Production |
| **Rate Limiting** | API protection and abuse prevention | ✅ Production |
| **Audit Logging** | Comprehensive activity tracking | ✅ Production |

## 🚀 Quick Start

### Prerequisites

- Python 3.13+
- Node.js 22.21.0+
- PostgreSQL 14+ (production) or SQLite (development)
- Git

### Installation

#### 1. Clone the repository
```bash
git clone https://github.com/Markjohns1/mailsentra.git
cd mailsentra
```

#### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Run database migrations
alembic upgrade head

# Train the ML model
python train_model.py

# Start the backend server
uvicorn main:app --reload
```

#### 3. Frontend Setup
```bash
# Open a new terminal
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start the development server
npm run dev
```

### Access the Application

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Alternative API Docs**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## 📸 Screenshots

> **Note**: Screenshots will be added soon. Check back for visual previews of the dashboard, analysis interface, and analytics pages.

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/ARCHITECTURE.md) | System design and component interactions |
| [API Reference](docs/API.md) | Complete API endpoint documentation |
| [Development Guide](docs/DEVELOPMENT.md) | Setup and development workflows |
| [Deployment Guide](docs/DEPLOYMENT.md) | Production deployment instructions |
| [Training Guide](docs/TRAINING_GUIDE.md) | **NEW!** Model training & dataset management |
| [Training Quick Start](docs/TRAINING_QUICK_START.md) | Quick reference for training workflows |

## 🛠️ Technology Stack

### Backend
- **FastAPI 0.104.1** - Modern, fast web framework
- **SQLAlchemy** - Database ORM
- **Alembic** - Database migrations
- **Scikit-learn** - Machine learning
- **NLTK** - Natural language processing
- **BeautifulSoup4** - HTML parsing
- **Passlib** - Password hashing
- **PyJWT** - JWT authentication
- **SlowAPI** - Rate limiting

### Frontend
- **React 18.2.0** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Navigation
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Data visualization
- **Lucide React** - Icon library

### Database
- **SQLite** - Development environment
- **PostgreSQL** - Production deployment

## 📁 Project Structure

```
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
│   ├── tests/                # Unit tests
│   ├── main.py               # Application entry point
│   └── requirements.txt      # Python dependencies
├── frontend/
│   └── src/
│       ├── components/       # React components
│       ├── context/          # State management
│       ├── pages/            # Page components
│       └── services/         # API services
├── docs/                     # Documentation
├── README.md                 # This file
├── CONTRIBUTING.md           # Contribution guidelines
└── LICENSE                   # MIT License
```

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest tests/ -v

# Frontend tests
cd frontend
npm test

# Coverage report
pytest --cov=app tests/
```

## 🐳 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:
- Code of Conduct
- Development process
- Submitting pull requests
- Coding standards

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**John O. Mark** - Founder & Lead Developer

- Email: [johnmarkoguta@gmail.com](mailto:johnmarkoguta@gmail.com)
- GitHub: [@Markjohns1](https://github.com/Markjohns1)

## 📞 Support

- 📧 Email: [johnmarkoguta@gmail.com](mailto:johnmarkoguta@gmail.com)
- 🐛 Issues: [GitHub Issues](https://github.com/Markjohns1/mailsentra/issues)
- 📖 Documentation: [docs/](docs/)

## 🙏 Acknowledgments

- SMS Spam Collection Dataset
- FastAPI and React communities
- All contributors and supporters

## 📈 Project Roadmap

- [ ] Mobile application (iOS/Android)
- [ ] Browser extension
- [ ] Multi-language support
- [ ] Advanced analytics with AI insights
- [ ] Integration with email providers (Gmail, Outlook)
- [ ] Batch email processing
- [ ] Custom model training for enterprises

---

**Made with ❤️ by John O. Mark**

*Version 1.0.0 - Last updated: October 2024*
