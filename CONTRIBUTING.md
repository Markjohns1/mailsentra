# Contributing to MailSentra

Thank you for your interest in contributing to MailSentra! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of experience level, gender, gender identity and expression, sexual orientation, disability, personal appearance, body size, race, ethnicity, age, religion, or nationality.

### Expected Behavior

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:
- Python 3.13+
- Node.js 22.21.0+
- Git
- A GitHub account
- Basic knowledge of FastAPI and React

### Setting Up Your Development Environment

1. **Fork the repository**
   ```bash
   # Click the 'Fork' button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/mailsentra.git
   cd mailsentra
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/Markjohns1/mailsentra.git
   ```

4. **Set up the backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   pip install -r requirements-dev.txt  # Development dependencies
   ```

5. **Set up the frontend**
   ```bash
   cd frontend
   npm install
   ```

6. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 🤝 How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- Clear, descriptive title
- Detailed description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details (OS, Python version, etc.)

**Template:**
```markdown
**Bug Description**
A clear description of the bug.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., Windows 11, Ubuntu 22.04]
- Python Version: [e.g., 3.13.0]
- Node Version: [e.g., 22.21.0]
- Browser: [e.g., Chrome 120]
```

### Suggesting Features

Feature requests are welcome! Please provide:
- Clear, descriptive title
- Detailed description of the feature
- Use case and benefits
- Possible implementation approach (optional)

### Code Contributions

1. **Find an issue** or create one
2. **Comment** on the issue to let others know you're working on it
3. **Fork and create a branch** for your work
4. **Make your changes** following our coding standards
5. **Test your changes** thoroughly
6. **Submit a pull request**

## 🔄 Development Workflow

### 1. Keep Your Fork Updated

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

### 2. Create a Feature Branch

```bash
git checkout -b feature/amazing-feature
# or
git checkout -b fix/bug-description
# or
git checkout -b docs/documentation-improvement
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests
- `chore/` - Maintenance tasks

### 3. Make Your Changes

- Write clean, readable code
- Follow the coding standards below
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass

### 4. Test Your Changes

**Backend:**
```bash
cd backend
pytest tests/ -v
pytest --cov=app tests/  # Check coverage
```

**Frontend:**
```bash
cd frontend
npm test
npm run lint
```

### 5. Commit Your Changes

```bash
git add .
git commit -m "feat: add amazing feature"
```

See [Commit Guidelines](#commit-guidelines) below.

### 6. Push to Your Fork

```bash
git push origin feature/amazing-feature
```

### 7. Submit a Pull Request

- Go to your fork on GitHub
- Click "New Pull Request"
- Select your feature branch
- Fill out the PR template
- Submit!

## 📝 Coding Standards

### Python (Backend)

**Follow PEP 8**
```bash
# Use Black for formatting
black app/

# Use isort for imports
isort app/

# Use flake8 for linting
flake8 app/
```

**Code Style:**
```python
# Good
def analyze_email(email_text: str) -> dict:
    """
    Analyze email for spam detection.
    
    Args:
        email_text: The email content to analyze
        
    Returns:
        Dictionary with classification results
    """
    # Implementation
    pass

# Bad
def analyzeEmail(emailText):
    # No docstring, no type hints
    pass
```

**Naming Conventions:**
- Functions/variables: `snake_case`
- Classes: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Private methods: `_leading_underscore`

### JavaScript/React (Frontend)

**Use ESLint and Prettier**
```bash
npm run lint
npm run format
```

**Code Style:**
```javascript
// Good
const EmailAnalyzer = ({ email, onAnalyze }) => {
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onAnalyze(email);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return <button onClick={handleSubmit}>Analyze</button>;
};

// Bad
function emailAnalyzer(props) {
  var loading = false;
  // Missing error handling, inconsistent style
}
```

**Naming Conventions:**
- Components: `PascalCase`
- Functions/variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- CSS classes: `kebab-case` (Tailwind utilities)

### General Principles

- **DRY**: Don't Repeat Yourself
- **KISS**: Keep It Simple, Stupid
- **YAGNI**: You Aren't Gonna Need It
- Write self-documenting code
- Add comments for complex logic
- Keep functions small and focused
- Use meaningful variable names

## 📋 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no code change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependencies

### Examples

```bash
# Feature
git commit -m "feat(auth): add password reset functionality"

# Bug fix
git commit -m "fix(api): resolve CORS issue in production"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Breaking change
git commit -m "feat(api)!: change authentication endpoint structure

BREAKING CHANGE: /auth/login now requires email instead of username"
```

## 🔍 Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] Self-review completed
- [ ] No unnecessary console.logs or debugging code
- [ ] Commits are meaningful and follow guidelines

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested your changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed my code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No new warnings
- [ ] Added tests
- [ ] All tests pass

## Screenshots (if applicable)
Add screenshots here

## Related Issues
Closes #123
```

### Review Process

1. Maintainers will review your PR within 48 hours
2. Address any requested changes
3. Once approved, your PR will be merged
4. Your contribution will be acknowledged in the changelog

## 🎯 Areas for Contribution

### Good First Issues

Look for issues tagged with:
- `good first issue`
- `help wanted`
- `documentation`

### Current Priorities

- Improving test coverage
- Adding integration tests
- Enhancing documentation
- Performance optimizations
- UI/UX improvements

## 💡 Need Help?

- 📧 Email: [johnmarkoguta@gmail.com](mailto:johnmarkoguta@gmail.com)
- 💬 GitHub Issues: [Create an issue](https://github.com/Markjohns1/mailsentra/issues)
- 📖 Documentation: [docs/](../docs/)

## 🙏 Recognition

All contributors will be recognized in:
- README.md contributors section
- CHANGELOG.md for each release
- GitHub contributors page

Thank you for contributing to MailSentra! 🎉

---

**Questions?** Feel free to ask in the issues or reach out directly!
