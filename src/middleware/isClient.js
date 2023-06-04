const { PROFILE_TYPES } = require("../constants/profiles");

const isClient = async (req, res, next) => {
  const { profile } = req;
  if (profile.type === PROFILE_TYPES.CLIENT) {
    return next();
  }
  return res.status(403).end();
};
module.exports = { isClient };
