'use client';

import Link from 'next/link';
import { CarbonRing } from '@/components/ui/CarbonRing';
import {
  Leaf, Database, Bot, Wifi, Shield, Zap, Bike,
  UtensilsCrossed, Globe, CheckCircle2, ArrowRight,
  Sparkles, TrendingDown,
} from 'lucide-react';

/* ─── Data ──────────────────────────────────────────────────────── */

const features = [
  { Icon: Bike,            title: '2-Wheeler Native',  desc: 'India GHG Program emission factors for petrol, CNG, and EV two-wheelers. Because most of India rides, not drives.' },
  { Icon: UtensilsCrossed, title: 'Indian Diet Data',  desc: 'Pathak et al. factors calibrated for Indian food patterns — dal, rice, roti. Not avocado toast.' },
  { Icon: Zap,             title: 'CEA Grid Factors',  desc: '0.71 kg CO₂/kWh — official FY2024-25 weighted average from the Central Electricity Authority.' },
  { Icon: Globe,           title: 'City Context',      desc: 'Mumbai, Delhi, Bengaluru, Chennai and more. Regional data makes your score actually accurate.' },
  { Icon: Bot,             title: 'Gemini AI Insights', desc: 'Powered by Google Vertex AI. Finds your biggest impact opportunities, quantified in kg CO₂ and ₹ saved.' },
  { Icon: Shield,          title: 'Private by Design', desc: 'No account required. No data stored on our servers. Your footprint stays on your device.' },
];

const trustItems = [
  { Icon: Database, label: 'CEA v21.0 Data' },
  { Icon: Bot,      label: 'Gemini AI' },
  { Icon: Wifi,     label: 'Works Offline' },
  { Icon: Shield,   label: 'No Login Needed' },
];

const steps = [
  { n: '01', title: 'Share your lifestyle',   desc: '5 quick questions about your commute, cooking, and energy use. Takes under 2 minutes.' },
  { n: '02', title: 'See your India footprint', desc: 'Calculated using CEA grid data and India GHG Program emission factors — built for us.' },
  { n: '03', title: 'Get AI-powered actions', desc: 'Gemini finds your biggest impact opportunities, quantified in kg CO₂ saved and ₹ in your pocket.' },
];

/* ─── Component ──────────────────────────────────────────────────── */

export default function LandingPage() {
  const F = "'Fraunces', Georgia, serif";
  const S = "'Cabinet Grotesk', 'DM Sans', system-ui, sans-serif";
  const M = "'JetBrains Mono', monospace";

  return (
    <div style={{ minHeight: '100dvh', background: '#111009', color: '#F2EFE3', fontFamily: S }}>
      <style>{`
        .cta-btn:hover { opacity: 0.88; transform: translateY(-1px); }
        .feature-card:hover { border-color: rgba(212,168,83,0.20) !important; transform: translateY(-2px); }
      `}</style>

      {/* ── Nav ─────────────────────────────────────────────────── */}
      <nav role="navigation" aria-label="Main navigation" style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: 64,
        background: 'rgba(17,16,9,0.92)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(242,239,227,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(212,168,83,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Leaf size={16} strokeWidth={1.5} color="#D4A853" />
          </div>
          <span style={{ fontFamily: F, fontSize: 20, fontWeight: 600, color: '#D4A853', letterSpacing: '-0.01em' }}>VaayuMitra</span>
          <span style={{ fontSize: 11, color: '#6B6454', letterSpacing: '0.08em' }}>वायुमित्र</span>
        </div>
        <Link href="/onboarding" aria-label="Sign in" style={{ fontSize: 13, color: '#A09880', textDecoration: 'none', fontWeight: 500 }}>
          Sign in
        </Link>
      </nav>

      <main>
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section aria-labelledby="hero-heading" style={{ maxWidth: 640, margin: '0 auto', padding: '96px 24px 48px', textAlign: 'center', animation: 'fadeUp .6s ease both' }}>

          {/* Eyebrow */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', marginBottom: 32, background: 'rgba(212,168,83,0.08)', border: '1px solid rgba(212,168,83,0.18)', borderRadius: 9999, fontSize: 11, color: '#D4A853', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            <Sparkles size={11} strokeWidth={1.5} />
            India&apos;s first AI carbon companion
          </div>

          {/* Heading */}
          <h1 id="hero-heading" style={{ fontFamily: F, fontSize: 'clamp(42px, 9vw, 80px)', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 24 }}>
            Built for how{' '}
            <span style={{ color: '#D4A853' }}>India</span>
            {' '}actually lives.
          </h1>

          {/* Sub */}
          <p style={{ fontSize: 'clamp(15px, 2.5vw, 18px)', color: '#A09880', lineHeight: 1.65, maxWidth: 460, margin: '0 auto 48px' }}>
            Not for UK homeowners. Not for car-driving suburbanites.{' '}
            <strong style={{ color: '#F2EFE3', fontWeight: 600 }}>For Metro commuters. For LPG users. For us.</strong>
          </p>

          {/* Carbon Score Preview */}
          <div role="img" aria-label="Animated preview of carbon score showing India average 1.84 tonnes CO₂ per year" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, marginBottom: 40, padding: '40px 32px', background: '#1C1A14', border: '1px solid rgba(212,168,83,0.18)', borderRadius: 24, animation: 'scaleIn .7s cubic-bezier(0.34,1.56,.64,1) .15s both' }}>
            <CarbonRing score={1.84} maxScore={2.5} size={168} animated />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ fontSize: 13, color: '#6B6454', letterSpacing: '0.04em', fontFamily: M }}>
                India avg · 1.84 t/yr
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#A09880' }}>
                <CheckCircle2 size={13} strokeWidth={1.5} color="#5B9E6F" />
                Your target: 1.2 t/yr — achievable
              </div>
            </div>
          </div>

          {/* CTA */}
          <Link id="hero-cta" href="/onboarding" aria-label="Calculate my carbon footprint, free, no signup required" className="cta-btn" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', maxWidth: 380, padding: '18px 32px', background: '#D4A853', color: '#111009', borderRadius: 10, fontFamily: S, fontWeight: 700, fontSize: 16, textDecoration: 'none', letterSpacing: '-0.01em', transition: 'opacity 150ms, transform 150ms' }}>
            Calculate My Footprint
            <ArrowRight size={18} strokeWidth={2} />
          </Link>
          <p style={{ marginTop: 14, fontSize: 13, color: '#6B6454' }}>2 minutes · 5 questions · No signup required</p>
        </section>

        {/* ── Trust Bar ────────────────────────────────────────── */}
        <section aria-label="Trust indicators" style={{ borderTop: '1px solid rgba(242,239,227,0.06)', borderBottom: '1px solid rgba(242,239,227,0.06)' }}>
          <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', padding: '18px 24px' }}>
            {trustItems.map(({ Icon, label }, i) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0 20px', color: '#A09880', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' }}>
                  <Icon size={14} strokeWidth={1.5} />
                  {label}
                </div>
                {i < trustItems.length - 1 && <span style={{ width: 1, height: 16, background: 'rgba(242,239,227,0.10)', flexShrink: 0 }} />}
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ─────────────────────────────────────────── */}
        <section aria-labelledby="features-heading" style={{ maxWidth: 960, margin: '0 auto', padding: '80px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 id="features-heading" style={{ fontFamily: F, fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 600, letterSpacing: '-0.025em', marginBottom: 12 }}>
              Built for Indian Life
            </h2>
            <p style={{ color: '#A09880', fontSize: 15, maxWidth: 440, margin: '0 auto' }}>
              Most carbon apps assume you drive a car and heat your home. We don&apos;t.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(272px, 1fr))', gap: 14 }}>
            {features.map(({ Icon, title, desc }) => (
              <div key={title} className="feature-card" style={{ padding: '28px 24px', background: '#1C1A14', border: '1px solid rgba(242,239,227,0.08)', borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 14, transition: 'border-color 200ms, transform 200ms' }}>
                <div style={{ width: 40, height: 40, background: 'rgba(212,168,83,0.10)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} strokeWidth={1.5} color="#D4A853" />
                </div>
                <div>
                  <div style={{ fontFamily: S, fontSize: 16, fontWeight: 600, color: '#F2EFE3', marginBottom: 8, letterSpacing: '-0.01em' }}>{title}</div>
                  <div style={{ fontSize: 13, color: '#A09880', lineHeight: 1.65 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── How It Works ─────────────────────────────────────── */}
        <section aria-labelledby="how-heading" style={{ maxWidth: 580, margin: '0 auto', padding: '0 24px 96px' }}>
          <div style={{ height: 1, background: 'rgba(242,239,227,0.06)', marginBottom: 80 }} />
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 id="how-heading" style={{ fontFamily: F, fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 600, letterSpacing: '-0.025em', marginBottom: 12 }}>
              How It Works
            </h2>
            <p style={{ color: '#A09880', fontSize: 15 }}>Simple. Fast. Accurate.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {steps.map(({ n, title, desc }, i) => (
              <div key={n} style={{ display: 'flex', gap: 20, alignItems: 'flex-start', paddingBottom: i < steps.length - 1 ? 40 : 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(212,168,83,0.10)', border: '1px solid rgba(212,168,83,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4A853', fontFamily: M, fontWeight: 700, fontSize: 12, letterSpacing: '0.02em' }}>{n}</div>
                  {i < steps.length - 1 && <div style={{ width: 1, flexGrow: 1, background: 'rgba(212,168,83,0.14)', marginTop: 8 }} />}
                </div>
                <div style={{ paddingTop: 10 }}>
                  <div style={{ fontFamily: S, fontWeight: 600, fontSize: 16, marginBottom: 8, color: '#F2EFE3', letterSpacing: '-0.01em' }}>{title}</div>
                  <div style={{ color: '#A09880', fontSize: 14, lineHeight: 1.65 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 56, textAlign: 'center' }}>
            <Link id="bottom-cta" href="/onboarding" aria-label="Start now, calculate your carbon footprint for free" className="cta-btn" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', maxWidth: 380, padding: '18px 32px', background: '#D4A853', color: '#111009', borderRadius: 10, fontFamily: S, fontWeight: 700, fontSize: 16, textDecoration: 'none', letterSpacing: '-0.01em', transition: 'opacity 150ms, transform 150ms' }}>
              Start Now — It&apos;s Free
              <ArrowRight size={18} strokeWidth={2} />
            </Link>
            <p style={{ marginTop: 14, fontSize: 12, color: '#6B6454' }}>No account · No tracking · India-calibrated data</p>
          </div>
        </section>

        {/* ── Footer ───────────────────────────────────────────── */}
        <footer role="contentinfo" style={{ borderTop: '1px solid rgba(242,239,227,0.06)', padding: '28px 24px', textAlign: 'center', color: '#6B6454', fontSize: 12, fontFamily: M }}>
          <p style={{ marginBottom: 12, lineHeight: 1.7 }}>
            Data: CEA CO₂ Baseline v21.0 · India GHG Program (WRI/TERI/CII 2015) · Pathak et al. 2010
          </p>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', fontFamily: S }}>
            <a href="https://github.com" aria-label="View source on GitHub" style={{ color: '#6B6454', textDecoration: 'none' }}>GitHub</a>
            <span>·</span>
            <a href="#" aria-label="Privacy policy" style={{ color: '#6B6454', textDecoration: 'none' }}>Privacy</a>
            <span>·</span>
            <a href="#" aria-label="About VaayuMitra" style={{ color: '#6B6454', textDecoration: 'none' }}>About</a>
          </div>
        </footer>
      </main>
    </div>
  );
}
