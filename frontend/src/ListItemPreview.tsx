// ============================================================================
// FILE: ListItemPreview.tsx
// Purpose: Sticky right-column Live Campus Preview sidebar,bottom Owner
//          Assurance Banner, and shared types/validation for List Your Item.
// ============================================================================

import { brandConfig } from './config/brand';

export const MAX_PHOTOS = 5;

export interface UploadedPhoto {
  id: string;
  url: string;
  alt: string;
}

export interface ListingFormData {
  photos: UploadedPhoto[];
  productName: string;
  category: string;
  brandModel: string;
  description: string;
  condition: string;
  dailyPrice: string;
  meetupSpot: string;
  availability: 'available' | 'paused';
}

export interface ListingFormErrors {
  photos?: string;
  productName?: string;
  category?: string;
  description?: string;
  condition?: string;
  dailyPrice?: string;
  meetupSpot?: string;
}

export const LISTING_CATEGORIES = [
  'Photography & Video',
  'Electronics & Audio',
  'Sports & Mobility',
  'Academic & STEM Tools',
  'Event Equipment',
  'Other Campus Gear',
];

export const CONDITION_OPTIONS = [
  { value: 'Like New', description: 'Flawless, virtually zero noticeable wear' },
  { value: 'Excellent', description: 'Minor cosmetic signs, 100% functional' },
  { value: 'Good', description: 'Normal signs of campus use, fully operational' },
  { value: 'Fair', description: 'Visible wear or cosmetic scuffs, fully operational' },
];

export const EMPTY_LISTING_FORM: ListingFormData = {
  photos: [],
  productName: '',
  category: '',
  brandModel: '',
  description: '',
  condition: '',
  dailyPrice: '',
  meetupSpot: '',
  availability: 'available',
};

export function validateListingForm(data: ListingFormData): ListingFormErrors {
  const errors: ListingFormErrors = {};
  const parsedPrice = Number(data.dailyPrice);

  if (data.photos.length === 0) errors.photos = 'Please upload at least 1 photo of your item.';
  if (!data.productName.trim()) errors.productName = 'Please enter the item name.';
  if (!data.category.trim()) errors.category = 'Please select a category.';
  if (!data.description.trim()) errors.description = 'Please provide a description of your item.';
  if (!data.condition.trim()) errors.condition = 'Please select the item condition.';
  if (!data.dailyPrice.trim() || Number.isNaN(parsedPrice) || parsedPrice <= 0) {
    errors.dailyPrice = 'Please enter a valid daily rental price greater than ₹0.';
  }
  if (!data.meetupSpot.trim()) errors.meetupSpot = 'Please enter a preferred campus meetup location.';

  return errors;
}

// Right-column sticky Live Campus Preview card updating automatically from user inputs
export function LiveListingPreviewSidebar({ data }: { data: ListingFormData }) {
  const coverPhoto = data.photos[0];
  const parsedPrice = Number(data.dailyPrice);
  const hasValidPrice = data.dailyPrice.trim() !== '' && !Number.isNaN(parsedPrice) && parsedPrice > 0;
  const shortCategory = data.category ? data.category.split('&')[0].trim() : 'Category';
  const shortMeetup = data.meetupSpot.trim() || 'Campus pickup location';

  return (
    <div className="lg:col-span-5 lg:sticky lg:top-24 flex flex-col gap-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-ping" />
          <span className="font-label-md text-label-md text-primary font-bold uppercase tracking-wider">
            Live Campus Preview
          </span>
        </div>
        <span className="font-label-sm text-label-sm text-on-surface-variant">Updates automatically</span>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-md transition-shadow hover:shadow-xl group">
        <div className="relative aspect-[4/3] w-full bg-surface-container overflow-hidden">
          {coverPhoto ? (
            <img
              id="preview-image"
              alt={data.productName.trim() || 'Listing cover preview'}
              src={coverPhoto.url}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div
              id="preview-image-placeholder"
              className="w-full h-full flex flex-col items-center justify-center gap-2 p-6 text-center text-on-surface-variant"
            >
              <span className="material-symbols-outlined text-[40px] text-outline">add_photo_alternate</span>
              <span className="font-title-md text-title-md text-primary font-semibold">No cover photo yet</span>
              <span className="font-body-sm text-body-sm max-w-xs">
                Upload a product photo on the left to preview how your listing cover will look.
              </span>
            </div>
          )}

          <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-surface-container-lowest/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-secondary font-label-sm text-label-sm font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
              {data.availability === 'available' ? 'Available' : 'Paused'}
            </span>
          </div>
          <div className="absolute top-3.5 right-3.5">
            <span className="w-8 h-8 rounded-full bg-surface-container-lowest/80 backdrop-blur-sm flex items-center justify-center text-primary shadow-sm">
              <span className="material-symbols-outlined text-[18px]">favorite_border</span>
            </span>
          </div>
        </div>

        <div className="p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider font-bold text-secondary">
              {shortCategory}
            </span>
            <span className="px-2 py-0.5 rounded bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm font-medium">
              {data.condition ? `${data.condition} condition` : 'Condition not set'}
            </span>
          </div>

          <h3 id="preview-title" className="font-headline-sm text-headline-sm text-primary font-bold leading-snug line-clamp-2">
            {data.productName.trim() || 'Your item name will appear here'}
          </h3>

          <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
            <div className="w-5 h-5 rounded-full bg-surface-container-high flex items-center justify-center text-primary text-[10px] font-bold">
              YOU
            </div>
            <span className="font-medium text-primary">Campus Owner</span>
            <span>•</span>
            <span className="flex items-center gap-0.5 truncate">
              <span className="material-symbols-outlined text-[14px] text-secondary">location_on</span>
              {shortMeetup}
            </span>
          </div>

          <div className="pt-3 border-t border-surface-container-high flex items-center justify-between mt-1">
            <div>
              <span className="font-headline-sm text-headline-sm font-bold text-primary" data-testid="preview-price">
                {hasValidPrice ? `${brandConfig.currencySymbol}${parsedPrice}` : `${brandConfig.currencySymbol}—`}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant"> / day</span>
            </div>
            <button
              type="button"
              disabled
              className="font-label-md text-label-md font-semibold px-4 py-2 rounded-lg bg-primary text-on-primary opacity-90 cursor-default"
            >
              Rent Now
            </button>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-low rounded-xl p-4 flex items-start gap-3 shadow-sm">
        <div className="w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center text-secondary shrink-0">
          <span className="material-symbols-outlined text-[20px]">lightbulb</span>
        </div>
        <div>
          <p className="font-title-md text-title-md text-primary font-bold text-xs uppercase tracking-wider mb-1">
            Helpful Listing Tip
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
            Upload clear photos from multiple angles, list any included accessories or cables, and suggest a convenient campus pickup spot so peers know exactly what to expect.
          </p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex items-center gap-3">
        <span className="material-symbols-outlined text-secondary text-[24px]">verified_user</span>
        <div className="flex flex-col">
          <span className="font-title-md text-title-md text-primary font-semibold text-sm">Verified Peer Handshakes</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Direct physical handoff in designated campus safety zones.
          </span>
        </div>
      </div>
    </div>
  );
}

const ASSURANCE_PILLARS = [
  {
    num: '01',
    title: 'You decide who rents',
    text: 'You receive an inquiry with intended dates and review your peer’s campus verification before accepting. No automatic approvals.',
  },
  {
    num: '02',
    title: 'Edit or adjust anytime',
    text: 'Update your daily rate, upload newly purchased accessories, or swap meetup spots anytime directly from your dashboard.',
  },
  {
    num: '03',
    title: 'Pause or remove freely',
    text: 'Need your gear for personal travel or finals week? Instantly switch to paused with one tap without losing your listing data.',
  },
];

// Bottom full-width 3-card assurance banner ("You are always in control")
export function OwnerAssuranceBanner() {
  return (
    <section className="mt-14 bg-surface-container-lowest rounded-2xl p-6 md:p-10 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center text-secondary">
          <span className="material-symbols-outlined text-[24px]">shield</span>
        </div>
        <div>
          <h3 className="font-headline-md text-headline-md text-primary font-bold">You are always in control</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            RentLoop is built for students, by students. Simple rules and absolute autonomy.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {ASSURANCE_PILLARS.map((pillar) => (
          <div key={pillar.num} className="p-4 rounded-xl bg-surface-container-low flex flex-col gap-2">
            <div className="w-7 h-7 rounded-lg bg-surface-container-high flex items-center justify-center text-primary font-bold text-xs">
              {pillar.num}
            </div>
            <h4 className="font-title-md text-title-md text-primary font-bold">{pillar.title}</h4>
            <p className="font-body-md text-body-md text-on-surface-variant">{pillar.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
