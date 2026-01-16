---
description: "Atomic commit with Conventional Commit message"
---

1. Analyze current staged changes: !`git diff --cached`.
2. Generate a concise commit message using the format: `<type>(<scope>): <subject>`.
3. Valid types: feat, fix, docs, test, refactor, chore.
4. Execute !`git commit -m "[generated message]"`.
