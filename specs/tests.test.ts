import request from "supertest";

import { config } from "dotenv";

import app from "../src/app";

import { connectDB, disConnectDB } from "../src/config/db";

describe("Test Routes", () => {
  let token: string;
  let testId: string;

  beforeAll(async () => {
    config();
    await connectDB();

    const res = await request(app).post("/api/v1/auth/signup").send({
      name: "Test Admin",
      email: "test@email.com",
      password: "Test@123",
      role: 1,
    });

    token = res.headers["x-auth-token"];

    const questionRes = await request(app)
      .post("/api/v1/questions")
      .send({
        question: "Test Question",
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
        answer: "Option 1",
        difficulty: 10,
      });

    const questionId = questionRes.body.data.id;

    const testRes = await request(app)
      .post("/api/v1/tests")
      .send({
        name: "Test Name",
        description: "Test Description",
        questions: [questionId],
      });

    testId = testRes.body.data.id;
  });

  describe("GET /api/v1/tests/:testId", () => {
    it("should return test details of given testId", async () => {
      const res = await request(app)
        .get(`/api/v1/tests/${testId}`)
        .set("Cookie", `x-auth-token=${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Test fetched successfully");
    });
  });

  afterAll(async () => {
    await disConnectDB();
  });
});
