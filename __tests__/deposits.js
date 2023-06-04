const app = require("../src/app");
const request = require("supertest");

describe("POST /deposit/:userId", () => {
  it("Should deposit money into a given client balance", async () => {
    const { Profile } = app.get("models");
    const clientId = 9; // added in the seed script with corresponding contract and job records
    const clientBefore = await Profile.findOne({
      where: { id: clientId },
      raw: true,
    });
    const amount = 10;
    const response = await request(app)
      .post(`/balances/deposit/${clientId}`)
      .send({
        amount,
      })
      .set("profile_id", 9);
    expect(response.statusCode).toBe(200);
    const clientAfter = await Profile.findOne({
      where: { id: clientId },
      raw: true,
    });
    expect(clientBefore.balance + amount).toBe(clientAfter.balance);
  });

  it("Should return 400 if the client tries to deposit a sum that is too big", async () => {
    const { Profile } = app.get("models");
    const clientId = 9; // added in the seed script with corresponding contract and job records
    const clientBefore = await Profile.findOne({
      where: { id: clientId },
      raw: true,
    });
    const amount = 1000000;
    const response = await request(app)
      .post(`/balances/deposit/${clientId}`)
      .send({
        amount,
      })
      .set("profile_id", 9);
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "The amount exceeds 25% of the total of unpaid jobs"
    );
    const clientAfter = await Profile.findOne({
      where: { id: clientId },
      raw: true,
    });
    expect(clientBefore.balance).toBe(clientAfter.balance);
  });
});
