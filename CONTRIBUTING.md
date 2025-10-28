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
```markdown
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
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. Include:

- **Clear title and description**
- **Use case** for the enhancement
- **Proposed solution**
- **Alternative solutions** considered

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Write/update tests
5. Ensure tests pass
6. Update documentation
7. Commit your changes (`git commit -m 'feat: add amazing feature'`)
8. Push to the branch (`git push origin feature/amazing-feature`)
9. Open a Pull Request

**Pull Request Template**:
```markdown
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
```

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

Thank you for contributing to MailSentra! ðŸŽ‰
