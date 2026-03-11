'use strict';

/**
 * Factory that returns an Express middleware which validates req.body
 * against the given Zod schema. On failure, responds 400 with field errors.
 */
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = {};
      for (const issue of result.error.issues) {
        const field = issue.path.join('.') || 'body';
        errors[field] = issue.message;
      }
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
        timestamp: new Date().toISOString(),
      });
    }
    req.body = result.data; // use parsed/coerced data
    return next();
  };
}

module.exports = validate;
