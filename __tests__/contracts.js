const app = require("../src/app");
const request = require("supertest");

describe("GET /contracts/:id", () => {
  it("Should return 401 if no profile_id present", async () => {
    const response = await request(app).get("/contracts/1");
    expect(response.error.status).toBe(401);
  });
  it("Should return 403 if the profile is a client and it does not have access to the current contract", async () => {
    const response = await request(app)
      .get("/contracts/1")
      .set("profile_id", 2);
    expect(response.error.status).toBe(403);
  });
  it("Should return 403 if the profile is a contractor and it does not have access to the current contract", async () => {
    const response = await request(app)
      .get("/contracts/2")
      .set("profile_id", 5);
    expect(response.error.status).toBe(403);
  });
  it("Should return the contract if the current user has access to it", async () => {
    const response = await request(app)
      .get("/contracts/1")
      .set("profile_id", 1);
    expect(response.body.id).toBe(1);
    expect(response.body.ClientId).toBe(1);
  });
});

describe("GET /contracts", () => {
  it("Should return all the not terminated contracts of a client", async () => {
    const response = await request(app).get("/contracts").set("profile_id", 1);
    expect(response.body.length).toBe(2);
    response.body.forEach((contract) => {
      expect(contract.ClientId).toBe(1);
    });
  });

  it("Should return all the not terminated contracts of a contractor", async () => {
    const response = await request(app).get("/contracts").set("profile_id", 6);
    expect(response.body.length).toBe(3);
    response.body.forEach((contract) => {
      expect(contract.ContractorId).toBe(6);
    });
  });
});
