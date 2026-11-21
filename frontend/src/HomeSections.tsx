// ============================================================================
// FILE: HomeSections.tsx
// Purpose: Modular section components that make up the RentLoop Homepage.
// ============================================================================

import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { brandConfig } from './config/brand';
import { HERO_MOSAIC_IMAGES, HOME_CATEGORIES, HOW_IT_WORKS_STEPS, RentalItem } from './data';
import { ProductCard } from './Layout';
import { fetchMarketplaceListings } from './services/apiClient';

const HERO_BENEFITS = [
  'Campus peer-to-peer community',
  'Rent what you need',
  'Earn from things you own',
];

// 1. Hero Section: Value Proposition, Search Bar, Platform Benefits, and Campus Sharing Showcase
export function HeroSection() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchQuery.trim();
    navigate(query ? `/marketplace?search=${encodeURIComponent(query)}` : '/marketplace');
  }

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 items-center gap-12 lg:gap-16 pt-10 pb-16">
      <div className="lg:col-span-7 flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <span className="font-label-sm text-label-sm tracking-widest text-secondary font-bold uppercase">
            Campus Peer-to-Peer Rentals
          </span>
          <span className="w-8 h-px bg-outline-variant" />
        </div>
        <h1 className="font-display text-display text-primary tracking-tight leading-[1.08] text-4xl sm:text-5xl lg:text-[60px]">
          Good things are <br className="hidden sm:inline" />
          <span className="text-secondary italic font-serif font-normal">better shared.</span>
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
          Discover useful products shared by your campus community. Rent what you need, or make your unused things available to peers nearby.
        </p>

        <form onSubmit={handleSearchSubmit} className="w-full max-w-xl bg-surface-container-lowest rounded-xl p-2 shadow-md flex items-center gap-2">
          <span className="material-symbols-outlined pl-3 text-[22px] text-on-surface-variant">search</span>
          <input
            className="w-full bg-transparent border-none text-on-surface font-body-md text-body-md placeholder:text-outline focus:outline-none px-2"
            placeholder="What are you looking for?"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="bg-secondary hover:bg-on-secondary-container text-on-secondary font-label-md text-label-md px-6 py-3 rounded-lg transition-colors flex items-center gap-1.5 shrink-0">
            <span>Search</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Link className="bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md px-8 py-3.5 rounded-xl transition-all shadow-sm" to="/marketplace">
            Explore rentals
          </Link>
          <Link className="bg-surface-container-low hover:bg-surface-container text-primary font-label-md text-label-md px-8 py-3.5 rounded-xl transition-colors" to="/listings/new">
            List your item
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-y-3 gap-x-6 pt-4 text-on-surface-variant">
          {HERO_BENEFITS.map((benefit, idx) => (
            <div key={benefit} className="flex items-center gap-6">
              {idx > 0 && <div className="hidden sm:block w-px h-5 bg-surface-container-high" />}
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary shrink-0" />
                <span className="font-label-md text-label-md text-primary font-semibold">{benefit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Editorial Campus Sharing Showcase */}
      <div className="lg:col-span-5 grid grid-cols-2 gap-4">
        <div className="col-span-2 rounded-2xl overflow-hidden shadow-lg bg-surface-container-lowest group">
          <div className="aspect-[16/10] w-full overflow-hidden bg-surface-container">
            <img
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              alt="University student everyday campus essentials"
              src={HERO_MOSAIC_IMAGES.camera}
            />
          </div>
          <div className="p-4 flex items-center justify-between gap-3">
            <div>
              <p className="font-label-sm text-label-sm text-secondary uppercase font-semibold tracking-wider">
                CAMPUS ESSENTIALS
              </p>
              <p className="font-title-md text-title-md text-primary font-bold">
                Share more. Spend less.
              </p>
            </div>
            <span className="material-symbols-outlined text-secondary text-[22px] shrink-0">
              handshake
            </span>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden shadow-sm bg-surface-container-lowest group">
          <div className="aspect-square w-full overflow-hidden bg-surface-container">
            <img
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              alt="Campus mobility and everyday student gear"
              src={HERO_MOSAIC_IMAGES.bike}
            />
          </div>
          <div className="p-3">
            <p className="font-label-sm text-label-sm text-secondary uppercase font-semibold tracking-wider">
              Campus Mobility
            </p>
            <p className="font-label-md text-label-md text-primary font-semibold truncate">
              Sports &amp; Mobility
            </p>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden shadow-sm bg-surface-container-lowest group">
          <div className="aspect-square w-full overflow-hidden bg-surface-container">
            <img
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              alt="Study, technology, and creative campus equipment"
              src={HERO_MOSAIC_IMAGES.projector}
            />
          </div>
          <div className="p-3">
            <p className="font-label-sm text-label-sm text-secondary uppercase font-semibold tracking-wider">
              Study &amp; Creative
            </p>
            <p className="font-label-md text-label-md text-primary font-semibold truncate">
              Electronics &amp; Audio
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// 2. Category Section: 5 Campus Directory Cards
export function CategorySection() {
  return (
    <section id="explore" className="flex flex-col gap-8 py-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider">Campus Directory</span>
          <h2 className="font-headline-lg text-headline-lg text-primary mt-1">Explore by category</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Quality tools, equipment, and essentials shared locally.</p>
        </div>
        <Link className="font-label-md text-label-md text-secondary hover:text-on-secondary-container flex items-center gap-1" to="/marketplace">
          <span>View all inventory</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {HOME_CATEGORIES.map((cat) => (
          <Link
            key={cat.name}
            to={`/marketplace?category=${cat.key}`}
            className={`group p-5 bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-44 ${
              cat.wideOnMobile ? 'col-span-2 md:col-span-1' : ''
            }`}
          >
            <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
              <span className="material-symbols-outlined text-[24px]">{cat.icon}</span>
            </div>
            <div>
              <h3 className="font-title-md text-title-md text-primary font-semibold">{cat.name}</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{cat.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// 3. Featured Products Section: 4 Campus Listings fetched from the database
export function FeaturedProductsSection() {
  const [featuredItems, setFeaturedItems] = useState<RentalItem[]>([]);

  useEffect(() => {
    fetchMarketplaceListings()
      .then((items) => setFeaturedItems(items.slice(0, 4)))
      .catch(() => setFeaturedItems([]));
  }, []);

  return (
    <section id="featured-products" className="flex flex-col gap-8 py-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider">Verified Gear</span>
          <h2 className="font-headline-lg text-headline-lg text-primary mt-1">Available on campus today</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Recently listed items ready for direct pickup.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
          <span className="font-label-md text-label-md text-on-surface-variant">Live campus inventory</span>
        </div>
      </div>
      {featuredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredItems.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="bg-surface-container-lowest p-8 rounded-xl text-center text-on-surface-variant font-body-md">
          No active listings on campus yet. Be the first to <Link className="text-secondary font-semibold hover:underline" to="/listings/new">list an item</Link>!
        </div>
      )}
    </section>
  );
}

// 4. How It Works Section: 4-Step Campus Rental Protocol
export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-12 flex flex-col gap-10">
      <div className="max-w-2xl">
        <span className="font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider">Simple &amp; Respectful</span>
        <h2 className="font-headline-lg text-headline-lg text-primary mt-1">How {brandConfig.appName} works</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">A streamlined, trusted protocol designed for sharing resources across campus.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {HOW_IT_WORKS_STEPS.map((step) => (
          <div key={step.stepNumber} className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between h-full">
            <div>
              <span className="font-display text-3xl font-extrabold text-secondary/30 block mb-3">{step.stepNumber}</span>
              <h3 className="font-title-md text-title-md text-primary font-bold mb-2">{step.title}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">{step.description}</p>
            </div>
            <span className="pt-6 mt-4 text-secondary font-label-sm text-label-sm">{step.footerLabel}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

const ECOSYSTEM_CARDS = [
  {
    role: 'For Owners',
    title: 'Have something worth sharing?',
    description:
      'List your unused camera, bike, projector, or tools and let others rent them. Put idle equipment to work without losing ownership.',
    ctaLabel: 'List your item',
    ctaTo: '/listings/new',
    ctaClass: 'bg-primary hover:bg-primary-container text-on-primary',
    note: 'Keep 100% control of dates',
  },
  {
    role: 'For Renters',
    title: 'Looking for something?',
    description:
      'Discover useful products without purchasing them outright. Complete your coursework, weekend trips, and creative projects affordably.',
    ctaLabel: 'Explore rentals',
    ctaTo: '/marketplace',
    ctaClass: 'bg-secondary hover:bg-on-secondary-container text-on-secondary',
    note: 'Pay only for active usage',
  },
];

// 5 & 6. Ecosystem Cards (Owners & Renters) and Final CTA Banner
export function EcosystemAndCtaSection() {
  return (
    <>
      <section className="py-6 flex flex-col gap-6">
        <div>
          <span className="font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider">Ecosystem</span>
          <h2 className="font-headline-lg text-headline-lg text-primary mt-1">Built for both sides of campus</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {ECOSYSTEM_CARDS.map((card) => (
            <div key={card.role} className="bg-surface-container-lowest p-8 sm:p-10 rounded-2xl shadow-sm flex flex-col justify-between gap-6">
              <div className="flex flex-col gap-3">
                <span className="font-label-sm text-label-sm text-secondary font-bold tracking-widest uppercase">{card.role}</span>
                <h3 className="font-headline-md text-headline-md text-primary font-bold">{card.title}</h3>
                <p className="font-body-lg text-body-lg text-on-surface-variant">{card.description}</p>
              </div>
              <div className="flex items-center gap-4 pt-4">
                <Link className={`${card.ctaClass} font-label-md text-label-md px-6 py-3.5 rounded-xl shadow-sm`} to={card.ctaTo}>
                  {card.ctaLabel}
                </Link>
                <span className="font-body-sm text-body-sm text-on-surface-variant">{card.note}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="my-10 bg-primary-container text-on-primary rounded-2xl p-8 sm:p-14 lg:p-16 shadow-xl relative overflow-hidden">
        <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full bg-secondary/20 blur-3xl pointer-events-none" />
        <div className="max-w-2xl relative z-10 flex flex-col gap-4">
          <span className="font-label-sm text-label-sm text-secondary-fixed font-bold tracking-widest uppercase">Campus Sharing Revolution</span>
          <h2 className="font-headline-lg text-headline-lg text-white font-bold leading-tight">Your next useful find is right on campus.</h2>
          <p className="font-body-lg text-body-lg text-surface-container-high max-w-lg">
            Join your campus peers in sharing tools, tech, and gear thoughtfully. Access more, spend wisely, and keep waste at zero.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link className="bg-secondary-fixed text-on-secondary-fixed hover:bg-secondary-container font-label-md text-label-md px-8 py-3.5 rounded-xl shadow-sm" to="/marketplace">
              Explore {brandConfig.appName}
            </Link>
            <Link className="text-on-primary hover:text-secondary-fixed font-label-md text-label-md px-6 py-3.5 rounded-xl" to="/listings/new">
              List your item
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
