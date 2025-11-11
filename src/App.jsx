import React, { useEffect, useMemo, useState } from 'react'
import Spline from '@splinetool/react-spline'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, MessageSquare, Scale, ShieldCheck, LogOut, Sparkles, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react'

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
  if (!(body instanceof FormData)) {
    hdrs['Content-Type'] = 'application/json'
  }
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
    <div className="min-h-screen bg-gradient-to-br from-[#0b1025] via-[#0a1633] to-[#07121f] text-white">
      <div className="absolute inset-0 opacity-70">
        <Spline scene="https://prod.spline.design/4cHQr84zOGAHOehh/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-teal-500/20 rounded-lg"><ShieldCheck className="text-teal-300" /></div>
            <div>
              <h1 className="text-2xl font-semibold">JuriSight</h1>
              <p className="text-sm text-white/70">AI legal analysis, simplified</p>
            </div>
          </div>
          <div className="flex gap-2 mb-6">
            <button className={`flex-1 py-2 rounded-lg ${isLogin ? 'bg-teal-500 text-white' : 'bg-white/10'}`} onClick={() => setIsLogin(true)}>Sign in</button>
            <button className={`flex-1 py-2 rounded-lg ${!isLogin ? 'bg-teal-500 text-white' : 'bg-white/10'}`} onClick={() => setIsLogin(false)}>Create account</button>
          </div>
          <form onSubmit={submit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm mb-1">Full Name</label>
                <input className="w-full px-3 py-2 rounded bg-white/10 outline-none border border-white/20" value={name} onChange={(e)=>setName(e.target.value)} required />
              </div>
            )}
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input type="email" className="w-full px-3 py-2 rounded bg-white/10 outline-none border border-white/20" value={email} onChange={(e)=>setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm mb-1">Password</label>
              <input type="password" className="w-full px-3 py-2 rounded bg-white/10 outline-none border border-white/20" value={password} onChange={(e)=>setPassword(e.target.value)} required />
            </div>
            {error && (
              <div className="flex items-center gap-2 text-red-300 text-sm"><AlertTriangle size={16} /> {error}</div>
            )}
            <button disabled={loading} className="w-full py-2 rounded-lg bg-teal-500 hover:bg-teal-600 transition flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />} {isLogin ? 'Sign in' : 'Create account'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

function TopBar({ onLogout }) {
  return (
    <div className="sticky top-0 z-20 bg-white/70 backdrop-blur-xl border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1e3a8a]" />
          <span className="font-semibold text-slate-800">JuriSight</span>
        </div>
        <button onClick={onLogout} className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-2"><LogOut size={16}/> Logout</button>
      </div>
    </div>
  )
}

function Stat({ label, value, hint }) {
  return (
    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-2xl font-semibold text-slate-800">{value}</div>
      {hint && <div className="text-xs text-slate-400 mt-1">{hint}</div>}
    </div>
  )
}

function Dashboard({ token, onLogout }) {
  const [tab, setTab] = useState('upload')
  const [docs, setDocs] = useState([])
  const [loadingDocs, setLoadingDocs] = useState(true)

  async function refresh() {
    setLoadingDocs(true)
    try {
      const res = await api('/api/documents', { token })
      setDocs(res.documents || [])
    } finally {
      setLoadingDocs(false)
    }
  }

  useEffect(() => { refresh() }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar onLogout={onLogout} />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Stat label="Documents" value={docs.length} hint="Total uploaded" />
          <Stat label="AI Summaries" value={docs.filter(d => d.status==='processed').length} hint="Processed" />
          <Stat label="Comparisons" value={Math.floor(docs.length/2)} hint="Sample" />
          <Stat label="Chat Sessions" value={docs.length + 3} hint="Last 7d" />
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto">
          <button onClick={()=>setTab('upload')} className={`px-3 py-2 rounded-lg flex items-center gap-2 ${tab==='upload'?'bg-[#1e3a8a] text-white':'bg-white border'}`}><Upload size={16}/> Upload</button>
          <button onClick={()=>setTab('documents')} className={`px-3 py-2 rounded-lg ${tab==='documents'?'bg-[#1e3a8a] text-white':'bg-white border'}`}><span className="inline-flex items-center gap-2"><FileText size={16}/> Documents</span></button>
          <button onClick={()=>setTab('compare')} className={`px-3 py-2 rounded-lg ${tab==='compare'?'bg-[#1e3a8a] text-white':'bg-white border'}`}><span className="inline-flex items-center gap-2"><Scale size={16}/> Compare</span></button>
          <button onClick={()=>setTab('chat')} className={`px-3 py-2 rounded-lg ${tab==='chat'?'bg-[#1e3a8a] text-white':'bg-white border'}`}><span className="inline-flex items-center gap-2"><MessageSquare size={16}/> Chat</span></button>
        </div>

        <div className="mt-6">
          <AnimatePresence mode="wait">
            {tab==='upload' && <UploadPanel key="upload" token={token} onDone={refresh} />}
            {tab==='documents' && <DocumentsPanel key="docs" token={token} docs={docs} loading={loadingDocs} onRefresh={refresh} />}
            {tab==='compare' && <ComparePanel key="compare" token={token} docs={docs} />}
            {tab==='chat' && <ChatPanel key="chat" token={token} />}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function UploadPanel({ token, onDone }) {
  const [file, setFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

  async function handleUpload(e) {
    e.preventDefault()
    if (!file) return
    setStatus('uploading')
    setProgress(10)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await api('/api/documents/upload', { token, method: 'POST', body: fd, headers: {} })
      setProgress(100)
      setStatus('done')
      setMessage(`Uploaded ${res.filename}`)
      onDone?.()
    } catch (err) {
      setStatus('error')
      setMessage(err.message)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border p-6 shadow-sm">
      <h3 className="font-semibold text-slate-800 mb-2">Upload documents</h3>
      <p className="text-sm text-slate-500 mb-4">PDF and DOCX are supported. Text is extracted automatically.</p>
      <form onSubmit={handleUpload} className="space-y-4">
        <input type="file" accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e)=> setFile(e.target.files?.[0] || null)} className="block w-full text-sm" />
        <button className="px-4 py-2 rounded-lg bg-[#0d9488] text-white hover:bg-[#0c7f75] disabled:opacity-50" disabled={!file || status==='uploading'}>
          {status==='uploading' ? 'Uploading…' : 'Upload'}
        </button>
        {status!== 'idle' && (
          <div className="space-y-2">
            <div className="h-2 bg-slate-100 rounded overflow-hidden">
              <div className={`h-full ${status==='error'?'bg-red-400': 'bg-[#1e3a8a]'} transition-all`} style={{ width: `${progress}%` }} />
            </div>
            <div className={`text-sm ${status==='error'?'text-red-600':'text-slate-600'}`}>{message}</div>
          </div>
        )}
      </form>
    </motion.div>
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
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800">Your documents</h3>
        <button onClick={onRefresh} className="text-sm text-slate-600 hover:text-slate-900">Refresh</button>
      </div>
      {loading ? (
        <div className="text-sm text-slate-500">Loading…</div>
      ) : docs.length === 0 ? (
        <div className="text-sm text-slate-500">No documents yet.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {docs.map(d => (
            <div key={d.id} className="p-4 border rounded-lg">
              <div className="font-medium text-slate-800">{d.filename}</div>
              <div className="text-xs text-slate-500">{Math.round((d.size||0)/1024)} KB • {d.status}</div>
              <div className="mt-3 flex gap-2">
                <button onClick={()=>summarize(d.id)} className="text-xs px-3 py-1.5 rounded bg-[#1e3a8a] text-white">Summarize</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {summary && (
        <div className="mt-6 p-4 bg-slate-50 border rounded-lg">
          <div className="text-sm font-semibold mb-2">AI Summary</div>
          <div className="prose prose-sm max-w-none">{summary}</div>
        </div>
      )}
    </motion.div>
  )
}

function ComparePanel({ token, docs }) {
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
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border p-6 shadow-sm">
      <h3 className="font-semibold text-slate-800 mb-4">Compare documents</h3>
      <form onSubmit={submit} className="grid md:grid-cols-3 gap-3 items-end">
        <div>
          <label className="text-sm text-slate-600">Left</label>
          <select value={left} onChange={e=>setLeft(e.target.value)} className="w-full border rounded px-2 py-2">
            <option value="">Select…</option>
            {docs.map(d => <option key={d.id} value={d.id}>{d.filename}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm text-slate-600">Right</label>
          <select value={right} onChange={e=>setRight(e.target.value)} className="w-full border rounded px-2 py-2">
            <option value="">Select…</option>
            {docs.map(d => <option key={d.id} value={d.id}>{d.filename}</option>)}
          </select>
        </div>
        <button disabled={!left || !right || loading} className="h-10 rounded bg-[#0d9488] text-white">{loading?'Comparing…':'Compare'}</button>
      </form>

      {result && (
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          {result.error ? (
            <div className="text-sm text-red-600">{result.error}</div>
          ) : (
            <>
              <div className="p-3 border rounded"><div className="text-xs uppercase text-slate-500">Added</div><ul className="text-sm list-disc pl-4 space-y-1">{(result.added||[]).map((t,i)=>(<li key={i}>{t}</li>))}</ul></div>
              <div className="p-3 border rounded"><div className="text-xs uppercase text-slate-500">Removed</div><ul className="text-sm list-disc pl-4 space-y-1">{(result.removed||[]).map((t,i)=>(<li key={i}>{t}</li>))}</ul></div>
              <div className="p-3 border rounded"><div className="text-xs uppercase text-slate-500">Confidence</div><div className="mt-2 inline-flex items-center gap-2 px-2 py-1 rounded-full" style={{ background: `linear-gradient(90deg,#0d9488 ${Math.round((result.confidence||0)*100)}%, #e2e8f0 0%)`}}><span className="text-xs font-medium">{(result.confidence||0).toFixed(2)}</span></div></div>
            </>
          )}
        </div>
      )}
    </motion.div>
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
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border p-6 shadow-sm">
      <div className="h-80 overflow-auto space-y-4 pr-1">
        {messages.length === 0 && (
          <div className="text-sm text-slate-500">Try commands like /summarize, /compare, /find, /extract, /risk, /deadlines, /export</div>
        )}
        {messages.map((m, i) => (
          <div key={i} className="space-y-2">
            <div className="font-medium text-slate-800">You</div>
            <div className="p-3 bg-slate-50 rounded border text-sm">{m.q}</div>
            <div className="font-medium text-slate-800">JuriSight</div>
            <div className="p-3 bg-white rounded border text-sm whitespace-pre-wrap">{m.a}</div>
            {m.sources?.length ? (
              <div className="text-xs text-slate-500">Sources: {m.sources.map((s,idx)=> <span key={idx} className="inline-flex items-center gap-1 mr-2"><CheckCircle2 size={14} className="text-teal-600" />{s.filename} <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100">{(s.score||0).toFixed(2)}</span></span>)}</div>
            ): null}
          </div>
        ))}
      </div>
      <form onSubmit={send} className="mt-4 flex gap-2">
        <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Type a message or /command…" className="flex-1 border rounded px-3 py-2" />
        <button disabled={busy} className="px-4 py-2 rounded bg-[#1e3a8a] text-white">{busy?'Thinking…':'Send'}</button>
      </form>
    </motion.div>
  )
}

export default function App() {
  const { token, user, saveAuth, logout } = useAuth()
  if (!token) {
    return <AuthView onAuthed={(data)=> saveAuth(data.access_token, data.user)} />
  }
  return <Dashboard token={token} onLogout={logout} />
}
