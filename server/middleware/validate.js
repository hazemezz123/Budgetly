export const validate = (schemas) => (req, res, next) => {
  try {
    if (schemas.body) {
      req.body = schemas.body.parse(req.body);
    }
    if (schemas.query) {
      req.query = schemas.query.parse(req.query);
    }
    if (schemas.params) {
      req.params = schemas.params.parse(req.params);
    }
    next();
  } catch (error) {
    if (error.name === "ZodError") {
      const issues = error.issues || error.errors || [];
      const formattedErrors = issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return res.status(400).json({
        message: formattedErrors[0]?.message || "Validation error",
        errors: formattedErrors,
      });
    }
    next(error);
  }
};
