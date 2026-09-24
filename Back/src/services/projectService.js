const AppError = require('../utils/appError')
const Project = require('../models/Project')
const { pool } = require('../config/db')

const getProject = async (projectId, userId) => {
  const [rows] = await pool.execute(
    `SELECT p.id, p.name, p.description, p.owner_id, p.created_at, p.updated_at
     FROM projects p
     JOIN project_members pm ON pm.project_id = p.id
     WHERE p.id = ? AND pm.user_id = ?`,
    [projectId, userId]
  )

  if (rows.length === 0) {
    throw new AppError('Project not found', 404)
  }

  return rows[0]
}

const checkOwner = async (projectId, userId) => {
  const [rows] = await pool.execute(
    'SELECT id FROM projects WHERE id = ? AND owner_id = ?',
    [projectId, userId]
  )

  if (rows.length === 0) {
    throw new AppError('Only the project owner can perform this action', 403)
  }
}

const list = async (user) => {
  const [rows] = await pool.execute(
    `SELECT p.id, p.name, p.description, p.owner_id, p.created_at, p.updated_at
     FROM projects p
     JOIN project_members pm ON pm.project_id = p.id
     WHERE pm.user_id = ?
     ORDER BY p.created_at DESC`,
    [user.id]
  )
  return rows.map((row) => new Project(row))
}

const getById = async (projectId, user) => {
  return new Project(await getProject(projectId, user.id))
}

const create = async (projectData, user) => {
  const { name, description = null } = projectData || {}
  if (!name) {
    throw new AppError('Project name is required', 400)
  }

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const [result] = await connection.execute(
      'INSERT INTO projects (name, description, owner_id) VALUES (?, ?, ?)',
      [name, description, user.id]
    )
    await connection.execute(
      `INSERT INTO project_members (project_id, user_id, role)
       VALUES (?, ?, 'owner')`,
      [result.insertId, user.id]
    )
    await connection.commit()
    return getById(result.insertId, user)
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

const update = async (projectId, projectData, user) => {
  await checkOwner(projectId, user.id)
  const updates = ['name', 'description'].filter(
    (field) => projectData && projectData[field] !== undefined
  )
  if (updates.length === 0) {
    throw new AppError('No project fields to update', 400)
  }

  const assignments = updates.map((field) => `${field} = ?`).join(', ')
  const values = updates.map((field) => projectData[field])
  await pool.execute(
    `UPDATE projects SET ${assignments} WHERE id = ?`,
    [...values, projectId]
  )
  return getById(projectId, user)
}

const remove = async (projectId, user) => {
  await checkOwner(projectId, user.id)
  await pool.execute('DELETE FROM projects WHERE id = ?', [projectId])
}

const listMembers = async (projectId, user) => {
  await getProject(projectId, user.id)
  const [rows] = await pool.execute(
    `SELECT u.id, u.username, u.email, u.first_name, u.last_name, pm.role, pm.joined_at
     FROM project_members pm
     JOIN users u ON u.id = pm.user_id
     WHERE pm.project_id = ?
     ORDER BY pm.joined_at`,
    [projectId]
  )
  return rows
}

const addMember = async (projectId, memberData, user) => {
  await checkOwner(projectId, user.id)
  const memberId = memberData && memberData.user_id
  if (!memberId) {
    throw new AppError('user_id is required', 400)
  }

  try {
    await pool.execute(
      `INSERT INTO project_members (project_id, user_id, role)
       VALUES (?, ?, 'member')`,
      [projectId, memberId]
    )
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new AppError('User is already a project member', 409)
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      throw new AppError('User not found', 404)
    }
    throw error
  }

  const [rows] = await pool.execute(
    `SELECT u.id, u.username, u.email, u.first_name, u.last_name, pm.role, pm.joined_at
     FROM project_members pm
     JOIN users u ON u.id = pm.user_id
     WHERE pm.project_id = ? AND pm.user_id = ?`,
    [projectId, memberId]
  )
  return rows[0]
}

const removeMember = async (projectId, memberId, user) => {
  await checkOwner(projectId, user.id)
  const [rows] = await pool.execute(
    'SELECT owner_id FROM projects WHERE id = ?',
    [projectId]
  )
  if (rows.length === 0) {
    throw new AppError('Project not found', 404)
  }
  if (Number(rows[0].owner_id) === Number(memberId)) {
    throw new AppError('The project owner cannot be removed', 400)
  }

  const [result] = await pool.execute(
    'DELETE FROM project_members WHERE project_id = ? AND user_id = ?',
    [projectId, memberId]
  )
  if (result.affectedRows === 0) {
    throw new AppError('Project member not found', 404)
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