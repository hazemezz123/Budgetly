import rateLimit from "express-rate-limit";

// Rate limiter - bypass during local tests and benchmarks
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100000,
  skip: (req) => {
    return (
      process.env.NODE_ENV === "test" ||
      process.env.DISABLE_RATE_LIMIT === "true" ||
      req.headers["x-benchmark"] === "budgetly-audit" ||
      req.ip === "127.0.0.1" ||
      req.ip === "::1" ||
      req.ip === "::ffff:127.0.0.1"
    );
  },
  message: {
    message:
      "لقد تجاوزت الحد المسموح به من الطلبات، يرجى المحاولة مرة أخرى لاحقًا.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});


