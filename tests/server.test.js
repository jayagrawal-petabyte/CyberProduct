const request = require("supertest");
const app = require("../server");

describe("Server routes", () => {
  test("mounts the company configuration API", async () => {
    const response = await request(app).get(
      "/api/v1/companies/16ec71a3-027d-43ef-90ab-c2cbc3db268b"
    );

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("TOKEN_MISSING");
  });
});
