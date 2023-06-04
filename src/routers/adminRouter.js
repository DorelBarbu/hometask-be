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
  const endDate = new Date(start);
  console.log("startDate", startDate);
  console.log("endDate", endDate);
  try {
    // const queryResult = await Job.findAll({
    //   where: {
    //     paid: true,
    //   },
    //   group: ["Contract.Contractor.profession"],
    //   attributes: [
    //     "Contract.Contractor.profession",
    //     [sequelize.fn("sum", sequelize.col("price")), "total_paid"],
    //   ],
    //   include: [
    //     {
    //       model: Contract,
    //       as: "Contract",
    //       include: [
    //         {
    //           model: Profile,
    //           as: "Contractor",
    //         },
    //       ],
    //     },
    //   ],
    // });
    const queryResult = await Profile.findAll({
      where: {
        type: "contractor",
      },
      include: [
        {
          model: Contract,
          as: "Contractor",
          include: [
            {
              model: Job,
              where: {
                paid: true,
              },
            },
          ],
        },
      ],
    });
    const r = queryResult.map((q) => q.toJSON());
    const x = 0;
  } catch (err) {
    console.log(err);
    return next(err);
  }
  res.json({});
});

module.exports = adminRouter;
