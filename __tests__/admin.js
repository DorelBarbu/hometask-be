const app = require("../src/app");
const request = require("supertest");

describe("GET /admin/best-profession?start=<date>&end=<date>", () => {
  it("Should return the best profession", async () => {
    const { Profile } = app.get("models");
    const startDate = new Date();
    const endDate = new Date();
    const response = await request(app)
      .get(`/admin/best-profession`)
      .query({
        start: startDate,
        end: endDate,
      })
      .set("profile_id", 9);
  });
});
