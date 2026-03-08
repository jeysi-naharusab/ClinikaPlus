export function errorHandler(err, _req, res, _next) {
  console.error(err);

  const status = Number.isInteger(err?.statusCode) ? err.statusCode : 500;

  return res.status(status).json({
    error: err?.message || "Internal server error",
  });
}
