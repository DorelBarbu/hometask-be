const { Router, query } = require("express");
const { getProfile } = require("../middleware/getProfile");
const { isClient } = require("../middleware/isClient");
const { PROFILE_TYPES } = require("../constants/profiles");
const { Op } = require("sequelize");
const { CONTRACT_STATUS } = require("../constants/contracts");
const { buildSeqeulizeClauseForProfileType } = require("../helpers");
const { ApiError } = require("../middleware/handleErrors");
const balancesRouter = Router();

/**
 * Disclaimer: I am not sure I understood the requirement properly.
 * Assume we are depositing x into client_a's balance.
 * Assume sum = the total of unpaid jobs related to client_a.
 * We only allow depositing the sum if x <= 0.25 * sum.
 * This is my understanding for this requirement.
 * We assume that an user can only deposit money into his own account.
 */
balancesRouter.post("/deposit/:userId", getProfile, async (req, res, next) => {
  const { Job, Contract, Profile } = req.app.get("models");
  const sequelize = req.app.get("sequelize");
  const { profile, body } = req;
  const { amount } = body;
  const userId = Number(req.params.userId);
  if (userId !== profile.id) {
    return next(new ApiError("Forbidden", 403));
  }
  try {
    await sequelize.transaction(async (t) => {
      const sumUnpaidJobsQueryResponse = await Contract.findAll({
        attributes: [
          [sequelize.fn("SUM", sequelize.col("Jobs.price")), "total"],
        ],
        where: {
          [Op.and]: [
            {
              status: { [Op.not]: CONTRACT_STATUS.TERMINATED },
            },
            {
              ClientId: profile.id,
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
          },
        ],
        raw: true,
      });
      const totalUnpaidJobs = sumUnpaidJobsQueryResponse[0].total;
      if (amount > 0.25 * totalUnpaidJobs) {
        throw new ApiError(
          "The amount exceeds 25% of the total of unpaid jobs",
          400
        );
      }
      const client = await Profile.findOne({
        where: { id: profile.id },
        lock: true,
        transaction: t,
      });
      client.balance += amount;
      await client.save({
        transaction: t,
      });
    });
    res.json({});
  } catch (err) {
    return next(err);
  }
});

module.exports = balancesRouter;
