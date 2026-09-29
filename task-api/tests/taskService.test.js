const taskService = require("../src/services/taskService");

beforeEach(() => {
  taskService._reset();
});

describe("Task Service - create", () => {
  test("should create a task", () => {
    const task = taskService.create({
      title: "Learn Jest",
      priority: "high",
    });

    expect(task).toHaveProperty("id");
    expect(task.title).toBe("Learn Jest");
    expect(task.priority).toBe("high");
    expect(task.status).toBe("todo");
    expect(task.completedAt).toBeNull();
    expect(task).toHaveProperty("createdAt");
  });

  test("should create task with default values", () => {
    const task = taskService.create({
      title: "Test task",
    });

    expect(task.status).toBe("todo");
    expect(task.priority).toBe("medium");
    expect(task.description).toBe("");
    expect(task.dueDate).toBeNull();
  });
});

describe("Task Service - getAll and findById", () => {
  test("should return all tasks", () => {
    taskService.create({ title: "Task 1" });
    taskService.create({ title: "Task 2" });

    const tasks = taskService.getAll();

    expect(tasks).toHaveLength(2);
  });

  test("should find task by id", () => {
    const created = taskService.create({ title: "Find me" });

    const task = taskService.findById(created.id);

    expect(task).toEqual(created);
  });

  test("should return undefined for non-existing task", () => {
    const task = taskService.findById("invalid-id");

    expect(task).toBeUndefined();
  });
});

describe("Task Service - getByStatus", () => {
  test("should return tasks with matching status", () => {
    taskService.create({
      title: "Todo task",
      status: "todo",
    });

    taskService.create({
      title: "Done task",
      status: "done",
    });

    const tasks = taskService.getByStatus("todo");

    expect(tasks).toHaveLength(1);
    expect(tasks[0].status).toBe("todo");
  });

  test("should not match partial status values", () => {
    taskService.create({
      title: "Done task",
      status: "done",
    });

    const tasks = taskService.getByStatus("do");

    expect(tasks).toHaveLength(0);
  });
});

describe("Task Service - pagination", () => {
  test("should return first page correctly", () => {
    taskService.create({ title: "Task 1" });
    taskService.create({ title: "Task 2" });
    taskService.create({ title: "Task 3" });

    const tasks = taskService.getPaginated(1, 2);

    expect(tasks).toHaveLength(2);
    expect(tasks[0].title).toBe("Task 1");
    expect(tasks[1].title).toBe("Task 2");
  });

  test("should return second page correctly", () => {
    taskService.create({ title: "Task 1" });
    taskService.create({ title: "Task 2" });
    taskService.create({ title: "Task 3" });

    const tasks = taskService.getPaginated(2, 2);

    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe("Task 3");
  });
});

describe("Task Service - update", () => {
  test("should update an existing task", () => {
    const task = taskService.create({
      title: "Old title",
      priority: "low",
    });

    const updated = taskService.update(task.id, {
      title: "New title",
      priority: "high",
    });

    expect(updated.title).toBe("New title");
    expect(updated.priority).toBe("high");
  });

  test("should return null when updating non-existing task", () => {
    const result = taskService.update("invalid-id", {
      title: "Updated",
    });

    expect(result).toBeNull();
  });
});

describe("Task Service - remove", () => {
  test("should remove an existing task", () => {
    const task = taskService.create({
      title: "Delete me",
    });

    const result = taskService.remove(task.id);

    expect(result).toBe(true);
    expect(taskService.findById(task.id)).toBeUndefined();
  });

  test("should return false for non-existing task", () => {
    const result = taskService.remove("invalid-id");

    expect(result).toBe(false);
  });
});

describe("Task Service - completeTask", () => {
  test("should mark task as done", () => {
    const task = taskService.create({
      title: "Complete me",
      priority: "high",
    });

    const completed = taskService.completeTask(task.id);

    expect(completed.status).toBe("done");
    expect(completed.completedAt).not.toBeNull();
  });

  test("should preserve task priority when completing", () => {
    const task = taskService.create({
      title: "High priority task",
      priority: "high",
    });

    const completed = taskService.completeTask(task.id);

    expect(completed.priority).toBe("high");
  });

  test("should return null for non-existing task", () => {
    const result = taskService.completeTask("invalid-id");

    expect(result).toBeNull();
  });
});

describe("Task Service - stats", () => {
  test("should return correct task counts", () => {
    taskService.create({ title: "Todo" });
    taskService.create({
      title: "Progress",
      status: "in_progress",
    });
    taskService.create({
      title: "Done",
      status: "done",
    });

    const stats = taskService.getStats();

    expect(stats.todo).toBe(1);
    expect(stats.in_progress).toBe(1);
    expect(stats.done).toBe(1);
  });
});