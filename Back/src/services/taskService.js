const AppError = require('../utils/appError')
const Task = require('../models/Task')
const { pool } = require('../config/db')

const getTask = async (taskId, userId) => {
  const [rows] = await pool.execute(
    `SELECT t.id, t.project_id, t.title, t.description, t.status, t.priority,
            t.created_by, t.assigned_to, t.due_date, t.created_at, t.updated_at
     FROM tasks t
     JOIN project_members pm ON pm.project_id = t.project_id
     WHERE t.id = ? AND pm.user_id = ?`,
    [taskId, userId]
  )
  if (rows.length === 0) {
    throw new AppError('Task not found', 404)
  }
  return rows[0]
}

const validateEnum = (value, allowed, field) => {
  if (value !== undefined && !allowed.includes(value)) {
    throw new AppError(`${field} must be one of: ${allowed.join(', ')}`, 400)
  }
}

const requireProjectMember = async (projectId, userId) => {
  const [rows] = await pool.execute(
    'SELECT 1 FROM project_members WHERE project_id = ? AND user_id = ?',
    [projectId, userId]
  )
  if (rows.length === 0) {
    throw new AppError('Project not found', 404)
  }
}

const list = async (filters = {}, user) => {
  const conditions = ['pm.user_id = ?']
  const values = [user.id]
  for (const field of ['project_id', 'status', 'priority', 'assigned_to']) {
    if (filters[field] !== undefined) {
      conditions.push(`t.${field} = ?`)
      values.push(filters[field])
    }
  }
  validateEnum(filters.status, ['todo', 'in_progress', 'done'], 'status')
  validateEnum(filters.priority, ['low', 'medium', 'high'], 'priority')

  const [rows] = await pool.execute(
    `SELECT t.id, t.project_id, t.title, t.description, t.status, t.priority,
            t.created_by, t.assigned_to, t.due_date, t.created_at, t.updated_at
     FROM tasks t
     JOIN project_members pm ON pm.project_id = t.project_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY t.created_at DESC`,
    values
  )
  return rows.map((row) => new Task(row))
}

const getById = async (taskId, user) => {
  return new Task(await getTask(taskId, user.id))
}

const create = async (taskData, user) => {
  const {
    project_id,
    title,
    description = null,
    status = 'todo',
    priority = 'medium',
    assigned_to = null,
    due_date = null
  } = taskData || {}

  if (!project_id || !title) {
    throw new AppError('project_id and title are required', 400)
  }
  validateEnum(status, ['todo', 'in_progress', 'done'], 'status')
  validateEnum(priority, ['low', 'medium', 'high'], 'priority')
  await requireProjectMember(project_id, user.id)

  if (assigned_to !== null) {
    await requireProjectMember(project_id, assigned_to)
  }

  const [result] = await pool.execute(
    `INSERT INTO tasks
       (project_id, title, description, status, priority, created_by, assigned_to, due_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [project_id, title, description, status, priority, user.id, assigned_to, due_date]
  )
  return getById(result.insertId, user)
}

const update = async (taskId, taskData, user) => {
  const task = await getTask(taskId, user.id)
  const allowedFields = ['title', 'description', 'status', 'priority', 'assigned_to', 'due_date']
  const updates = allowedFields.filter(
    (field) => taskData && taskData[field] !== undefined
  )
  if (updates.length === 0) {
    throw new AppError('No task fields to update', 400)
  }

  validateEnum(taskData.status, ['todo', 'in_progress', 'done'], 'status')
  validateEnum(taskData.priority, ['low', 'medium', 'high'], 'priority')
  if (taskData.assigned_to !== undefined && taskData.assigned_to !== null) {
    await requireProjectMember(task.project_id, taskData.assigned_to)
  }

  const assignments = updates.map((field) => `${field} = ?`).join(', ')
  const values = updates.map((field) => taskData[field])
  await pool.execute(
    `UPDATE tasks SET ${assignments} WHERE id = ?`,
    [...values, taskId]
  )
  return getById(taskId, user)
}

const remove = async (taskId, user) => {
  await getTask(taskId, user.id)
  await pool.execute('DELETE FROM tasks WHERE id = ?', [taskId])
}

const updateStatus = async (taskId, status, user) =>
  update(taskId, { status }, user)

const assign = async (taskId, assigneeId, user) =>
  update(taskId, { assigned_to: assigneeId ?? null }, user)

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
  updateStatus,
  assign
}