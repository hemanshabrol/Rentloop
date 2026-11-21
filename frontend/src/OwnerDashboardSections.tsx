// ============================================================================
// FILE: OwnerDashboardSections.tsx
// Purpose: Section components for the Student Dashboard:
//          DashboardOverviewSection, MyListingsSection, RentalRequestsSection,
//          and CurrentlyRentedSection.
// ============================================================================

import { Link } from 'react-router-dom';
import { brandConfig } from './config/brand';
import { ActivePeerRental, OwnerListing, OwnerRentalRequest } from './data';

export type ListingFilter = 'all' | 'active' | 'paused';

const FILTER_LABELS: Record<ListingFilter, string> = {
  all: 'All',
  active: 'Active',
  paused: 'Paused',
};

const REQUEST_STATUS_BADGES: Record<OwnerRentalRequest['status'], string> = {
  pending: 'Pending Review',
  approved: 'Approved · Active',
  declined: 'Declined',
  returned: 'Returned',
};

// 1. Dashboard Overview Section: Displays calculated summary statistics
export function DashboardOverviewSection({
  totalListings,
  activeListings,
  pausedListings,
  pendingRequests,
  activeRentals,
}: {
  totalListings: number;
  activeListings: number;
  pausedListings: number;
  pendingRequests: number;
  activeRentals: number;
}) {
  const summaryCards = [
    { label: 'Total Listings', value: totalListings, subtext: `${activeListings} available · ${pausedListings} paused`, testId: 'stat-total-listings' },
    { label: 'Active Listings', value: activeListings, subtext: 'Visible in marketplace', testId: 'stat-active-listings' },
    { label: 'Pending Requests', value: pendingRequests, subtext: 'Needs your review', testId: 'stat-pending-requests' },
    { label: 'Active Rentals', value: activeRentals, subtext: 'Approved peer rentals', testId: 'stat-active-rentals' },
  ];

  return (
    <section aria-label="Dashboard Overview" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
      {summaryCards.map((card) => (
        <div key={card.label} className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-xs">
          <span className="font-label-md text-label-md text-on-surface-variant font-medium">{card.label}</span>
          <span className="font-display text-display text-primary font-bold leading-none mt-1" data-testid={card.testId}>{card.value}</span>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{card.subtext}</p>
        </div>
      ))}
    </section>
  );
}

// 2. My Listings Section: Displays the owner's listings, filter tabs, and empty state
export function MyListingsSection({
  listings,
  listingFilter,
  confirmRemoveId,
  onFilterChange,
  onToggleStatus,
  onRequestRemove,
  onConfirmRemove,
  onCancelRemove,
  onEditClick,
}: {
  listings: OwnerListing[];
  listingFilter: ListingFilter;
  confirmRemoveId: number | null;
  onFilterChange: (filter: ListingFilter) => void;
  onToggleStatus: (itemId: number) => void;
  onRequestRemove: (itemId: number) => void;
  onConfirmRemove: (itemId: number) => void;
  onCancelRemove: () => void;
  onEditClick: (itemId: number) => void;
}) {
  const activeCount = listings.filter((l) => l.status === 'active').length;
  const counts: Record<ListingFilter, number> = {
    all: listings.length,
    active: activeCount,
    paused: listings.length - activeCount,
  };
  const filteredListings = listingFilter === 'all' ? listings : listings.filter((l) => l.status === listingFilter);

  return (
    <section id="my-listings" className="flex flex-col gap-space-lg scroll-mt-24">
      <div className="flex items-center gap-space-md flex-wrap">
        <h2 className="font-headline-md text-headline-md text-primary font-bold">My Listings</h2>
        <div className="inline-flex items-center bg-surface-container-low p-1 rounded-lg gap-1">
          {(['all', 'active', 'paused'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => onFilterChange(tab)}
              className={`px-space-md py-1.5 rounded-md font-label-md text-label-md transition-all ${
                listingFilter === tab
                  ? 'bg-primary text-on-primary shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {FILTER_LABELS[tab]} ({counts[tab]})
            </button>
          ))}
        </div>
      </div>

      {filteredListings.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl p-space-xl text-center border border-surface-container-high flex flex-col items-center gap-space-xs">
          <span className="material-symbols-outlined text-[36px] text-secondary">inventory_2</span>
          <h3 className="font-title-md text-title-md text-primary font-bold">No listings yet</h3>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
            You do not have any items in this view. Use the Add Listing button above to share equipment with your campus community.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md" id="listings-grid">
          {filteredListings.map((listing) => {
            const isAvailable = listing.status === 'active';
            const itemId = listing.item.id;
            return (
              <article key={itemId} className={`bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group ${isAvailable ? '' : 'opacity-90'}`}>
                <Link to={`/product/${itemId}`} className="relative aspect-[4/3] w-full overflow-hidden bg-surface-container block">
                  <img alt={listing.item.imageAlt} src={listing.item.imageUrl} className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${isAvailable ? '' : 'grayscale-[30%]'}`} />
                  <div className="absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                    <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-secondary' : 'bg-outline'}`} />
                    <span className={`font-label-sm text-label-sm font-semibold ${isAvailable ? 'text-primary' : 'text-on-surface-variant'}`}>
                      {isAvailable ? 'Available' : 'Paused'}
                    </span>
                  </div>
                </Link>

                <div className="p-space-md flex flex-col flex-1 justify-between gap-space-sm">
                  <div className="flex flex-col gap-1">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">{listing.item.categoryLabel}</span>
                    <h3 className="font-title-md text-title-md text-primary font-bold line-clamp-1">
                      <Link to={`/product/${itemId}`} className="hover:text-secondary transition-colors">{listing.item.name}</Link>
                    </h3>
                    <p className="font-body-md text-body-md font-bold text-primary">
                      {brandConfig.currencySymbol}{listing.item.pricePerDay} <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">/ day</span>
                    </p>
                    <div className="flex items-center gap-1 text-on-surface-variant font-body-sm text-body-sm mt-1">
                      <span className="material-symbols-outlined text-[15px] text-secondary">location_on</span>
                      <span>{listing.pickupLocation}</span>
                    </div>
                  </div>

                  {confirmRemoveId === itemId ? (
                    <div className="pt-space-sm border-t border-surface-container flex flex-col gap-2 bg-error-container/40 p-2 rounded-lg">
                      <span className="font-label-sm text-label-sm text-on-error-container font-semibold">Remove this listing?</span>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => onConfirmRemove(itemId)} className="bg-error text-on-error px-2.5 py-1 rounded font-label-sm text-label-sm font-semibold">Confirm Remove</button>
                        <button type="button" onClick={onCancelRemove} className="bg-surface-container-lowest text-on-surface px-2.5 py-1 rounded font-label-sm text-label-sm font-medium border border-outline-variant">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-space-sm border-t border-surface-container flex items-center justify-between gap-1 font-label-sm text-label-sm text-on-surface-variant">
                      <Link to={`/product/${itemId}`} className="hover:text-secondary transition-colors font-semibold">View</Link>
                      <span>·</span>
                      <button type="button" onClick={() => onEditClick(itemId)} className="hover:text-primary transition-colors font-semibold">Edit</button>
                      <span>·</span>
                      <button type="button" onClick={() => onToggleStatus(itemId)} className="hover:text-secondary transition-colors font-semibold">{isAvailable ? 'Pause' : 'Resume'}</button>
                      <span>·</span>
                      <button type="button" onClick={() => onRequestRemove(itemId)} className="hover:text-error transition-colors">Remove</button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

// 3. Rental Requests Section (Owner View): Incoming requests and active owner handoffs
export function RentalRequestsSection({
  requests,
  onApprove,
  onDecline,
  onMarkReturned,
}: {
  requests: OwnerRentalRequest[];
  onApprove: (id: string) => void;
  onDecline: (id: string) => void;
  onMarkReturned: (id: string) => void;
}) {
  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <section id="rental-requests" className="flex flex-col gap-space-lg scroll-mt-24">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-space-sm">
          <h2 className="font-headline-md text-headline-md text-primary font-bold">Rental Requests</h2>
          <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold">{pendingCount} pending</span>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant">Review incoming rental requests from campus peers, approve or decline them, and mark approved rentals as returned.</p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl p-space-xl text-center border border-surface-container-high flex flex-col items-center gap-space-xs">
          <span className="material-symbols-outlined text-[36px] text-secondary">inbox</span>
          <h3 className="font-title-md text-title-md text-primary font-bold">No incoming rental requests</h3>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
            Incoming requests for your listed items will appear here with the renter&apos;s details, requested dates, duration, and total price.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-space-md">
          {requests.map((request) => {
            const dayUnit = request.durationDays === 1 ? 'day' : 'days';
            return (
              <article key={request.id} className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col lg:flex-row gap-space-lg items-start">
                <Link to={`/product/${request.item.id}`} className="w-full lg:w-44 h-36 rounded-lg overflow-hidden shrink-0 bg-surface-container block">
                  <img alt={request.item.imageAlt} className="w-full h-full object-cover" src={request.item.imageUrl} />
                </Link>
                <div className="flex-1 flex flex-col gap-space-sm w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
                    <div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">{request.item.categoryLabel}</span>
                      <h3 className="font-headline-sm text-headline-sm text-primary font-bold">{request.item.name}</h3>
                    </div>
                    <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-semibold">
                      {REQUEST_STATUS_BADGES[request.status]}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm py-space-xs bg-surface-container-low px-space-md rounded-lg">
                    <div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant block">Renter</span>
                      <span className="font-title-md text-title-md text-primary font-semibold block">{request.renterName}</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">{request.renterDepartment}</span>
                    </div>
                    <div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant block">Requested Dates</span>
                      <span className="font-title-md text-title-md text-primary font-semibold block">{request.requestedDates}</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">{request.durationDays} {dayUnit}</span>
                    </div>
                    <div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant block">Total Price</span>
                      <span className="font-title-md text-title-md text-primary font-bold block">{brandConfig.currencySymbol}{request.totalPrice}</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">{brandConfig.currencySymbol}{request.item.pricePerDay}/day × {request.durationDays} {dayUnit}</span>
                    </div>
                  </div>
                  {request.status === 'pending' && (
                    <div className="flex items-center gap-space-sm pt-space-xs">
                      <button type="button" onClick={() => onApprove(request.id)} className="bg-secondary text-on-secondary px-space-lg py-2 rounded-lg font-label-md text-label-md font-semibold">Approve</button>
                      <button type="button" onClick={() => onDecline(request.id)} className="bg-surface-container-high text-on-surface px-space-md py-2 rounded-lg font-label-md text-label-md font-semibold">Decline</button>
                    </div>
                  )}
                  {request.status === 'approved' && (
                    <div className="flex items-center gap-space-sm pt-space-xs">
                      <button type="button" onClick={() => onMarkReturned(request.id)} className="bg-primary text-on-primary px-space-lg py-2 rounded-lg font-label-md text-label-md font-semibold">
                        Mark as Returned
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

// 4. My Rentals Section (Renter View): Bookings requested by this student
export function CurrentlyRentedSection({ activeRentals }: { activeRentals: ActivePeerRental[] }) {
  return (
    <section id="currently-rented" className="flex flex-col gap-space-md scroll-mt-24">
      <div className="flex flex-col gap-1">
        <h2 className="font-headline-md text-headline-md text-primary font-bold">My Rentals</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">Track the status and details of items you have requested or rented from campus peers.</p>
      </div>

      {activeRentals.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl p-space-xl text-center border border-surface-container-high flex flex-col items-center gap-space-xs">
          <span className="material-symbols-outlined text-[36px] text-secondary">handshake</span>
          <h3 className="font-title-md text-title-md text-primary font-bold">No rental bookings yet</h3>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
            Items you request to rent from the Marketplace will appear here with their dates, total price, and live approval status.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
          {activeRentals.map((rental) => {
            const dayUnit = rental.durationDays === 1 ? 'day' : 'days';
            return (
              <div key={rental.id} className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex items-start gap-space-md">
                <Link to={`/product/${rental.item.id}`} className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-surface-container block">
                  <img alt={rental.item.imageAlt} src={rental.item.imageUrl} className="w-full h-full object-cover" />
                </Link>
                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">{rental.item.categoryLabel}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
                      {rental.statusLabel}
                    </span>
                  </div>
                  <h3 className="font-title-md text-title-md text-primary font-bold">
                    <Link to={`/product/${rental.item.id}`} className="hover:text-secondary transition-colors">
                      {rental.item.name}
                    </Link>
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Dates: {rental.dateRange} ({rental.durationDays} {dayUnit})
                  </p>
                  <p className="font-body-sm text-body-sm text-primary font-semibold">
                    Total: {brandConfig.currencySymbol}{rental.totalPrice} · Pickup: {rental.renterCampusArea}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
