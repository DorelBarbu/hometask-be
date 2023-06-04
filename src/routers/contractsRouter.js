const { Router } = require("express");
const { getProfile } = require("../middleware/getProfile");
const { PROFILE_TYPES } = require("../constants/profiles");
const { Op } = require("sequelize");
const { CONTRACT_STATUS } = require("../constants/contracts");
const { buildSeqeulizeClauseForProfileType } = require("../helpers");

const contractsRouter = Router();

contractsRouter.get("/:id", getProfile, async (req, res) => {
  const { Contract } = req.app.get("models");
  const { id } = req.params;
  const contract = await Contract.findOne({ where: { id } });
  if (!contract) return res.status(404).end();
  const { profile } = req;
  if (
    profile.type === PROFILE_TYPES.CONTRACTOR &&
    profile.id !== contract.ContractorId
  ) {
    return res.status(403).end();
  }
  if (
    profile.type === PROFILE_TYPES.CLIENT &&
    profile.id !== contract.ClientId
  ) {
    return res.status(403).end();
  }
  res.json(contract);
});

contractsRouter.get("/", getProfile, async (req, res) => {
  const { Contract } = req.app.get("models");
  const { profile } = req;
  const contracts = await Contract.findAll({
    where: {
      [Op.and]: [
        buildSeqeulizeClauseForProfileType(profile),
        {
          status: { [Op.not]: CONTRACT_STATUS.TERMINATED },
        },
      ],
    },
  });

  res.json(contracts);
});

module.exports = contractsRouter;
