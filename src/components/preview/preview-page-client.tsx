'use client'

import * as React from 'react'
import Image from 'next/image'
import {
  Loader2, CheckCircle2, XCircle, Rocket, ExternalLink, RefreshCw,
} from 'lucide-react'

interface Deploy {
  id: string
  name: string
  status: string
  previewUrl: string | null
  customDomain: string | null
  framework: string | null
  buildLog: string | null
  repoUrl: string
  createdAt: string
  updatedAt: string
}

export function PreviewPageClient({ deploy: initialDeploy }: { deploy: Deploy }) {
  const [deploy, setDeploy] = React.useState(initialDeploy)
  const [copied, setCopied] = React.useState(false)

  // Poll for status updates while building
  React.useEffect(() => {
    if (deploy.status !== 'building' && deploy.status !== 'queued') return

    const interval = setInterval(async () => {
      try {
        // Use the public status endpoint (no auth required)
        const res = await fetch(`/api/preview/${deploy.id}/status`)
        const data = await res.json()
        if (res.ok && data.deploy) {
          setDeploy(data.deploy)
          if (data.deploy.status === 'ready' || data.deploy.status === 'error') {
            clearInterval(interval)
          }
        }
      } catch {
        // ignore
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [deploy.status, deploy.id])

  const isBuilding = deploy.status === 'building' || deploy.status === 'queued'
  const isError = deploy.status === 'error'
  const isReady = deploy.status === 'ready'

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 grid-bg grid-bg-radial opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative w-full max-w-lg">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/lipehost-logo-navbar.png"
            alt="LipeHost"
            width={180}
            height={45}
            priority
            className="h-11 w-auto opacity-90"
          />
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-[#111]/80 backdrop-blur-xl p-8 text-center">
          {/* Status icon */}
          <div className="flex justify-center mb-5">
            {isBuilding && (
              <div className="size-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                <Loader2 className="size-8 text-blue-400 animate-spin" />
              </div>
            )}
            {isReady && (
              <div className="size-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle2 className="size-8 text-emerald-400" />
              </div>
            )}
            {isError && (
              <div className="size-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <XCircle className="size-8 text-red-400" />
              </div>
            )}
          </div>

          {/* Status text */}
          <h1 className="text-2xl font-extrabold text-white mb-2">
            {isBuilding && 'Deploy em andamento...'}
            {isReady && 'Deploy pronto! 🎉'}
            {isError && 'Erro no deploy'}
          </h1>

          <p className="text-sm text-white/60 mb-1">
            <strong className="text-white/80">{deploy.name}</strong>
          </p>
          <p className="text-xs text-white/40 mb-6 font-mono">
            {deploy.repoUrl.replace('https://github.com/', '')}
          </p>

          {/* Building message */}
          {isBuilding && (
            <div className="space-y-3 mb-6">
              <p className="text-sm text-white/60">
                Estamos construindo seu site. Isso pode levar alguns minutos.
                Esta página vai atualizar automaticamente quando terminar.
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-blue-400">
                <RefreshCw className="size-3 animate-spin" />
                Atualizando a cada 2 segundos...
              </div>
            </div>
          )}

          {/* Ready message */}
          {isReady && (
            <div className="space-y-3 mb-6">
              <p className="text-sm text-white/60">
                Seu site foi publicado com sucesso! Você já pode acessar.
              </p>
              {deploy.customDomain && (
                <a
                  href={`https://${deploy.customDomain}`}
                  className="inline-flex items-center gap-2 h-11 px-6 rounded-xl gradient-bg text-white font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                >
                  <ExternalLink className="size-4" />
                  Acessar {deploy.customDomain}
                </a>
              )}
            </div>
          )}

          {/* Error message */}
          {isError && (
            <div className="space-y-3 mb-6">
              <p className="text-sm text-red-400/80">
                Ocorreu um erro durante o build. Verifique os logs no painel.
              </p>
            </div>
          )}

          {/* Framework badge */}
          {deploy.framework && (
            <div className="inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-300 uppercase mb-4">
              <Rocket className="size-3" />
              {deploy.framework}
            </div>
          )}

          {/* Build log preview (if building) */}
          {isBuilding && deploy.buildLog && (
            <div className="mt-4 text-left">
              <div className="rounded-lg bg-slate-950 border border-white/5 p-3 max-h-32 overflow-y-auto">
                <pre className="text-[10px] font-mono text-slate-400 whitespace-pre-wrap">
                  {deploy.buildLog.split('\n').slice(-6).join('\n')}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-white/30">
            Powered by{' '}
            <a href="https://lipe.host" className="text-white/50 hover:text-white/80 transition-colors">
              LipeHost
            </a>
          </p>
          <p className="text-[10px] text-white/20 mt-1">
            Atualizado em {new Date(deploy.updatedAt).toLocaleString('pt-BR')}
          </p>
        </div>
      </div>
    </div>
  )
}
