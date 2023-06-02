const app = require("../src/app");
const request = require("supertest");

describe("GET /contracts/:id", () => {
  it("Should return 401 if no profile_id present", async () => {
    const response = await request(app).get("/contracts/1");
    expect(response.error.status).toBe(401);
  });
  it("Should return 403 if the profile is a client and the contract does not belong to him", async () => {
    const response = await request(app)
      .get("/contracts/1")
      .set("profile_id", 1);
    console.log(response.body);
  });
});
