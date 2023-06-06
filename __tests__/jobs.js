const app = require("../src/app");
const request = require("supertest");

describe("GET /jobs/unpaid", () => {
  it("Should return the unpaid jobs for a given profile", async () => {
    const response = await request(app)
      .get("/jobs/unpaid")
      .set("profile_id", 1);
    const { body: unpaidJobs } = response;
    unpaidJobs.forEach((job) => {
      expect(job.paid).toBe(null);
    });
  });
});

describe("POST /jobs/:job_id/pay", () => {
  it("Should successfully pay for a job", async () => {
    const { Job, Profile } = app.get("models");
    // The following ids were chosen by inspecting the contract with id 1.
    const clientId = 1;
    const contractorId = 5;
    // Create a new job for the contract with id 1.
    const jobBefore = (
      await Job.create({
        description: "work",
        price: 100,
        ContractId: 1,
        paid: null,
        paymentDate: null,
      })
    ).toJSON();
    const jobId = jobBefore.id;
    const clientBefore = await Profile.findOne({
      where: { id: clientId },
    });
    const contractorBefore = await Profile.findOne({
      where: {
        id: contractorId,
      },
    });
    expect(jobBefore.paid).toBe(null);
    expect(jobBefore.paymentDate).toBe(null);
    const response = await request(app)
      .post(`/jobs/${jobId}/pay`)
      .set("profile_id", 1);
    expect(response.statusCode).toBe(200);
    // Query the records after the payment
    const clientAfter = await Profile.findOne({
      where: { id: clientId },
    });
    const contractorAfter = await Profile.findOne({
      where: {
        id: contractorId,
      },
    });
    const jobAfter = await Job.findOne({
      where: {
        id: jobId,
      },
    });
    expect(jobAfter.paid).toBe(true);
    expect(contractorBefore.balance + jobBefore.price).toBe(
      contractorAfter.balance
    );
    expect(clientBefore.balance - jobBefore.price).toBe(clientAfter.balance);
  });

  it("Should return 404 not found if a job does not exist", async () => {
    const jobId = 2023;
    const response = await request(app)
      .post(`/jobs/${jobId}/pay`)
      .set("profile_id", 1);
    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("Job not found");
  });

  it("Should return 400 if trying to pay for a job without enough balance", async () => {
    const { Job } = app.get("models");
    // Create a new job for the contract with id 1. The job price exceeds the client balance
    const jobBefore = (
      await Job.create({
        description: "work",
        price: 100000,
        ContractId: 1,
        paid: null,
        paymentDate: null,
      })
    ).toJSON();
    expect(jobBefore.paid).toBe(null);
    expect(jobBefore.paymentDate).toBe(null);
    const jobId = jobBefore.id;
    const response = await request(app)
      .post(`/jobs/${jobId}/pay`)
      .set("profile_id", 1);
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Insufficient funds');
  });
});
