'use client'

import { STATS } from '@/lib/content'
import { Counter } from '@/components/counter'
import { Reveal } from '@/components/reveal'

export function Stats() {
  return (
    <section className="relative py-24">
      <div className="container-x">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.1} direction="up">
              <div className="relative gradient-border p-8 text-center card-hover rounded-2xl group">
                {/* glow */}
                <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-500" />
                <div className="relative">
                  <div className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                    <span className="gradient-text">
                      <Counter
                        value={stat.value}
                        suffix={stat.suffix}
                        decimals={stat.decimals ?? 0}
                      />
                    </span>
                  </div>
                  <div className="mt-3 text-sm text-white/60">{stat.label}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
