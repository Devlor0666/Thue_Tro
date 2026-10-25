const AppError = require("../utils/AppError");

module.exports = (schema, property = "body") => (req, res, next) => {
  const { error, value } = schema.validate(req[property], {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });

  if (error) {
    const message = error.details.map((detail) => detail.message).join("; ");
    return next(new AppError(message, 400));
  }
  req[property] = value;
  return next();
};
