const jwt = require("jsonwebtoken");
require("dotenv").config();

const ACCESS_EXPIRES_IN = "15m";
const REFRESH_EXPIRES_IN = "7d";

const createAccessToken = (payload) => jwt.sign(payload, process.env.ACCESS_SECRET_TOKEN, { expiresIn: ACCESS_EXPIRES_IN });
const createRefreshToken = (payload) => jwt.sign(payload, process.env.REFRESH_SECRET_TOKEN, { expiresIn: REFRESH_EXPIRES_IN });
const verifyAccessToken = (token) => jwt.verify(token, process.env.ACCESS_SECRET_TOKEN);
const verifyRefreshToken = (token) => jwt.verify(token, process.env.REFRESH_SECRET_TOKEN);

module.exports = { createAccessToken, createRefreshToken, verifyAccessToken, verifyRefreshToken };
