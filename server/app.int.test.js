import request from "supertest"; // Supertest for making HTTP requests
import dotenv from "dotenv"; // Load environment variables
import app from "./app.js"; // Import the Express app
import jwt from "jsonwebtoken"; // Import JWT library for generating tokens
import * as todoRepo from "./repository/todoRepository.js"; // used for resetting state

dotenv.config(); // Load environment variables

// Helper: generates a valid JWT token for authenticated requests
const getToken = (email = "student@example.com") =>
  jwt.sign({ email }, process.env.JWT_SECRET);

// --- Test isolation: before each test reset the repository state ---
beforeEach(() => {
  todoRepo.reset();
});

// Test cases

test("1) GET / returns a list (200 + array)", async () => {
  const res = await request(app).get("/");
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
});

test("2) POST /create without a token → 401", async () => {
  const res = await request(app)
    .post("/create")
    .send({ task: { description: "Test Task" } });

  expect(res.status).toBe(401); // Expect 401 Unauthorized
});

test("3) POST /create with a valid token → 201 + id", async () => {
  const token = getToken(); // Generate a valid token
  const res = await request(app)
    .post("/create")
    .set("Authorization", `Bearer ${token}`) // Pass token in Authorization header
    .send({ task: { description: "Test Task" } });

  expect(res.status).toBe(201); // Expect 201 Created
  expect(res.body).toHaveProperty("id"); // Ensure the response has an 'id'
});

test("4) POST /create with missing data → 400", async () => {
  const token = getToken(); // Generate a valid token
  const res = await request(app)
    .post("/create")
    .set("Authorization", `Bearer ${token}`)
    .send({ task: null });

  expect(res.status).toBe(400); // Expect 400 Bad Request
  expect(res.body).toHaveProperty("error"); // Ensure error message is included
});

test("5) Created task appears in GET /", async () => {
  const token = getToken(); // Generate a valid token

  // Create a task first
  await request(app)
    .post("/create")
    .set("Authorization", `Bearer ${token}`)
    .send({ task: { description: "Test Task" } })
    .expect(201); // Ensure task creation was successful

  // Now check that GET / returns the task
  const res = await request(app).get("/").expect(200);

  expect(res.body.length).toBeGreaterThan(0); // Ensure the task list isn't empty
  expect(res.body[0].description).toBe("Test Task"); // Check the task description
});

test("6) POST /create with invalid token → 401", async () => {
  const res = await request(app)
    .post("/create")
    .set("Authorization", "invalid-token")
    .send({ task: { description: "Test Task" } });

  expect(res.status).toBe(401); // Expect 401 Unauthorized
});

test("7) DELETE removes task → 204", async () => {
  const token = getToken(); // Generate a valid token

  // Create a task first
  const createRes = await request(app)
    .post("/create")
    .set("Authorization", `Bearer ${token}`)
    .send({ task: { description: "Task to delete" } })
    .expect(201);

  const taskId = createRes.body.id;

  // Delete the task
  const deleteRes = await request(app)
    .delete(`/${taskId}`)
    .set("Authorization", `Bearer ${token}`);

  expect(deleteRes.status).toBe(204); // Expect 204 No Content
});

test("8) DELETE unknown id → 404", async () => {
  const token = getToken(); // Generate a valid token

  const res = await request(app)
    .delete("/999")
    .set("Authorization", `Bearer ${token}`);

  expect(res.status).toBe(404); // Expect 404 Not Found
});

test("9) POST /create with too short description → 400", async () => {
  const token = getToken(); // Generate a valid token
  const res = await request(app)
    .post("/create")
    .set("Authorization", `Bearer ${token}`)
    .send({ task: { description: "AB" } }); // Only 2 characters

  expect(res.status).toBe(400); // Expect 400 Bad Request
  expect(res.body).toHaveProperty("error"); // Ensure error message is included
});