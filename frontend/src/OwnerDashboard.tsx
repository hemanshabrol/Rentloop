// ============================================================================
// FILE: OwnerDashboard.tsx
// Purpose: Student Dashboard controller (/dashboard/owner).
//          Supports both Owner activities (My Listings, Received Requests) and
//          Renter activities (My Rentals) using one student account, connected
//          to the C++17 OOP backend.
// ============================================================================

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FormAlert } from './AuthComponents';
import { ActivePeerRental, OwnerListing, OwnerRentalRequest } from './data';
import { Footer, Navbar } from './Layout';
import {
  CurrentlyRentedSection,
  DashboardOverviewSection,
  ListingFilter,
  MyListingsSection,
  RentalRequestsSection,
} from './OwnerDashboardSections';
import {
  deleteExistingListing,
  fetchMyOwnerListings,
  fetchMyRenterBookings,
  fetchOwnerBookingRequests,
  updateBookingDecision,
  updateExistingListing,
} from './services/apiClient';

type DashboardSectionId = 'my-listings' | 'rental-requests' | 'currently-rented';

const DASHBOARD_NAV_ITEMS: { id: DashboardSectionId; label: string }[] = [
  { id: 'my-listings', label: 'My Listings' },
  { id: 'rental-requests', label: 'Rental Requests' },
  { id: 'currently-rented', label: 'My Rentals' },
];

const DECISION_LABELS = {
  approved: 'approved',
  declined: 'declined',
  returned: 'marked as returned',
};

export default function OwnerDashboard() {
  const navigate = useNavigate();

  const [listings, setListings] = useState<OwnerListing[]>([]);
  const [requests, setRequests] = useState<OwnerRentalRequest[]>([]);
  const [activeRentals, setActiveRentals] = useState<ActivePeerRental[]>([]);
  const [listingFilter, setListingFilter] = useState<ListingFilter>('all');
  const [activeSection, setActiveSection] = useState<DashboardSectionId>('my-listings');
  const [confirmRemoveId, setConfirmRemoveId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // Loads the student's own listings, received booking requests, and renter bookings
  useEffect(() => {
    Promise.all([
      fetchMyOwnerListings(),
      fetchOwnerBookingRequests(),
      fetchMyRenterBookings(),
    ])
      .then(([myListingsData, ownerRequestsData, myRentalsData]) => {
        setListings(myListingsData);
        setRequests(ownerRequestsData);
        setActiveRentals(myRentalsData);
      })
      .catch((err: unknown) => {
        setErrorMessage(err instanceof Error ? err.message : 'Failed to load dashboard data.');
      });
  }, []);

  // Calculate summary statistics directly from current database records
  const totalListingsCount = listings.length;
  const activeListingsCount = listings.filter((item) => item.status === 'active').length;
  const pausedListingsCount = totalListingsCount - activeListingsCount;
  const pendingRequestsCount = requests.filter((req) => req.status === 'pending').length;
  const activeRentalsCount =
    requests.filter((req) => req.status === 'approved').length +
    activeRentals.filter((rental) => rental.bookingStatus === 'approved').length;

  function handleSelectSection(sectionId: DashboardSectionId) {
    setActiveSection(sectionId);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Pauses or reactivates a listing via PATCH /api/v1/listings/:id
  async function handleToggleListingStatus(itemId: number) {
    const target = listings.find((l) => l.item.id === itemId);
    if (!target) return;

    const nextStatus = target.status === 'active' ? 'paused' : 'available';
    setErrorMessage('');
    setStatusMessage('');

    try {
      await updateExistingListing(itemId, { availability_status: nextStatus });
      setListings((prev) =>
        prev.map((listing) =>
          listing.item.id === itemId
            ? { ...listing, status: nextStatus === 'available' ? 'active' : 'paused' }
            : listing
        )
      );
      setStatusMessage(
        `Listing "${target.item.name}" is now ${nextStatus === 'available' ? 'Available' : 'Paused'}.`
      );
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to update listing availability.');
    }
  }

  // Removes a listing via DELETE /api/v1/listings/:id
  async function handleConfirmRemoveListing(itemId: number) {
    setErrorMessage('');
    setStatusMessage('');

    try {
      await deleteExistingListing(itemId);
      setListings((prev) => prev.filter((listing) => listing.item.id !== itemId));
      setConfirmRemoveId(null);
      setStatusMessage('Listing removed from campus marketplace.');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to remove listing.');
    }
  }

  // Approves, declines, or marks a booking returned via PATCH /api/v1/bookings/:id
  async function handleRequestDecision(
    requestId: string,
    decision: 'approved' | 'declined' | 'returned'
  ) {
    const target = requests.find((req) => req.id === requestId);
    if (!target) return;

    setErrorMessage('');
    setStatusMessage('');

    try {
      await updateBookingDecision(target.bookingId, decision);

      setRequests((prev) =>
        prev.map((req) => (req.id === requestId ? { ...req, status: decision } : req))
      );

      if (decision === 'approved' || decision === 'returned') {
        const nextListingStatus = decision === 'approved' ? 'paused' : 'active';
        setListings((prev) =>
          prev.map((listing) =>
            listing.item.id === target.item.id ? { ...listing, status: nextListingStatus } : listing
          )
        );
      }

      setStatusMessage(`Booking request for "${target.item.name}" has been ${DECISION_LABELS[decision]}.`);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to update booking status.');
    }
  }

  return (
    <div className="bg-surface text-on-surface font-body-md text-body-md antialiased min-h-screen flex flex-col justify-between">
      <Navbar activePage="dashboard" />

      <main className="w-full max-w-7xl mx-auto px-margin-mobile md:px-margin py-space-xl flex flex-col gap-space-xl">
        <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg pb-space-lg border-b border-surface-container-highest">
          <div className="flex flex-col gap-space-xs">
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Dashboard</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Manage your campus listings, incoming rental requests, and active rentals.
            </p>
          </div>

          <Link
            to="/listings/new"
            className="self-start lg:self-auto inline-flex items-center gap-space-xs bg-secondary text-on-secondary px-space-lg py-3 rounded-xl font-title-md text-title-md shadow-sm hover:opacity-95 transition-all shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>Add Listing</span>
          </Link>
        </section>

        <nav aria-label="Dashboard Sections" className="flex flex-wrap items-center gap-space-xs bg-surface-container-low p-1.5 rounded-xl self-start">
          {DASHBOARD_NAV_ITEMS.map((navItem) => (
            <button
              key={navItem.id}
              type="button"
              onClick={() => handleSelectSection(navItem.id)}
              className={`px-space-lg py-2 rounded-lg font-label-md text-label-md transition-colors ${
                activeSection === navItem.id
                  ? 'bg-primary text-on-primary font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              {navItem.label}
            </button>
          ))}
        </nav>

        {(errorMessage || statusMessage) && (
          <FormAlert errorMessage={errorMessage} infoMessage={statusMessage} />
        )}

        <DashboardOverviewSection
          totalListings={totalListingsCount}
          activeListings={activeListingsCount}
          pausedListings={pausedListingsCount}
          pendingRequests={pendingRequestsCount}
          activeRentals={activeRentalsCount}
        />

        <MyListingsSection
          listings={listings}
          listingFilter={listingFilter}
          confirmRemoveId={confirmRemoveId}
          onFilterChange={setListingFilter}
          onToggleStatus={handleToggleListingStatus}
          onRequestRemove={setConfirmRemoveId}
          onConfirmRemove={handleConfirmRemoveListing}
          onCancelRemove={() => setConfirmRemoveId(null)}
          onEditClick={(itemId) => navigate(`/listings/new?edit=${itemId}`)}
        />

        <RentalRequestsSection
          requests={requests}
          onApprove={(id) => handleRequestDecision(id, 'approved')}
          onDecline={(id) => handleRequestDecision(id, 'declined')}
          onMarkReturned={(id) => handleRequestDecision(id, 'returned')}
        />

        <CurrentlyRentedSection activeRentals={activeRentals} />
      </main>

      <Footer />
    </div>
  );
}
