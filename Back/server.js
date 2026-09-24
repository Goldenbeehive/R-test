const app = require('./src/app')
const { connectDatabase } = require('./src/config/db')

const port = process.env.PORT || 3000

const startServer = async () => {
  try {
    await connectDatabase()

    app.listen(port, () => {
      console.log(`Server listening on port ${port}`)
    })
  } catch (error) {
    console.error('Unable to connect to MySQL:', error.message)
    process.exitCode = 1
  }
}

startServer()