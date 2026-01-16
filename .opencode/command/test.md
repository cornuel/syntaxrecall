---
description: "Generate and run tests for current changes"
agent: test-engineer
---

1. Run `git diff` to identify modified logic in @backend/app or @frontend/src.
2. If backend: Write/Update tests in `backend/tests/` and run !`cd backend && venv/bin/pytest`.
3. If frontend: Run !`cd frontend && pnpm test`.
4. Iterate until all tests pass.
