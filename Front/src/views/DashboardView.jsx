import { useState } from 'react'

export default function DashboardView({
  user,
  projects,
  tasks,
  members,
  userOptions,
  selectedProject,
  setSelectedProject,
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
  logout,
  loading,
  actionLoading,
  error,
  setError,
}) {
  const [projectForm, setProjectForm] = useState({ name: '', description: '' })
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium', status: 'todo', assigned_to: '', due_date: '' })
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingProject, setEditingProject] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [memberId, setMemberId] = useState('')
  const [memberQuery, setMemberQuery] = useState('')
  const [showProfile, setShowProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({ username: user?.username || '', email: user?.email || '', first_name: user?.first_name || '', last_name: user?.last_name || '' })
  const completed = tasks.filter((task) => task.status === 'done').length
  const isOwner = selectedProject && Number(selectedProject.owner_id) === Number(user?.id)

  const submitProject = async (event) => {
    event.preventDefault()
    try {
      await createProject(projectForm)
      setProjectForm({ name: '', description: '' })
      setShowProjectForm(false)
    } catch (err) { setError(err.message) }
  }

  const submitTask = async (event) => {
    event.preventDefault()
    try {
      const data = { ...taskForm, assigned_to: taskForm.assigned_to ? Number(taskForm.assigned_to) : null, due_date: taskForm.due_date || null }
      if (editingTask) await updateTask(editingTask.id, data)
      else await createTask(data)
      setTaskForm({ title: '', description: '', priority: 'medium', status: 'todo', assigned_to: '', due_date: '' })
      setEditingTask(null)
      setShowTaskForm(false)
    } catch (err) { setError(err.message) }
  }

  const submitProjectEdit = async (event) => {
    event.preventDefault()
    try {
      await updateProject(selectedProject.id, projectForm)
      setEditingProject(false)
    } catch (err) { setError(err.message) }
  }

  const startTaskEdit = (task) => {
    setEditingTask(task)
    setTaskForm({ title: task.title, description: task.description || '', priority: task.priority, status: task.status, assigned_to: task.assigned_to || '', due_date: task.due_date || '' })
    setShowTaskForm(true)
  }

  const submitProfile = async (event) => {
    event.preventDefault()
    try {
      await updateProfile(profileForm)
      setShowProfile(false)
    } catch (err) { setError(err.message) }
  }

  return (
    <div className="app-shell bg-[#f4f7f5]">
      <header className="flex items-center justify-between border-b border-[#dce7df] bg-white px-5 py-4 lg:px-10">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#ef8354] font-black text-white">C</span>
          <span className="font-black tracking-[-0.03em] text-[#173042]">PROJECT DESK</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm font-semibold text-[#6d827b] sm:block">{user?.username || user?.email}</span>
          <button disabled={actionLoading} onClick={() => setShowProfile(!showProfile)} className="rounded-lg border border-[#d8e2dc] px-3 py-2 text-sm font-bold text-[#173042] hover:border-[#ef8354] disabled:opacity-50">Profile</button>
          <button onClick={logout} className="rounded-lg border border-[#d8e2dc] px-3 py-2 text-sm font-bold text-[#173042] hover:border-[#ef8354]">Log out</button>
        </div>
      </header>

      {showProfile && <form onSubmit={submitProfile} className="mx-auto grid max-w-375 gap-3 border-b border-[#dce7df] bg-white p-5 sm:grid-cols-2 lg:px-10">
        <input required placeholder="Username" value={profileForm.username} onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })} className="rounded-lg border border-[#d8e2dc] px-3 py-2 text-sm outline-none focus:border-[#ef8354]" />
        <input required type="email" placeholder="Email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} className="rounded-lg border border-[#d8e2dc] px-3 py-2 text-sm outline-none focus:border-[#ef8354]" />
        <input placeholder="First name" value={profileForm.first_name} onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })} className="rounded-lg border border-[#d8e2dc] px-3 py-2 text-sm outline-none focus:border-[#ef8354]" />
        <input placeholder="Last name" value={profileForm.last_name} onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })} className="rounded-lg border border-[#d8e2dc] px-3 py-2 text-sm outline-none focus:border-[#ef8354]" />
        <button disabled={actionLoading} className="rounded-lg bg-[#173042] px-4 py-2 text-sm font-bold text-white disabled:opacity-50 sm:col-span-2 sm:justify-self-end">{actionLoading ? 'Saving...' : 'Save profile'}</button>
      </form>}

      <div className="mx-auto grid max-w-375 lg:grid-cols-[270px_1fr]">
        <aside className="border-b border-[#dce7df] bg-[#e6f1e9] p-5 lg:min-h-[calc(100vh-74px)] lg:border-b-0 lg:border-r lg:p-7">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#6d827b]">Your projects</p>
              <p className="mt-1 text-sm text-[#6d827b]">{projects.length} active</p>
            </div>
            <button title="Create project" onClick={() => setShowProjectForm(!showProjectForm)} className="grid h-9 w-9 place-items-center rounded-lg bg-[#173042] text-xl text-white hover:bg-[#254c5b]">+</button>
          </div>
          {showProjectForm && <form onSubmit={submitProject} className="mb-5 space-y-2 rounded-xl bg-white p-3 shadow-sm">
            <input autoFocus required placeholder="Project name" value={projectForm.name} onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })} className="w-full rounded-lg border border-[#d8e2dc] px-3 py-2 text-sm outline-none focus:border-[#ef8354]" />
            <textarea placeholder="Description" value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} className="w-full resize-none rounded-lg border border-[#d8e2dc] px-3 py-2 text-sm outline-none focus:border-[#ef8354]" rows="2" />
            <button className="w-full rounded-lg bg-[#ef8354] px-3 py-2 text-sm font-bold text-white">Save project</button>
          </form>}
          <nav className="space-y-2">
            {projects.map((project) => <button key={project.id} onClick={() => setSelectedProject(project)} className={`w-full rounded-xl px-4 py-3 text-left transition ${selectedProject?.id === project.id ? 'bg-[#173042] text-white shadow-lg shadow-[#173042]/10' : 'text-[#41616d] hover:bg-white'}`}>
              <span className="block truncate font-bold">{project.name}</span>
              <span className={`mt-1 block truncate text-xs ${selectedProject?.id === project.id ? 'text-[#b9d2ca]' : 'text-[#819690]'}`}>{project.description || 'No description yet'}</span>
            </button>)}
            {!projects.length && !loading && <p className="rounded-xl border border-dashed border-[#b9cbc1] p-4 text-sm text-[#6d827b]">Create your first project.</p>}
          </nav>
        </aside>

        <main className="min-w-0 p-5 lg:p-10">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-[#ef8354]">Project overview</p>
              <h1 className="text-4xl font-black tracking-[-0.06em] text-[#173042] lg:text-6xl">{selectedProject?.name || 'Projects'}</h1>
              <p className="mt-3 max-w-xl text-[#6d827b]">{selectedProject?.description || 'Choose a project to see its work.'}</p>
            </div>
            {selectedProject && <div className="flex flex-wrap gap-2">
              {isOwner && <>
                <button onClick={() => { setProjectForm({ name: selectedProject.name, description: selectedProject.description || '' }); setEditingProject(!editingProject) }} className="rounded-xl border border-[#d8e2dc] px-4 py-3 font-bold text-[#173042] hover:border-[#ef8354]">Edit project</button>
                <button onClick={async () => { if (window.confirm('Delete this project and its tasks?')) { try { await deleteProject(selectedProject.id) } catch (err) { setError(err.message) } } }} className="rounded-xl border border-red-200 px-4 py-3 font-bold text-red-700 hover:bg-red-50">Delete</button>
              </>}
              <button onClick={() => { setEditingTask(null); setShowTaskForm(!showTaskForm) }} className="rounded-xl bg-[#ef8354] px-5 py-3 font-bold text-white shadow-lg shadow-[#ef8354]/20 hover:bg-[#df7042]">+ New task</button>
            </div>}
          </div>

          {error && <div className="mb-5 flex items-center justify-between rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"><span>{error}</span><button onClick={() => setError('')} aria-label="Dismiss error">×</button></div>}
          {editingProject && <form onSubmit={submitProjectEdit} className="mb-6 grid gap-3 rounded-2xl bg-white p-5 shadow-sm sm:grid-cols-[1fr_1fr_auto]">
            <input autoFocus required placeholder="Project name" value={projectForm.name} onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })} className="rounded-lg border border-[#d8e2dc] px-3 py-2 outline-none focus:border-[#ef8354]" />
            <input placeholder="Description" value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} className="rounded-lg border border-[#d8e2dc] px-3 py-2 outline-none focus:border-[#ef8354]" />
            <button className="rounded-lg bg-[#173042] px-4 py-2 font-bold text-white">Save project</button>
          </form>}
          {showTaskForm && <form onSubmit={submitTask} className="mb-6 grid gap-3 rounded-2xl bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
            <input autoFocus required placeholder="Task title" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} className="rounded-lg border border-[#d8e2dc] px-3 py-2 outline-none focus:border-[#ef8354]" />
            <input placeholder="Description" value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} className="rounded-lg border border-[#d8e2dc] px-3 py-2 outline-none focus:border-[#ef8354]" />
            <select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })} className="rounded-lg border border-[#d8e2dc] px-3 py-2 outline-none focus:border-[#ef8354]"><option value="low">Low priority</option><option value="medium">Medium priority</option><option value="high">High priority</option></select>
            <select value={taskForm.status} onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })} className="rounded-lg border border-[#d8e2dc] px-3 py-2 outline-none focus:border-[#ef8354]"><option value="todo">To do</option><option value="in_progress">In progress</option><option value="done">Done</option></select>
            <select value={taskForm.assigned_to} onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })} className="rounded-lg border border-[#d8e2dc] px-3 py-2 outline-none focus:border-[#ef8354]"><option value="">Unassigned</option>{members.map((member) => <option key={member.id} value={member.id}>{member.username}</option>)}</select>
            <input type="date" value={taskForm.due_date} onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })} className="rounded-lg border border-[#d8e2dc] px-3 py-2 outline-none focus:border-[#ef8354]" />
            <button disabled={actionLoading} className="rounded-lg bg-[#173042] px-4 py-2 font-bold text-white disabled:opacity-50 lg:col-span-2">{actionLoading ? 'Saving...' : editingTask ? 'Save task' : 'Add task'}</button>
          </form>}

          <section className="mb-8 grid gap-4 sm:grid-cols-3">
            <Stat label="Total tasks" value={tasks.length} detail="in this project" />
            <Stat label="Completed" value={completed} detail={tasks.length ? `${Math.round((completed / tasks.length) * 100)}% of tasks` : 'ready to start'} accent />
            <Stat label="In progress" value={tasks.filter((task) => task.status === 'in_progress').length} detail="moving forward" />
          </section>

          <section className="overflow-hidden rounded-2xl border border-[#dce7df] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#edf1ee] px-5 py-4"><h2 className="font-black text-[#173042]">Task board</h2><span className="text-xs font-bold uppercase tracking-[0.15em] text-[#9aaba5]">{tasks.length} items</span></div>
            {loading && <p className="p-8 text-center text-sm text-[#6d827b]">Loading...</p>}
            {!loading && !tasks.length && <p className="p-10 text-center text-[#6d827b]">No tasks here yet. Add the first piece of work.</p>}
            <div className="divide-y divide-[#edf1ee]">
              {tasks.map((task) => <article key={task.id} className="flex flex-col gap-3 px-5 py-4 transition hover:bg-[#fbfdfb] sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0"><h3 className={`truncate font-bold ${task.status === 'done' ? 'text-[#9aaba5] line-through' : 'text-[#173042]'}`}>{task.title}</h3><p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#9aaba5]">{task.priority} priority{task.due_date ? ` · due ${task.due_date}` : ''}</p><p className="mt-1 truncate text-sm text-[#6d827b]">{task.description || 'No description'}</p></div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <select value={task.assigned_to ?? ''} onChange={(e) => assignTask(task.id, e.target.value ? Number(e.target.value) : null).catch((err) => setError(err.message))} className="w-full rounded-lg border border-[#d8e2dc] bg-white px-3 py-2 text-sm font-bold text-[#41616d] outline-none focus:border-[#ef8354] sm:w-40" aria-label={`Assign ${task.title}`}>
                    <option value="">Unassigned</option>
                    {members.map((member) => <option key={member.id} value={member.id}>{member.username}</option>)}
                  </select>
                  <select value={task.status} onChange={(e) => updateStatus(task.id, e.target.value).catch((err) => setError(err.message))} className="w-full rounded-lg border border-[#d8e2dc] bg-white px-3 py-2 text-sm font-bold text-[#41616d] outline-none focus:border-[#ef8354] sm:w-36" aria-label={`Set status for ${task.title}`}><option value="todo">To do</option><option value="in_progress">In progress</option><option value="done">Done</option></select>
                  <button onClick={() => startTaskEdit(task)} className="rounded-lg border border-[#d8e2dc] px-3 py-2 text-sm font-bold text-[#173042] hover:border-[#ef8354]">Edit</button>
                  <button onClick={async () => { if (window.confirm('Delete this task?')) { try { await deleteTask(task.id) } catch (err) { setError(err.message) } } }} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-50">Delete</button>
                </div>
              </article>)}
            </div>
          </section>

          {selectedProject && <section className="mt-6 rounded-2xl border border-[#dce7df] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between"><div><h2 className="font-black text-[#173042]">Project members</h2><p className="text-sm text-[#6d827b]">{members.length} people on this project</p></div></div>
            {isOwner && <form onSubmit={async (event) => { event.preventDefault(); if (!memberId) return; try { await addMember(Number(memberId)); setMemberId(''); setMemberQuery('') } catch (err) { setError(err.message) } }} className="relative mb-4 flex gap-2"><div className="relative min-w-0 flex-1"><input required placeholder="Search username or email" value={memberQuery} onChange={(e) => { setMemberQuery(e.target.value); setMemberId(''); searchUsers(e.target.value).catch((err) => setError(err.message)) }} className="w-full rounded-lg border border-[#d8e2dc] px-3 py-2 text-sm outline-none focus:border-[#ef8354]" />{userOptions.length > 0 && !memberId && <div className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-lg border border-[#d8e2dc] bg-white shadow-xl">{userOptions.map((option) => <button type="button" key={option.id} onClick={() => { setMemberId(option.id); setMemberQuery(option.username); setUserOptions([]) }} className="block w-full px-3 py-2 text-left text-sm hover:bg-[#f4f7f5]"><span className="font-bold text-[#173042]">{option.username}</span><span className="ml-2 text-[#6d827b]">{option.email}</span></button>)}</div>}</div><button disabled={!memberId || actionLoading} className="rounded-lg bg-[#173042] px-4 py-2 text-sm font-bold text-white disabled:opacity-40">{actionLoading ? 'Saving...' : 'Add member'}</button></form>}
            <div className="flex flex-wrap gap-2">{members.map((member) => <div key={member.id} className="flex items-center gap-2 rounded-lg bg-[#f4f7f5] px-3 py-2 text-sm"><span className="font-bold text-[#173042]">{member.username}</span><span className="text-[#9aaba5]">{member.role}</span>{isOwner && member.role !== 'owner' && <button onClick={async () => { try { await removeMember(member.id) } catch (err) { setError(err.message) } }} className="font-bold text-red-700" aria-label={`Remove ${member.username}`}>×</button>}</div>)}</div>
          </section>}
        </main>
      </div>
    </div>
  )
}

function Stat({ label, value, detail, accent }) {
  return <div className={`rounded-2xl border p-5 ${accent ? 'border-[#ef8354]/30 bg-[#fff7f2]' : 'border-[#dce7df] bg-white'}`}><p className="text-xs font-black uppercase tracking-[0.15em] text-[#9aaba5]">{label}</p><p className="mt-3 text-4xl font-black tracking-tighter text-[#173042]">{value}</p><p className="mt-1 text-sm font-semibold text-[#6d827b]">{detail}</p></div>
}
