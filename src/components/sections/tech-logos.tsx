'use client'

import { TECH_LOGOS } from '@/lib/content'

export function TechLogos() {
  // duplicate for seamless marquee
  const logos = [...TECH_LOGOS, ...TECH_LOGOS]

  return (
    <section className="relative py-16 border-y border-white/5 bg-[#0a0a0a]">
      <div className="container-x">
        <p className="text-center text-xs uppercase tracking-[0.2em] text-white/40 mb-10">
          Tecnologias que dominamos
        </p>
        <div className="relative overflow-hidden">
          {/* gradient masks on sides */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
          <div className="flex gap-12 animate-marquee w-max">
            {logos.map((logo, i) => (
              <div
                key={`${logo}-${i}`}
                className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group flex-shrink-0"
              >
                <div className="size-7 rounded-lg bg-white/5 border border-white/10 group-hover:border-blue-500/30 flex items-center justify-center font-bold text-xs">
                  {logo.charAt(0)}
                </div>
                <span className="font-semibold text-lg whitespace-nowrap">{logo}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
