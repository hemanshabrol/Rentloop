// ============================================================================
// FILE: Marketplace.tsx
// Purpose: RentLoop Marketplace page connected to GET /api/v1/listings.
//          Displays live Supabase database listings retrieved through the
//          C++17 backend with search, category, location, condition, and
//          price filtering.
// ============================================================================

import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FormAlert } from './AuthComponents';
import { brandConfig } from './config/brand';
import { MARKETPLACE_CATEGORIES, RentalItem } from './data';
import { Footer, Navbar, ProductCard } from './Layout';
import { fetchMarketplaceListings } from './services/apiClient';

export default function Marketplace() {
  const [searchParams] = useSearchParams();
  const [listings, setListings] = useState<RentalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('any');
  const [sortBy, setSortBy] = useState('recent');
  const [demoEmptyState, setDemoEmptyState] = useState(false);

  // Load real available listings from the C++17 backend (GET /api/v1/listings)
  function loadListings() {
    setIsLoading(true);
    setErrorMessage('');
    fetchMarketplaceListings()
      .then((items) => {
        setListings(items);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        setErrorMessage(err instanceof Error ? err.message : 'Unable to load campus listings from the backend.');
        setIsLoading(false);
      });
  }

  useEffect(() => {
    loadListings();
  }, []);

  useEffect(() => {
    const queryParam = searchParams.get('search');
    const categoryParam = searchParams.get('category');
    if (queryParam !== null) setSearchQuery(queryParam);
    if (categoryParam !== null) setSelectedCategory(categoryParam);
  }, [searchParams]);

  function handleResetFilters() {
    setDemoEmptyState(false);
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedLocation('all');
    setSelectedCondition('all');
    setSelectedPriceRange('any');
    setSortBy('recent');
  }

  // Filter and sort database listings
  const query = searchQuery.trim().toLowerCase();
  const displayedItems = listings
    .filter((item) => {
      if (demoEmptyState) return false;
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.categoryLabel.toLowerCase().includes(query) ||
        item.subtitle.toLowerCase().includes(query);
      const matchesCategory = selectedCategory === 'all' || item.categoryKey === selectedCategory;
      const matchesLocation = selectedLocation === 'all' || item.locationKey === selectedLocation;
      const matchesCondition = selectedCondition === 'all' || item.condition === selectedCondition;
      const matchesPrice =
        selectedPriceRange === 'any' ||
        (selectedPriceRange === 'under200' && item.pricePerDay < 200) ||
        (selectedPriceRange === '200-500' && item.pricePerDay >= 200 && item.pricePerDay <= 500) ||
        (selectedPriceRange === 'over500' && item.pricePerDay > 500);
      return matchesSearch && matchesCategory && matchesLocation && matchesCondition && matchesPrice;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.pricePerDay - b.pricePerDay;
      if (sortBy === 'price-desc') return b.pricePerDay - a.pricePerDay;
      return b.id - a.id;
    });

  const hasActiveFilters =
    query !== '' ||
    selectedCategory !== 'all' ||
    selectedLocation !== 'all' ||
    selectedCondition !== 'all' ||
    selectedPriceRange !== 'any' ||
    sortBy !== 'recent' ||
    demoEmptyState;

  return (
    <div className="min-h-screen flex flex-col bg-surface font-body-md text-on-surface antialiased">
      <Navbar activePage="marketplace" />

      <main className="w-full pt-20 bg-surface flex-1">
        <section className="w-full px-margin-mobile md:px-margin pt-space-md pb-space-lg">
          <div className="max-w-7xl mx-auto flex flex-col gap-space-lg">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
              <div>
                <div className="flex items-center gap-space-xs">
                  <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold">Campus Marketplace</span>
                  <span className="text-outline-variant">—</span>
                  <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant font-semibold">All Listings</span>
                </div>
                <h1 className="font-display text-display text-primary tracking-tight font-bold">Find something useful.</h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
                  Explore verified gear, high-end electronics, and academic essentials shared directly by people across campus quads.
                </p>
              </div>
              <div className="flex items-center gap-space-xs self-start md:self-end bg-surface-container px-space-md py-space-xs rounded-full">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
                <span className="font-label-md text-label-md text-primary font-semibold">
                  {isLoading
                    ? 'Loading campus listings...'
                    : `Showing ${displayedItems.length} item${displayedItems.length === 1 ? '' : 's'} available today on campus`}
                </span>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-space-sm items-center">
                <div className="md:col-span-8 relative flex items-center">
                  <span className="material-symbols-outlined absolute left-space-md text-outline text-[22px]">search</span>
                  <input
                    className="w-full pl-12 pr-space-md py-3 rounded-lg bg-surface-container-low font-body-md text-body-md text-primary focus:outline-none"
                    placeholder="Search by keyword, item name, model (e.g., Canon R5, TI-84, Trek)..."
                    type="text"
                    value={searchQuery}
                    onChange={(e) => { setDemoEmptyState(false); setSearchQuery(e.target.value); }}
                  />
                </div>
                <div className="md:col-span-4 flex items-center gap-space-xs">
                  <select
                    aria-label="Filter by campus location"
                    className="w-full px-4 py-3 rounded-lg bg-surface-container-low font-label-md text-label-md text-primary cursor-pointer focus:outline-none"
                    value={selectedLocation}
                    onChange={(e) => { setDemoEmptyState(false); setSelectedLocation(e.target.value); }}
                  >
                    <option value="all">All Campus Quads</option>
                    <option value="north">North Campus (Quad A)</option>
                    <option value="west">West Dorms</option>
                    <option value="east">East Commons</option>
                    <option value="science">Science &amp; Eng Hall</option>
                    <option value="media">Arts &amp; Media Center</option>
                  </select>
                  {hasActiveFilters && (
                    <button type="button" onClick={handleResetFilters} className="px-space-md py-3 rounded-lg bg-surface-container hover:bg-surface-container-high font-label-md text-label-md">
                      Reset
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md pt-space-xs">
                <div className="flex items-center gap-space-xs overflow-x-auto pb-1">
                  {MARKETPLACE_CATEGORIES.map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => { setDemoEmptyState(false); setSelectedCategory(cat.key); }}
                      className={`px-space-md py-1.5 rounded-full font-label-md text-label-md whitespace-nowrap transition-all ${
                        selectedCategory === cat.key ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-space-sm flex-wrap">
                  <select
                    aria-label="Filter by condition"
                    className="px-3 py-1.5 rounded-lg bg-surface-container-low font-label-md text-label-md text-on-surface-variant cursor-pointer"
                    value={selectedCondition}
                    onChange={(e) => { setDemoEmptyState(false); setSelectedCondition(e.target.value); }}
                  >
                    <option value="all">Any condition</option>
                    <option value="Like New">Like New</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>

                  <select
                    aria-label="Filter by daily price"
                    className="px-3 py-1.5 rounded-lg bg-surface-container-low font-label-md text-label-md text-on-surface-variant cursor-pointer"
                    value={selectedPriceRange}
                    onChange={(e) => { setDemoEmptyState(false); setSelectedPriceRange(e.target.value); }}
                  >
                    <option value="any">Any daily rate</option>
                    <option value="under200">Under {brandConfig.currencySymbol}200 / day</option>
                    <option value="200-500">{brandConfig.currencySymbol}200 – {brandConfig.currencySymbol}500 / day</option>
                    <option value="over500">{brandConfig.currencySymbol}500+ / day</option>
                  </select>

                  <select
                    aria-label="Sort items"
                    className="px-3 py-1.5 rounded-lg bg-surface-container-low font-label-md text-label-md text-on-surface-variant cursor-pointer"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="recent">Sort by: Recently listed</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>

                  <button type="button" onClick={() => setDemoEmptyState((p) => !p)} className="px-space-sm py-1.5 rounded-lg text-outline hover:text-primary font-label-sm text-label-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">{demoEmptyState ? 'visibility_off' : 'visibility'}</span>
                    <span>{demoEmptyState ? 'Show Results' : 'Demo Zero State'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full px-margin-mobile md:px-margin py-space-sm">
          <div className="max-w-7xl mx-auto flex flex-col gap-space-xl">
            {errorMessage ? (
              <div className="w-full bg-surface-container-lowest rounded-2xl p-space-xl shadow-sm flex flex-col items-center gap-space-md text-center">
                <FormAlert errorMessage={errorMessage} infoMessage="" />
                <button
                  type="button"
                  onClick={loadListings}
                  className="bg-primary text-on-primary px-space-lg py-2.5 rounded-lg font-label-md text-label-md hover:bg-primary-container"
                >
                  Retry Loading Listings
                </button>
              </div>
            ) : isLoading ? (
              <div className="w-full bg-surface-container-lowest rounded-2xl p-space-xl text-center shadow-sm font-body-md text-on-surface-variant">
                Loading available campus listings...
              </div>
            ) : displayedItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter" id="productGrid">
                {displayedItems.map((item) => (
                  <ProductCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="w-full bg-surface-container-lowest rounded-2xl p-space-xl text-center shadow-sm" id="emptyState">
                <div className="max-w-md mx-auto flex flex-col items-center gap-space-md">
                  <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[32px] text-outline">search_off</span>
                  </div>
                  <div>
                    <h4 className="font-headline-sm text-headline-sm text-primary font-bold">No products found matching your filters.</h4>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                      Try adjusting your search query, clearing specific filters, or requesting an item directly from campus peers.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-space-sm pt-space-xs w-full justify-center">
                    <button type="button" onClick={handleResetFilters} className="bg-primary text-on-primary px-space-lg py-2.5 rounded-lg font-label-md text-label-md hover:bg-primary-container">
                      Clear filters
                    </button>
                    <Link to="/listings/new" className="bg-surface-container hover:bg-surface-container-high text-primary px-space-lg py-2.5 rounded-lg font-label-md text-label-md">
                      List an item on campus
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="w-full px-margin-mobile md:px-margin py-space-xl">
          <div className="max-w-7xl mx-auto bg-primary text-on-primary rounded-2xl p-space-lg md:p-space-xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-space-lg">
            <div className="max-w-xl">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary-fixed font-bold">Peer Exchange</span>
              <h2 className="font-headline-lg text-headline-lg font-bold text-on-primary mt-1">Have gear sitting on your desk?</h2>
              <p className="font-body-md text-body-md text-on-primary-container mt-1">
                Share calculators, camera lenses, bikes, and tools with verified students in your hall.
              </p>
            </div>
            <div className="flex items-center gap-space-sm flex-wrap">
              <Link className="bg-secondary text-on-secondary px-space-xl py-3 rounded-lg font-label-md text-label-md" to="/listings/new">List an item today</Link>
              <Link className="bg-primary-container text-on-primary px-space-lg py-3 rounded-lg font-label-md text-label-md" to="/#how-it-works">How {brandConfig.appName} Works</Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
