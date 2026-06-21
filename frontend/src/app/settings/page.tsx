'use client';

import Link from 'next/link';
import { NavTabBar, AppHeader } from '@/components/ui/Navigation';
import {
  Info, Shield, Trash2, ExternalLink, Leaf,
  Database, Bot, Globe,
} from 'lucide-react';

const S = "'Cabinet Grotesk', 'DM Sans', system-ui, sans-serif";
const F = "'Fraunces', Georgia, serif";
const M = "'JetBrains Mono', monospace";

export default function SettingsPage() {
  return (
    <div style={{ minHeight: '100dvh', background: '#111009', color: '#F2EFE3', fontFamily: S, paddingBottom: 76 }}>

      <AppHeader title="Settings" backHref="/dashboard" backLabel="Dashboard" />

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px' }}>

        {/* ── App Info ──────────────────────────────────────── */}
        <section aria-labelledby="about-h" style={{ marginBottom: 20 }}>
          <h2 id="about-h" style={{ fontSize: 11, color: '#6B6454', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>
            About
          </h2>
          <div style={{ background: '#1C1A14', border: '1px solid rgba(242,239,227,0.08)', borderRadius: 16, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(212,168,83,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Leaf size={22} strokeWidth={1.5} color="#D4A853" />
              </div>
              <div>
                <div style={{ fontFamily: F, fontSize: 18, fontWeight: 600, color: '#D4A853', letterSpacing: '-0.01em' }}>VaayuMitra</div>
                <div style={{ fontSize: 12, color: '#6B6454', fontFamily: M, marginTop: 2 }}>वायुमित्र · v1.0</div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: '#A09880', lineHeight: 1.65, marginBottom: 16 }}>
              India&apos;s first AI-powered carbon footprint tracker. Built for Indian households
              using CEA v21.0 emission factors, India GHG Program data, and Gemini AI.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#A09880' }}>
                <Database size={14} strokeWidth={1.5} color="#D4A853" />
                CEA CO₂ Baseline v21.0 · FY2024-25
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#A09880' }}>
                <Bot size={14} strokeWidth={1.5} color="#5A9ED1" />
                Powered by Google Gemini AI (Vertex AI)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#A09880' }}>
                <Globe size={14} strokeWidth={1.5} color="#7BC47A" />
                India GHG Program (WRI/TERI/CII 2015)
              </div>
            </div>
          </div>
        </section>

        {/* ── Data & Privacy ────────────────────────────────── */}
        <section aria-labelledby="privacy-h" style={{ marginBottom: 20 }}>
          <h2 id="privacy-h" style={{ fontSize: 11, color: '#6B6454', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>
            Data & Privacy
          </h2>
          <div style={{ background: '#1C1A14', border: '1px solid rgba(242,239,227,0.08)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(242,239,227,0.06)', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(91,158,111,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                <Shield size={16} strokeWidth={1.5} color="#5B9E6F" />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Anonymous by Design</div>
                <p style={{ fontSize: 13, color: '#A09880', lineHeight: 1.6 }}>
                  No account required. Your data is identified only by a randomly generated device ID stored locally. We never collect your name, email, or personal information.
                </p>
              </div>
            </div>
            <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(90,158,209,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                <Info size={16} strokeWidth={1.5} color="#5A9ED1" />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Local Storage</div>
                <p style={{ fontSize: 13, color: '#A09880', lineHeight: 1.6 }}>
                  Your footprint calculations, profile, and history are stored in your browser&apos;s local storage. Clearing your browser data will erase your history.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Links ──────────────────────────────────────────── */}
        <section aria-labelledby="links-h" style={{ marginBottom: 20 }}>
          <h2 id="links-h" style={{ fontSize: 11, color: '#6B6454', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>
            Resources
          </h2>
          <div style={{ background: '#1C1A14', border: '1px solid rgba(242,239,227,0.08)', borderRadius: 16, overflow: 'hidden' }}>
            {[
              { label: 'View Source on GitHub', href: 'https://github.com/vanshdigitals/VaayuMitra' },
              { label: 'CEA Emission Factor Data', href: 'https://cea.nic.in' },
              { label: 'India GHG Program', href: 'https://www.indiaghgp.org' },
            ].map(({ label, href }, i, arr) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 20px',
                  borderBottom: i < arr.length - 1 ? '1px solid rgba(242,239,227,0.06)' : 'none',
                  color: '#A09880', fontSize: 14, textDecoration: 'none',
                  transition: 'color 150ms',
                }}
              >
                {label}
                <ExternalLink size={14} strokeWidth={1.5} />
              </a>
            ))}
          </div>
        </section>

        {/* ── Danger Zone ────────────────────────────────────── */}
        <section aria-labelledby="danger-h">
          <h2 id="danger-h" style={{ fontSize: 11, color: '#6B6454', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>
            Danger Zone
          </h2>
          <button
            id="clear-data-btn"
            onClick={() => {
              if (typeof window !== 'undefined') {
                localStorage.clear();
                window.location.href = '/onboarding';
              }
            }}
            aria-label="Clear all data and reset the app"
            style={{
              width: '100%', padding: '16px 20px',
              background: 'rgba(209,90,74,0.08)', border: '1px solid rgba(209,90,74,0.25)',
              borderRadius: 16, color: '#D15A4A', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: S,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              transition: 'background 150ms',
            }}
          >
            <Trash2 size={16} strokeWidth={1.5} />
            Clear All Data &amp; Reset App
          </button>
          <p style={{ fontSize: 11, color: '#6B6454', marginTop: 8, textAlign: 'center', fontFamily: M }}>
            This will delete all your local history and footprint data.
          </p>
        </section>

      </div>

      <NavTabBar active="dashboard" />
    </div>
  );
}
