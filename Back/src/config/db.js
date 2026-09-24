const mysql = require('mysql2/promise')
const dotenv = require('dotenv')

dotenv.config()

const poolConfig = process.env.DATABASE_URL
  ? (() => {
      const databaseUrl = new URL(process.env.DATABASE_URL)

      return {
        host: databaseUrl.hostname,
        port: Number(databaseUrl.port) || 3306,
        user: decodeURIComponent(databaseUrl.username),
        password: decodeURIComponent(databaseUrl.password),
        database: databaseUrl.pathname.slice(1),
      }
    })()
  : {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'curt',
    }

const pool = mysql.createPool({
  ...poolConfig,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
})

const connectDatabase = async () => {
  const connection = await pool.getConnection()

  try {
    await connection.ping()
    console.log('MySQL database connected')
  } finally {
    connection.release()
  }
}

module.exports = { pool, connectDatabase }