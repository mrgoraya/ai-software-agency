"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Lenis from "lenis";
import { site } from "@/lib/config";
import { scrollState } from "@/lib/scrollState";
import {
  AgentSection,
  ClientsSection,
  CtaSection,
  FaqSection,
  Footer,
  PricingSection,
  ProcessSection,
  ServicesSection,
  TeamSection,
  WorkSection,
} from "./Sections";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

const navItems = [
  { label: "Services", id: "services" },
  { label: "Work", id: "work" },
  { label: "Process", id: "process" },
  { label: "Pricing", id: "pricing" },
  { label: "FAQ", id: "faq" },
];

const delay = (d: string, extra?: React.CSSProperties) =>
  ({ "--d": d, ...extra }) as React.CSSProperties;

const noopSubscribe = () => () => {};

let webglCache: boolean | undefined;
function detectWebGL() {
  if (webglCache === undefined) {
    try {
      const c = document.createElement("canvas");
      webglCache = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      webglCache = false;
    }
  }
  return webglCache;
}

const reducedQuery = "(prefers-reduced-motion: reduce)";
function subscribeReduced(cb: () => void) {
  const mq = window.matchMedia(reducedQuery);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

export function Landing() {
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState("");

  // 3D only when the browser can actually run it; false during SSR/hydration.
  const webgl = useSyncExternalStore(noopSubscribe, detectWebGL, () => false);
  const reduced = useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(reducedQuery).matches,
    () => false,
  );

  // Smooth scrolling + scroll state shared with the 3D scene.
  useEffect(() => {
    const prefersReduced = window.matchMedia(reducedQuery).matches;
    let lenis: Lenis | null = null;
    let raf = 0;

    if (!prefersReduced) {
      lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
      scrollState.lenis = lenis;
      const loop = (time: number) => {
        lenis?.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    // Section centres: the 3D scene hits each section's keyframe when that
    // section's centre is at the middle of the viewport.
    let centers: number[] = [];
    let ids: string[] = [];
    const measure = () => {
      const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-section]"));
      ids = sections.map((el) => el.id);
      centers = sections.map((el) => {
        const r = el.getBoundingClientRect();
        return r.top + window.scrollY + r.height / 2;
      });
    };

    let lastY = window.scrollY;
    const update = () => {
      const y = window.scrollY;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scrollState.p = Math.min(1, Math.max(0, y / max));
      scrollState.vel += y - lastY;
      lastY = y;

      const probe = y + window.innerHeight * 0.5;
      let i = 0;
      while (i < centers.length - 1 && centers[i + 1] <= probe) i++;
      if (centers.length < 2) {
        scrollState.idx = 0;
      } else if (probe <= centers[0]) {
        scrollState.idx = 0;
      } else if (i >= centers.length - 1) {
        scrollState.idx = centers.length - 1;
      } else {
        scrollState.idx = i + (probe - centers[i]) / Math.max(1, centers[i + 1] - centers[i]);
      }

      if (progressRef.current) progressRef.current.style.transform = `scaleX(${scrollState.p})`;
      headerRef.current?.classList.toggle("is-scrolled", y > 24);
      if (sceneRef.current) sceneRef.current.style.opacity = scrollState.idx < 0.5 ? "1" : "0.6";

      const current = ids[Math.round(scrollState.idx)] ?? "";
      setActive((prev) => (prev === current ? prev : current));
    };

    const onResize = () => {
      measure();
      update();
    };

    measure();
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", onResize);
    // Images and fonts can shift layout after first paint.
    const remeasure = setTimeout(onResize, 800);

    return () => {
      clearTimeout(remeasure);
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", onResize);
      lenis?.destroy();
      scrollState.lenis = null;
    };
  }, []);

  // Entrance animation bookkeeping + fallback.
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".appear"));
    const onEnd = (e: Event) => {
      const el = e.currentTarget as HTMLElement;
      if (e.target !== el) return; // ignore bubbled child animations
      el.classList.add("is-in");
      el.removeEventListener("animationend", onEnd);
    };
    els.forEach((el) => el.addEventListener("animationend", onEnd));

    let r2 = 0;
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => {
        const working = els.some(
          (el) =>
            typeof el.getAnimations === "function" &&
            el.getAnimations().some((a) => a.playState === "running" || a.playState === "finished"),
        );
        if (!working) els.forEach((el) => el.classList.add("is-in"));
      });
    });

    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
      els.forEach((el) => el.removeEventListener("animationend", onEnd));
    };
  }, []);

  // Slide the highlight under the nav link for the section being read.
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const place = () => {
      const link = nav.querySelector<HTMLElement>(`[data-nav="${active}"]`);
      if (link) {
        nav.style.setProperty("--ix", `${link.offsetLeft}px`);
        nav.style.setProperty("--iw", `${link.offsetWidth}px`);
        nav.style.setProperty("--io", "1");
      } else {
        nav.style.setProperty("--io", "0");
      }
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [active]);

  // Menu: body class, Escape, resize to desktop.
  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    return () => document.body.classList.remove("menu-open");
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const mq = window.matchMedia("(min-width: 901px)");
    const onMq = (e: MediaQueryListEvent) => e.matches && setOpen(false);
    document.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => {
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
    };
  }, []);

  const goTo = (id: string) => (e: React.MouseEvent) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    setOpen(false);
    if (scrollState.lenis) scrollState.lenis.scrollTo(el, { offset: -64, duration: 1.4 });
    else el.scrollIntoView({ behavior: "auto" });
  };

  return (
    <>
      <div className="grain" aria-hidden />
      <div className="progress" ref={progressRef} aria-hidden />
      <div className="scene" ref={sceneRef} aria-hidden>
        {webgl && <Scene reduced={reduced} />}
      </div>

      <div className="menu-backdrop" onClick={() => setOpen(false)} aria-hidden />

      <header className="header" ref={headerRef}>
        <a
          href="#top"
          onClick={goTo("top")}
          className="logo appear appear--scale"
          aria-label={site.name}
          style={delay("0.08s")}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden>
            <path d="M12 3.5 4.6 8v8L12 20.5 19.4 16V8L12 3.5Z" strokeLinejoin="round" />
            <path d="M12 3.5V12m0 0-7.4 4M12 12l7.4 4" />
            <circle cx="12" cy="12" r="2.1" fill="currentColor" stroke="none" />
          </svg>
          <span>
            Neural<span className="logo-suffix">Forge</span>
          </span>
        </a>

        <nav id="site-nav" className="nav" aria-label="Primary" ref={navRef}>
          <span className="nav-ind" aria-hidden />
          {navItems.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              data-nav={n.id}
              className={`nav-link ${active === n.id ? "is-active" : ""}`}
              aria-current={active === n.id ? "true" : undefined}
              onClick={goTo(n.id)}
            >
              {n.label}
            </a>
          ))}
        </nav>

        <a
          href={site.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="cta-pill header-cta appear appear--scale"
          style={delay("0.34s")}
        >
          <span className="cta-dot" aria-hidden />
          Book a call
        </a>

        <button
          type="button"
          className="burger appear appear--scale"
          style={delay("0.34s")}
          aria-controls="site-nav"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      <main id="main" className="page">
        <section id="top" data-section className="hero-wrap">
          <div className="hero">
            <div className="hero-copy">
              <div className="badge appear appear--pop" style={delay("0.22s")}>
                <svg className="badge-star" width="18" height="20" viewBox="0 0 24 24" fill="#fff" aria-hidden>
                  <path d="M12 2.6C12.55 2.6 12.88 3.15 13.08 4.7c.62 4.7 1.52 5.6 6.22 6.22 1.55.2 2.1.53 2.1 1.08s-.55.88-2.1 1.08c-4.7.62-5.6 1.52-6.22 6.22-.2 1.55-.53 2.1-1.08 2.1s-.88-.55-1.08-2.1c-.62-4.7-1.52-5.6-6.22-6.22C3.15 12.88 2.6 12.55 2.6 12s.55-.88 2.1-1.08c4.7-.62 5.6-1.52 6.22-6.22C11.12 3.15 11.45 2.6 12 2.6Z" />
                </svg>
                AI software agency
              </div>

              <h1>
                <span className="headline-line">
                  <span className="appear appear--mask" style={{ ...delay("0.42s"), display: "block" }}>
                    We build <em>AI agents</em> that do
                  </span>
                </span>
                <span className="headline-line">
                  <span className="appear appear--mask" style={{ ...delay("0.62s"), display: "block" }}>
                    real work for your team.
                  </span>
                </span>
              </h1>

              <p className="lede appear appear--soft" style={{ ...delay("0.82s"), animationDuration: "1.25s" }}>
                NeuralForge designs and ships agents, automations and assistants that plug into the tools you already
                use, and measures them against your numbers.
              </p>

              <div className="hero-actions">
                <a
                  href={site.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-solid hero-btn appear appear--btn"
                  style={delay("0.96s")}
                >
                  Book a discovery call
                </a>
                <a
                  href="#work"
                  onClick={goTo("work")}
                  className="btn btn-ghost hero-btn hero-ghost appear appear--side"
                  style={delay("1.10s")}
                >
                  See our work
                </a>
              </div>
            </div>
          </div>

          <div className="stats">
            <div className="stat appear appear--stat" style={delay("1.12s")}>
              <svg className="stat-icon" viewBox="0 0 24 24" aria-hidden>
                <defs>
                  <linearGradient id="pillL" x1="3" y1="2" x2="14" y2="22" gradientUnits="userSpaceOnUse">
                    <stop offset="0.38" stopColor="#ffffff" />
                    <stop offset="0.62" stopColor="#3a3a3a" />
                  </linearGradient>
                  <linearGradient id="pillR" x1="3" y1="2" x2="14" y2="22" gradientUnits="userSpaceOnUse">
                    <stop offset="0.38" stopColor="#3a3a3a" />
                    <stop offset="0.62" stopColor="#ffffff" />
                  </linearGradient>
                </defs>
                <rect x="3.4" y="2.6" width="7.2" height="18.8" rx="3.6" fill="url(#pillL)" />
                <rect x="13.4" y="2.6" width="7.2" height="18.8" rx="3.6" fill="url(#pillR)" />
                <rect x="9.2" y="10.9" width="5.6" height="2.2" rx="1.1" fill="#4a4a4a" />
              </svg>
              <span>40+ AI systems in production</span>
            </div>

            <div className="stat appear appear--stat" style={delay("1.28s")}>
              <svg className="stat-icon" viewBox="0 0 24 24" aria-hidden>
                <rect x="2.4" y="2.4" width="19.2" height="19.2" rx="6.2" fill="#ffffff" />
                <path
                  d="M12 7.1v7.4M8.15 12.35L12 16.2l3.85-3.85"
                  fill="none"
                  stroke="#111"
                  strokeWidth="1.85"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Quotes in 6 minutes, down from 3 hours</span>
            </div>

            <div className="stat appear appear--stat" style={delay("1.44s")}>
              <svg className="stat-icon stat-icon-wide" viewBox="0 0 40 22" aria-hidden>
                <circle cx="10.2" cy="11" r="9.2" fill="#2b2b2b" />
                <ellipse cx="10.2" cy="12.1" rx="4.15" ry="3.7" fill="#f4f4f4" />
                <circle cx="8.6" cy="11.2" r="0.7" fill="#1a1a1a" />
                <circle cx="11.8" cy="11.2" r="0.7" fill="#1a1a1a" />
                <circle cx="20.2" cy="11" r="9.2" fill="#ffffff" />
                <circle cx="17.6" cy="9.4" r="1.7" fill="#111" />
                <circle cx="22.8" cy="9.4" r="1.7" fill="#111" />
                <path d="M16.9 14.6Q20.2 17.4 23.5 14.6" fill="none" stroke="#111" strokeWidth="1.2" strokeLinecap="round" />
                <circle cx="30.2" cy="11" r="9.2" fill="#ffb347" />
                <text x="30.2" y="15.1" fontSize="12.5" fontWeight="700" textAnchor="middle" fill="#111" fontFamily="Inter, system-ui, sans-serif">
                  N
                </text>
              </svg>
              <span>Trusted by 25+ operations teams</span>
            </div>
          </div>
        </section>

        <AgentSection />
        <ServicesSection />
        <WorkSection />
        <ProcessSection />
        <PricingSection />
        <ClientsSection />
        <TeamSection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
