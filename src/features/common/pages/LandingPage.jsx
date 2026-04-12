import { Link } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { FEATURE_ROUTES } from '../../../app/router/featureRoutes'

const heroImageUrl =
  'https://cf.bstatic.com/xdata/images/hotel/max1024x768/443864191.jpg?k=0837457835c35fea09548980489550e0d70ede5cb8cef3af85e65551e4eecbe0&o='

const trustMetrics = [
  { label: 'Certified Hotels', value: '420+' },
  { label: 'Audits Completed', value: '1,900+' },
  { label: 'Traveler Searches', value: '78K+' },
]

const featureHighlights = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Reliable Certification Workflow',
    description: 'Manage end-to-end applications, document verification, and compliance milestones with role-based governance.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Evidence-Driven Audits',
    description: 'Track findings, risk insights, and recommendations in one place so every decision stays transparent and measurable.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    title: 'Public Trust Through Search',
    description: 'Expose verified hotel sustainability profiles for travelers and partners to discover trusted ethical destinations quickly.',
  },
]

const pillars = [
  'Environmental Stewardship',
  'Ethical Labor Practices',
  'Local Community Impact',
  'Transparent Governance',
  'ISO-Aligned Checkpoints',
  'Role-Based Workflows',
]

const journeySteps = [
  {
    title: 'Apply With Structured Evidence',
    detail: 'Hotels submit sustainability records, compliance documents, and improvement plans in one guided flow.',
  },
  {
    title: 'Audit And Verify Transparently',
    detail: 'Auditors review submissions with traceable findings, recommendations, and risk scoring.',
  },
  {
    title: 'Publish Trust Signals Publicly',
    detail: 'Approved properties appear in searchable listings so travelers can compare verified ethical standards.',
  },
]

const outcomeCards = [
  {
    tag: 'For Hotels',
    title: 'Visible Credibility',
    detail: 'Gain recognized certification, streamline renewals, and demonstrate measurable sustainability commitment to guests.',
  },
  {
    tag: 'For Auditors',
    title: 'Efficient Verification',
    detail: 'Reduce manual follow-up with digital workflows and consistent evidence tracking across every audit.',
  },
  {
    tag: 'For Travelers',
    title: 'Confident Choices',
    detail: 'Choose accommodations confidently with transparent, verified sustainability information at your fingertips.',
  },
]

const trustDots = [
  { bg: '#9FE1CB', color: '#085041', letter: 'H' },
  { bg: '#5DCAA5', color: '#085041', letter: 'A' },
  { bg: '#1D9E75', color: 'white', letter: 'T' },
  { bg: '#0F6E56', color: 'white', letter: '+' },
]

/* ─── Animate single element on scroll ─── */
function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('lp-revealed')
          io.unobserve(el)
        }
      },
      { threshold: 0.12 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return ref
}

/* ─── Staggered children reveal on scroll ─── */
function useStaggerReveal(staggerMs = 90) {
  const ref = useRef(null)
  useEffect(() => {
    const parent = ref.current
    if (!parent) return
    const children = [...parent.children]
    children.forEach((child, i) => {
      child.style.transitionDelay = `${i * staggerMs}ms`
    })
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          children.forEach((c) => c.classList.add('lp-revealed'))
          io.unobserve(parent)
        }
      },
      { threshold: 0.1 }
    )
    io.observe(parent)
    return () => io.disconnect()
  }, [])
  return ref
}

/* ─── Global styles injected once ─── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400&family=Instrument+Serif:ital@0;1&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .lp-root {
    font-family: 'Instrument Sans', sans-serif;
    color: #1a1a1a;
    background: #fafaf8;
    overflow-x: hidden;
  }

  /* ── Scroll-reveal base states ── */
  .lp-fade-up {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.65s cubic-bezier(0.22,1,0.36,1),
                transform 0.65s cubic-bezier(0.22,1,0.36,1);
  }
  .lp-scale-in {
    opacity: 0;
    transform: scale(0.95);
    transition: opacity 0.6s cubic-bezier(0.22,1,0.36,1),
                transform 0.6s cubic-bezier(0.22,1,0.36,1);
  }
  .lp-revealed {
    opacity: 1 !important;
    transform: none !important;
  }

  /* ── Hero entrance keyframes ── */
  @keyframes lpNavDrop {
    from { opacity: 0; transform: translateY(-14px); }
    to   { opacity: 1; transform: none; }
  }
  @keyframes lpFadeUp {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: none; }
  }
  @keyframes lpCardSlide {
    from { opacity: 0; transform: translateX(44px) scale(0.97); }
    to   { opacity: 1; transform: none; }
  }
  @keyframes lpStatPop {
    from { opacity: 0; transform: scale(0.78) translateX(14px); }
    to   { opacity: 1; transform: none; }
  }
  @keyframes lpBadgeSlide {
    from { opacity: 0; transform: translateX(-28px); }
    to   { opacity: 1; transform: none; }
  }
  @keyframes lpBadgeFloat {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-7px); }
  }
  @keyframes lpMarquee {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }

  .lp-anim-nav     { animation: lpNavDrop  0.55s cubic-bezier(0.22,1,0.36,1) 0.05s both; }
  .lp-anim-eyebrow { animation: lpFadeUp   0.6s  cubic-bezier(0.22,1,0.36,1) 0.15s both; }
  .lp-anim-title   { animation: lpFadeUp   0.7s  cubic-bezier(0.22,1,0.36,1) 0.28s both; }
  .lp-anim-lead    { animation: lpFadeUp   0.65s cubic-bezier(0.22,1,0.36,1) 0.42s both; }
  .lp-anim-actions { animation: lpFadeUp   0.6s  cubic-bezier(0.22,1,0.36,1) 0.54s both; }
  .lp-anim-trust   { animation: lpFadeUp   0.6s  cubic-bezier(0.22,1,0.36,1) 0.64s both; }
  .lp-anim-card    { animation: lpCardSlide 0.8s cubic-bezier(0.22,1,0.36,1) 0.30s both; }
  .lp-anim-stat    { animation: lpStatPop  0.6s  cubic-bezier(0.22,1,0.36,1) 0.72s both; }
  .lp-anim-badge   { animation: lpBadgeSlide 0.6s cubic-bezier(0.22,1,0.36,1) 0.84s both; }
  .lp-anim-float   { animation: lpBadgeFloat 3.6s ease-in-out 1.3s infinite; }

  /* ── Marquee ── */
  .lp-marquee-outer {
    overflow: hidden;
    border-top: 0.5px solid #e0e0d8;
    border-bottom: 0.5px solid #e0e0d8;
    padding: 1rem 0;
    margin: 0 -1.5rem 4rem;
  }
  .lp-marquee-track {
    display: flex;
    gap: 12px;
    width: max-content;
    animation: lpMarquee 24s linear infinite;
  }
  .lp-marquee-track:hover { animation-play-state: paused; }

  /* ── Hover micro-interactions ── */
  .lp-feature-card {
    transition: transform 0.3s cubic-bezier(0.22,1,0.36,1),
                box-shadow 0.3s ease;
  }
  .lp-feature-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 14px 36px rgba(29,158,117,0.11);
  }
  .lp-outcome-card {
    transition: transform 0.3s cubic-bezier(0.22,1,0.36,1);
  }
  .lp-outcome-card:hover { transform: translateY(-4px); }

  .lp-step-num {
    transition: transform 0.3s cubic-bezier(0.22,1,0.36,1),
                box-shadow 0.3s ease;
  }
  .lp-journey-step:hover .lp-step-num {
    transform: scale(1.14);
    box-shadow: 0 0 0 7px rgba(29,158,117,0.14);
  }

  .lp-btn-primary {
    transition: background 0.2s ease, transform 0.2s ease;
  }
  .lp-btn-primary:hover { background: #0F6E56 !important; transform: translateY(-1px); }

  .lp-btn-secondary {
    transition: background 0.2s ease;
  }
  .lp-btn-secondary:hover { background: #f0f0ec !important; }

  .lp-nav-cta {
    transition: background 0.2s ease, transform 0.2s ease;
  }
  .lp-nav-cta:hover { background: #0F6E56 !important; transform: translateY(-1px); }

  .lp-btn-white {
    transition: background 0.2s ease, transform 0.2s ease;
  }
  .lp-btn-white:hover { background: #E1F5EE !important; transform: translateY(-1px); }

  /* ── Image zoom on hover ── */
  .lp-hero-img-wrap { overflow: hidden; border-radius: 20px; }
  .lp-hero-img-inner {
    width: 100%; height: 100%; object-fit: cover; display: block;
    transition: transform 0.65s cubic-bezier(0.22,1,0.36,1);
  }
  .lp-hero-img-wrap:hover .lp-hero-img-inner { transform: scale(1.05); }
`

function LandingPage() {
  const metricsRef = useStaggerReveal(110)
  const featuresRef = useStaggerReveal(100)
  const journeyRef = useStaggerReveal(120)
  const outcomesRef = useStaggerReveal(100)
  const journeySecRef = useReveal()
  const outcomesSecRef = useReveal()
  const ctaRef = useReveal()

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div className="lp-root">
        <div style={{ width: '100%', margin: 0, padding: '0 1.5rem 4rem' }}>

          {/* ── NAV ── */}
          <nav
            className="lp-anim-nav"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 0 2.5rem' }}
          >
            <Link to={FEATURE_ROUTES.login} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 16, fontWeight: 600, color: '#1a1a1a', textDecoration: 'none', letterSpacing: '-0.01em' }}>
              <div style={{ width: 32, height: 32, background: '#1D9E75', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: 'white' }}>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 13H8V9h2v6zm4 0h-2V9h2v6z" />
                </svg>
              </div>
              EthiCert
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', fontSize: 14, color: '#666' }}>
              {[
                ['About', FEATURE_ROUTES.about],
                ['Contact', FEATURE_ROUTES.contact],
                ['Privacy', FEATURE_ROUTES.privacy],
                ['Terms', FEATURE_ROUTES.terms],
              ].map(([label, route]) => (
                <Link key={label} to={route} style={{ color: '#666', textDecoration: 'none' }}>{label}</Link>
              ))}
            </div>

            <Link
              to={FEATURE_ROUTES.login}
              className="lp-nav-cta"
              style={{ background: '#1D9E75', color: 'white', padding: '9px 20px', borderRadius: 8, fontSize: 14, fontWeight: 500, textDecoration: 'none', display: 'inline-block' }}
            >
              Sign In
            </Link>
          </nav>

          {/* ── HERO ── */}
          <header style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', padding: '3rem 0 4rem' }}>
            <div>
              <p className="lp-anim-eyebrow" style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1D9E75', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'inline-block', width: 24, height: 2, background: '#1D9E75', borderRadius: 2 }} />
                Ethical Tourism Certification System
              </p>

              <h1 className="lp-anim-title" style={{ fontFamily: "'Instrument Serif', serif", fontSize: 48, fontWeight: 400, lineHeight: 1.1, color: '#1a1a1a', margin: '0 0 1.25rem', letterSpacing: '-0.01em' }}>
                Build trust in{' '}
                <em style={{ fontStyle: 'italic', color: '#1D9E75' }}>sustainable travel</em>{' '}
                with a platform designed for impact.
              </h1>

              <p className="lp-anim-lead" style={{ fontSize: 16, color: '#555', lineHeight: 1.75, marginBottom: '2rem' }}>
                From hotel onboarding to audit decisions and public discovery, manage every step in a
                secure, transparent, and modern certification ecosystem.
              </p>

              <div className="lp-anim-actions" style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: '2.5rem' }}>
                <Link
                  to={FEATURE_ROUTES.register}
                  className="lp-btn-primary"
                  style={{ background: '#1D9E75', color: 'white', padding: '13px 26px', borderRadius: 9, fontSize: 15, fontWeight: 500, textDecoration: 'none', display: 'inline-block' }}
                >
                  Start Certification Journey
                </Link>
                <Link
                  to={FEATURE_ROUTES.login}
                  className="lp-btn-secondary"
                  style={{ background: 'transparent', color: '#1a1a1a', border: '1px solid #d0d0c8', padding: '12px 26px', borderRadius: 9, fontSize: 15, textDecoration: 'none', display: 'inline-block' }}
                >
                  Sign In
                </Link>
              </div>

              <div className="lp-anim-trust" style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#555' }}>
                <div style={{ display: 'flex' }}>
                  {trustDots.map((dot, i) => (
                    <div
                      key={i}
                      style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid #fafaf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 500, background: dot.bg, color: dot.color, marginLeft: i === 0 ? 0 : -6 }}
                    >
                      {dot.letter}
                    </div>
                  ))}
                </div>
                <span>Trusted by auditors &amp; eco-conscious travelers</span>
              </div>
            </div>

            {/* Hero image card */}
            <aside aria-label="Program highlights" className="lp-anim-card" style={{ position: 'relative' }}>
              <div
                className="lp-anim-stat"
                style={{ position: 'absolute', top: 24, right: -16, background: '#1D9E75', borderRadius: 12, padding: '12px 18px', textAlign: 'center', zIndex: 1 }}
              >
                <div style={{ fontSize: 22, fontWeight: 600, color: 'white', lineHeight: 1, marginBottom: 4 }}>420+</div>
                <div style={{ fontSize: 11, color: '#9FE1CB' }}>Certified Hotels</div>
              </div>

              <div className="lp-hero-img-wrap" style={{ aspectRatio: '4/3', background: '#E1F5EE' }}>
                <img src={heroImageUrl} alt="Sustainable travel destination" className="lp-hero-img-inner" />
              </div>

              <div
                className="lp-anim-badge lp-anim-float"
                style={{ position: 'absolute', bottom: 24, left: -24, background: 'white', border: '0.5px solid #e0e0d8', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', zIndex: 1 }}
              >
                <div style={{ width: 36, height: 36, background: '#E1F5EE', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>Latest Audit</p>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a' }}>ISO Verified</p>
                </div>
              </div>
            </aside>
          </header>

          {/* ── MARQUEE PILLARS ── */}
          <div className="lp-marquee-outer">
            <div className="lp-marquee-track">
              {[...pillars, ...pillars].map((p, i) => (
                <span key={i} style={{ background: '#f0f0ec', border: '0.5px solid #e0e0d8', borderRadius: 999, padding: '7px 18px', fontSize: 13, color: '#555', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* ── METRICS ── */}
          <section
            ref={metricsRef}
            aria-label="Platform trust metrics"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: '#e0e0d8', borderRadius: 16, overflow: 'hidden', marginBottom: '4rem' }}
          >
            {trustMetrics.map((m) => (
              <article key={m.label} className="lp-fade-up" style={{ background: '#fafaf8', padding: '2rem 1.5rem', textAlign: 'center' }}>
                <p style={{ fontFamily: "'Instrument Serif', serif", fontSize: 40, fontWeight: 400, color: '#1D9E75', marginBottom: 4, letterSpacing: '-0.02em' }}>{m.value}</p>
                <p style={{ fontSize: 14, color: '#666' }}>{m.label}</p>
              </article>
            ))}
          </section>

          {/* ── FEATURES ── */}
          <section aria-label="Core platform features" style={{ marginBottom: '4rem' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1D9E75', marginBottom: '0.5rem' }}>Core Platform Features</p>
              <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 34, fontWeight: 400, color: '#1a1a1a', marginBottom: '1rem', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                Everything you need to certify with confidence
              </h2>
              <p style={{ fontSize: 15, color: '#666', lineHeight: 1.7, margin: '0 auto 0.75rem', maxWidth: 540 }}>
                A single ecosystem purpose-built for hotels, auditors, and travelers to collaborate transparently.
              </p>
              <div
                aria-hidden="true"
                style={{
                  width: 120,
                  height: 2,
                  background: '#e0e0d8',
                  borderRadius: 999,
                  margin: '0 auto 1.25rem',
                }}
              />
            </div>
            <div ref={featuresRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem' }}>
              {featureHighlights.map((f) => (
                <article key={f.title} className="lp-fade-up lp-feature-card" style={{ background: 'white', border: '0.5px solid #e0e0d8', borderRadius: 16, padding: '1.5rem' }}>
                  <div style={{ width: 40, height: 40, background: '#E1F5EE', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>{f.icon}</div>
                  <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 8, color: '#1a1a1a', letterSpacing: '-0.01em' }}>{f.title}</h3>
                  <p style={{ fontSize: 13, color: '#666', lineHeight: 1.65 }}>{f.description}</p>
                </article>
              ))}
            </div>
          </section>

          {/* ── JOURNEY ── */}
          <section
            ref={journeySecRef}
            aria-label="How the certification journey works"
            className="lp-fade-up"
            style={{ background: '#f0f0ec', borderRadius: 20, padding: '3rem', marginBottom: '4rem' }}
          >
            <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1D9E75', marginBottom: '0.5rem' }}>How It Works</p>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 34, fontWeight: 400, color: '#1a1a1a', lineHeight: 1.2, letterSpacing: '-0.01em', marginBottom: 0 }}>
              A clear path from application to public trust
            </h2>
            <div ref={journeyRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '2rem', marginTop: '2rem', position: 'relative' }}>
              <div aria-hidden="true" style={{ position: 'absolute', top: 20, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg, #1D9E75, #5DCAA5, #1D9E75)', opacity: 0.25, pointerEvents: 'none' }} />
              {journeySteps.map((step, i) => (
                <article key={step.title} className="lp-fade-up lp-journey-step" style={{ position: 'relative' }}>
                  <div className="lp-step-num" style={{ width: 40, height: 40, background: '#1D9E75', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 500, color: 'white', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
                    {i + 1}
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 8, color: '#1a1a1a', letterSpacing: '-0.01em' }}>{step.title}</h3>
                  <p style={{ fontSize: 13, color: '#666', lineHeight: 1.65 }}>{step.detail}</p>
                </article>
              ))}
            </div>
          </section>

          {/* ── OUTCOMES ── */}
          <section ref={outcomesSecRef} aria-label="Platform outcomes" className="lp-fade-up" style={{ marginBottom: '4rem' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1D9E75', marginBottom: '0.5rem' }}>Who Benefits</p>
              <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 34, fontWeight: 400, color: '#1a1a1a', marginBottom: '1rem', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                Built for every stakeholder
              </h2>
              <p style={{ fontSize: 15, color: '#666', lineHeight: 1.7, margin: '0 auto 2.5rem', maxWidth: 540 }}>
                Whether you're a hotel seeking credibility, an auditor streamlining workflows, or a traveler making informed choices — EthiCert delivers.
              </p>
            </div>
            <div ref={outcomesRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem' }}>
              {outcomeCards.map((item) => (
                <article key={item.title} className="lp-fade-up lp-outcome-card" style={{ border: '0.5px solid #e0e0d8', borderRadius: 16, padding: '1.5rem', position: 'relative', overflow: 'hidden', background: 'white' }}>
                  <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#1D9E75' }} />
                  <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#1D9E75', marginBottom: '0.75rem' }}>{item.tag}</p>
                  <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 8, color: '#1a1a1a', letterSpacing: '-0.01em' }}>{item.title}</h3>
                  <p style={{ fontSize: 13, color: '#666', lineHeight: 1.65 }}>{item.detail}</p>
                </article>
              ))}
            </div>
          </section>

          {/* ── CTA ── */}
          <section
            ref={ctaRef}
            aria-label="Get started"
            className="lp-scale-in"
            style={{ background: '#085041', borderRadius: 20, padding: '3.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' }}
          >
            <div>
              <p style={{ fontSize: 13, color: '#5DCAA5', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>Get started today</p>
              <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 30, fontWeight: 400, color: 'white', lineHeight: 1.2, maxWidth: 480, margin: 0, letterSpacing: '-0.01em' }}>
                Ready to move from compliance checklists to measurable sustainability leadership?
              </h2>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0 }}>
              <Link
                to={FEATURE_ROUTES.register}
                className="lp-btn-white"
                style={{ background: 'white', color: '#085041', padding: '13px 26px', borderRadius: 9, fontSize: 15, fontWeight: 500, textDecoration: 'none', display: 'inline-block', whiteSpace: 'nowrap' }}
              >
                Start Certification Journey
              </Link>
              <Link
                to={FEATURE_ROUTES.about}
                style={{ background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '12px 26px', borderRadius: 9, fontSize: 15, textDecoration: 'none', display: 'inline-block', whiteSpace: 'nowrap', transition: 'background 0.2s ease' }}
              >
                Learn More
              </Link>
            </div>
          </section>

          {/* ── FOOTER ── */}
          <footer
            aria-label="Footer"
            style={{
              marginTop: '4rem',
              paddingTop: '2rem',
              borderTop: '0.5px solid #e0e0d8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
              color: '#666',
              fontSize: 13,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, background: '#1D9E75', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'white' }}>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 13H8V9h2v6zm4 0h-2V9h2v6z" />
                </svg>
              </div>
              <span style={{ color: '#1a1a1a', fontWeight: 600, letterSpacing: '-0.01em' }}>EthiCert</span>
            </div>

            <nav aria-label="Footer links" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
              <Link to={FEATURE_ROUTES.about} style={{ color: '#666', textDecoration: 'none' }}>About</Link>
              <Link to={FEATURE_ROUTES.contact} style={{ color: '#666', textDecoration: 'none' }}>Contact</Link>
              <Link to={FEATURE_ROUTES.privacy} style={{ color: '#666', textDecoration: 'none' }}>Privacy</Link>
              <Link to={FEATURE_ROUTES.terms} style={{ color: '#666', textDecoration: 'none' }}>Terms</Link>
            </nav>

            <div style={{ color: '#888' }}>
              © {new Date().getFullYear()} EthiCert. All rights reserved.
            </div>
          </footer>

        </div>
      </div>
    </>
  )
}

export default LandingPage