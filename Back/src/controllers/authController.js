const authService = require('../services/authService')

const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body)
    res.status(201).json(user)
  } catch (error) {
    next(error)
  }
}

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body)
    res.json(result)
  } catch (error) {
    next(error)
  }
}

const getProfile = async (req, res, next) => {
  try {
    res.json(await authService.getProfile(req.user.id))
  } catch (error) {
    next(error)
  }
}

const updateProfile = async (req, res, next) => {
  try {
    res.json(await authService.updateProfile(req.user.id, req.body))
  } catch (error) {
    next(error)
  }
}

const searchUsers = async (req, res, next) => {
  try {
    res.json(await authService.searchUsers(req.query.q, req.user.id))
  } catch (error) {
    next(error)
  }
}

module.exports = { register, login, getProfile, updateProfile, searchUsers }