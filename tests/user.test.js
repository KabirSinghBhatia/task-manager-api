const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user");

const { userOneId, userOne, setupDb, stopDb } = require("./fixtures/db");

jest.mock("../src/emails/accounts", () => {
  return {
    sendWelcomeEmail: () => {},
    sendCancellationEmail: () => {},
  };
});

beforeEach(setupDb);
afterAll(stopDb);

test("Should signup new user", async () => {
  const response = await request(app)
    .post("/users")
    .send({
      name: "Kabir-3",
      email: "kabir3@abc.com",
      password: "somepass",
    })
    .expect(201);

  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();

  expect(response.body).toMatchObject({
    user: {
      email: "kabir3@abc.com",
      name: "Kabir-3",
    },
    token: user.tokens[0].token,
  });

  expect(user.password).not.toBe("somepass");
});

test("Should signin existing user", async () => {
  const response = await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);

  const user = await User.findById(userOneId);
  expect(response.body.token).toBe(user.tokens[1].token);
});

test("Should not login nonexistent user", async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: "NotAPassword",
    })
    .expect(400);
});

test("Should get user profile for authenticated user", async () => {
  await request(app)
    .get("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test("Should not get user profile for authenticated user", async () => {
  await request(app).get("/users/me").send().expect(401);
});

test("Should delete user profile for authenticated user", async () => {
  await request(app)
    .delete("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user).toBeNull();
});

test("Should not delete user profile for unauthenticated user", async () => {
  await request(app).delete("/users/me").send().expect(401);
});

test("Should upload avatar image", async () => {
  await request(app)
    .post("/users/me/avatar")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .attach("avatar", "tests/fixtures/test-avatar.png")
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user.avatar).toEqual(expect.any(Buffer));
});

test("Should update valid user fields", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: "Kabir-3",
    })
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user.name).toEqual("Kabir-3");
});

test("Should not update invalid user fields", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      location: "Kabir-2",
    })
    .expect(400);
});

test("Should not signup user with invalid name/email/password", async () => {
  await request(app)
    .post("/users")
    .send({
      name: "",
      email: "kabir3@abc.com",
      password: "somepass",
    })
    .expect(400);

  await request(app)
    .post("/users")
    .send({
      name: "Kabir-3",
      email: "kabir3abc.com",
      password: "somepass",
    })
    .expect(400);

  await request(app)
    .post("/users")
    .send({
      name: "Kabir-3",
      email: "kabir3@abc.com",
      password: "Password1!",
    })
    .expect(400);
});

test("Should not update user with invalid name/email/password", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: "",
      email: "kabir3@abc.com",
      password: "somepass",
    })
    .expect(400);

  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: "Kabir-3",
      email: "kabir3abc.com",
      password: "somepass",
    })
    .expect(400);

  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: "Kabir-3",
      email: "kabir3@abc.com",
      password: "Password1!",
    })
    .expect(400);
});

test("Should not update user if unauthenticated", async () => {
  await request(app)
    .patch("/users/me")
    .send({
      name: "Kabir-3",
      email: "kabir3@abc.com",
      password: "somepass",
    })
    .expect(401);
});
