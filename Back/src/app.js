const express = require('express')
const authRoutes = require('./routes/authRoutes')
const projectRoutes = require('./routes/projectRoutes')
const taskRoutes = require('./routes/taskRoutes')
const errorMiddleware = require('./middleware/errorMiddleware')
const app = express()

app.use(express.json())


app.use('/auth', authRoutes)
app.use('/projects', projectRoutes)
app.use('/tasks', taskRoutes)
app.use(errorMiddleware)

module.exports = app