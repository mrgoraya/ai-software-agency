"use client";

import { useEffect, useState } from "react";
import { Bot, Boxes, Compass, Database, MessageSquare, Workflow } from "lucide-react";
import { site } from "@/lib/config";
import {
  agentRun,
  caseStudies,
  faqs,
  pricing,
  process,
  services,
  team,
  testimonials,
} from "@/lib/content";
import { Reveal, Tilt, useSeen } from "./FX";

const serviceIcons = [Bot, Workflow, MessageSquare, Boxes, Database, Compass];

function Head({ title, intro }: { title: string; intro?: string }) {
  return (
    <Reveal className="sec-head">
      <h2>{title}</h2>
      {intro && <p className="sec-intro">{intro}</p>}
    </Reveal>
  );
}

function BookLink({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <a
      href={site.bookingUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn btn-solid hero-btn ${className}`}
    >
      {children}
    </a>
  );
}

export function AgentSection() {
  const [ref, seen] = useSeen<HTMLDivElement>();

  return (
    <section id="agent" data-section className="sec">
      <div className="sec-inner agent-grid">
        <Head
          title="Watch an agent do the work"
          intro="This is a real kind of job we automate: a support inbox that used to eat the first two hours of every day."
        />
        <Reveal delay={0.1}>
          <Tilt className="glass agent-card" max={6}>
            <div ref={ref} className={`agent ${seen ? "play" : ""}`}>
              <p className="agent-label">Agent run</p>
              <p className="agent-task">{agentRun.task}</p>
              <div className="agent-bar" aria-hidden>
                <span />
              </div>
              <ol className="agent-steps">
                {agentRun.steps.map((step, i) => (
                  <li key={step} style={{ "--i": i } as React.CSSProperties}>
                    <svg viewBox="0 0 20 20" aria-hidden>
                      <path d="M4 10.5 8.2 14.5 16 5.5" />
                    </svg>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <p className="agent-result">{agentRun.result}</p>
            </div>
          </Tilt>
        </Reveal>
      </div>
    </section>
  );
}

export function ServicesSection() {
  return (
    <section id="services" data-section className="sec">
      <div className="sec-inner">
        <Head
          title="What we build"
          intro="Six kinds of work, all aimed at one thing: fewer hours spent on tasks software can finish."
        />
        <div className="svc-grid">
          {services.map((s, i) => {
            const Icon = serviceIcons[i % serviceIcons.length];
            return (
              <Reveal key={s.name} delay={(i % 3) * 0.08}>
                <Tilt className="glass svc-card">
                  <span className="svc-icon z2">
                    <Icon size={22} strokeWidth={1.6} aria-hidden />
                  </span>
                  <h3 className="z1">{s.name}</h3>
                  <p>{s.body}</p>
                </Tilt>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function WorkSection() {
  return (
    <section id="work" data-section className="sec">
      <div className="sec-inner">
        <Head title="Work that shipped" intro="Three projects, with the result each client measured." />
        <div className="work-list">
          {caseStudies.map((c, i) => (
            <Reveal key={c.client} delay={i * 0.08}>
              <Tilt className="glass work-card" max={5}>
                <div className="work-who z1">
                  <h3>{c.client}</h3>
                  <p>{c.work}</p>
                </div>
                <p className="work-detail">{c.detail}</p>
                <div className="work-result z2">
                  <span className="work-stat">{c.stat}</span>
                  <span>{c.result}</span>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProcessSection() {
  return (
    <section id="process" data-section className="sec">
      <div className="sec-inner">
        <Head title="How a project runs" intro="Five stages. You see working software at the end of the second one." />
        <ol className="steps">
          {process.map((p, i) => (
            <li key={p.title}>
              <Reveal delay={0.05}>
                <Tilt className="glass step-card" max={4}>
                  <span className="step-no">Step {i + 1}</span>
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                </Tilt>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function PricingSection() {
  return (
    <section id="pricing" data-section className="sec">
      <div className="sec-inner">
        <Head
          title="Pricing"
          intro="Starting points. Your quote comes after the discovery call, in writing, with a fixed scope."
        />
        <div className="price-grid">
          {pricing.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.1}>
              <Tilt className={`glass price-card ${t.featured ? "featured" : ""}`} max={7}>
                <h3>{t.name}</h3>
                <p className="price z2">{t.price}</p>
                <p className="price-cadence">{t.cadence}</p>
                <p className="price-summary">{t.summary}</p>
                <ul>
                  {t.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ClientsSection() {
  const [n, setN] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = testimonials.length;

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setN((v) => v + 1), 6500);
    return () => clearInterval(t);
  }, [paused]);

  const active = ((n % count) + count) % count;

  return (
    <section id="clients" data-section className="sec">
      <div className="sec-inner">
        <Head title="What clients say" />
        <Reveal>
          <div
            className="carousel"
            onPointerEnter={() => setPaused(true)}
            onPointerLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
          >
            <div className="carousel-track" style={{ "--n": n } as React.CSSProperties}>
              {testimonials.map((t, i) => (
                <figure
                  key={t.name}
                  className="glass c-card"
                  style={{ "--i": i } as React.CSSProperties}
                  aria-hidden={i !== active}
                >
                  <blockquote>{t.quote}</blockquote>
                  <figcaption>
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
          <div className="carousel-dots" role="group" aria-label="Choose a testimonial">
            {testimonials.map((t, i) => (
              <button
                key={t.name}
                type="button"
                aria-label={`Show quote from ${t.name}`}
                aria-pressed={i === active}
                className={i === active ? "on" : ""}
                onClick={() => setN(n + (((i - active) % count) + count) % count)}
              />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function TeamSection() {
  return (
    <section id="team" data-section className="sec">
      <div className="sec-inner">
        <Head title="The people you’ll work with" />
        <div className="team-grid">
          {team.map((m, i) => (
            <Reveal key={m.name} delay={i * 0.07}>
              <Tilt className="glass team-card">
                <span className="orb z2" aria-hidden>
                  {m.name
                    .split(" ")
                    .map((p) => p[0])
                    .join("")}
                </span>
                <h3 className="z1">{m.name}</h3>
                <p className="team-role">{m.role}</p>
                <p>{m.note}</p>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FaqSection() {
  return (
    <section id="faq" data-section className="sec">
      <div className="sec-inner faq-wrap">
        <Head title="Questions we hear a lot" />
        <Reveal>
          <div className="glass faq">
            {faqs.map((f) => (
              <details key={f.q}>
                <summary>
                  {f.q}
                  <span aria-hidden>+</span>
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function CtaSection() {
  return (
    <section id="start" data-section className="sec cta-sec">
      <div className="sec-inner">
        <Reveal>
          <Tilt className="glass cta-card" max={4}>
            <h2 className="z1">Tell us which task you’d like off your team’s plate.</h2>
            <p className="sec-intro">
              A 30-minute call. You’ll leave knowing whether AI fits, what it would take, and a rough price.
            </p>
            <BookLink className="cta-btn z2">Book a discovery call</BookLink>
          </Tilt>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <p>
          <strong>{site.name}</strong> &copy; 2026
        </p>
        <a href={`mailto:${site.email}`}>{site.email}</a>
      </div>
    </footer>
  );
}
