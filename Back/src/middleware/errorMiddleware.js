const AppError = require('../utils/appError')

const errorMiddleware = (error, req, res, next) => {
  const isOperationalError = error instanceof AppError
  const statusCode = isOperationalError ? error.statusCode : 500

  if (!isOperationalError) {
    console.error(error)
  }
// should have debug and non debug mode but I don't think I'll have time.
  res.status(statusCode).json({
    error: isOperationalError ? error.message : 'Internal server error'
  })
}

module.exports = errorMiddleware