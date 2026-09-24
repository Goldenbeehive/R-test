const express = require('express')
const authRoutes = require('./routes/authRoutes')
const projectRoutes = require('./routes/projectRoutes')
const taskRoutes = require('./routes/taskRoutes')
const errorMiddleware = require('./middleware/errorMiddleware')
const app = express()

app.use((req, res, next) => {
	const origin = process.env.FRONTEND_URL || 'http://localhost:5173'
	res.setHeader('Access-Control-Allow-Origin', origin)
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')

	if (req.method === 'OPTIONS') {
		return res.sendStatus(204)
	}

	next()
})

app.use(express.json())


app.use('/auth', authRoutes)
app.use('/projects', projectRoutes)
app.use('/tasks', taskRoutes)
app.use(errorMiddleware)

module.exports = app