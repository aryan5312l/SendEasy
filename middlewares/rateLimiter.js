// middlewares/rateLimiter.js
const rateLimit = require('express-rate-limit');

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 requests per window per IP
  message: 'Too many upload attempts from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  uploadLimiter
};
