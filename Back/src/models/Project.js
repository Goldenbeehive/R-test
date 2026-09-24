class Project {
	constructor(data = {}) {
		this.id = data.id
		this.name = data.name
		this.description = data.description ?? null
		this.owner_id = data.owner_id
		this.created_at = data.created_at
		this.updated_at = data.updated_at
	}
}

module.exports = Project