class User {
  constructor(data = {}) {
    this.id = data.id
    this.username = data.username
    this.email = data.email
    this.password_hash = data.password_hash
    this.first_name = data.first_name ?? null
    this.last_name = data.last_name ?? null
    this.created_at = data.created_at
    this.updated_at = data.updated_at
  }

}

module.exports = User