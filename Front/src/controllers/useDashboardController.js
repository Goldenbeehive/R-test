import { useEffect, useState } from 'react'
import * as authService from '../services/authService'
import * as projectService from '../services/projectService'
import * as taskService from '../services/taskService'
import { getToken } from '../services/api'

export const useDashboardController = () => {
  const [token, setToken] = useState(getToken())
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('curt_user')
    return saved ? JSON.parse(saved) : null
  })
  const [projects, setProjects] = useState([])
  const [members, setMembers] = useState([])
  const [userOptions, setUserOptions] = useState([])
  const [tasks, setTasks] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')

  const runAction = async (action) => {
    setActionLoading(true)
    try {
      return await action()
    } finally {
      setActionLoading(false)
    }
  }

  const finishAuth = (result) => {
    localStorage.setItem('curt_token', result.token)
    localStorage.setItem('curt_user', JSON.stringify(result.user))
    setToken(result.token)
    setUser(result.user)
  }

  const login = async (credentials) => finishAuth(await authService.login(credentials))

  const register = async (details) => {
    await authService.register(details)
    await login({ email: details.email, password: details.password })
  }

  const logout = () => {
    localStorage.removeItem('curt_token')
    localStorage.removeItem('curt_user')
    setToken(null)
    setUser(null)
    setProjects([])
    setMembers([])
    setTasks([])
  }

  const handleError = (error) => {
    if (error.status === 401) {
      logout()
    }
    setError(error.message)
  }

  const loadProjects = async () => {
    const result = await projectService.getProjects()
    setProjects(result)
    setSelectedProject((current) => result.find((project) => project.id === current?.id) || result[0] || null)
  }

  const loadTasks = async (projectId) => {
    setTasks(await taskService.getTasks(projectId))
  }

  const loadMembers = async (projectId) => {
    setMembers(await projectService.getMembers(projectId))
  }

  useEffect(() => {
    if (!token) return
    setLoading(true)
    Promise.all([authService.getProfile(), loadProjects()])
      .then(([profile]) => {
        setUser(profile)
        localStorage.setItem('curt_user', JSON.stringify(profile))
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }, [token])

  useEffect(() => {
    if (!selectedProject) {
      setTasks([])
      setMembers([])
      return
    }
    loadTasks(selectedProject.id).catch(handleError)
    loadMembers(selectedProject.id).catch(handleError)
  }, [selectedProject])

  const createProject = (project) => runAction(async () => {
    const created = await projectService.createProject(project)
    setProjects((current) => [created, ...current])
    setSelectedProject(created)
  })

  const updateProject = (projectId, project) => runAction(async () => {
    const updated = await projectService.updateProject(projectId, project)
    setProjects((current) => current.map((item) => (item.id === updated.id ? updated : item)))
    setSelectedProject(updated)
  })

  const deleteProject = (projectId) => runAction(async () => {
    await projectService.deleteProject(projectId)
    const next = projects.filter((project) => project.id !== projectId)
    setProjects(next)
    setSelectedProject(next[0] || null)
  })

  const createTask = (task) => runAction(async () => {
    const created = await taskService.createTask({
      ...task,
      project_id: selectedProject.id,
    })
    setTasks((current) => [created, ...current])
  })

  const updateStatus = (taskId, status) => runAction(async () => {
    const updated = await taskService.updateTaskStatus(taskId, status)
    setTasks((current) => current.map((task) => (task.id === updated.id ? updated : task)))
  })

  const assignTask = (taskId, assignedTo) => runAction(async () => {
    const updated = await taskService.assignTask(taskId, assignedTo)
    setTasks((current) => current.map((task) => (task.id === updated.id ? updated : task)))
  })

  const updateTask = (taskId, task) => runAction(async () => {
    const updated = await taskService.updateTask(taskId, task)
    setTasks((current) => current.map((item) => (item.id === updated.id ? updated : item)))
  })

  const deleteTask = (taskId) => runAction(async () => {
    await taskService.deleteTask(taskId)
    setTasks((current) => current.filter((task) => task.id !== taskId))
  })

  const addMember = (userId) => runAction(async () => {
    const member = await projectService.addMember(selectedProject.id, userId)
    setMembers((current) => [...current, member])
  })

  const searchUsers = async (query) => {
    if (query.trim().length < 2) {
      setUserOptions([])
      return
    }
    setUserOptions(await authService.searchUsers(query))
  }

  const removeMember = (userId) => runAction(async () => {
    await projectService.removeMember(selectedProject.id, userId)
    setMembers((current) => current.filter((member) => member.id !== userId))
  })

  const updateProfile = (profile) => runAction(async () => {
    const updated = await authService.updateProfile(profile)
    setUser(updated)
    localStorage.setItem('curt_user', JSON.stringify(updated))
  })

  return {
    token,
    user,
    projects,
    members,
    userOptions,
    tasks,
    selectedProject,
    loading,
    actionLoading,
    error,
    setError,
    setSelectedProject,
    login,
    register,
    logout,
    createProject,
    updateProject,
    deleteProject,
    createTask,
    updateTask,
    deleteTask,
    updateStatus,
    assignTask,
    addMember,
    searchUsers,
    removeMember,
    updateProfile,
  }
}
