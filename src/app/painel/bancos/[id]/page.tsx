'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Database, ArrowLeft, Loader2, Copy, Check, Eye, EyeOff,
  Table2, Terminal, Download, Upload, RefreshCw, Play, Trash2,
  AlertTriangle, X, FileJson, Server,
} from 'lucide-react'
import { PainelShell } from '@/components/painel/painel-shell'
import { Button } from '@/components/ui/button'

interface DatabaseDetail {
  id: string
  name: string
  slug: string
  engine: string
  status: string
  host: string
  ipHost?: string
  internalHost: string
  port: number
  dbName: string
  dbUser: string
  dbPassword: string
  connectionString: string
  prismaConnectionString?: string
  ipConnectionString?: string
  internalConnectionString: string
  errorMessage?: string | null
  createdAt: string
}

interface TableInfo {
  name: string
  rowCount: number
  size: string
}

export default function DatabaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [database, setDatabase] = React.useState<DatabaseDetail | null>(null)
  const [tables, setTables] = React.useState<TableInfo[]>([])
  const [loading, setLoading] = React.useState(true)
  const [loadingTables, setLoadingTables] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [revealed, setRevealed] = React.useState(false)
  const [copiedField, setCopiedField] = React.useState<string | null>(null)

  // SQL query state
  const [sql, setSql] = React.useState('SELECT * FROM users LIMIT 10;')
  const [queryResult, setQueryResult] = React.useState<{ rows: Record<string, unknown>[]; columns: string[]; rowCount: number } | null>(null)
  const [queryError, setQueryError] = React.useState<string | null>(null)
  const [querying, setQuerying] = React.useState(false)

  // Import state
  const [importText, setImportText] = React.useState('')
  const [importing, setImporting] = React.useState(false)
  const [importResult, setImportResult] = React.useState<string | null>(null)

  // Selected table
  const [selectedTable, setSelectedTable] = React.useState<string | null>(null)

  // Active tab: 'tables' | 'sql' | 'io'
  const [activeTab, setActiveTab] = React.useState<'tables' | 'sql' | 'io'>('tables')

  const { id } = React.use(params)

  const loadDatabase = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/databases/${id}${revealed ? '?reveal=true' : ''}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDatabase(data.database)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar banco')
    } finally {
      setLoading(false)
    }
  }, [id, revealed])

  const loadTables = React.useCallback(async () => {
    setLoadingTables(true)
    try {
      const res = await fetch(`/api/databases/${id}/tables`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setTables(data.tables || [])
    } catch (err) {
      // Ignore table loading errors (often just empty databases)
      setTables([])
    } finally {
      setLoadingTables(false)
    }
  }, [id])

  React.useEffect(() => {
    loadDatabase()
    loadTables()
  }, [loadDatabase, loadTables])

  const handleReveal = async () => {
    const newRevealed = !revealed
    setRevealed(newRevealed)
    // Reload with reveal flag
    setLoading(true)
    try {
      const res = await fetch(`/api/databases/${id}${newRevealed ? '?reveal=true' : ''}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDatabase(data.database)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao revelar senha')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (field: string, value: string) => {
    navigator.clipboard.writeText(value)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const runQuery = async () => {
    if (!sql.trim()) return
    setQuerying(true)
    setQueryError(null)
    setQueryResult(null)
    try {
      const res = await fetch(`/api/databases/${id}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setQueryResult({
        rows: data.rows || [],
        columns: data.columns || [],
        rowCount: data.rowCount || 0,
      })
    } catch (err) {
      setQueryError(err instanceof Error ? err.message : 'Erro ao executar query')
    } finally {
      setQuerying(false)
    }
  }

  const exportData = async (tableName?: string) => {
    try {
      const url = `/api/databases/${id}/export${tableName ? `?table=${tableName}` : ''}`
      const res = await fetch(url)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      const blob = await res.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = tableName ? `${tableName}-${Date.now()}.json` : `${database?.slug}-full-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao exportar')
    }
  }

  const importData = async () => {
    if (!importText.trim()) return
    setImporting(true)
    setImportResult(null)
    try {
      const data = JSON.parse(importText)
      const res = await fetch(`/api/databases/${id}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error)
      const summary = Object.entries(result.imported || {})
        .map(([table, count]) => `${table}: ${count} linhas`)
        .join(', ')
      setImportResult(`✓ Importado: ${summary}`)
      setImportText('')
      await loadTables()
    } catch (err) {
      setImportResult(err instanceof Error ? `❌ ${err.message}` : 'Erro ao importar')
    } finally {
      setImporting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('DELETAR BANCO DE DADOS? Todos os dados serão perdidos permanentemente!')) return
    if (!confirm('Tem certeza ABSOLUTA? Esta ação NÃO pode ser desfeita.')) return
    try {
      const res = await fetch(`/api/databases/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      router.push('/painel/bancos')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar')
    }
  }

  const selectTable = (tableName: string) => {
    setSelectedTable(tableName)
    setSql(`SELECT * FROM "${tableName}" LIMIT 100;`)
    // Switch to SQL tab so user sees the query ready to run
    setActiveTab('sql')
  }

  if (loading) {
    return (
      <PainelShell>
        <div className="max-w-6xl mx-auto p-8">
          <Loader2 className="size-8 text-slate-400 animate-spin mx-auto" />
          <p className="text-center text-sm text-slate-500 mt-3">Carregando banco...</p>
        </div>
      </PainelShell>
    )
  }

  if (error && !database) {
    return (
      <PainelShell>
        <div className="max-w-6xl mx-auto p-8">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <AlertTriangle className="size-8 text-red-600 mx-auto mb-2" />
            <p className="text-red-900 font-semibold">{error}</p>
            <Link href="/painel/bancos" className="text-sm text-blue-600 hover:underline mt-3 inline-block">
              ← Voltar para lista
            </Link>
          </div>
        </div>
      </PainelShell>
    )
  }

  if (!database) return null

  return (
    <PainelShell>
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/painel/bancos"
              className="size-10 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600"
            >
              <ArrowLeft className="size-5" />
            </Link>
            <div className="size-10 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center flex-shrink-0">
              <Database className="size-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 truncate">
                {database.name}
              </h1>
              <p className="text-xs text-slate-500 font-mono">
                {database.engine === 'postgresql' ? 'PostgreSQL 16' : database.engine} · {database.host}:{database.port}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => { loadDatabase(); loadTables(); }} className="text-slate-600">
              <RefreshCw className="size-4" />
              Atualizar
            </Button>
            <Button
              onClick={handleDelete}
              variant="ghost"
              className="text-red-600 hover:bg-red-50"
            >
              <Trash2 className="size-4" />
              Deletar
            </Button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
            <AlertTriangle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-900 flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* Connection info */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Server className="size-4 text-blue-600" />
            Connection Strings
          </h2>

          {/* DNS setup warning */}
          <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
            <strong>⚠️ Importante:</strong> Para que o subdomínio <code className="font-mono bg-amber-100 px-1 rounded">{database.host}</code> funcione,
            você precisa adicionar no Cloudflare um registro DNS wildcard <code className="font-mono bg-amber-100 px-1 rounded">*.db</code> apontando
            para <code className="font-mono bg-amber-100 px-1 rounded">209.145.62.238</code> com <strong>Proxy status = DNS only (nuvem CINZA, NÃO laranja)</strong>.
            Se deixar laranja, o Cloudflare bloqueia a porta 5432. Enquanto não configurar, use a connection string de IP abaixo.
          </div>

          <div className="space-y-3">
            {/* Subdomain connection string (plain — for psql, pg, DBeaver) */}
            <div>
              <Label className="text-xs text-slate-600 mb-1.5 block">
                🌐 Subdomínio (psql, DBeaver, pgAdmin) — <code className="font-mono">{database.host}</code>
              </Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 rounded-lg bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto">
                  {database.connectionString}
                </div>
                <button
                  onClick={() => copyToClipboard('subdomain', database.connectionString)}
                  className="size-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 flex-shrink-0"
                >
                  {copiedField === 'subdomain' ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
                </button>
              </div>
            </div>

            {/* Prisma connection string (with ?schema=public) */}
            {database.prismaConnectionString && (
              <div>
                <Label className="text-xs text-slate-600 mb-1.5 block">
                  ⚡ Prisma (DATABASE_URL no .env) — <code className="font-mono">?schema=public</code>
                </Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-2 rounded-lg bg-slate-900 text-emerald-300 text-xs font-mono overflow-x-auto">
                    {database.prismaConnectionString}
                  </div>
                  <button
                    onClick={() => copyToClipboard('prisma', database.prismaConnectionString!)}
                    className="size-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 flex-shrink-0"
                  >
                    {copiedField === 'prisma' ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* IP fallback connection string (always works) */}
            {database.ipConnectionString && (
              <div>
                <Label className="text-xs text-slate-600 mb-1.5 block">
                  🔢 IP direto (fallback — sempre funciona) — <code className="font-mono">{database.ipHost || '209.145.62.238'}</code>
                </Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-2 rounded-lg bg-slate-900 text-amber-300 text-xs font-mono overflow-x-auto">
                    {database.ipConnectionString}
                  </div>
                  <button
                    onClick={() => copyToClipboard('ip', database.ipConnectionString!)}
                    className="size-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 flex-shrink-0"
                  >
                    {copiedField === 'ip' ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Internal connection string (for deploys on same VPS) */}
            <div>
              <Label className="text-xs text-slate-600 mb-1.5 block">
                🏠 Interna (deploys na mesma VPS — mais rápida) — <code className="font-mono">{database.internalHost}</code>
              </Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 rounded-lg bg-slate-900 text-blue-300 text-xs font-mono overflow-x-auto">
                  {database.internalConnectionString}
                </div>
                <button
                  onClick={() => copyToClipboard('internal', database.internalConnectionString)}
                  className="size-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 flex-shrink-0"
                >
                  {copiedField === 'internal' ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
                </button>
              </div>
            </div>

            {/* DB info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Database</p>
                <p className="text-sm font-mono font-semibold text-slate-900 truncate">{database.dbName}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">User</p>
                <p className="text-sm font-mono font-semibold text-slate-900 truncate">{database.dbUser}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Senha</p>
                <button
                  onClick={handleReveal}
                  className="text-sm font-mono font-semibold text-blue-600 hover:underline flex items-center gap-1"
                >
                  {revealed ? <><EyeOff className="size-3" /> Ocultar</> : <><Eye className="size-3" /> Revelar</>}
                </button>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Porta</p>
                <p className="text-sm font-mono font-semibold text-slate-900">{database.port}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs: Tables | SQL | Import/Export */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          {/* Tab buttons */}
          <div className="border-b border-slate-200 flex">
            <TabButton active={activeTab === 'tables'} onClick={() => setActiveTab('tables')} icon={<Table2 className="size-4" />} label="Tabelas" count={tables.length} />
            <TabButton active={activeTab === 'sql'} onClick={() => setActiveTab('sql')} icon={<Terminal className="size-4" />} label="SQL" />
            <TabButton active={activeTab === 'io'} onClick={() => setActiveTab('io')} icon={<FileJson className="size-4" />} label="Import / Export" />
          </div>

          {/* ===== TAB: Tabelas ===== */}
          {activeTab === 'tables' && (
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Tabelas ({tables.length})
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => exportData()}
                  className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 font-semibold"
                >
                  <Download className="size-3.5" />
                  Exportar tudo
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('io')}
                  className="text-blue-700 hover:text-blue-800 hover:bg-blue-50 font-semibold"
                >
                  <Upload className="size-3.5" />
                  Importar JSON
                </Button>
              </div>
            </div>

            {loadingTables ? (
              <div className="py-8 text-center">
                <Loader2 className="size-6 text-slate-400 animate-spin mx-auto" />
                <p className="text-xs text-slate-500 mt-2">Carregando tabelas...</p>
              </div>
            ) : tables.length === 0 ? (
              <div className="py-12 text-center">
                <Table2 className="size-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-900">Nenhuma tabela</p>
                <p className="text-xs text-slate-500 mt-1">
                  Use a aba SQL para criar tabelas, ou importe JSON na aba Import/Export.
                </p>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button
                    onClick={() => setActiveTab('sql')}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Terminal className="size-3.5" />
                    Abrir SQL
                  </Button>
                  <Button
                    onClick={() => setActiveTab('io')}
                    size="sm"
                    variant="outline"
                  >
                    <Upload className="size-3.5" />
                    Importar JSON
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-2">
                {tables.map((t) => (
                  <div
                    key={t.name}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
                  >
                    <button
                      onClick={() => selectTable(t.name)}
                      className="flex items-center gap-3 flex-1 min-w-0 text-left"
                    >
                      <Table2 className="size-4 text-slate-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-mono font-semibold text-slate-900 truncate">{t.name}</p>
                        <p className="text-xs text-slate-500">
                          {t.rowCount.toLocaleString('pt-BR')} linhas · {t.size}
                        </p>
                      </div>
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => selectTable(t.name)}
                        className="size-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-blue-600"
                        title="Ver dados (vai pra aba SQL)"
                      >
                        <Eye className="size-4" />
                      </button>
                      <button
                        onClick={() => exportData(t.name)}
                        className="size-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-blue-600"
                        title="Exportar tabela como JSON"
                      >
                        <Download className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          )}

          {/* ===== TAB: SQL ===== */}
          {activeTab === 'sql' && (
          <>
          <div className="border-b border-slate-200 px-5 py-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Terminal className="size-4 text-blue-600" />
              Console SQL
              {selectedTable && (
                <span className="text-xs text-slate-500 font-normal">
                  · tabela selecionada: <code className="font-mono bg-slate-100 px-1 rounded">{selectedTable}</code>
                </span>
              )}
            </h3>
            <Button
              onClick={runQuery}
              disabled={querying}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {querying ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
              Executar
            </Button>
          </div>
          <div className="p-4">
            <textarea
              value={sql}
              onChange={(e) => setSql(e.target.value)}
              placeholder="SELECT * FROM usuarios LIMIT 10;"
              className="w-full h-32 px-3 py-2 rounded-lg bg-slate-900 text-slate-100 text-xs font-mono resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              spellCheck={false}
            />
            <p className="text-xs text-slate-500 mt-1">
              💡 Apenas consultas SELECT são permitidas (read-only). Para criar tabelas, use a aba Import/Export ou conecte via psql.
            </p>
          </div>

          {/* Query result */}
          {queryError && (
            <div className="mx-4 mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-900 text-xs font-mono">
              ❌ {queryError}
            </div>
          )}
          {queryResult && (
            <div className="mx-4 mb-4 border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50 px-3 py-2 flex items-center justify-between border-b border-slate-200">
                <p className="text-xs text-slate-700">
                  <strong>{queryResult.rowCount}</strong> linha(s) retornada(s) em {queryResult.columns.length} coluna(s)
                </p>
                <button
                  onClick={() => copyToClipboard('result', JSON.stringify(queryResult.rows, null, 2))}
                  className="text-xs text-blue-600 hover:underline"
                >
                  {copiedField === 'result' ? '✓ Copiado' : 'Copiar JSON'}
                </button>
              </div>
              <div className="overflow-x-auto max-h-96">
                {queryResult.rows.length === 0 ? (
                  <p className="p-4 text-center text-sm text-slate-500">Nenhum resultado</p>
                ) : (
                  <table className="w-full text-xs">
                    <thead className="bg-slate-100 sticky top-0">
                      <tr>
                        {queryResult.columns.map((col) => (
                          <th key={col} className="px-3 py-2 text-left font-semibold text-slate-700 whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {queryResult.rows.map((row, i) => (
                        <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
                          {queryResult.columns.map((col) => (
                            <td key={col} className="px-3 py-2 font-mono text-slate-900 whitespace-nowrap max-w-xs truncate">
                              {String(row[col] ?? 'NULL')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
          </>
          )}

          {/* ===== TAB: Import / Export ===== */}
          {activeTab === 'io' && (
          <>
          <div className="border-b border-slate-200 px-5 py-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileJson className="size-4 text-blue-600" />
              Importar / Exportar JSON
            </h3>
          </div>
          <div className="p-5 space-y-5">
            {/* Export */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <Download className="size-4 text-emerald-600" />
                Exportar
              </h4>
              <p className="text-xs text-slate-500 mb-2">
                Baixe todos os dados do banco como JSON. Você também pode exportar uma tabela específica na aba Tabelas.
              </p>
              <Button
                onClick={() => exportData()}
                variant="outline"
                size="sm"
                className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                <Download className="size-3.5" />
                Exportar banco completo (JSON)
              </Button>
            </div>

            {/* Import */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <Upload className="size-4 text-blue-600" />
                Importar
              </h4>
              <p className="text-xs text-slate-500 mb-2">
                Cole JSON no formato <code className="font-mono bg-slate-100 px-1 rounded">{`{"nome_tabela": [{"coluna": "valor"}, ...]}`}</code>.
                As tabelas serão criadas automaticamente se não existirem.
              </p>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={`{\n  "usuarios": [\n    {"id": "1", "nome": "João"},\n    {"id": "2", "nome": "Maria"}\n  ],\n  "produtos": [\n    {"id": "1", "nome": "Produto A"}\n  ]\n}`}
                className="w-full h-40 px-3 py-2 rounded-lg bg-slate-900 text-slate-100 text-xs font-mono resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                spellCheck={false}
              />
              <div className="flex items-center gap-3 mt-2">
                <Button
                  onClick={importData}
                  disabled={importing || !importText.trim()}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {importing ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                  Importar JSON
                </Button>
                {importResult && (
                  <p className={`text-xs font-mono ${importResult.startsWith('✓') ? 'text-emerald-700' : 'text-red-700'}`}>
                    {importResult}
                  </p>
                )}
              </div>
            </div>
          </div>
          </>
          )}
        </div>
      </div>
    </PainelShell>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>
}

function TabButton({ active, onClick, icon, label, count }: { active: boolean; onClick?: () => void; icon: React.ReactNode; label: string; count?: number }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
        active
          ? 'border-blue-600 text-blue-700 bg-blue-50/50'
          : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
      }`}
    >
      {icon}
      {label}
      {typeof count === 'number' && (
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
          active ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
        }`}>
          {count}
        </span>
      )}
    </button>
  )
}
