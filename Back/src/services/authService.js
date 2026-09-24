const AppError = require('../utils/appError')
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { pool } = require('../config/db')
const notImplemented = (operation) => {
  throw new AppError(`${operation} service not implemented`, 501)
}

// if I find repeating functions across the services might rethink and put the supporting functions in the models.
// although its an antipattern? but more readable
const getProfile = async (userId) => {
  const [rows] = await pool.execute(
    `SELECT id, username, email, first_name, last_name, created_at, updated_at
     FROM users
     WHERE id = ?`,
    [userId]
  )

  if (rows.length === 0) {
    throw new AppError('User not found', 404)
  }

  return new User(rows[0])
}

const register = async (userData) => {
  const { username, email, password, first_name, last_name } = userData

  if (!username || !email || !password) {
    throw new AppError('Username, email, and password are required', 400)
  }

  const passwordHash = await bcrypt.hash(password, 12)

  try {
    const [result] = await pool.execute(
      `INSERT INTO users (username, email, password_hash, first_name, last_name)
       VALUES (?, ?, ?, ?, ?)`,
      [username, email, passwordHash, first_name ?? null, last_name ?? null]
    )

    return getProfile(result.insertId)
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new AppError('Username or email already exists', 409)
    }

    throw error
  }
}

const login = async (credentials) => {
  const { email, username, password } = credentials
  const identifier = email || username

  if (!identifier || !password) {
    throw new AppError('Email or username and password are required', 400)
  }

  const [rows] = await pool.execute(
    `SELECT id, username, email, password_hash, first_name, last_name
     FROM users
     WHERE email = ? OR username = ?`,
    [identifier, identifier]
  )

  if (rows.length === 0 || !(await bcrypt.compare(password, rows[0].password_hash))) {
    throw new AppError('Invalid credentials', 401)
  }

  if (!process.env.JWT_SECRET) {
    throw new AppError('JWT_SECRET is not configured', 500)
  }

  const token = jwt.sign({ id: rows[0].id }, process.env.JWT_SECRET, {
    expiresIn: '1d'
  })

  return {
    token,
    user: new User({
      ...rows[0],
      password_hash: undefined
    })
  }
}

const updateProfile = async (userId, profileData) => {
  const allowedFields = ['username', 'email', 'first_name', 'last_name']
  const updates = allowedFields.filter((field) => profileData[field] !== undefined)

  if (updates.length === 0) {
    throw new AppError('No profile fields to update', 400)
  }

  const values = updates.map((field) => profileData[field])
  const assignments = updates.map((field) => `${field} = ?`).join(', ')

  try {
    await pool.execute(
      `UPDATE users SET ${assignments} WHERE id = ?`,
      [...values, userId]
    )
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new AppError('Username or email already exists', 409)
    }

    throw error
  }

  return getProfile(userId)
}

module.exports = { register, login, getProfile, updateProfile }