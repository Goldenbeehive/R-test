const AppError = require('../utils/appError')
const jwt = require('jsonwebtoken')

const authenticate = (req, res, next) => {
  const authorization = req.headers.authorization
  const [scheme, token] = authorization ? authorization.split(' ') : []

  if (scheme !== 'Bearer' || !token) {
    return next(new AppError('Authentication required', 401))
  }

  if (!process.env.JWT_SECRET) {
    return next(new AppError('JWT_SECRET is not configured', 500))
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    return next()
  } catch (error) {
    return next(new AppError('Invalid or expired token', 401))
  }
}

module.exports = authenticate