# DEVELOPING STUDENT EMAIL PHISHING AND SPAM ATTACKS DETECTION, FILTERING AND PREVENTION MEASURES

---

# MAILSENTRA SYSTEM

---

## SYSTEM DOCUMENTATION

---

**SUBMITTED BY,**

**JOHN ORIOKI OGUTA**

**DCS-01-8645/2024**

---

A SYSTEM DOCUMENTATION SUBMITTED IN PARTIAL FULFILMENT FOR THE AWARD OF DIPLOMA IN COMPUTER SCIENCE BY ZETECH UNIVERSITY

---

**APRIL 2026**

---

## DECLARATION

I, John Orioki Oguta, hereby declare that this system documentation is my original work and has not been submitted for examination in any other institution. Where other people's work has been used, proper references have been made. This documentation has been prepared in accordance with the guidelines provided by the Department of ICT and Engineering, Zetech University.

Signature: _________________                                               Date: _________________

---

## DEDICATION

This project is dedicated to my family and friends who have supported me throughout my academic journey. I also dedicate this work to all students who have been victims of phishing and spam email attacks. May this system help protect future students from such threats.

---

## ABSTRACT

This system documentation presents MailSentra, a comprehensive solution designed to detect, filter, and prevent spam and phishing emails targeting students in educational environments. The system employs machine learning algorithms, specifically Multinomial Naive Bayes classification with TF-IDF vectorization, to analyze email content and accurately classify messages as spam or legitimate. MailSentra features a modern web-based interface built with React for the frontend and FastAPI for the backend, providing real-time email analysis with over 95% accuracy. The system includes user authentication with JWT tokens, an analysis history log, a feedback mechanism for continuous model improvement, and an administrative dashboard for system monitoring. Key features include real-time spam classification, adaptive learning through user feedback, comprehensive analytics, and user education on safe email practices. The system was developed using Python, React, SQLAlchemy, and Scikit-learn, following industry best practices for security and scalability. Testing results demonstrate effective spam detection capabilities, making MailSentra a practical and accessible solution for protecting student populations from email-based cyber threats.

---

## DEFINITION OF KEY TERMS

i. **Spam** refers to unwanted or unsolicited messages sent in bulk to multiple recipients, usually for advertising purposes or to spread malicious content.

ii. **Phishing** is a fraudulent attempt to obtain sensitive information such as usernames, passwords, and credit card details by pretending to be a trustworthy entity in electronic communication.

iii. **Machine Learning (ML)** is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed.

iv. **Naive Bayes Classifier** is a probabilistic machine learning algorithm based on Bayes' theorem, commonly used for text classification tasks like spam detection.

v. **TF-IDF (Term Frequency-Inverse Document Frequency)** is a numerical statistic that reflects how important a word is to a document in a collection, used to convert text into numerical features for machine learning.

vi. **JWT (JSON Web Token)** is a compact, URL-safe means of representing claims to be transferred between two parties, used for authentication and information exchange.

vii. **API (Application Programming Interface)** is a set of protocols and tools for building software applications that specify how software components should interact.

viii. **Frontend** refers to the client-side of a web application that users interact with directly, typically built with HTML, CSS, and JavaScript frameworks.

ix. **Backend** refers to the server-side of a web application that handles data processing, business logic, and database operations.

x. **Database** is an organized collection of structured information or data stored electronically in a computer system.

---

## ABBREVIATIONS AND ACRONYMS

- **API** - Application Programming Interface
- **CSS** - Cascading Style Sheets
- **CRUD** - Create, Read, Update, Delete
- **CSV** - Comma Separated Values
- **HTML** - Hypertext Markup Language
- **HTTP** - Hypertext Transfer Protocol
- **HTTPS** - Hypertext Transfer Protocol Secure
- **IDE** - Integrated Development Environment
- **JWT** - JSON Web Token
- **ML** - Machine Learning
- **NLP** - Natural Language Processing
- **ORM** - Object Relational Mapping
- **REST** - Representational State Transfer
- **SQL** - Structured Query Language
- **TF-IDF** - Term Frequency-Inverse Document Frequency
- **UI** - User Interface
- **URL** - Uniform Resource Locator
- **UX** - User Experience

---

## LIST OF FIGURES

- Figure 2.2.1: Login Page Design
- Figure 2.2.2: Registration Page Design
- Figure 2.2.3: User Dashboard Design
- Figure 2.2.4: Email Analysis Form Design
- Figure 2.2.5: Analysis Results Display Design
- Figure 2.2.6: Analysis History Logs Design
- Figure 2.2.7: Admin Dashboard Design
- Figure 2.2.8: User Management Panel Design
- Figure 2.2.9: Training Page Design
- Figure 2.3.1: System Architecture Diagram
- Figure 2.3.2: User Authentication Flowchart
- Figure 2.3.3: Email Analysis Process Flowchart
- Figure 2.3.4: Data Flow Diagram (Level 0)
- Figure 2.3.5: Data Flow Diagram (Level 1)
- Figure 2.3.6: Entity Relationship Diagram (ERD)
- Figure 2.3.7: Class Diagram
- Figure 2.3.8: Sequence Diagram - Email Analysis

---

## LIST OF TABLES

- Table 1.4: Functional Requirements Table
- Table 1.5: Tools and Resources Breakdown
- Table 1.6: Project Schedule Breakdown (Gantt Chart)

---

## TABLE OF CONTENTS

- DECLARATION
- DEDICATION
- ABSTRACT
- DEFINITION OF KEY TERMS
- ABBREVIATIONS AND ACRONYMS
- LIST OF FIGURES
- LIST OF TABLES
- TABLE OF CONTENTS
- CHAPTER ONE: PROJECT PLANNING AND ANALYSIS
  - 1.1 Statement of Problem
  - 1.2 Study Justification
  - 1.3 System Objectives
    - 1.3.1 General Objective
    - 1.3.2 Specific Objectives
  - 1.4 Functional Requirements
  - 1.5 Breakdown of Tools and Resources to Be Used
  - 1.6 Project Schedule Breakdown
- CHAPTER TWO: DESIGN AND MODELING
  - 2.1 Introduction to Modelling
  - 2.2 User Interface Models
  - 2.3 Logic Models
- REFERENCES

---

# CHAPTER ONE: PROJECT PLANNING AND ANALYSIS (WORKPLAN)

## 1.1 Statement of Problem

Students living in shared hostels and educational institutions face a growing number of spam and phishing emails that appear genuine and attempt to collect personal details such as passwords, bank account information, and academic credentials. According to Verizon (2023), phishing remains one of the primary vectors for initial access in data breaches. The standard email filters provided by free email service providers such as Gmail, Yahoo, and Outlook do not effectively stop all harmful messages because attackers continuously evolve their tactics to bypass these filters (Chiew, Yong, & Tan, 2018). As a result, students spend valuable time sorting through suspicious emails and risk losing money, exposing personal data, and compromising their privacy. Many students lack the technical knowledge or awareness to identify fake messages, making them easy targets for cybercriminals (Jagatic, Johnson, Jakobsson, & Menczer, 2007). Furthermore, shared hostel networks increase security vulnerabilities as multiple students use the same Wi-Fi or share computers (Patil & Aithal, 2020). There is currently no simple, student-focused system designed to detect, filter, and prevent such emails while also educating users about safe email practices in their shared environment.

## 1.2 Study Justification

This system is important because it addresses the critical need to protect students from the risks posed by spam and phishing emails. Many students do not have the knowledge, experience, or tools to identify fake messages designed to steal their personal information. Normal email filters provided by free email services are not always reliable and fail to catch sophisticated phishing attempts that specifically target young people. By creating a system that can automatically detect and classify suspicious emails using machine learning, students will save time, protect their personal details, and feel safer using email in shared hostel networks. The MailSentra system also includes an educational component that raises awareness and improves general cybersecurity habits among students. Additionally, the feedback mechanism allows the system to continuously learn and improve its detection accuracy based on user corrections, making it more effective over time. This project fills a gap in the market by providing a free, accessible, and user-friendly solution tailored specifically for student populations.

## 1.3 System Objectives

### 1.3.1 General Objective

(i) To develop a system that effectively detects, filters, and prevents spam and phishing emails targeting students in educational environments.

### 1.3.2 Specific Objectives

(i) To implement a secure Role-Based Access Control (RBAC) system that facilitates user registration and distinguishes between normal (student) users and administrative roles.

(ii) To develop an email analysis engine using Natural Language Processing (NLP) and machine learning to classify content as spam or ham with over 95% accuracy.

(iii) To design a user-friendly dashboard for real-time email scanning, results visualization, and management of personal analysis history logs.

(iv) To create an administrative dashboard that provides comprehensive system analytics, including user growth, scan trends, and management of all system logs.

(v) To implement a feedback mechanism that allows users to report misclassifications, enabling continuous model evaluation and improvement.

(vi) To provide an educational training module that teaches students how to recognize phishing attempts and adopt safe email practices.

## 1.4 Functional Requirements

| User | User Activities | Features |
|------|-----------------|----------|
| Regular Student User | - Register for an account | - Registration form with email verification |
| | - Log in to the system | - Secure login with JWT authentication |
| | - Analyze emails for spam | - Email analysis form with results display |
| | - View analysis history | - Searchable logs table with filtering |
| | - Provide feedback on results | - Feedback submission for corrections |
| | - Manage personal API keys | - API key generation and revocation interface |
| | - Learn about phishing | - Training page with educational content |
| Administrator | - Manage user accounts | - User management panel (view, activate, deactivate) |
| | - View system statistics | - Analytics dashboard with charts |
| | - Monitor all analysis logs | - System-wide logs viewer |
| | - Manage all API keys | - Global API key management panel |
| | - Retrain the ML model | - Model retraining interface |
| | - Upload training datasets | - CSV dataset upload functionality |
| | - Manage training content | - Training content editor |
| System (Automated) | - Classify emails automatically | - ML model prediction engine |
| | - Store analysis results | - Database logging of all analyses |
| | - Track user activities | - Audit logging system |
| | - Enforce rate limits | - API rate limiting (60 requests/minute) |

*Table 1.4: Functional Requirements Table*

## 1.5 Breakdown of Tools and Resources to Be Used

### 1. Software Tools

**Front-End:**
- HTML5, CSS3, JavaScript ES6+ – for structure, styling, and interactivity
- React 18.2.0 – JavaScript library for building user interfaces
- Vite – Next-generation frontend build tool and development server
- Tailwind CSS – Utility-first CSS framework for styling
- Axios – HTTP client for API communication
- Recharts – Charting library for data visualization
- React Router – Navigation and routing library
- Lucide React – Icon library

**Back-End:**
- Python 3.13+ – Programming language for backend development
- FastAPI 0.104.1 – Modern, high-performance web framework for building APIs
- SQLAlchemy – Object Relational Mapping (ORM) for database operations
- Alembic – Database migration tool
- Uvicorn – ASGI server for running the FastAPI application

**Machine Learning:**
- Scikit-learn – Machine learning library for classification algorithms
- NLTK – Natural Language Toolkit for text preprocessing
- BeautifulSoup4 – Library for parsing HTML content in emails

**Database:**
- SQLite – Lightweight database for development environment
- PostgreSQL 14+ – Production-grade relational database

**Security:**
- PyJWT – JSON Web Token implementation for authentication
- Passlib – Password hashing library using bcrypt
- SlowAPI – Rate limiting middleware

### 2. Development Environment

- **IDE:** Visual Studio Code with Python and React extensions
- **Version Control:** Git and GitHub for source code management
- **API Testing:** Postman for testing API endpoints
- **Browser:** Chrome/Firefox DevTools for frontend debugging

### 3. Deployment Resources

- **Backend Hosting:** PythonAnywhere or Railway for Python/FastAPI deployment
- **Frontend Hosting:** Netlify or Vercel for React application hosting
- **Database Hosting:** ElephantSQL for PostgreSQL (free tier)

### 4. Hardware Resources

- **Development Machine:** Personal computer with minimum 8GB RAM
- **Client Devices:** Computers, laptops, and smartphones (to access the web application)
- **Server:** Cloud-based virtual server for production deployment

### 5. Human Resources

- **System Developer:** Designs, codes, tests, and documents the system
- **Test Users:** Fellow students for usability testing and feedback
- **Supervisor:** Guides and evaluates the project

*Table 1.5: Tools and Resources Breakdown*

## 1.6 Project Schedule Breakdown

| WEEKS | Project Planning & Analysis (Chapter One) | Project Design & Modeling (Chapter Two) | Project Development & Testing (Chapter Three) | Project Deployment (Chapter Three) | Final Touches of Documentation (Preliminary Pages, Chapter Four & References) | Project Presentation |
|-------|------------------------------------------|----------------------------------------|----------------------------------------------|-----------------------------------|-----------------------------------------------------------------------------|---------------------|
| 7-9 Jan | ██ | | | | | |
| 12-16 Jan | ██ | | | | | |
| 19-23 Jan | | ██ | | | | |
| 26-30 Jan | | ██ | | | | |
| 2-6 Feb | | ██ | | | | |
| 9-13 Feb | | | ██ | | | |
| 16-20 Feb | | | ██ | | | |
| 23-27 Feb | | | ██ | | | |
| 2-6 Mar | | | ██ | | | |
| 9-13 Mar | | | | ██ | | |
| 16-20 Mar | | | | ██ | | |
| 23-27 Mar | | | | | ██ | |
| 3rd April | | | | | | ██ |

*Table 1.6: Project Schedule Breakdown (Gantt Chart)*

**Note:** This table should be printed in LANDSCAPE orientation.

---

# CHAPTER TWO: DESIGN AND MODELING

## 2.1 Introduction to Modelling

This chapter presents the designs and models that were created to visualize the MailSentra system before actual development began. System modelling is an essential phase in software development as it allows developers to plan the structure, user interfaces, and logic flow of the application before writing code. By creating these models, potential design flaws were identified early, user experience was carefully considered, and the overall development process became more organized and efficient.

The models in this chapter are divided into two main categories: User Interface Models and Logic Models. The User Interface Models include hand-sketched designs of all the forms, pages, and interaction panels that users will see and interact with. These designs helped establish the visual layout, navigation flow, and user experience of the application. The Logic Models include architecture diagrams, flowcharts, data flow diagrams, entity relationship diagrams, and class diagrams that define how the system processes data and how different components interact with each other.

The benefit of creating these models before development was significant. It provided a clear roadmap for implementation, ensured all team members understood the system requirements, and reduced the time spent on revisions during the coding phase.

## 2.2 User Interface Models

This section presents the user interface designs for the MailSentra system. Each design was hand-sketched using draw.io to visualize how the pages would look before development.

### 2.2.1 Login Page

The Login Page serves as the main entry point for registered users to access the MailSentra system. The design features a clean, centered layout with the system logo at the top, followed by the system name "MailSentra". Below the header are two input fields: one for email address and one for password. A "Login" button is prominently displayed below the input fields. At the bottom, there is a link text "Don't have an account? Register" to guide new users to the registration page. The design uses a dark blue background with a white card container to create visual contrast and focus user attention on the login form.

**[INSERT FIGURE 2.2.1: Login Page Design, Hand-Sketched in draw.io]**

*Figure 2.2.1: Login Page Design*

---

### 2.2.2 Registration Page

The Registration Page allows new users to create an account on the MailSentra system. The design mirrors the login page layout for consistency but includes additional fields. The form contains four input fields: Username, Email Address, Password, and Confirm Password. Below the inputs is a "Register" button. At the bottom, a link text "Already have an account? Login" directs existing users back to the login page. The design includes validation indicators next to each field to show users whether their inputs meet the requirements (such as password strength and matching passwords).

**[INSERT FIGURE 2.2.2: Registration Page Design, Hand-Sketched in draw.io]**

*Figure 2.2.2: Registration Page Design*

---

### 2.2.3 User Dashboard

The User Dashboard is the main interface users see after logging in. The design features a sidebar navigation on the left containing links to: Dashboard (Home), Analyze Email, My Logs, Training, and Logout. The main content area displays a welcome message at the top with the user's name. Below are three statistics cards showing: Total Emails Analyzed, Spam Detected, and Ham (Legitimate) Detected. Each card shows the count number and a percentage. Below the stats cards is a recent activity section showing the user's last 5 email analyses with the result (spam/ham) and timestamp.

**[INSERT FIGURE 2.2.3: User Dashboard Design, Hand-Sketched in draw.io]**

*Figure 2.2.3: User Dashboard Design*

---

### 2.2.4 Email Analysis Form

The Email Analysis Form is the core feature of MailSentra where users paste email content for spam detection. The design shows a large text area labeled "Paste Email Content Here" where users can input the email they want to analyze. Below the text area is an "Analyze" button. The form also includes a sample placeholder text to guide users on what to paste. On the right side of the form (or below on mobile), there is a tips panel showing quick indicators of common spam characteristics to educate users while they analyze.

**[INSERT FIGURE 2.2.4: Email Analysis Form Design, Hand-Sketched in draw.io]**

*Figure 2.2.4: Email Analysis Form Design*

---

### 2.2.5 Analysis Results Display

After an email is analyzed, the results are displayed in a clear, visual format. The design shows a results card with a large icon indicating the result: a red warning icon for SPAM or a green checkmark for HAM (legitimate). Below the icon is the classification label ("SPAM" or "HAM") in large text. A confidence percentage bar shows how confident the model is in its prediction (e.g., "95.34% confidence"). Below the main result is a summary showing stats such as original text length and processed text length. At the bottom are two buttons: "Analyze Another" to perform a new analysis, and "This is Wrong" to provide feedback if the classification is incorrect.

**[INSERT FIGURE 2.2.5: Analysis Results Display Design, Hand-Sketched in draw.io]**

*Figure 2.2.5: Analysis Results Display Design*

---

### 2.2.6 Analysis History Logs

The Analysis History Logs page displays all past email analyses performed by the user. The design features a table with the following columns: Date/Time, Email Preview (truncated), Result (Spam/Ham), Confidence, and Actions. Each row represents one analysis record. Above the table is a search bar for filtering by keyword and dropdown filters for Result type (All, Spam, Ham) and Date range. The Actions column includes buttons for "View Details" and "Delete". Pagination controls are shown at the bottom of the table for navigating through large datasets.

**[INSERT FIGURE 2.2.6: Analysis History Logs Design, Hand-Sketched in draw.io]**

*Figure 2.2.6: Analysis History Logs Design*

---

### 2.2.7 Admin Dashboard

The Admin Dashboard provides system administrators with an overview of the entire system. The design shows a sidebar with admin-specific navigation: Dashboard, Users, All Logs, Retrain Model, Upload Dataset, Training Content, and Settings. The main content area displays key metrics cards: Total Users, Total Analyses Today, Model Accuracy, and Pending Feedback. Below the metrics is a pie chart showing the distribution of Spam vs Ham classifications. Another section shows a line chart of daily analysis counts over the past 30 days. At the bottom is a quick actions panel with buttons for common admin tasks.

**[INSERT FIGURE 2.2.7: Admin Dashboard Design, Hand-Sketched in draw.io]**

*Figure 2.2.7: Admin Dashboard Design*

---

### 2.2.8 User Management Panel

The User Management Panel allows administrators to view and manage all registered users. The design shows a data table with columns: User ID, Username, Email, Status (Active/Inactive), Role (User/Admin), Registration Date, and Actions. The Actions column includes buttons for "View", "Activate/Deactivate", and "Make Admin". Above the table is a search bar for finding users by name or email. Filter dropdowns allow filtering by Status and Role. A "Total Users" count is displayed at the top right corner.

**[INSERT FIGURE 2.2.8: User Management Panel Design, Hand-Sketched in draw.io]**

*Figure 2.2.8: User Management Panel Design*

---

### 2.2.9 Training Page

The Training Page provides educational content to help users learn about phishing and spam. The design shows a tabbed interface with sections: "What is Phishing?", "Common Signs of Spam", "Real Examples", and "Quiz". Each tab displays relevant content. The "What is Phishing?" section shows an introductory paragraph with an illustration. The "Common Signs" section displays a list of red flags with icons. The "Real Examples" section shows sample spam and legitimate emails side by side for comparison. The "Quiz" section presents multiple-choice questions to test user knowledge with immediate feedback.

**[INSERT FIGURE 2.2.9: Training Page Design, Hand-Sketched in draw.io]**

*Figure 2.2.9: Training Page Design*

---

## 2.3 Logic Models

This section presents the logic models that define how the MailSentra system processes data and how different components interact. These diagrams provide a technical blueprint for the system architecture and data flow.

### 2.3.1 System Architecture Diagram

The System Architecture Diagram shows the three-tier architecture of MailSentra. The diagram displays three main layers:

**Presentation Layer (Frontend):**
- React Client Application
- Components: Login, Register, Dashboard, AnalyzeEmail, LogsTable, AdminPanel, TrainingPage
- Communicates with backend via REST API calls

**Application Layer (Backend):**
- FastAPI Server
- Routes: /api/auth, /api/analyze, /api/logs, /api/feedback, /api/admin
- Services: AuthService, ModelService, PreprocessingService
- Middleware: CORS, RateLimiting, SecurityHeaders

**Data Layer:**
- PostgreSQL/SQLite Database
- Tables: users, spam_logs, user_feedbacks, api_keys, training_sections
- ML Models stored as pickle files

An arrow shows the ML Pipeline (Scikit-learn) connecting to the Application Layer for email classification.

**Sketch Instructions for draw.io:**
1. Draw three horizontal boxes stacked vertically, labeled "Presentation Layer", "Application Layer", and "Data Layer"
2. In the top box, draw a rounded rectangle labeled "React Client" with smaller boxes inside for each component
3. In the middle box, draw a rounded rectangle labeled "FastAPI Server" with internal boxes for Routes, Services, and Middleware
4. Draw a separate box to the side labeled "ML Pipeline (Scikit-learn)" with an arrow pointing to the FastAPI Server
5. In the bottom box, draw a cylinder shape labeled "PostgreSQL/SQLite" and a folder icon labeled "ML Models"
6. Draw bidirectional arrows connecting each layer

**[INSERT FIGURE 2.3.1: System Architecture Diagram, Hand-Sketched in draw.io]**

*Figure 2.3.1: System Architecture Diagram*

---

### 2.3.2 User Authentication Flowchart

This flowchart shows the process of user login and registration.

**Sketch Instructions for draw.io:**
1. Start with an oval labeled "Start"
2. Diamond: "New User?" → Yes: Go to Register flow; No: Go to Login flow
3. **Register Flow:**
   - Rectangle: "Enter Username, Email, Password"
   - Diamond: "Valid Input?" → No: "Show Error" → loop back; Yes: continue
   - Rectangle: "Hash Password"
   - Rectangle: "Store User in Database"
   - Rectangle: "Generate JWT Token"
   - Rectangle: "Redirect to Dashboard"
4. **Login Flow:**
   - Rectangle: "Enter Email, Password"
   - Diamond: "User Exists?" → No: "Show Error"; Yes: continue
   - Diamond: "Password Matches?" → No: "Show Error"; Yes: continue
   - Rectangle: "Generate JWT Token"
   - Rectangle: "Redirect to Dashboard"
5. End with oval labeled "End"

**[INSERT FIGURE 2.3.2: User Authentication Flowchart, Hand-Sketched in draw.io]**

*Figure 2.3.2: User Authentication Flowchart*

---

### 2.3.3 Email Analysis Process Flowchart

This flowchart shows the step-by-step process of analyzing an email for spam.

**Sketch Instructions for draw.io:**
1. Start oval: "Start"
2. Rectangle: "User Pastes Email Text"
3. Rectangle: "Send to Backend API"
4. Diamond: "User Authenticated?" → No: "Return 401 Unauthorized"; Yes: continue
5. Rectangle: "Preprocess Email Text"
   - Sub-steps (small rectangles): Remove HTML → Remove URLs → Lowercase → Remove Symbols → Remove Stopwords → Tokenize
6. Rectangle: "Convert to TF-IDF Vector"
7. Rectangle: "Load ML Model from Memory"
8. Rectangle: "Model Predicts Classification"
9. Diamond: "Confidence > 50%?"
   - If spam probability > 50%: "Result = SPAM"
   - If spam probability ≤ 50%: "Result = HAM"
10. Rectangle: "Store Result in spam_logs Table"
11. Rectangle: "Return Result to Frontend"
12. Rectangle: "Display Result to User"
13. End oval: "End"

**[INSERT FIGURE 2.3.3: Email Analysis Process Flowchart, Hand-Sketched in draw.io]**

*Figure 2.3.3: Email Analysis Process Flowchart*

---

### 2.3.4 Data Flow Diagram (Level 0 - Context Diagram)

The Context Diagram shows the system as a single process with external entities.

**Sketch Instructions for draw.io:**
1. Draw a large circle in the center labeled "MailSentra System"
2. Draw four rectangles around it for external entities:
   - Top: "Student User"
   - Right: "Administrator"
   - Bottom: "Email Data Source (User Input)"
   - Left: "ML Training Dataset"
3. Draw arrows showing data flows:
   - Student User → System: "Email Text, Login Credentials, Feedback"
   - System → Student User: "Classification Result, Analysis History"
   - Administrator → System: "User Management Commands, Retrain Requests"
   - System → Administrator: "System Stats, User List, All Logs"
   - Email Data Source → System: "Raw Email Content"
   - ML Training Dataset → System: "Training Data (CSV)"

**[INSERT FIGURE 2.3.4: Data Flow Diagram (Level 0), Hand-Sketched in draw.io]**

*Figure 2.3.4: Data Flow Diagram (Level 0 - Context Diagram)*

---

### 2.3.5 Data Flow Diagram (Level 1)

The Level 1 DFD breaks down the system into major processes.

**Sketch Instructions for draw.io:**
1. Draw rectangles for external entities: "Student User", "Administrator"
2. Draw circles for processes:
   - 1.0 "User Authentication"
   - 2.0 "Email Analysis"
   - 3.0 "History Management"
   - 4.0 "Feedback Processing"
   - 5.0 "Admin Management"
   - 6.0 "Model Training"
3. Draw open-ended rectangles for data stores:
   - D1 "Users"
   - D2 "Spam Logs"
   - D3 "User Feedbacks"
   - D4 "Training Data"
4. Draw arrows with labels:
   - Student → 1.0: "Credentials"
   - 1.0 → D1: "Store/Retrieve User"
   - 1.0 → Student: "JWT Token"
   - Student → 2.0: "Email Text"
   - 2.0 → D2: "Store Analysis"
   - 2.0 → Student: "Result"
   - Student → 3.0: "View Request"
   - D2 → 3.0: "Log Records"
   - 3.0 → Student: "History Data"
   - Student → 4.0: "Feedback Data"
   - 4.0 → D3: "Store Feedback"
   - Admin → 5.0: "Management Commands"
   - D1, D2 → 5.0: "Data"
   - 5.0 → Admin: "Stats, Users, Logs"
   - Admin → 6.0: "Retrain Command"
   - D3, D4 → 6.0: "Training Data"
   - 6.0 → 2.0: "Updated Model"

**[INSERT FIGURE 2.3.5: Data Flow Diagram (Level 1), Hand-Sketched in draw.io]**

*Figure 2.3.5: Data Flow Diagram (Level 1)*

---

### 2.3.6 Entity Relationship Diagram (ERD)

The ERD shows the database tables and their relationships.

**Sketch Instructions for draw.io:**
1. Draw rectangles for each entity with table name at top and attributes listed:

**USERS**
- id (PK)
- email
- username
- hashed_password
- is_active
- is_admin
- created_at
- updated_at

**SPAM_LOGS**
- id (PK)
- user_id (FK)
- email_id (FK)
- email_text
- result
- confidence
- model_version
- is_correct
- created_at

**USER_FEEDBACKS**
- id (PK)
- user_id (FK)
- spam_log_id (FK)
- original_result
- corrected_result
- comment
- created_at

**API_KEYS**
- id (PK)
- user_id (FK)
- key
- name
- is_active
- usage_count
- last_used_at
- created_at
- expires_at

**TRAINING_SECTIONS**
- id (PK)
- title
- icon
- order
- content
- is_active
- created_at
- updated_at

2. Draw relationship lines with cardinality:
   - USERS to SPAM_LOGS: One-to-Many (1:N)
   - USERS to USER_FEEDBACKS: One-to-Many (1:N)
   - USERS to API_KEYS: One-to-Many (1:N)
   - SPAM_LOGS to USER_FEEDBACKS: One-to-Many (1:N)

**[INSERT FIGURE 2.3.6: Entity Relationship Diagram, Hand-Sketched in draw.io]**

*Figure 2.3.6: Entity Relationship Diagram (ERD)*

---

### 2.3.7 Class Diagram

The Class Diagram shows the object-oriented structure of the backend models.

**Sketch Instructions for draw.io:**
1. Draw UML class boxes with three sections: Class Name, Attributes, Methods

**User**
- id: Integer
- email: String
- username: String
- hashed_password: String
- is_active: Boolean
- is_admin: Boolean
- created_at: DateTime
- spam_logs: List[SpamLog]
- feedbacks: List[UserFeedback]
- api_keys: List[APIKey]

**SpamLog**
- id: Integer
- user_id: Integer
- email_text: Text
- result: String
- confidence: Float
- model_version: String
- is_correct: Boolean
- created_at: DateTime
- user: User
- feedbacks: List[UserFeedback]

**UserFeedback**
- id: Integer
- user_id: Integer
- spam_log_id: Integer
- original_result: String
- corrected_result: String
- comment: Text
- created_at: DateTime
- user: User
- spam_log: SpamLog

**SpamDetectionModel**
- model: NaiveBayesClassifier
- vectorizer: TfidfVectorizer
- metadata: Dict
+ load_model(): void
+ predict(email_text: String): Dict
+ get_model_info(): Dict

2. Draw association lines showing relationships with multiplicities

**[INSERT FIGURE 2.3.7: Class Diagram, Hand-Sketched in draw.io]**

*Figure 2.3.7: Class Diagram*

---

### 2.3.8 Sequence Diagram - Email Analysis

The Sequence Diagram shows the interaction between components during email analysis.

**Sketch Instructions for draw.io:**
1. Draw vertical lifelines (dashed lines) for actors/objects:
   - User
   - React Frontend
   - FastAPI Backend
   - Auth Middleware
   - Model Service
   - Database

2. Draw horizontal arrows for messages (numbered):
   1. User → Frontend: "Paste email text"
   2. User → Frontend: "Click Analyze"
   3. Frontend → Backend: "POST /api/analyze {email_text, JWT}"
   4. Backend → Auth Middleware: "Validate JWT"
   5. Auth Middleware → Backend: "User verified"
   6. Backend → Model Service: "predict(email_text)"
   7. Model Service → Model Service: "preprocess_email()"
   8. Model Service → Model Service: "vectorize()"
   9. Model Service → Model Service: "model.predict()"
   10. Model Service → Backend: "Return {result, confidence}"
   11. Backend → Database: "INSERT spam_log"
   12. Database → Backend: "Confirm stored"
   13. Backend → Frontend: "Return {result, confidence, message}"
   14. Frontend → User: "Display result"

3. Draw activation boxes (rectangles) on lifelines during processing

**[INSERT FIGURE 2.3.8: Sequence Diagram - Email Analysis, Hand-Sketched in draw.io]**

*Figure 2.3.8: Sequence Diagram - Email Analysis*

---

## REFERENCES

Abawajy, J. (2014). User preference of cyber security awareness delivery methods. *Behaviour & Information Technology*, 33(3), 237-248.

Chiew, K. L., Yong, K. S. C., & Tan, C. L. (2018). A survey of phishing attacks: Their types, vectors and technical approaches. *Expert Systems with Applications*, 106, 1-20.

FastAPI Documentation. (2024). FastAPI - Modern Python web framework. Retrieved from https://fastapi.tiangolo.com/

Gupta, B. B., Tewari, A., Jain, A. K., & Agrawal, D. P. (2017). Fighting against phishing attacks: State of the art and future challenges. *Neural Computing and Applications*, 28(12), 3629-3654.

Jagatic, T. N., Johnson, N. A., Jakobsson, M., & Menczer, F. (2007). Social phishing. *Communications of the ACM*, 50(10), 94-100.

Patil, A. K., & Aithal, S. (2020). Security issues in shared network environments: A comprehensive review. *International Journal of Applied Engineering Research*, 5(2), 112-125.

React Documentation. (2024). React - A JavaScript library for building user interfaces. Retrieved from https://react.dev/

Scikit-learn Documentation. (2024). Machine Learning in Python. Retrieved from https://scikit-learn.org/

SQLAlchemy Documentation. (2024). The Python SQL Toolkit and Object Relational Mapper. Retrieved from https://www.sqlalchemy.org/

Verizon. (2023). 2023 Data Breach Investigations Report. Retrieved from https://www.verizon.com/business/resources/reports/dbir/

---

*End of System Documentation - Chapters One and Two*

*Prepared by: John Orioki Oguta*

*DCS-01-8645/2024*

*Zetech University*

*April 2026*
