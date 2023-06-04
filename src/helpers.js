const { PROFILE_TYPES } = require("./constants/profiles");

const buildSeqeulizeClauseForProfileType = (profile) => {
  return profile.type === PROFILE_TYPES.CONTRACTOR
    ? { ContractorId: profile.id }
    : { ClientId: profile.id };
};

module.exports = {
  buildSeqeulizeClauseForProfileType
}