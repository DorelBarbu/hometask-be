const app = require("../src/app");
const request = require("supertest");

describe("GET /admin/best-profession?start=<date>&end=<date>", () => {
  it("Should return the best profession", async () => {
    const { Profile } = app.get("models");
    const startDate = new Date("2019-01-02T00:00:00Z");
    const endDate = new Date();
    const response = await request(app)
      .get(`/admin/best-profession`)
      .query({
        start: startDate,
        end: endDate,
      })
      .set("profile_id", 9);
    expect(response.statusCode).toBe(200);
    expect(response.body.profession).toBe("Programmer");
    expect(response.body.total).toBe(2683); // found the sum by inspecting the data set
  });
});

describe("GET /admin/best-clients?start=<date>&end=<date>&limit=<integer>", () => {
  it("Should return the best client", async () => {
    const { Profile } = app.get("models");
    const startDate = new Date("2019-01-02T00:00:00Z");
    const endDate = new Date();
    const response = await request(app)
      .get(`/admin/best-clients`)
      .query({
        start: startDate,
        end: endDate,
        limit: 3,
      })
      .set("profile_id", 9);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(3);
    expect(response.body[0].total).toBe(2020); // found the sum by inspecting the data set
    expect(response.body[0].fullName).toBe('Ash Kethcum');
  });
});
