# 🧪 Testing Guide

[← Back to Index](./README.md)

## Overview
SyntaxRecall uses a test-driven approach to ensure the reliability of the Spaced Repetition (SM-2) algorithm and the security of the authentication flow.

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
- **Auth Flow** (`test_auth.py`): Verifies GitHub exchange, JWT issuance, and route protection.
- **SM-2 Logic** (`test_sm2.py`): Validates interval and ease factor calculations based on user performance.
- **Social Features** (`test_social.py`): Tests marketplace, forking, and like/unlike functionality.
- **Reviews & Ratings** (`test_ratings.py`): Validates star rating submission, aggregation, and review updates.
- **Roadmaps** (`test_roadmaps.py`): Tests roadmap listing, user subscriptions, and mastery calculations.
- **Database**: Uses an in-memory SQLite database for fast, isolated testing.

### Test Files
```bash
tests/test_auth.py       # Authentication and authorization
tests/test_sm2.py         # Spaced repetition algorithm
tests/test_social.py      # Marketplace and forking
tests/test_ratings.py     # Star ratings and reviews
tests/test_roadmaps.py    # Roadmap subscriptions and mastery
```

## Frontend Testing
*(Planned: Integration of Vitest/Jest for component testing)*

## Continuous Integration
Tests are designed to be run on every PR to ensure no regressions in the core learning logic or security boundaries.

---
[← Back to Index](./README.md)
