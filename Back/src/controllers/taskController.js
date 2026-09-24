const taskService = require('../services/taskService')

const list = async (req, res, next) => {
  try {
    res.json(await taskService.list(req.query, req.user))
  } catch (error) {
    next(error)
  }
}

const create = async (req, res, next) => {
  try {
    res.status(201).json(await taskService.create(req.body, req.user))
  } catch (error) {
    next(error)
  }
}

const getById = async (req, res, next) => {
  try {
    res.json(await taskService.getById(req.params.taskId, req.user))
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    res.json(await taskService.update(req.params.taskId, req.body, req.user))
  } catch (error) {
    next(error)
  }
}

const remove = async (req, res, next) => {
  try {
    await taskService.remove(req.params.taskId, req.user)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}

const updateStatus = async (req, res, next) => {
  try {
    res.json(
      await taskService.updateStatus(
        req.params.taskId,
        req.body.status,
        req.user
      )
    )
  } catch (error) {
    next(error)
  }
}

const assign = async (req, res, next) => {
  try {
    res.json(
      await taskService.assign(
        req.params.taskId,
        req.body.assigned_to,
        req.user
      )
    )
  } catch (error) {
    next(error)
  }
}

module.exports = { list, getById, create, update, remove, updateStatus, assign }