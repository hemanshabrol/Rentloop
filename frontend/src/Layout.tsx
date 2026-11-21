// ============================================================================
// FILE: Layout.tsx
// Purpose: Reusable navigation headers, footers, and ProductCard shared
//          across Homepage, Marketplace, ListItem, Dashboard, Login, & Signup.
// ============================================================================

import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { brandConfig } from './config/brand';
import { RentalItem } from './data';
import { supabase, useAuthSession } from './supabaseClient';
import { HealthResponse } from './types/api';

// Reusable Product Card shared by Homepage and Marketplace
export function ProductCard({ item }: { item: RentalItem }) {
  const detailPath = `/product/${item.id}`;

  return (
    <article className="product-item group flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
      <Link to={detailPath} className="relative aspect-[4/3] w-full overflow-hidden bg-surface-container-high block">
        <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={item.imageAlt} src={item.imageUrl} />
        <div className="absolute top-space-sm left-space-sm bg-surface-container-lowest/95 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-secondary" />
          <span className="font-label-sm text-label-sm text-primary font-semibold">Available now</span>
        </div>
        <span className="absolute bottom-space-sm right-space-sm bg-primary/80 text-on-primary font-label-sm text-label-sm px-2 py-0.5 rounded-md">
          {item.categoryLabel}
        </span>
      </Link>
      <div className="p-space-md flex flex-col flex-1 justify-between gap-space-md">
        <div>
          <Link to={detailPath} className="block">
            <h3 className="font-title-md text-title-md text-primary font-bold line-clamp-1 group-hover:text-secondary transition-colors">
              {item.name}
            </h3>
          </Link>
          <div className="flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm mt-1">
            <span className="material-symbols-outlined text-[16px] text-secondary">location_on</span>
            <span>{item.ownerAndLocation}</span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-space-xs border-t border-surface-container-high">
          <div className="flex items-baseline gap-1">
            <span className="font-headline-sm text-headline-sm text-primary font-bold">
              {brandConfig.currencySymbol}{item.pricePerDay}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">/ day</span>
          </div>
          <Link to={detailPath} className="bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md px-space-md py-2 rounded-lg transition-colors shadow-sm">
            Rent
          </Link>
        </div>
      </div>
    </article>
  );
}

function BrandLogo() {
  return (
    <Link className="flex items-center gap-2.5 group text-left" to="/">
      <div className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center text-secondary-fixed shadow-sm">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.74-8z" />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="font-headline-sm text-[19px] leading-tight text-primary tracking-tight font-bold">
          {brandConfig.appName}
        </span>
        <span className="font-body-sm text-[11px] leading-none text-on-surface-variant font-normal">
          {brandConfig.tagline}
        </span>
      </div>
    </Link>
  );
}

// Top Sticky Header shared across Homepage, Marketplace, List Your Item, and Owner Dashboard
export function Navbar({ activePage }: { activePage?: 'home' | 'marketplace' | 'list-item' | 'dashboard' }) {
  const navigate = useNavigate();
  const { session } = useAuthSession();
  const isMarketplace = activePage === 'marketplace';
  const isListItem = activePage === 'list-item';
  const isDashboard = activePage === 'dashboard';

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/login');
  }

  return (
    <header
      className="sticky top-0 z-50 w-full transition-colors px-margin-mobile md:px-margin"
      style={{ height: '70px', backgroundColor: '#F8F7F3', borderBottom: '1px solid #E7E5DF' }}
    >
      <div className="h-full w-full max-w-7xl mx-auto flex items-center justify-between">
        <BrandLogo />
        <nav className="hidden md:flex items-center gap-8">
          <Link
            className={`font-label-md text-label-md relative py-1 transition-colors flex items-center ${
              isMarketplace ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface font-medium'
            }`}
            to="/marketplace"
          >
            <span>Explore</span>
            {isMarketplace && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-full" />}
          </Link>
          <Link
            className={`font-label-md text-label-md relative py-1 transition-colors flex items-center ${
              isDashboard ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface font-medium'
            }`}
            to="/dashboard/owner"
          >
            <span>Dashboard</span>
            {isDashboard && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-full" />}
          </Link>
          <a className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors font-medium" href="/#how-it-works">
            How it works
          </a>
        </nav>
        <div className="flex items-center gap-5">
          <Link
            className={`hidden sm:inline font-label-md text-label-md transition-colors ${
              isListItem ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface font-medium'
            }`}
            to="/listings/new"
          >
            List an item
          </Link>
          {session ? (
            <>
              <span className="hidden lg:inline font-body-sm text-body-sm text-on-surface-variant truncate max-w-[180px]" title={session.user.email}>
                {session.user.email}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="font-label-md text-label-md text-primary border border-outline-variant hover:bg-surface-container-high px-4 py-2 rounded-lg transition-colors font-semibold"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface font-medium transition-colors" to="/login">
                Log in
              </Link>
              <Link
                className="font-label-md text-label-md text-white px-5 py-2.5 rounded-lg transition-all shadow-sm font-semibold"
                to="/signup"
                style={{ backgroundColor: '#0F766E' }}
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

const FOOTER_EXPLORE_LINKS = [
  { to: '/marketplace?category=audio', label: 'Electronics' },
  { to: '/marketplace?category=photography', label: 'Photography' },
  { to: '/marketplace?category=mobility', label: 'Sports' },
  { to: '/marketplace?category=academic', label: 'Academic' },
  { to: '/marketplace?category=event', label: 'Event Equipment' },
];

// 4-Column Footer used across pages
export function Footer({ health, backendOffline }: { health?: HealthResponse | null; backendOffline?: boolean }) {
  const isConnected = health?.status === 'ok';
  return (
    <footer className="w-full bg-surface-container-low border-t border-surface-container-high mt-space-xl">
      <div className="w-full max-w-7xl mx-auto px-margin-mobile md:px-margin pt-space-xl pb-space-lg">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter mb-space-xl">
          <div className="md:col-span-4 flex flex-col gap-space-sm">
            <div className="flex items-center gap-space-sm">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary">
                <span className="material-symbols-outlined text-[18px] text-secondary-fixed">all_inclusive</span>
              </div>
              <span className="font-headline-sm text-headline-sm text-primary tracking-tight font-bold">{brandConfig.appName}</span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xs mt-space-xs">{brandConfig.tagline}</p>
          </div>
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-gutter">
            <div className="flex flex-col gap-space-sm">
              <span className="font-label-md text-label-md text-primary font-bold uppercase tracking-wider">Explore</span>
              <ul className="flex flex-col gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
                {FOOTER_EXPLORE_LINKS.map((link) => (
                  <li key={link.to}><Link className="hover:text-on-surface" to={link.to}>{link.label}</Link></li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-space-sm">
              <span className="font-label-md text-label-md text-primary font-bold uppercase tracking-wider">Platform</span>
              <ul className="flex flex-col gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
                <li><a className="hover:text-on-surface" href="/#how-it-works">How it works</a></li>
                <li><Link className="hover:text-on-surface" to="/listings/new">List an item</Link></li>
                <li><Link className="hover:text-on-surface" to="/dashboard/owner">Owner Dashboard</Link></li>
                <li><a className="hover:text-on-surface" href="#guidelines">Guidelines</a></li>
              </ul>
            </div>
            <div className="flex flex-col gap-space-sm">
              <span className="font-label-md text-label-md text-primary font-bold uppercase tracking-wider">Company</span>
              <ul className="flex flex-col gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
                <li><a className="hover:text-on-surface" href="#about">About</a></li>
                <li><a className="hover:text-on-surface" href="#contact">Contact</a></li>
                <li><a className="hover:text-on-surface" href="#terms">Terms</a></li>
                <li><a className="hover:text-on-surface" href="#privacy">Privacy</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="pt-space-lg border-t border-surface-container-high flex flex-col sm:flex-row items-center justify-between gap-space-md text-on-surface-variant font-body-sm text-body-sm">
          <p>© {brandConfig.copyrightYear} {brandConfig.legalEntity} All rights reserved.</p>
          <div className="flex items-center gap-space-lg">
            {health !== undefined && (
              <span data-testid="backend-status" className="inline-flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-secondary' : backendOffline ? 'bg-error' : 'bg-outline'}`} />
                <span>{isConnected ? `API Online (${health?.standard})` : backendOffline ? 'API Offline' : 'Connecting API...'}</span>
              </span>
            )}
            <a className="hover:text-on-surface" href="#terms">Terms of Service</a>
            <a className="hover:text-on-surface" href="#privacy">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Shared Wrapper for Login and Signup pages (Fixed Header + Minimal Footer)
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen flex flex-col justify-between">
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b px-6 md:px-12"
        style={{ height: '70px', backgroundColor: '#F8F7F3', borderBottom: '1px solid #E7E5DF' }}
      >
        <BrandLogo />
        <nav className="flex items-center gap-space-lg">
          <Link className="font-title-md text-title-md text-on-surface-variant hover:text-on-surface transition-colors" to="/marketplace">
            Explore Marketplace
          </Link>
          <a className="font-title-md text-title-md text-on-surface-variant hover:text-on-surface transition-colors" href="#help">
            Help
          </a>
        </nav>
      </header>
      <main className="w-full pt-20 flex-1 flex flex-col justify-center items-center bg-surface">
        {children}
      </main>
      <footer className="w-full bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-space-lg flex flex-col md:flex-row items-center justify-between gap-space-md">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-space-lg text-center font-label-md text-label-md text-on-surface-variant">
            <a className="hover:text-on-surface" href="#privacy-policy">Privacy Policy</a>
            <a className="hover:text-on-surface" href="#terms-of-service">Terms of Service</a>
            <a className="hover:text-on-surface" href="#community-guidelines">Community Guidelines</a>
          </div>
          <div className="font-body-sm text-body-sm text-on-surface-variant text-center md:text-right">
            © 2026 {brandConfig.appName} Technologies Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
