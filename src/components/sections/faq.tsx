'use client'

import * as React from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ChevronDown } from 'lucide-react'
import { FAQ } from '@/lib/content'
import { Reveal } from '@/components/reveal'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'

export function Faq() {
  return (
    <section id="faq" className="relative py-24 section-padding border-t border-white/5">
      <div className="container-x">
        <div className="grid lg:grid-cols-[1fr_1.6fr] gap-12 lg:gap-16">
          {/* Left — title */}
          <Reveal direction="right" className="lg:sticky lg:top-32 lg:self-start">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/70 mb-5">
              <span className="size-1.5 rounded-full bg-violet-400 animate-pulse" />
              Perguntas frequentes
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Tire suas{' '}
              <span className="gradient-text">dúvidas</span>
            </h2>
            <p className="mt-5 text-base text-white/60">
              Reunimos as perguntas mais comuns. Se você não encontrar sua resposta aqui, nossa
              equipe está pronta para conversar.
            </p>
            <Link
              href="#contato"
              className="mt-7 inline-flex items-center gap-2 h-11 px-5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-all"
            >
              <MessageCircle className="size-4" />
              Falar com especialista
            </Link>
          </Reveal>

          {/* Right — accordion */}
          <Reveal direction="left" delay={0.1}>
            <Accordion type="single" collapsible className="space-y-3">
              {FAQ.map((item, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="rounded-xl border border-white/8 bg-[#111] px-5 data-[state=open]:border-blue-500/30 transition-colors"
                >
                  <AccordionTrigger className="text-left text-base font-semibold hover:no-underline py-5 group">
                    <span className="flex-1 pr-3">{item.q}</span>
                    <div className="size-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-data-[state=open]:bg-blue-500/20 group-data-[state=open]:border-blue-500/40 transition-all">
                      <ChevronDown className="size-4 text-white/60 group-data-[state=open]:text-blue-400 group-data-[state=open]:rotate-180 transition-all" />
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-white/60 leading-relaxed pb-5 pt-0">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
