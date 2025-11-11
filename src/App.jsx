import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  Upload as UploadIcon,
  FileText,
  MessageSquare,
  Scale,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Search,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Menu,
  Moon,
  Sun,
  User,
  LogOut,
  Folder,
  FolderPlus,
  PieChart,
  LineChart,
  Info,
  Command,
  FileUp,
  ImageUp,
  Paperclip
} from 'lucide-react'
import * as Toast from '@radix-ui/react-toast'
import * as Dialog from '@radix-ui/react-dialog'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as Switch from '@radix-ui/react-switch'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as PieChartR,
  Pie,
  Cell,
  LineChart as LineChartR,
  Line
} from 'recharts'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem('js_token') || '')
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('js_user')
    return raw ? JSON.parse(raw) : null
  })
  function saveAuth(nextToken, nextUser) {
    setToken(nextToken)
    setUser(nextUser)
    localStorage.setItem('js_token', nextToken)
    localStorage.setItem('js_user', JSON.stringify(nextUser))
  }
  function logout() {
    setToken('')
    setUser(null)
    localStorage.removeItem('js_token')
    localStorage.removeItem('js_user')
  }
  return { token, user, saveAuth, logout }
}

async function api(path, { token, method = 'GET', body, headers } = {}) {
  const hdrs = { ...(headers || {}) }
  if (!(body instanceof FormData)) hdrs['Content-Type'] = 'application/json'
  if (token) hdrs['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: hdrs,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    let message = 'Request failed'
    try {
      const data = await res.json()
      message = data.detail || data.message || message
    } catch (_) {}
    throw new Error(message)
  }
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) return res.json()
  return res.text()
}

// Theme management (dark/light)
function useTheme() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme_dark')
    return saved ? saved === '1' : true
  })
  useEffect(() => {
    const root = document.documentElement
    if (dark) root.classList.add('dark')
    else root.classList.remove('dark')
    localStorage.setItem('theme_dark', dark ? '1' : '0')
  }, [dark])
  return { dark, setDark }
}

// Toast hook using Radix
function useToasts() {
  const [toasts, setToasts] = useState([])
  function pushToast(t) {
    const id = Math.random().toString(36).slice(2)
    setToasts((s) => [...s, { id, ...t }])
    return id
  }
  function dismiss(id) {
    setToasts((s) => s.filter((t) => t.id !== id))
  }
  return { toasts, pushToast, dismiss }
}

function AuthView({ onAuthed }) {
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const path = isLogin ? '/api/auth/login' : '/api/auth/register'
      const payload = isLogin ? { email, password } : { name, email, password }
      const data = await api(path, { method: 'POST', body: payload })
      onAuthed(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1225] via-[#0a1633] to-[#07121f] text-white relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />
      </div>
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white/10 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-teal-500/20 rounded-lg"><ShieldCheck className="text-teal-300" /></div>
            <div>
              <h1 className="text-2xl font-semibold font-heading">JuriSight</h1>
              <p className="text-sm text-white/70">AI legal analysis, simplified</p>
            </div>
          </div>
          <div role="tablist" aria-label="auth switch" className="flex gap-2 mb-6">
            <button aria-pressed={isLogin} className={`flex-1 py-2 rounded-xl transition border ${isLogin ? 'bg-primary text-white border-primary' : 'bg-white/10 border-white/10 hover:bg-white/20'}`} onClick={() => setIsLogin(true)}>Sign in</button>
            <button aria-pressed={!isLogin} className={`flex-1 py-2 rounded-xl transition border ${!isLogin ? 'bg-primary text-white border-primary' : 'bg-white/10 border-white/10 hover:bg-white/20'}`} onClick={() => setIsLogin(false)}>Create account</button>
          </div>
          <form onSubmit={submit} className="space-y-4" aria-label="authentication form">
            {!isLogin && (
              <div>
                <label className="block text-sm mb-1">Full Name</label>
                <input className="w-full px-3 py-2 rounded-xl bg-white/10 outline-none border border-white/20 focus:border-primary/70" value={name} onChange={(e)=>setName(e.target.value)} required />
              </div>
            )}
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input type="email" className="w-full px-3 py-2 rounded-xl bg-white/10 outline-none border border-white/20 focus:border-primary/70" value={email} onChange={(e)=>setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm mb-1">Password</label>
              <input type="password" className="w-full px-3 py-2 rounded-xl bg-white/10 outline-none border border-white/20 focus:border-primary/70" value={password} onChange={(e)=>setPassword(e.target.value)} required />
            </div>
            {error && (
              <div className="flex items-center gap-2 text-red-300 text-sm"><AlertTriangle size={16} /> {error}</div>
            )}
            <button disabled={loading} className="w-full py-2.5 rounded-xl bg-accent text-white hover:bg-teal-600 transition flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />} {isLogin ? 'Sign in' : 'Create account'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

function Header({ onToggleSidebar, collapsed, onLogout, dark, setDark }) {
  const [open, setOpen] = useState(false)
  const [workspace, setWorkspace] = useState('Default Workspace')

  useEffect(() => {
    function onKey(e){
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="sticky top-0 z-30 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
      <div className="px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button aria-label="Toggle sidebar" onClick={onToggleSidebar} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            {collapsed ? <ChevronRight size={18}/> : <ChevronLeft size={18}/>}  
          </button>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-2">
                <Folder size={16}/> <span className="hidden sm:inline">{workspace}</span>
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2 shadow-xl">
              {['Default Workspace','Compliance','M&A','Litigation'].map(w => (
                <DropdownMenu.Item key={w} onSelect={()=>setWorkspace(w)} className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                  <div className="flex items-center gap-2"><Folder size={16}/> {w}</div>
                </DropdownMenu.Item>
              ))}
              <DropdownMenu.Separator className="h-px bg-slate-200 dark:bg-slate-700 my-2"/>
              <DropdownMenu.Item onSelect={()=>setWorkspace('New Workspace')} className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                <div className="flex items-center gap-2"><FolderPlus size={16}/> New Workspace</div>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <button onClick={()=>setOpen(true)} className="w-[320px] text-left px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-2 text-slate-500">
            <Search size={16}/> <span className="text-sm">Ask or search…</span> <span className="ml-auto text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">Ctrl K</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setDark(!dark)} aria-label="Toggle theme" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            {dark ? <Sun size={18}/> : <Moon size={18}/>}
          </button>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-blue-400"/>
                <span className="hidden sm:inline text-sm">Partner</span>
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2 shadow-xl">
              <DropdownMenu.Item className="px-3 py-2 rounded-lg">Profile</DropdownMenu.Item>
              <DropdownMenu.Item className="px-3 py-2 rounded-lg">Settings</DropdownMenu.Item>
              <DropdownMenu.Separator className="h-px bg-slate-200 dark:bg-slate-700 my-2"/>
              <DropdownMenu.Item onSelect={onLogout} className="px-3 py-2 rounded-lg text-red-600 inline-flex items-center gap-2"><LogOut size={16}/> Logout</DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
      </div>
      <CommandPalette open={open} setOpen={setOpen} />
    </div>
  )
}

function Sidebar({ collapsed, tab, setTab }) {
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'upload', label: 'Upload', icon: UploadIcon },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'compare', label: 'Compare', icon: Scale },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ]
  return (
    <div className={`h-screen sticky top-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 ${collapsed ? 'w-16' : 'w-64'} transition-[width] duration-300`}> 
      <div className="p-3 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary" />
        {!collapsed && <span className="font-heading text-slate-900 dark:text-white">JuriSight</span>}
      </div>
      <nav className="px-2 space-y-1">
        {items.map((it) => (
          <button key={it.id} onClick={()=>setTab(it.id)} className={`w-full group flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 ${tab===it.id ? 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white' : ''}`} title={collapsed ? it.label : undefined}>
            <it.icon className="shrink-0" size={18}/>
            {!collapsed && <span>{it.label}</span>}
          </button>
        ))}
      </nav>
    </div>
  )
}

function StatCard({ title, value, hint, accent='primary' }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="text-xs text-slate-500 dark:text-slate-400">{title}</div>
      <div className="text-2xl font-semibold text-slate-900 dark:text-white mt-1">{value}</div>
      {hint && <div className="text-xs text-slate-400 mt-1">{hint}</div>}
    </motion.div>
  )
}

function DashboardOverview({ docs }) {
  const data = useMemo(() => ([
    { name: 'Mon', value: 3 },
    { name: 'Tue', value: 6 },
    { name: 'Wed', value: 4 },
    { name: 'Thu', value: 8 },
    { name: 'Fri', value: 7 },
  ]), [])
  const pie = useMemo(() => ([
    { name: 'Contracts', value: 10 },
    { name: 'Policies', value: 6 },
    { name: 'Pleadings', value: 4 },
  ]), [])
  const colors = ['#2563eb','#0d9488','#94a3b8']

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Documents Processed" value={docs.length} hint="All-time" />
        <StatCard title="AI Queries" value={Math.max(12, docs.length*2)} hint="Last 7 days" />
        <StatCard title="Avg Confidence" value={`${(0.82).toFixed(2)}`} hint="Model score" />
        <StatCard title="Workspace Count" value={3} hint="Active" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4">
          <div className="text-sm font-semibold mb-2">AI Usage</div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="name" tick={{ fill: 'currentColor' }} />
                <YAxis tick={{ fill: 'currentColor' }} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', color: 'white' }} />
                <Bar dataKey="value" fill="#2563eb" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4">
          <div className="text-sm font-semibold mb-2">Accuracy Trend</div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChartR data={data}>
                <XAxis dataKey="name" tick={{ fill: 'currentColor' }} />
                <YAxis domain={[0,10]} tick={{ fill: 'currentColor' }} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', color: 'white' }} />
                <Line type="monotone" dataKey="value" stroke="#0d9488" strokeWidth={2} dot={false} />
              </LineChartR>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4">
          <div className="text-sm font-semibold mb-2">Workspace Activity</div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChartR>
                <Pie data={pie} dataKey="value" nameKey="name" innerRadius={40} outerRadius={60} paddingAngle={6}>
                  {pie.map((entry, index) => (
                    <Cell key={`c-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', color: 'white' }} />
              </PieChartR>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4">
        <div className="text-sm font-semibold mb-3">AI Activity Timeline</div>
        <div className="space-y-3">
          {[...Array(6)].map((_,i)=> (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i*0.05 }} className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary"/>
              <div className="text-sm text-slate-600 dark:text-slate-300">Processed document #{i+1} and generated summary</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

function UploadPanel({ token, onDone, pushToast }) {
  const [dragOver, setDragOver] = useState(false)
  const [files, setFiles] = useState([])

  function onDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const list = Array.from(e.dataTransfer.files)
    if (!list.length) return
    setFiles(list.map(f => ({ f, progress: 0, status: 'queued' })))
  }
  function onInput(e) {
    const list = Array.from(e.target.files || [])
    if (!list.length) return
    setFiles(list.map(f => ({ f, progress: 0, status: 'queued' })))
  }

  async function startUpload() {
    for (let i = 0; i < files.length; i++) {
      const item = files[i]
      item.status = 'uploading'
      item.progress = 10
      const fd = new FormData()
      fd.append('file', item.f)
      try {
        await api('/api/documents/upload', { token, method: 'POST', body: fd, headers: {} })
        item.progress = 100
        item.status = 'done'
        pushToast({ title: 'Upload complete', description: item.f.name })
      } catch (err) {
        item.status = 'error'
        pushToast({ title: 'Upload failed', description: err.message })
      }
      setFiles([...files])
    }
    onDone?.()
  }

  return (
    <div>
      <div
        onDragOver={(e)=>{e.preventDefault(); setDragOver(true)}}
        onDragLeave={()=>setDragOver(false)}
        onDrop={onDrop}
        className={`rounded-2xl border-2 border-dashed ${dragOver?'border-primary bg-blue-50/50 dark:bg-blue-950/20':'border-slate-300 dark:border-slate-700'} p-8 text-center transition`}
        aria-label="Drag and drop zone"
      >
        <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 text-primary grid place-content-center mb-3">
          <FileUp/>
        </div>
        <div className="font-medium mb-1">Drag & drop your legal documents</div>
        <div className="text-sm text-slate-500 dark:text-slate-400 mb-3">PDF and DOCX supported. Max 10MB each.</div>
        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white cursor-pointer hover:opacity-90">
          <Paperclip size={16}/> Choose files
          <input type="file" className="hidden" multiple accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={onInput}/>
        </label>
      </div>

      {!!files.length && (
        <div className="mt-6 space-y-3">
          {files.map((it, idx) => (
            <div key={idx} className="p-3 rounded-xl border bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between text-sm">
                <div className="truncate mr-3">{it.f.name} <span className="text-slate-400">• {(it.f.size/1024).toFixed(0)} KB</span></div>
                <div className="text-slate-500 capitalize">{it.status}</div>
              </div>
              <div className="mt-2 h-2 w-full bg-slate-100 dark:bg-slate-800 rounded overflow-hidden">
                <div className={`h-full ${it.status==='error'?'bg-red-500':'bg-primary'} transition-all`} style={{ width: `${it.progress}%` }} />
              </div>
            </div>
          ))}
          <button onClick={startUpload} className="px-4 py-2 rounded-xl bg-accent text-white hover:bg-teal-600">Start upload</button>
        </div>
      )}
    </div>
  )
}

function DocumentsPanel({ token, docs, loading, onRefresh }) {
  const [busyId, setBusyId] = useState('')
  const [summary, setSummary] = useState('')

  async function summarize(id) {
    setBusyId(id)
    setSummary('')
    try {
      const res = await api('/api/documents/summarize', { token, method: 'POST', body: { document_id: id } })
      setSummary(res.summary)
    } catch (err) {
      setSummary('Error: ' + err.message)
    } finally {
      setBusyId('')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Your documents</h3>
        <button onClick={onRefresh} className="text-sm text-slate-600 dark:text-slate-300 hover:underline">Refresh</button>
      </div>
      {loading ? (
        <div className="animate-pulse h-24 rounded-xl bg-slate-100 dark:bg-slate-900"/>
      ) : docs.length === 0 ? (
        <div className="text-sm text-slate-500">No documents yet.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {docs.map(d => (
            <div key={d.id} className="p-4 rounded-xl border bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
              <div className="font-medium text-slate-900 dark:text-white">{d.filename}</div>
              <div className="text-xs text-slate-500">{Math.round((d.size||0)/1024)} KB • {d.status}</div>
              <div className="mt-3 flex gap-2">
                <button onClick={()=>summarize(d.id)} className="text-xs px-3 py-1.5 rounded-xl bg-primary text-white">{busyId===d.id? '…' : 'Summarize'}</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {summary && (
        <div className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <div className="text-sm font-semibold mb-2">AI Summary</div>
          <div className="text-sm whitespace-pre-wrap leading-relaxed">{summary}</div>
        </div>
      )}
    </div>
  )
}

function ComparePanel({ token, docs }) {
  const [mode, setMode] = useState('side') // side | overlay | summary
  const [left, setLeft] = useState('')
  const [right, setRight] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const res = await api('/api/documents/compare', { token, method: 'POST', body: { left_id: left, right_id: right } })
      setResult(res)
    } catch (err) {
      setResult({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="grid md:grid-cols-3 gap-3 items-end">
        <div>
          <label className="text-sm text-slate-600 dark:text-slate-300">Left</label>
          <select value={left} onChange={e=>setLeft(e.target.value)} className="w-full border rounded-xl px-2 py-2 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
            <option value="">Select…</option>
            {docs.map(d => <option key={d.id} value={d.id}>{d.filename}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm text-slate-600 dark:text-slate-300">Right</label>
          <select value={right} onChange={e=>setRight(e.target.value)} className="w-full border rounded-xl px-2 py-2 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
            <option value="">Select…</option>
            {docs.map(d => <option key={d.id} value={d.id}>{d.filename}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={!left || !right || loading} className="h-10 rounded-xl bg-accent text-white px-4">{loading?'Comparing…':'Compare'}</button>
          <div className="ml-auto inline-flex rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {['side','overlay','summary'].map(m => (
              <button key={m} type="button" onClick={()=>setMode(m)} className={`px-3 py-2 text-sm ${mode===m?'bg-slate-100 dark:bg-slate-800':''}`}>{m}</button>
            ))}
          </div>
        </div>
      </form>

      {result && (
        <AnimatePresence mode="wait">
          {mode==='side' && (
            <motion.div key="side" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-4">
              <div className="p-3 rounded-xl border bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-64 overflow-auto">{result.left_text || 'Left text…'}</div>
              <div className="p-3 rounded-xl border bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-64 overflow-auto">{result.right_text || 'Right text…'}</div>
            </motion.div>
          )}
          {mode==='overlay' && (
            <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-xl border bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-64 overflow-auto">
              <div className="space-y-1 text-sm">
                {(result.added||[]).map((t,i)=>(<span key={'a'+i} className="bg-green-100 text-green-800 px-1 rounded">{t}</span>))}
                {(result.removed||[]).map((t,i)=>(<span key={'r'+i} className="bg-red-100 text-red-800 px-1 rounded ml-1 line-through">{t}</span>))}
                <div className="mt-2 text-amber-700 bg-amber-50 inline-block px-1 rounded">Modified segments highlighted</div>
              </div>
            </motion.div>
          )}
          {mode==='summary' && (
            <motion.div key="summary" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-3 gap-4">
              <div className="p-3 rounded-xl border bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                <div className="text-xs uppercase text-slate-500">Added</div>
                <ul className="text-sm list-disc pl-4 space-y-1">{(result.added||[]).map((t,i)=>(<li key={i}>{t}</li>))}</ul>
              </div>
              <div className="p-3 rounded-xl border bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                <div className="text-xs uppercase text-slate-500">Removed</div>
                <ul className="text-sm list-disc pl-4 space-y-1">{(result.removed||[]).map((t,i)=>(<li key={i}>{t}</li>))}</ul>
              </div>
              <div className="p-3 rounded-xl border bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                <div className="text-xs uppercase text-slate-500">Confidence</div>
                <div className="mt-2 h-2 bg-slate-100 dark:bg-slate-800 rounded">
                  <div className="h-full bg-accent rounded" style={{ width: `${Math.round((result.confidence||0)*100)}%` }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}

function ChatPanel({ token }) {
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [messages, setMessages] = useState([])

  async function send(e) {
    e.preventDefault()
    if (!input.trim()) return
    const toSend = input
    setInput('')
    setBusy(true)
    try {
      const res = await api('/api/chat', { token, method: 'POST', body: { message: toSend } })
      setMessages(m => [...m, { q: toSend, a: res.answer, sources: res.sources }])
    } catch (err) {
      setMessages(m => [...m, { q: toSend, a: 'Error: ' + err.message, sources: [] }])
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative">
      <div className="h-96 overflow-auto space-y-4 pr-1">
        {messages.length === 0 && (
          <div className="text-sm text-slate-500">Try /summarize, /compare, /find, /risk</div>
        )}
        {messages.map((m, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-end">
              <div className="max-w-[80%] p-3 rounded-xl bg-gradient-to-br from-primary to-blue-500 text-white text-sm shadow">{m.q}</div>
            </div>
            <div className="flex justify-start">
              <div className="max-w-[85%] p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm whitespace-pre-wrap">
                <div>{m.a}</div>
                {!!m.sources?.length && (
                  <div className="mt-2 space-y-2">
                    {m.sources.map((s,idx)=> (
                      <details key={idx} className="rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2">
                        <summary className="text-xs text-slate-600">{s.filename} • Confidence {(s.score||0).toFixed(2)}</summary>
                        <div className="mt-1 text-xs text-slate-600">{s.snippet || 'Relevant clause snippet…'}</div>
                      </details>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={send} className="mt-4 flex gap-2">
        <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Type a message or /command…" className="flex-1 border rounded-xl px-3 py-2 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800" />
        <button disabled={busy} className="px-4 py-2 rounded-xl bg-primary text-white">{busy?'Thinking…':'Send'}</button>
      </form>
    </div>
  )
}

function CommandPalette({ open, setOpen }) {
  const [query, setQuery] = useState('')
  const commands = [
    { k: '/summarize', d: 'Summarize selected document' },
    { k: '/compare', d: 'Compare two documents' },
    { k: '/find', d: 'Find clauses and terms' },
    { k: '/risk', d: 'Assess risk in agreement' },
  ]
  const filtered = useMemo(() => commands.filter(c => c.k.includes(query) || c.d.toLowerCase().includes(query.toLowerCase())), [query])

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30" />
        <Dialog.Content className="fixed left-1/2 top-24 -translate-x-1/2 w-[90vw] max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl p-2">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-200 dark:border-slate-800">
            <Command size={16} className="text-slate-400"/>
            <input autoFocus value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Ask AI or type a /command" className="flex-1 outline-none bg-transparent text-sm" />
            <span className="text-xs text-slate-400">Esc</span>
          </div>
          <div className="max-h-64 overflow-auto py-1">
            {filtered.map((c,i)=>(
              <button key={c.k} className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900">
                <span className="font-mono mr-2 text-primary">{c.k}</span>{c.d}
              </button>
            ))}
            {filtered.length===0 && (
              <div className="px-3 py-6 text-sm text-slate-500 text-center">No matches</div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function TopSection({ token, onLogout, dark, setDark, collapsed, setCollapsed }) {
  return (
    <Header onToggleSidebar={()=>setCollapsed(v=>!v)} collapsed={collapsed} onLogout={onLogout} dark={dark} setDark={setDark} />
  )
}

export default function App() {
  const { token, user, saveAuth, logout } = useAuth()
  const { dark, setDark } = useTheme()
  const [collapsed, setCollapsed] = useState(false)
  const [tab, setTab] = useState('dashboard')
  const [docs, setDocs] = useState([])
  const [loadingDocs, setLoadingDocs] = useState(true)
  const { toasts, pushToast, dismiss } = useToasts()

  async function refresh() {
    if (!token) return
    setLoadingDocs(true)
    try {
      const res = await api('/api/documents', { token })
      setDocs(res.documents || [])
    } catch (e) {
      // no-op
    } finally {
      setLoadingDocs(false)
    }
  }

  useEffect(() => { refresh() }, [token])

  if (!token) {
    return <AuthView onAuthed={(data)=> saveAuth(data.access_token, data.user)} />
  }

  return (
    <Toast.Provider swipeDirection="right">
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <div className="flex">
          <Sidebar collapsed={collapsed} tab={tab} setTab={setTab} />
          <div className="flex-1 min-w-0">
            <TopSection token={token} onLogout={logout} dark={dark} setDark={setDark} collapsed={collapsed} setCollapsed={setCollapsed} />
            <main className="px-4 md:px-6 py-6 max-w-7xl">
              <AnimatePresence mode="wait">
                {tab==='dashboard' && (
                  <motion.div key="dash" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <DashboardOverview docs={docs} />
                  </motion.div>
                )}
                {tab==='upload' && (
                  <motion.div key="upload" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 p-6">
                    <UploadPanel token={token} onDone={refresh} pushToast={pushToast} />
                  </motion.div>
                )}
                {tab==='documents' && (
                  <motion.div key="docs" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 p-6">
                    <DocumentsPanel token={token} docs={docs} loading={loadingDocs} onRefresh={refresh} />
                  </motion.div>
                )}
                {tab==='compare' && (
                  <motion.div key="compare" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 p-6">
                    <ComparePanel token={token} docs={docs} />
                  </motion.div>
                )}
                {tab==='chat' && (
                  <motion.div key="chat" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 p-6">
                    <ChatPanel token={token} />
                  </motion.div>
                )}
                {tab==='analytics' && (
                  <motion.div key="analytics" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 p-6">
                    <DashboardOverview docs={docs} />
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
          </div>
        </div>

        {toasts.map(t => (
          <Toast.Root key={t.id} className="fixed bottom-6 right-6 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xl" open onOpenChange={(o)=>{ if(!o) dismiss(t.id) }}>
            <Toast.Title className="font-medium">{t.title}</Toast.Title>
            {t.description && <Toast.Description className="text-sm text-slate-500 dark:text-slate-400">{t.description}</Toast.Description>}
          </Toast.Root>
        ))}
        <Toast.Viewport className="fixed bottom-0 right-0 flex flex-col gap-2 p-6 outline-none" />
      </div>
    </Toast.Provider>
  )
}
