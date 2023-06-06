const { Router, query } = require("express");
const { getProfile } = require("../middleware/getProfile");
const { PROFILE_TYPES } = require("../constants/profiles");
const { Op } = require("sequelize");
const { CONTRACT_STATUS } = require("../constants/contracts");
const { buildSeqeulizeClauseForProfileType } = require("../helpers");
const { ApiError } = require("../middleware/handleErrors");

const adminRouter = Router();

adminRouter.get("/best-profession", getProfile, async (req, res, next) => {
  const { Contract, Job, Profile } = req.app.get("models");
  const { start, end } = req.query;
  const sequelize = req.app.get("sequelize");
  // validate query params
  if (!start || !end) {
    return next(new ApiError("start and end must be specified", 400));
  }
  if (isNaN(Date.parse(start))) {
    return next(new ApiError("Start date is invalid", 400));
  }
  if (isNaN(Date.parse(end))) {
    return next(new ApiError("Start date is invalid", 400));
  }
  const startDate = new Date(start);
  const endDate = new Date(end);
  console.log("startDate", startDate);
  console.log("endDate", endDate);
  try {
    const queryResult = await Profile.findAll({
      where: {
        type: PROFILE_TYPES.CONTRACTOR,
      },
      group: ["Profile.profession"],
      attributes: [
        [sequelize.fn("SUM", sequelize.col("Contractor.Jobs.price")), "total"],
        "Profile.profession",
      ],
      include: [
        {
          attributes: [],
          model: Contract,
          as: "Contractor",
          include: [
            {
              model: Job,
              where: {
                paid: true,
                paymentDate: {
                  [Op.between]: [startDate, endDate],
                },
              },
              attributes: [],
            },
          ],
        },
      ],
      raw: true,
      order: [[sequelize.literal("total"), "DESC"]],
    });
    res.json(queryResult[0]).end();
  } catch (err) {
    console.log(err);
    return next(err);
  }
});

adminRouter.get("/best-clients", getProfile, async (req, res, next) => {
  const { Contract, Job, Profile } = req.app.get("models");
  const { start, end, limit: limitQuery } = req.query;
  const limit = Number(limitQuery);
  const sequelize = req.app.get("sequelize");
  // validate query params
  if (!start || !end || !limit) {
    return next(new ApiError("start and end must be specified", 400));
  }
  if (isNaN(Date.parse(start))) {
    return next(new ApiError("Start date is invalid", 400));
  }
  if (isNaN(Date.parse(end))) {
    return next(new ApiError("Start date is invalid", 400));
  }
  if (!Number.isInteger(limit)) {
    return next(new ApiError("limit must be an integer", 400));
  }
  const startDate = new Date(start);
  const endDate = new Date(end);
  try {
    const queryResult = await Profile.findAll({
      where: {
        type: PROFILE_TYPES.CLIENT,
      },
      group: ["Profile.id"],
      attributes: [
        [sequelize.fn("SUM", sequelize.col("Client.Jobs.price")), "total"],
        [sequelize.literal('Profile.firstName || " " || Profile.lastName'), 'fullName']
      ],
      include: [
        {
          attributes: [],
          model: Contract,
          as: "Client",
          include: [
            {
              model: Job,
              where: {
                paid: true,
                paymentDate: {
                  [Op.between]: [startDate, endDate],
                },
              },
              attributes: [],
            },
          ],
        },
      ],
      raw: true,
      order: [[sequelize.literal("total"), "DESC"]],
    });
    // Using limit in the above query generated some errors. Maybe it is because of sqlite.
    // I have successfully used 'limit' in the past with Postgres.
    // I have not investigated this issue furher at the moment.
    res.json(queryResult.slice(0, limit)).end();
  } catch (err) {
    console.log(err);
    return next(err);
  }
});

module.exports = adminRouter;
