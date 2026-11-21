// ============================================================================
// FILE: ProductDetails.tsx
// Purpose: Product Details and Booking Dates page (/product/:id).
//          Displays gallery, equipment overview, specifications, owner profile,
//          and the BookingSidebar.
// ============================================================================

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BookingSidebar } from './BookingSidebar';
import { RentalItem } from './data';
import { Footer, Navbar } from './Layout';
import { fetchListingById } from './services/apiClient';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const numericId = Number(id);
  const [selectedItem, setSelectedItem] = useState<RentalItem | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [questionNotice, setQuestionNotice] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Scroll to top and load the listing from the C++17 backend (GET /api/v1/listings/:id)
  useEffect(() => {
    window.scrollTo(0, 0);
    setSelectedIndex(0);
    setQuestionNotice(false);

    if (!numericId || Number.isNaN(numericId)) {
      setSelectedItem(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError('');
    fetchListingById(numericId)
      .then((item) => {
        setSelectedItem(item);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        setSelectedItem(null);
        setLoadError(err instanceof Error ? err.message : 'Unable to load product details.');
        setIsLoading(false);
      });
  }, [numericId]);

  if (isLoading || !selectedItem) {
    return (
      <div className="bg-surface text-on-surface font-body-md text-body-md antialiased min-h-screen flex flex-col justify-between">
        <Navbar activePage="marketplace" />
        <main className="w-full max-w-3xl mx-auto px-margin-mobile md:px-margin py-space-2xl text-center">
          {isLoading ? (
            <p className="text-on-surface-variant font-body-lg">Loading product details...</p>
          ) : (
            <>
              <h1 className="font-headline-lg text-headline-lg text-primary font-bold mb-space-sm">
                Product Not Found
              </h1>
              <p className="text-on-surface-variant mb-space-lg">
                {loadError || "We couldn't find the campus equipment item you were looking for."}
              </p>
              <Link
                to="/marketplace"
                className="inline-flex items-center gap-2 bg-primary text-on-primary font-label-md text-label-md px-space-lg py-3 rounded-lg font-semibold"
              >
                Back to Marketplace
              </Link>
            </>
          )}
        </main>
        <Footer />
      </div>
    );
  }

  const activeImageUrl = selectedItem.galleryImages[selectedIndex] || selectedItem.imageUrl;

  return (
    <div className="bg-surface text-on-surface font-body-md text-body-md antialiased selection:bg-secondary-container selection:text-on-secondary-container min-h-screen flex flex-col justify-between">
      <Navbar activePage="marketplace" />

      <main className="w-full max-w-7xl mx-auto px-margin-mobile md:px-margin pt-space-md pb-space-2xl">
        <nav aria-label="Breadcrumb" className="mb-space-md">
          <ol className="flex flex-wrap items-center gap-2 font-body-sm text-body-sm text-on-surface-variant">
            <li>
              <Link className="hover:text-primary transition-colors flex items-center gap-1" to="/marketplace">
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                Marketplace
              </Link>
            </li>
            <li className="text-outline-variant">/</li>
            <li>
              <Link className="hover:text-primary transition-colors" to={`/marketplace?category=${selectedItem.categoryKey}`}>
                {selectedItem.categoryLabel}
              </Link>
            </li>
            <li className="text-outline-variant">/</li>
            <li aria-current="page" className="text-primary font-medium truncate max-w-[240px] sm:max-w-none">
              {selectedItem.name}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-space-lg">
            {/* Image Gallery */}
            <div className="flex flex-col gap-space-sm">
              <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-surface-container-low border border-surface-container-high shadow-sm">
                <img alt={selectedItem.imageAlt} src={activeImageUrl} className="w-full h-full object-cover" />
                <div className="absolute top-space-md left-space-md flex flex-wrap gap-space-xs">
                  <span className="inline-flex items-center gap-1.5 bg-surface-container-lowest/95 backdrop-blur-md text-primary font-label-md text-label-md px-3 py-1.5 rounded-full shadow-sm font-semibold">
                    <span className="w-2 h-2 rounded-full bg-secondary" />
                    Available on Quad
                  </span>
                  <span className="inline-flex items-center gap-1 bg-primary/90 backdrop-blur-md text-on-primary font-label-sm text-label-sm px-3 py-1.5 rounded-full">
                    {selectedItem.badgeNote}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-space-sm">
                {selectedItem.galleryImages.map((imgUrl, index) => (
                  <button
                    key={`${selectedItem.id}-thumb-${index}`}
                    type="button"
                    onClick={() => setSelectedIndex(index)}
                    className={`aspect-[4/3] rounded-lg overflow-hidden bg-surface-container-high transition-opacity ${
                      index === selectedIndex
                        ? 'border-2 border-secondary ring-2 ring-secondary/20'
                        : 'border border-surface-container-high opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img alt={`${selectedItem.name} view ${index + 1}`} src={imgUrl} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Overview & Specs */}
            <div className="flex flex-col gap-space-md pt-space-xs">
              <div className="flex flex-wrap items-center justify-between gap-space-sm">
                <div className="flex items-center gap-space-xs">
                  <span className="inline-flex items-center gap-1.5 bg-surface-container-high text-primary font-label-md text-label-md px-3 py-1 rounded-md font-semibold">
                    <span className="material-symbols-outlined text-[16px] text-secondary">photo_camera</span>
                    {selectedItem.categoryLabel}
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-secondary-fixed/50 text-on-secondary-fixed-variant font-label-md text-label-md px-3 py-1 rounded-md font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    Available for booking
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Item ID: #RL-{1000 + selectedItem.id}
                </span>
              </div>

              <div>
                <h1 className="font-display-md text-headline-lg sm:text-[2.25rem] text-primary font-bold tracking-tight leading-tight">
                  {selectedItem.name}
                </h1>
                <p className="font-title-md text-title-md text-on-surface-variant font-normal mt-1">
                  {selectedItem.subtitle}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-space-md py-space-sm border-y border-surface-container-high text-on-surface-variant font-body-sm text-body-sm">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-secondary">location_on</span>
                  <span className="text-on-surface font-medium">{selectedItem.ownerAndLocation}</span>
                  <span>• Central Campus Hub</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-secondary">verified_user</span>
                  <span>University ID Verified</span>
                </div>
              </div>

              <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-surface-container-high flex flex-col gap-space-md">
                <h2 className="font-headline-sm text-headline-sm text-primary font-bold">Equipment Overview</h2>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {selectedItem.description}
                </p>

                <div className="mt-space-xs pt-space-md border-t border-surface-container-high">
                  <div className="flex items-center justify-between mb-space-sm">
                    <span className="font-title-md text-title-md text-primary font-semibold">Condition &amp; Inclusions</span>
                    <span className="inline-flex items-center gap-1 text-secondary font-label-md text-label-md font-semibold bg-secondary-fixed/40 px-2.5 py-1 rounded-md">
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                      {selectedItem.conditionNote}
                    </span>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs font-body-sm text-body-sm text-on-surface">
                    {selectedItem.inclusions.map((inclusion, index) => (
                      <li key={index} className="flex items-center gap-2 bg-surface-container-low px-3 py-2 rounded-lg">
                        <span className="material-symbols-outlined text-[18px] text-secondary">check_circle</span>
                        <span>{inclusion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-surface-container-low p-space-lg rounded-xl border border-surface-container-high">
                <h3 className="font-title-md text-title-md text-primary font-bold mb-space-md">Key Specifications</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-md">
                  {selectedItem.specs.map((spec, index) => (
                    <div key={index} className="bg-surface-container-lowest p-space-sm rounded-lg border border-surface-container-high">
                      <span className="font-label-sm text-label-sm text-on-surface-variant block">{spec.label}</span>
                      <span className="font-title-md text-title-md text-primary font-bold">{spec.value}</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant block mt-0.5">{spec.sublabel}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Verified Student Owner Card */}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-surface-container-high flex flex-col gap-space-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
                <div className="flex items-start gap-space-md">
                  <div className="w-14 h-14 rounded-full bg-primary-container text-secondary-fixed flex items-center justify-center font-headline-sm text-headline-sm font-bold shrink-0">
                    {selectedItem.ownerInitials}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-title-md text-title-md text-primary font-bold">Owned by {selectedItem.ownerName}</h3>
                      <span className="inline-flex items-center gap-1 bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm px-2 py-0.5 rounded-full font-semibold">
                        <span className="material-symbols-outlined text-[14px]">school</span>
                        Verified Student
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{selectedItem.ownerBio}</p>
                    <div className="flex flex-wrap items-center gap-space-md mt-2 font-label-sm text-label-sm text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px] text-secondary">apartment</span>
                        {selectedItem.ownerAndLocation}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px] text-secondary">schedule</span>
                        Usually responds within 1 hr
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setQuestionNotice(true)}
                  className="px-space-md py-2.5 rounded-lg border border-outline-variant bg-surface-container-low hover:bg-surface-container-high text-primary font-label-md text-label-md font-semibold transition-colors shrink-0"
                >
                  Ask Owner a Question
                </button>
              </div>
              {questionNotice && (
                <p className="font-body-sm text-body-sm text-secondary bg-secondary-fixed/30 px-3 py-2 rounded-lg">
                  Direct student messaging will be connected with the backend in a later task.
                </p>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 xl:col-span-4">
            <BookingSidebar item={selectedItem} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
