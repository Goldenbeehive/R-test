class Task {
	constructor(data = {}) {
		this.id = data.id
		this.project_id = data.project_id
		this.title = data.title
		this.description = data.description ?? null
		this.status = data.status
		this.priority = data.priority
		this.created_by = data.created_by
		this.assigned_to = data.assigned_to ?? null
		this.due_date = data.due_date ?? null
		this.created_at = data.created_at
		this.updated_at = data.updated_at
	}
}

module.exports = Task