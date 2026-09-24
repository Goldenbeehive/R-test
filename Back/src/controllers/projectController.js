const projectService = require('../services/projectService')

const list = async (req, res, next) => {
  try {
    res.json(await projectService.list(req.user))
  } catch (error) {
    next(error)
  }
}

const create = async (req, res, next) => {
  try {
    res.status(201).json(await projectService.create(req.body, req.user))
  } catch (error) {
    next(error)
  }
}

const getById = async (req, res, next) => {
  try {
    res.json(await projectService.getById(req.params.projectId, req.user))
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    res.json(await projectService.update(req.params.projectId, req.body, req.user))
  } catch (error) {
    next(error)
  }
}

const remove = async (req, res, next) => {
  try {
    await projectService.remove(req.params.projectId, req.user)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}

const listMembers = async (req, res, next) => {
  try {
    res.json(await projectService.listMembers(req.params.projectId, req.user))
  } catch (error) {
    next(error)
  }
}

const addMember = async (req, res, next) => {
  try {
    res.status(201).json(
      await projectService.addMember(req.params.projectId, req.body, req.user)
    )
  } catch (error) {
    next(error)
  }
}

const removeMember = async (req, res, next) => {
  try {
    await projectService.removeMember(
      req.params.projectId,
      req.params.memberId,
      req.user
    )
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
  listMembers,
  addMember,
  removeMember
}