const request = require("supertest");
const app = require("../src/app");
const taskService = require("../src/services/taskService");

beforeEach(() => {
  taskService._reset();
});

describe("POST /tasks", () => {
  test("should create a task", async () => {
    const response = await request(app)
      .post("/tasks")
      .send({
        title: "Learn Supertest",
        priority: "high",
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe("Learn Supertest");
    expect(response.body.priority).toBe("high");
    expect(response.body.status).toBe("todo");
    expect(response.body).toHaveProperty("id");
  });

  test("should reject task without title", async () => {
    const response = await request(app)
      .post("/tasks")
      .send({
        priority: "high",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  test("should reject invalid priority", async () => {
    const response = await request(app)
      .post("/tasks")
      .send({
        title: "Test task",
        priority: "urgent",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toMatch(/priority/i);
  });
});

describe("GET /tasks", () => {
  test("should return all tasks", async () => {
    await request(app)
      .post("/tasks")
      .send({ title: "Task 1" });

    await request(app)
      .post("/tasks")
      .send({ title: "Task 2" });

    const response = await request(app).get("/tasks");

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(2);
  });

  test("should filter tasks by status", async () => {
    await request(app)
      .post("/tasks")
      .send({
        title: "Todo task",
        status: "todo",
      });

    await request(app)
      .post("/tasks")
      .send({
        title: "Done task",
        status: "done",
      });

    const response = await request(app)
      .get("/tasks")
      .query({ status: "todo" });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].status).toBe("todo");
  });

  test("should return paginated tasks", async () => {
    await request(app).post("/tasks").send({ title: "Task 1" });
    await request(app).post("/tasks").send({ title: "Task 2" });
    await request(app).post("/tasks").send({ title: "Task 3" });

    const response = await request(app)
      .get("/tasks")
      .query({ page: 1, limit: 2 });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(2);
  });
});

describe("PUT /tasks/:id", () => {
  test("should update an existing task", async () => {
    const created = await request(app)
      .post("/tasks")
      .send({
        title: "Old title",
        priority: "low",
      });

    const response = await request(app)
      .put(`/tasks/${created.body.id}`)
      .send({
        title: "New title",
        priority: "high",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.title).toBe("New title");
    expect(response.body.priority).toBe("high");
  });

  test("should return 404 for non-existing task", async () => {
    const response = await request(app)
      .put("/tasks/non-existing-id")
      .send({
        title: "Updated",
      });

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe("Task not found");
  });

  test("should reject empty title", async () => {
    const created = await request(app)
      .post("/tasks")
      .send({
        title: "Original",
      });

    const response = await request(app)
      .put(`/tasks/${created.body.id}`)
      .send({
        title: "",
      });

    expect(response.statusCode).toBe(400);
  });
});

describe("DELETE /tasks/:id", () => {
  test("should delete an existing task", async () => {
    const created = await request(app)
      .post("/tasks")
      .send({
        title: "Delete me",
      });

    const response = await request(app)
      .delete(`/tasks/${created.body.id}`);

    expect(response.statusCode).toBe(204);

    const getResponse = await request(app).get("/tasks");

    expect(getResponse.body).toHaveLength(0);
  });

  test("should return 404 for non-existing task", async () => {
    const response = await request(app)
      .delete("/tasks/non-existing-id");

    expect(response.statusCode).toBe(404);
  });
});

describe("PATCH /tasks/:id/complete", () => {
  test("should complete a task", async () => {
    const created = await request(app)
      .post("/tasks")
      .send({
        title: "Complete me",
      });

    const response = await request(app)
      .patch(`/tasks/${created.body.id}/complete`);

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("done");
    expect(response.body.completedAt).not.toBeNull();
  });

  test("should return 404 for non-existing task", async () => {
    const response = await request(app)
      .patch("/tasks/non-existing-id/complete");

    expect(response.statusCode).toBe(404);
  });
});

describe("GET /tasks/stats", () => {
  test("should return task statistics", async () => {
    await request(app)
      .post("/tasks")
      .send({
        title: "Todo",
        status: "todo",
      });

    await request(app)
      .post("/tasks")
      .send({
        title: "Progress",
        status: "in_progress",
      });

    await request(app)
      .post("/tasks")
      .send({
        title: "Done",
        status: "done",
      });

    const response = await request(app).get("/tasks/stats");

    expect(response.statusCode).toBe(200);
    expect(response.body.todo).toBe(1);
    expect(response.body.in_progress).toBe(1);
    expect(response.body.done).toBe(1);
    expect(response.body).toHaveProperty("overdue");
  });
});

describe("PATCH /tasks/:id/assign", () => {
  test("should assign a task to a user", async () => {
    const created = await request(app)
      .post("/tasks")
      .send({
        title: "Assign me",
      });

    const response = await request(app)
      .patch(`/tasks/${created.body.id}/assign`)
      .send({
        assignee: "Saurabh",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.assignee).toBe("Saurabh");
    expect(response.body.title).toBe("Assign me");
  });

  test("should return 404 for non-existing task", async () => {
    const response = await request(app)
      .patch("/tasks/non-existing-id/assign")
      .send({
        assignee: "Saurabh",
      });

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe("Task not found");
  });

  test("should reject empty assignee", async () => {
    const created = await request(app)
      .post("/tasks")
      .send({
        title: "Assignment validation",
      });

    const response = await request(app)
      .patch(`/tasks/${created.body.id}/assign`)
      .send({
        assignee: "",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error");
  });
});