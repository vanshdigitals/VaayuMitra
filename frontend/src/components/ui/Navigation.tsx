'use client';

import Link from 'next/link';
import { LayoutDashboard, Activity, Lightbulb, Target, MessageSquare, Leaf } from 'lucide-react';

const TABS = [
  { href: '/dashboard', Icon: LayoutDashboard, label: 'Home',     id: 'dashboard' },
  { href: '/track',     Icon: Activity,         label: 'Track',    id: 'track'     },
  { href: '/insights',  Icon: Lightbulb,         label: 'Insights', id: 'insights'  },
  { href: '/dashboard', Icon: Target,            label: 'Goals',    id: 'goals'     },
  { href: '/chat',      Icon: MessageSquare,     label: 'Chat',     id: 'chat'      },
];

interface NavTabBarProps { active: 'dashboard' | 'track' | 'insights' | 'goals' | 'chat'; }

export function NavTabBar({ active }: NavTabBarProps) {
  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        height: 60,
        background: '#252219',
        borderTop: '1px solid rgba(242,239,227,0.08)',
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        paddingBottom: 'env(safe-area-inset-bottom)',
        zIndex: 100,
        backdropFilter: 'blur(12px)',
      }}
    >
      {TABS.map(({ href, Icon, label, id }) => {
        const isActive = active === id;
        return (
          <Link
            key={id}
            href={href}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              padding: '6px 14px', minWidth: 52, minHeight: 44,
              justifyContent: 'center',
              color: isActive ? '#D4A853' : '#6B6454',
              textDecoration: 'none',
              fontFamily: "'Cabinet Grotesk', 'DM Sans', system-ui, sans-serif",
              fontSize: 10,
              fontWeight: isActive ? 600 : 400,
              letterSpacing: '0.02em',
              transition: 'color var(--duration-fast) var(--ease-out)',
              position: 'relative',
            }}
          >
            <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
            {label}
            {isActive && (
              <div style={{
                position: 'absolute', bottom: 2,
                width: 4, height: 4, borderRadius: '50%',
                background: '#D4A853',
              }} />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

interface AppHeaderProps {
  title?: string;
  backHref?: string;
  backLabel?: string;
  rightSlot?: React.ReactNode;
  showLogo?: boolean;
}

export function AppHeader({ title, backHref, backLabel = 'Back', rightSlot, showLogo }: AppHeaderProps) {
  return (
    <header
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '0 16px', height: 64,
        position: 'sticky', top: 0,
        background: 'rgba(17,16,9,0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(242,239,227,0.06)',
        zIndex: 40,
      }}
    >
      {backHref && (
        <Link
          href={backHref}
          aria-label={`Back to ${backLabel}`}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            color: '#A09880', textDecoration: 'none', fontSize: 14,
            fontFamily: "'Cabinet Grotesk', 'DM Sans', system-ui, sans-serif",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          {backLabel}
        </Link>
      )}

      {showLogo && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'rgba(212,168,83,0.10)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Leaf size={16} strokeWidth={1.5} color="#D4A853" />
          </div>
          <span style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: 20, fontWeight: 600, color: '#D4A853', letterSpacing: '-0.01em',
          }}>VaayuMitra</span>
          <span style={{ fontSize: 11, color: '#6B6454', letterSpacing: '0.08em' }}>वायुमित्र</span>
        </div>
      )}

      {title && !showLogo && (
        <h1 style={{
          fontFamily: "'Cabinet Grotesk', 'DM Sans', system-ui, sans-serif",
          fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em',
          color: '#F2EFE3', flex: 1,
        }}>
          {title}
        </h1>
      )}

      {rightSlot && <div style={{ marginLeft: 'auto' }}>{rightSlot}</div>}
    </header>
  );
}
