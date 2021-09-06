const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const hashPassword = (password) => {
  const saltRounds = bcrypt.genSaltSync(10);
  var hashPassword = bcrypt.hashSync(password, saltRounds);
  return hashPassword;
};

const accessToken = (payload) => {
  try {
    var token = jwt.sign(payload, 'secret', { expiresIn: "1d" });
    // tokenList.refreshToken = { "token": token }
    // return { auth: true, token: token }
    return { token: token };
  } catch (err) {
    return err;
  }
};

const authenticateUser = (req, res, next) => {
  try {
    var token =
      req.headers["x-access-token"] || req.headers["token"] || req.params.token;

    if (!token)
      return res
        .status(401)
        .send({ auth: false, message: "No token provided." });

    jwt.verify(token, 'secret', async (err, decoded) => {
      if (err) {
        return res.status(401).json({
          auth: false,
          message: "Failed to authenticate..",
          error: err,
        });
      }
      req.token = decoded; //token added in the request process
      return next();
    });
  } catch (err) {
    return res.status(401).json({
      auth: false,
      message: "Failed to authenticate",
    });
  }
};

module.exports = { hashPassword, authenticateUser, accessToken };
