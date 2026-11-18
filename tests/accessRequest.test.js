
const express = require("express");
const request = require("supertest");

jest.mock("../access-requests/accessRequest.service", () => ({
  createAccessRequest: jest.fn()
}));

const {
  createAccessRequest
} = require("../access-requests/accessRequest.service");

const {
  submitAccessRequest
} = require("../access-requests/accessRequest.controller");

const {
  validateCreateAccessRequest
} = require("../access-requests/accessRequest.validation");

const app = express();

app.use(express.json());

// Mock authenticated user for route testing
app.use((req, res, next) => {
  req.user = {
    id: "33333333-3333-4333-8333-333333333333",
    company_id: "44444444-4444-4444-8444-444444444444"
  };

  req.accessToken = "test-access-token";
  next();
});

app.post(
  "/access-requests",
  validateCreateAccessRequest,
  submitAccessRequest
);

const validRequest = {
  resource_id: "11111111-1111-4111-8111-111111111111",
  device_id: "22222222-2222-4222-8222-222222222222",
  reason: "I need access for my project",
  requested_duration_minutes: 60
};

describe("Access Request API Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("successfully submits an access request", async () => {
    const createdRequest = {
      id: "55555555-5555-4555-8555-555555555555",
      ...validRequest,
      status: "pending"
    };

    createAccessRequest.mockResolvedValue(createdRequest);

    const res = await request(app)
      .post("/access-requests")
      .send(validRequest);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe(
      "Access request submitted successfully"
    );
    expect(res.body.data).toEqual(createdRequest);

    expect(createAccessRequest).toHaveBeenCalledWith({
      userId: "33333333-3333-4333-8333-333333333333",
      companyId: "44444444-4444-4444-8444-444444444444",
      accessToken: "test-access-token",
      requestData: validRequest
    });
  });

  test("rejects an invalid resource UUID", async () => {
    const res = await request(app)
      .post("/access-requests")
      .send({
        ...validRequest,
        resource_id: "invalid-id"
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Validation failed");
    expect(res.body.errors).toContain(
      "A valid resource_id is required"
    );

    expect(createAccessRequest).not.toHaveBeenCalled();
  });

  test("rejects an empty reason", async () => {
    const res = await request(app)
      .post("/access-requests")
      .send({
        ...validRequest,
        reason: "   "
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toContain(
      "Reason must contain between 1 and 1000 characters"
    );

    expect(createAccessRequest).not.toHaveBeenCalled();
  });

  test("rejects an invalid requested duration", async () => {
    const res = await request(app)
      .post("/access-requests")
      .send({
        ...validRequest,
        requested_duration_minutes: -10
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toContain(
      "Requested duration must be a positive integer or null"
    );

    expect(createAccessRequest).not.toHaveBeenCalled();
  });

  test("returns 409 when a duplicate pending request exists", async () => {
    const error = new Error(
      "A pending request already exists for this resource"
    );
    error.statusCode = 409;

    createAccessRequest.mockRejectedValue(error);

    jest.spyOn(console, "error").mockImplementation(() => {});

    const res = await request(app)
      .post("/access-requests")
      .send(validRequest);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe(
      "A pending request already exists for this resource"
    );
  });

  test("returns 500 when an unexpected server error occurs", async () => {
    createAccessRequest.mockRejectedValue(
      new Error("Database connection failed")
    );

    jest.spyOn(console, "error").mockImplementation(() => {});

    const res = await request(app)
      .post("/access-requests")
      .send(validRequest);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe(
      "Something went wrong while submitting the request"
    );
  });
});
