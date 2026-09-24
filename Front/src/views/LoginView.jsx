import { useState } from 'react'

const initialForm = { username: '', email: '', password: '' }

export default function LoginView({ login, register, error, setError }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState(initialForm)
  const [busy, setBusy] = useState(false)

  const update = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      if (mode === 'login') {
        await login({ email: form.email, username: form.username, password: form.password })
      } else {
        await register(form)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-4xl bg-[#173042] shadow-2xl shadow-[#173042]/20 md:grid-cols-[1fr_0.85fr]">
        <div className="flex flex-col justify-center bg-[#e6f1e9] p-8 sm:p-12">  
            <h1 className="max-w-md  text-5xl font-black leading-[0.95] tracking-tighter text-[#173042] sm:text-7xl">
              Keep work moving.
            </h1> 
        </div>

        <div className="bg-white p-8 sm:p-12">
          <div className="mb-10">
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-[#ef8354]">
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </p>
            <h2 className="text-3xl font-black tracking-[-0.04em] text-[#173042]">
              {mode === 'login' ? 'Sign in to your workspace.' : 'Create your workspace account.'}
            </h2>
          </div>

          <form className="space-y-4" onSubmit={submit}>
            {mode === 'register' && (
              <Field label="Username" name="username" value={form.username} onChange={update} />
            )}
            <Field label="Email" name="email" type="email" value={form.email} onChange={update} />
            <Field label="Password" name="password" type="password" value={form.password} onChange={update} />
            {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
            <button className="w-full rounded-xl bg-[#173042] px-5 py-3.5 font-bold text-white transition hover:bg-[#254c5b] disabled:opacity-50" disabled={busy}>
              {busy ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Register'}
            </button>
          </form>

          <button
            className="mt-6 text-sm font-bold text-[#41616d] underline decoration-[#ef8354] decoration-2 underline-offset-4"
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
          >
            {mode === 'login' ? 'Need an account? Register' : 'Already have an account? Sign in'}
          </button>
        </div>
      </section>
    </main>
  )
}

function Field({ label, ...props }) {
  return (
    <label className="block text-sm font-bold text-[#173042]">
      {label}
      <input {...props} required className="mt-2 w-full rounded-xl border border-[#d8e2dc] bg-[#f7faf8] px-4 py-3 font-normal outline-none transition placeholder:text-[#9aaba5] focus:border-[#ef8354] focus:ring-4 focus:ring-[#ef8354]/10" />
    </label>
  )
}
