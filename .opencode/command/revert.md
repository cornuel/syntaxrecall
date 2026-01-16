---
description: "Rollback to the last stable state"
---

1. Confirm with the user if they want to discard uncommitted changes or undo the last commit.
2. If uncommitted: !`git reset --hard HEAD` and !`git clean -fd`.
3. If last commit: !`git reset --soft HEAD~1`.
