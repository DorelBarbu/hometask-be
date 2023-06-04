const { Router, query } = require("express");
const { getProfile } = require("../middleware/getProfile");
const { isClient } = require("../middleware/isClient");
const { PROFILE_TYPES } = require("../constants/profiles");
const { Op } = require("sequelize");
const { CONTRACT_STATUS } = require("../constants/contracts");
const { buildSeqeulizeClauseForProfileType } = require("../helpers");
const { ApiError } = require("../middleware/handleErrors");
const jobsRouter = Router();

jobsRouter.get("/unpaid", getProfile, async (req, res) => {
  const { Job, Contract, Profile } = req.app.get("models");
  const { profile } = req;
  const contractsWithUnpaidJobs = await Contract.findAll({
    where: {
      [Op.and]: [
        buildSeqeulizeClauseForProfileType(profile),
        {
          status: { [Op.not]: CONTRACT_STATUS.TERMINATED },
        },
      ],
    },
    include: [
      {
        model: Job,
        as: "Jobs",
        where: {
          paid: {
            [Op.or]: [false, null],
          },
        },
        raw: true,
      },
    ],
  });
  const jobs = contractsWithUnpaidJobs.reduce((acc, contractWithUnpaidJobs) => {
    acc = [...acc, ...contractWithUnpaidJobs.Jobs];
    return acc;
  }, []);
  res.json(jobs);
});

jobsRouter.post(
  "/:job_id/pay",
  getProfile,
  isClient,
  async (req, res, next) => {
    const { Job, Contract, Profile } = req.app.get("models");
    const { job_id: jobId } = req.params;
    const { profile } = req;
    const sequelize = req.app.get("sequelize");
    // use a managed transaction to perform the payment and update related records
    // We will use pesimistic locking throuhout the transaction to ensure data consistency
    try {
      await sequelize.transaction(async (t) => {
        const job = await Job.findOne({
          where: {
            id: jobId,
          },
          lock: true,
          include: [{ model: Contract, as: "Contract" }],
        });
        if (!job) {
          throw new ApiError("Job not found", 404);
        }
        if (job.Contract.status === CONTRACT_STATUS.TERMINATED) {
          throw new ApiError("The contract is already terminated", 400);
        }
        if (job.paid) {
          throw new ApiError("Job is already paid", 400);
        }
        if (job.Contract.ClientId !== profile.id) {
          throw new ApiError("Not authorized", 403);
        }
        const contractorId = job.Contract.ContractorId;
        const amountToBePaid = job.price;
        // Update the balance
        const client = await Profile.findOne({
          where: {
            id: profile.id,
          },
          lock: true,
        });
        if (amountToBePaid > client.balance) {
          throw new ApiError("Insufficient funds", 400);
        }

        const contractor = await Profile.findOne({
          where: {
            id: contractorId,
          },
          lock: true,
        });
        client.balance -= amountToBePaid;
        await client.save({
          transaction: t,
        });
        contractor.balance += amountToBePaid;
        await contractor.save({
          transaction: t,
        });
        // update the job
        job.paid = true;
        job.paymentDate = new Date();
        await job.save({
          transaction: t,
        });
      });
    } catch (error) {
      return next(error);
    }

    res.status(200).end();
  }
);

module.exports = jobsRouter;
