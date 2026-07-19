'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, Mail, Lock, User, Eye, EyeOff, Loader2,
  Check, ShieldCheck, Zap, Server, Rocket, Github, Chrome, Apple,
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { CursorGlow } from '@/components/cursor-glow'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

type Mode = 'login' | 'register'

export default function LoginPage() {
  const [mode, setMode] = React.useState<Mode>('login')
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirm, setShowConfirm] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [success, setSuccess] = React.useState(false)
  const [form, setForm] = React.useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    accept: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulated auth (will be replaced with real auth when admin panel is built)
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 4000)
    }, 1500)
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <CursorGlow />
      <Navbar />

      <main className="flex-1 pt-32 pb-20 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 grid-bg grid-bg-radial opacity-50 pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-500/15 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[400px] bg-purple-500/15 blur-[140px] rounded-full pointer-events-none" />

        <div className="container-x relative">
          <div className="max-w-md mx-auto">
            {/* Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative rounded-3xl border border-white/10 bg-[#0c0c0c]/80 backdrop-blur-xl p-8 sm:p-10 overflow-hidden"
            >
              {/* Top gradient line */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />

              {/* Logo */}
              <div className="flex justify-center mb-6">
                <Link href="/" className="flex items-center" aria-label="LIPE.HOST">
                  <Image
                    src="/lipehost-logo-navbar.png"
                    alt="LIPE.HOST"
                    width={161}
                    height={40}
                    className="h-10 w-auto opacity-90"
                  />
                </Link>
              </div>

              {/* Mode tabs */}
              <div className="flex p-1 bg-white/[0.04] border border-white/10 rounded-xl mb-7">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className={`flex-1 h-9 rounded-lg text-sm font-semibold transition-all ${
                    mode === 'login'
                      ? 'gradient-bg text-white shadow-lg shadow-blue-500/20'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className={`flex-1 h-9 rounded-lg text-sm font-semibold transition-all ${
                    mode === 'register'
                      ? 'gradient-bg text-white shadow-lg shadow-blue-500/20'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Registrar-se
                </button>
              </div>

              {/* Heading */}
              <div className="mb-7 text-center">
                <h1 className="text-2xl font-extrabold tracking-tight mb-1.5">
                  {mode === 'login' ? (
                    <>Bem-vindo de volta</>
                  ) : (
                    <>Crie sua conta</>
                  )}
                </h1>
                <p className="text-sm text-white/55">
                  {mode === 'login'
                    ? 'Acesse seu painel para gerenciar sistemas e projetos'
                    : 'Comece a gerenciar seus sistemas e projetos hoje'}
                </p>
              </div>

              {/* Success message */}
              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 flex items-center gap-3"
                  >
                    <div className="size-7 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <Check className="size-4 text-emerald-400" strokeWidth={3} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-emerald-300">
                        {mode === 'login' ? 'Login realizado!' : 'Conta criada!'}
                      </div>
                      <div className="text-xs text-emerald-300/70">
                        {mode === 'login'
                          ? 'Redirecionando para o painel...'
                          : 'Verifique seu e-mail para ativar a conta.'}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence mode="wait">
                  {mode === 'register' && (
                    <motion.div
                      key="name"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <Label htmlFor="name" className="text-xs text-white/70 mb-1.5 block">
                        Nome completo
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
                        <Input
                          id="name"
                          type="text"
                          required
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="Seu nome"
                          className="h-11 pl-10 bg-[#111] border-white/10 text-white placeholder:text-white/40 rounded-xl focus-visible:border-blue-500/50"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="text-xs text-white/70 mb-1.5 block">
                    E-mail
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
                    <Input
                      id="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="voce@empresa.com"
                      className="h-11 pl-10 bg-[#111] border-white/10 text-white placeholder:text-white/40 rounded-xl focus-visible:border-blue-500/50"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <Label htmlFor="password" className="text-xs text-white/70 mb-1.5 block">
                    {mode === 'login' ? 'Senha' : 'Criar senha'}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="••••••••"
                      className="h-11 pl-10 pr-10 bg-[#111] border-white/10 text-white placeholder:text-white/40 rounded-xl focus-visible:border-blue-500/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm password (register) */}
                <AnimatePresence mode="wait">
                  {mode === 'register' && (
                    <motion.div
                      key="confirm"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <Label htmlFor="confirm" className="text-xs text-white/70 mb-1.5 block">
                        Confirmar senha
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
                        <Input
                          id="confirm"
                          type={showConfirm ? 'text' : 'password'}
                          required
                          value={form.confirm}
                          onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                          placeholder="••••••••"
                          className="h-11 pl-10 pr-10 bg-[#111] border-white/10 text-white placeholder:text-white/40 rounded-xl focus-visible:border-blue-500/50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                          aria-label={showConfirm ? 'Ocultar senha' : 'Mostrar senha'}
                        >
                          {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Remember + forgot (login) */}
                {mode === 'login' && (
                  <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center gap-2 cursor-pointer text-white/60 hover:text-white/80">
                      <Checkbox id="remember" />
                      Manter conectado
                    </label>
                    <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                      Esqueci a senha
                    </a>
                  </div>
                )}

                {/* Accept terms (register) */}
                {mode === 'register' && (
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-white/60 hover:text-white/80">
                    <Checkbox
                      id="accept"
                      checked={form.accept}
                      onCheckedChange={(v) => setForm({ ...form, accept: v === true })}
                      className="mt-0.5"
                    />
                    <span>
                      Eu li e aceito os{' '}
                      <a href="/termos" className="text-blue-400 hover:underline">Termos de Uso</a>{' '}
                      e a{' '}
                      <a href="/politica-de-privacidade" className="text-blue-400 hover:underline">Política de Privacidade</a>
                    </span>
                  </label>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={loading || (mode === 'register' && !form.accept)}
                  className="w-full h-11 gradient-bg border-0 text-white font-semibold hover:shadow-xl hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Aguarde...
                    </>
                  ) : (
                    <>
                      {mode === 'login' ? 'Entrar' : 'Criar conta'}
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[10px] uppercase tracking-wider text-white/40">ou continue com</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Social login */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  className="h-10 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] flex items-center justify-center text-white/70 hover:text-white transition-all"
                  aria-label="Entrar com Google"
                >
                  <Chrome className="size-4" />
                </button>
                <button
                  type="button"
                  className="h-10 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] flex items-center justify-center text-white/70 hover:text-white transition-all"
                  aria-label="Entrar com GitHub"
                >
                  <Github className="size-4" />
                </button>
                <button
                  type="button"
                  className="h-10 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] flex items-center justify-center text-white/70 hover:text-white transition-all"
                  aria-label="Entrar com Apple"
                >
                  <Apple className="size-4" />
                </button>
              </div>

              {/* Toggle mode link */}
              <p className="text-center text-xs text-white/50 mt-6">
                {mode === 'login' ? (
                  <>
                    Não tem conta?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('register')}
                      className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                    >
                      Registrar-se
                    </button>
                  </>
                ) : (
                  <>
                    Já tem conta?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                    >
                      Entrar
                    </button>
                  </>
                )}
              </p>
            </motion.div>

            {/* Trust badges below card */}
            <div className="mt-6 flex items-center justify-center gap-5 text-[11px] text-white/40">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-emerald-400" />
                Conexão segura SSL
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="size-3.5 text-blue-400" />
                Dados criptografados
              </div>
              <div className="flex items-center gap-1.5">
                <Server className="size-3.5 text-purple-400" />
                Servidor no Brasil
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
