// ============================================================================
// FILE: BookingSidebar.tsx
// Purpose: Sticky booking card and peer-rental guidelines for Product Details.
//          Handles start/end date selection, inclusive day calculation,
//          live rental price calculation, and date validation.
// ============================================================================

import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FormAlert } from './AuthComponents';
import { brandConfig } from './config/brand';
import { RentalItem } from './data';
import { createBookingRequest } from './services/apiClient';
import { useAuthSession } from './supabaseClient';

// Returns today's local date in YYYY-MM-DD format for HTML date input min attributes
export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Calculates inclusive rental days: Number of days = (End date - Start date) + 1
export function calculateInclusiveDays(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;

  const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
  const [endYear, endMonth, endDay] = endDate.split('-').map(Number);

  const startUtcMs = Date.UTC(startYear, startMonth - 1, startDay);
  const endUtcMs = Date.UTC(endYear, endMonth - 1, endDay);
  if (endUtcMs < startUtcMs) return 0;

  return Math.round((endUtcMs - startUtcMs) / (1000 * 60 * 60 * 24)) + 1;
}

const PEER_RENTAL_STEPS = [
  {
    num: '1',
    title: 'Request',
    text: "Propose your dates and briefly share what project or shoot you're working on.",
    primaryBadge: true,
  },
  {
    num: '2',
    title: 'Approval',
    text: 'The owner confirms availability and you coordinate a convenient on-campus handoff spot.',
    primaryBadge: false,
  },
  {
    num: '3',
    title: 'Meet & Exchange',
    text: 'Inspect the gear together on campus, complete a quick check-in, and create!',
    primaryBadge: false,
  },
];

export function BookingSidebar({ item }: { item: RentalItem }) {
  const navigate = useNavigate();
  const { session } = useAuthSession();
  const todayDate = getTodayDateString();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [validationNotice, setValidationNotice] = useState('');

  const isOwner = Boolean(session?.user?.id && item.ownerId && session.user.id === item.ownerId);
  const rentalDays = calculateInclusiveDays(startDate, endDate);
  const totalRentalCost = rentalDays * item.pricePerDay;
  const dayLabel = rentalDays === 1 ? 'day' : 'days';

  function handleStartDateChange(newStartDate: string) {
    setStartDate(newStartDate);
    setErrorMessage('');
    setValidationNotice('');
    if (endDate && newStartDate && endDate < newStartDate) {
      setEndDate(newStartDate);
    }
  }

  async function handleRequestRental(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    setValidationNotice('');

    if (!session) {
      navigate(`/login?redirect=${encodeURIComponent(`/product/${item.id}`)}`);
      return;
    }
    if (isOwner) return setErrorMessage('You cannot rent your own listing.');
    if (!startDate || !endDate) return setErrorMessage('Please select both a rental start date and a return date.');
    if (startDate < todayDate) return setErrorMessage('Rental start date cannot be in the past.');
    if (endDate < startDate) return setErrorMessage('Return date cannot be earlier than the start date.');

    setIsSubmitting(true);
    try {
      const created = await createBookingRequest({
        listing_id: item.id,
        start_date: startDate,
        end_date: endDate,
      });
      setValidationNotice(
        `Rental request #${created.id} submitted for ${rentalDays} ${dayLabel} (${startDate} to ${endDate}) · Total ${brandConfig.currencySymbol}${created.total_price.toLocaleString('en-IN')}. Track its status in your Dashboard under My Rentals.`
      );
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to submit booking request.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="lg:sticky lg:top-24 flex flex-col gap-space-md">
      <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-surface-container-high shadow-sm">
        <div className="flex items-baseline justify-between pb-space-md mb-space-md border-b border-surface-container-high">
          <div>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">
              Daily Rental Price
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-display-md text-headline-lg text-primary font-bold">
                {brandConfig.currencySymbol}{item.pricePerDay}
              </span>
              <span className="font-body-md text-body-md text-on-surface-variant font-medium">/ day</span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 bg-secondary-container text-on-secondary-container font-label-sm text-label-sm px-2.5 py-1 rounded-full font-semibold">
            Subject to confirmation
          </span>
        </div>

        <form onSubmit={handleRequestRental} noValidate>
          <div className="bg-surface-container-low p-space-md rounded-lg mb-space-md border border-surface-container-high">
            <div className="flex items-center justify-between mb-space-sm">
              <span className="font-label-md text-label-md text-primary font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-secondary">calendar_month</span>
                Rental Window
              </span>
              <span className="font-label-sm text-label-sm text-secondary font-medium">Inclusive dates</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs">
              <label className="bg-surface-container-lowest p-2.5 rounded border border-surface-container-high flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Start Date</span>
                <input
                  type="date"
                  aria-label="Start Date"
                  min={todayDate}
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="font-body-sm text-body-sm text-primary font-semibold bg-transparent focus:outline-none w-full"
                />
              </label>

              <label className="bg-surface-container-lowest p-2.5 rounded border border-surface-container-high flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Return Date</span>
                <input
                  type="date"
                  aria-label="Return Date"
                  min={startDate || todayDate}
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setErrorMessage('');
                    setValidationNotice('');
                  }}
                  className="font-body-sm text-body-sm text-primary font-semibold bg-transparent focus:outline-none w-full"
                />
              </label>
            </div>

            <div className="mt-space-sm pt-space-xs border-t border-surface-container-high flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
              <span>Meetup: {item.pickupLocation || 'On-campus exchange spot'}</span>
            </div>
          </div>

          <div className="flex flex-col gap-space-xs pb-space-md mb-space-md border-b border-surface-container-high font-body-md text-body-md">
            <div className="flex justify-between text-on-surface-variant">
              <span>Selected rental duration</span>
              <span className="text-on-surface font-semibold" data-testid="rental-duration">
                {rentalDays > 0 ? `${rentalDays} ${dayLabel}` : 'Select dates'}
              </span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>
                {rentalDays > 0
                  ? `${brandConfig.currencySymbol}${item.pricePerDay} × ${rentalDays} ${dayLabel}`
                  : 'Daily rate'}
              </span>
              <span className="text-on-surface font-medium">
                {brandConfig.currencySymbol}
                {rentalDays > 0 ? totalRentalCost.toLocaleString('en-IN') : item.pricePerDay}
              </span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span className="flex items-center gap-1">
                Platform peer fee
                <span className="text-[11px] bg-surface-container-high px-1.5 py-0.5 rounded text-primary">
                  Campus peer perk
                </span>
              </span>
              <span className="text-secondary font-medium">{brandConfig.currencySymbol}0</span>
            </div>
            <div className="flex justify-between text-primary font-title-md text-title-md font-bold pt-space-xs mt-space-xs border-t border-surface-container-low">
              <span>Total</span>
              <span data-testid="total-rental-cost">
                {brandConfig.currencySymbol}{totalRentalCost.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {(errorMessage || validationNotice) && (
            <div className="mb-space-md">
              <FormAlert errorMessage={errorMessage} infoMessage={validationNotice} />
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || item.availabilityStatus === 'paused'}
            className="w-full py-3.5 px-space-lg rounded-lg bg-gradient-to-br from-primary to-primary-container hover:opacity-95 disabled:opacity-60 text-on-primary font-title-md text-title-md font-semibold shadow-sm transition-all flex items-center justify-center gap-space-xs mb-space-sm"
          >
            <span>
              {item.availabilityStatus === 'paused'
                ? 'Listing Currently Paused'
                : isSubmitting
                ? 'Submitting Request...'
                : 'Request Rental'}
            </span>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
          {isOwner && (
            <div className="text-center mb-space-xs">
              <Link
                to={`/listings/new?edit=${item.id}`}
                className="font-label-md text-label-md text-secondary font-semibold hover:underline"
              >
                You own this item · Edit Listing
              </Link>
            </div>
          )}
          <p className="text-center font-label-sm text-label-sm text-on-surface-variant">
            You won&apos;t be charged yet. Payment is settled upon peer approval.
          </p>
        </form>
      </div>

      <div className="bg-surface-container-low p-space-lg rounded-xl border border-surface-container-high">
        <h3 className="font-title-md text-title-md text-primary font-bold mb-space-md flex items-center gap-space-xs">
          <span className="material-symbols-outlined text-secondary text-[20px]">handshake</span>
          How Peer Rental Works
        </h3>
        <ol className="flex flex-col gap-space-md relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-container-highest">
          {PEER_RENTAL_STEPS.map((step) => (
            <li key={step.num} className="relative pl-8">
              <span
                className={`absolute left-0 top-0.5 w-6 h-6 rounded-full font-label-sm text-label-sm font-bold flex items-center justify-center ${
                  step.primaryBadge
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-highest text-primary border border-outline-variant'
                }`}
              >
                {step.num}
              </span>
              <span className="font-label-md text-label-md text-primary font-bold block">{step.title}</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">{step.text}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="bg-surface-container-lowest p-space-md rounded-xl border border-surface-container-high flex items-start gap-space-sm">
        <span className="material-symbols-outlined text-secondary text-[22px] shrink-0 mt-0.5">gavel</span>
        <div>
          <span className="font-label-md text-label-md text-primary font-semibold block">Campus Guidelines</span>
          <p className="font-label-sm text-label-sm text-on-surface-variant leading-relaxed mt-0.5">
            Both students verify University IDs at handoff. Equipment must be returned in identical condition by 6:00 PM on the return date.
          </p>
        </div>
      </div>
    </div>
  );
}
