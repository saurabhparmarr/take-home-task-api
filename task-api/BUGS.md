# Bug Report

## Bug 1 — Status filter accepts partial matches

### Expected behavior

The `status` filter should return tasks whose status exactly matches the requested status.

### Actual behavior

The implementation uses `String.includes()`, so a partial value such as `do` matches a task with status `done`.

### How I discovered it

I wrote a unit test that created a `done` task and requested tasks using the status value `do`. The test expected no results, but the task was returned.

### Location

`src/services/taskService.js` — `getByStatus()`

### Suggested fix

Use an exact equality check instead of `includes()`.

---

## Bug 2 — Pagination starts from the wrong offset

### Expected behavior

Page 1 should return the first `limit` tasks. For example, page 1 with a limit of 2 should return Task 1 and Task 2.

### Actual behavior

Page 1 starts from index `limit`, causing the first page to skip the first set of tasks. Page 2 also starts too far ahead.

### How I discovered it

I created three tasks and tested pagination with a page size of 2. The first page returned only Task 3, while the second page returned no tasks.

### Location

`src/services/taskService.js` — `getPaginated()`

### Suggested fix

Calculate the offset using `(page - 1) * limit`.

---

## Bug 3 — Completing a task changes its priority

### Expected behavior

Completing a task should change its status to `done` and set `completedAt`, while preserving its existing priority.

### Actual behavior

When a task is completed, its priority is always changed to `medium`.

### How I discovered it

I created a high-priority task and completed it. The test expected the priority to remain `high`, but the returned task had `medium`.

### Location

`src/services/taskService.js` — `completeTask()`

### Suggested fix

Do not modify the task's priority when marking it as completed.

---

## Fix Applied

Bug 3 was fixed in `src/services/taskService.js`.

The `completeTask()` function now preserves the task's existing priority while updating the status to `done` and setting `completedAt`.

A regression test was added to verify that a high-priority task remains high priority after completion.

---

## Testing

All automated tests pass after the fix.

- Test suites: 2 passed
- Tests: 34 passed
- Statements coverage: 87.66%
- Branch coverage: 78.82%
- Functions coverage: 86.20%
- Lines coverage: 87.85%

The test suite includes unit tests for the task service and integration tests for the API routes using Supertest.