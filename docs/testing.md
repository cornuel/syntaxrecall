# 🧪 Testing Guide

[← Back to Index](./README.md)

## Overview
Flashcard AI uses a test-driven approach to ensure the reliability of the Spaced Repetition (SM-2) algorithm and the security of the authentication flow.

## Backend Testing (Pytest)

### Prerequisites
Ensure you are in the `backend/` directory and your virtual environment is activated:
```bash
cd backend
source venv/bin/activate
```

### Running Tests
Run all tests:
```bash
PYTHONPATH=. pytest
```

Run specific test files:
```bash
PYTHONPATH=. pytest tests/test_auth.py
PYTHONPATH=. pytest tests/test_sm2.py
```

### Test Coverage
- **Auth Flow**: Verifies GitHub exchange, JWT issuance, and route protection.
- **SM-2 Logic**: Validates interval and ease factor calculations based on user performance.
- **Database**: Uses an in-memory SQLite database for fast, isolated testing.

## Frontend Testing
*(Planned: Integration of Vitest/Jest for component testing)*

## Continuous Integration
Tests are designed to be run on every PR to ensure no regressions in the core learning logic or security boundaries.

---
[← Back to Index](./README.md)
