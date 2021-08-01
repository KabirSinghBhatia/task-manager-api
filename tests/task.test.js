const request = require("supertest");
const Task = require("../src/models/task");
const app = require("../src/app");

const {
  userOneId,
  userTwoId,
  userOne,
  userTwo,
  setupDb,
  stopDb,
  taskOne,
  taskTwo,
  taskThree,
} = require("./fixtures/db");

beforeEach(setupDb);
afterAll(stopDb);

test("Should create task for user", async () => {
  const response = await request(app)
    .post("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: "Test-1",
    })
    .expect(201);

  const task = await Task.findById(response.body._id);

  expect(task).not.toBeNull();
  expect(task.completed).toEqual(false);
});

test("Should fetch authenticated user's tasks", async () => {
  const response = await request(app)
    .get("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  expect(response.body.length).toEqual(2);
});

test("Should not delete other user's task", async () => {
  const response = await request(app)
    .delete(`/tasks/${taskThree._id}`)
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(404);

  const task = await Task.findById(taskThree._id);
  expect(task).not.toBeNull();
});

test("Should not create task with invalid description/completed", async () => {
  await request(app)
    .post("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: "",
    })
    .expect(400);

  await request(app)
    .post("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: "Test",
      completed: "Yes",
    })
    .expect(400);
});

test("Should not update task with invalid description/completed", async () => {
  await request(app)
    .patch(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: "",
    })
    .expect(400);

  await request(app)
    .patch(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: "Test",
      completed: "Yes",
    })
    .expect(400);
});

test("Should delete authenticated user's task", async () => {
  await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const task = await Task.findById(taskOne._id);
  expect(task).toBeNull();
});

test("Should not delete unauthenticated user's task", async () => {
  await request(app).delete(`/tasks/${taskOne._id}`).send().expect(401);

  const task = await Task.findById(taskOne._id);
  expect(task).not.toBeNull();
});

test("Should not update other users task", async () => {
  await request(app)
    .patch(`/tasks/${taskThree._id}`)
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: "",
      completed: true,
    })
    .expect(404);

  const task = await Task.findById(taskThree._id);
  expect(task).not.toBeNull();
});

test("Should fetch authenticated user's task by id", async () => {
  const response = await request(app)
    .get(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const task = await Task.findById(taskOne._id);
  expect(response.body.owner).toBe(userOneId.toString());
  expect(response.body._id).toEqual(task._id.toString());
});

test("Should not fetch user task by id if unauthenticated", async () => {
  await request(app).get(`/tasks/${taskOne._id}`).send().expect(401);
});

test("Should fetch only completed tasks", async () => {
  const response = await request(app)
    .get("/tasks?completed=true")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  expect(response.body.length).toBe(1);
});

test("Should fetch only incompleted tasks", async () => {
  const response = await request(app)
    .get("/tasks?completed=false")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  expect(response.body.length).toBe(1);
});

test("Should sort tasks by description/completed/createdAt/updatedAt", async () => {
  const { body: taskByDescription } = await request(app)
    .get("/tasks?sortBy=description_desc")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  expect(taskByDescription[0]._id.toString()).toBe(taskTwo._id.toString());

  const { body: taskByCompleted } = await request(app)
    .get("/tasks?sortBy=completed_desc")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  expect(taskByCompleted[0]._id.toString()).toBe(taskTwo._id.toString());

  const { body: taskByCreatedAt } = await request(app)
    .get("/tasks?sortBy=createdAt_desc")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  expect(taskByCreatedAt[0]._id.toString()).toBe(taskTwo._id.toString());

  const { body: taskByUpdatedAt } = await request(app)
    .get("/tasks?sortBy=updatedAt_desc")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  expect(taskByUpdatedAt[0]._id.toString()).toBe(taskTwo._id.toString());
});
