/**
 * Reusable Zod validation middleware for Express requests.
 * @param {import('zod').ZodSchema} schema
 * @param {'body'|'query'|'params'} source
 */
function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors,
      });
    }

    // Replace request data with the validated and transformed data
    req[source] = result.data;
    next();
  };
}

module.exports = {
  validate,
};
