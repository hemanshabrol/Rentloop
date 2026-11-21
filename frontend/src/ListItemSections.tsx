// ============================================================================
// FILE: ListItemSections.tsx
// Purpose: Four major form section components for the List Your Item page:
//          1. ProductPhotosSection
//          2. ProductInfoSection
//          3. RentalDetailsSection
//          4. ReviewAndPublishSection
// ============================================================================

import { ChangeEvent, DragEvent, useRef } from 'react';
import { FormAlert } from './AuthComponents';
import { brandConfig } from './config/brand';
import {
  CONDITION_OPTIONS,
  LISTING_CATEGORIES,
  ListingFormData,
  ListingFormErrors,
  MAX_PHOTOS,
  UploadedPhoto,
} from './ListItemPreview';

interface SectionProps {
  formData: ListingFormData;
  errors: ListingFormErrors;
  onUpdateField: <K extends keyof ListingFormData>(field: K, value: ListingFormData[K]) => void;
}

// Inline error message rendered directly beneath an invalid field
export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1.5 text-error font-body-sm text-body-sm flex items-center gap-1">
      <span className="material-symbols-outlined text-[16px]">error</span>
      <span>{message}</span>
    </p>
  );
}

// 1. Product Photos Section: File upload, drag-and-drop, previews, and removal
export function ProductPhotosSection({
  photos,
  error,
  onAddFiles,
  onRemovePhoto,
}: {
  photos: UploadedPhoto[];
  error?: string;
  onAddFiles: (files: FileList | null) => void;
  onRemovePhoto: (id: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    onAddFiles(event.target.files);
    event.target.value = '';
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    onAddFiles(event.dataTransfer.files);
  }

  return (
    <section className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-headline-md text-headline-md text-primary font-bold">1. Product Photos</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Upload bright, clear photos showing your item and any included accessories.
          </p>
        </div>
        <span className="font-label-sm text-label-sm text-secondary bg-secondary-container px-2.5 py-1 rounded-md font-medium shrink-0">
          {photos.length}/{MAX_PHOTOS} Uploaded
        </span>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" multiple aria-label="Upload product photos" onChange={handleFileChange} className="hidden" />

      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileInputRef.current?.click()}
        className="bg-surface-container-low rounded-xl p-8 text-center cursor-pointer transition-colors duration-200 hover:bg-surface-container flex flex-col items-center justify-center group mb-6 border border-dashed border-outline-variant"
      >
        <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-secondary mb-3 group-hover:scale-105 transition-transform">
          <span className="material-symbols-outlined text-[28px]">cloud_upload</span>
        </div>
        <p className="font-title-md text-title-md text-primary font-semibold mb-1">Drag and drop photos here, or browse files</p>
        <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm">
          Recommended: JPG or PNG. The first photo uploaded will be used as your main listing cover.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {photos.map((photo, index) => (
          <div key={photo.id} className="relative rounded-xl overflow-hidden aspect-[4/3] bg-surface-container group shadow-sm">
            <img className="w-full h-full object-cover" alt={photo.alt} src={photo.url} />
            {index === 0 && (
              <div className="absolute top-2 left-2 bg-primary/80 backdrop-blur-sm text-on-primary px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide">
                COVER
              </div>
            )}
            <button
              type="button"
              aria-label={`Remove photo ${index + 1}`}
              onClick={() => onRemovePhoto(photo.id)}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-surface-container-lowest/90 text-on-surface flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity hover:bg-error hover:text-on-error"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          </div>
        ))}
        {photos.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl aspect-[4/3] bg-surface-container-low hover:bg-surface-container flex flex-col items-center justify-center gap-1 text-on-surface-variant hover:text-primary transition-colors border border-dashed border-outline-variant"
          >
            <span className="material-symbols-outlined text-[24px]">add</span>
            <span className="font-label-sm text-label-sm font-semibold">Add Photo</span>
          </button>
        )}
      </div>
      <FieldError message={error} />
    </section>
  );
}

// 2. Product Information Section: Item name, category, brand/model, description, condition
export function ProductInfoSection({ formData, errors, onUpdateField }: SectionProps) {
  return (
    <section className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
      <div>
        <h2 className="font-headline-md text-headline-md text-primary font-bold">2. Product Information</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Provide accurate details so campus peers know exactly what they are renting.
        </p>
      </div>

      <div>
        <label className="block font-label-md text-label-md text-primary font-semibold mb-2" htmlFor="product-name">
          Product Name <span className="text-secondary">*</span>
        </label>
        <input id="product-name" type="text" placeholder="Enter the item name (e.g., Scientific Calculator, Tripod, Projector)" value={formData.productName} onChange={(e) => onUpdateField('productName', e.target.value)} className="w-full bg-surface-container-low text-primary font-body-md text-body-md px-4 py-3 rounded-xl focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary/30 transition-all" />
        <FieldError message={errors.productName} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-label-md text-label-md text-primary font-semibold mb-2" htmlFor="category-select">
            Category <span className="text-secondary">*</span>
          </label>
          <div className="relative">
            <select id="category-select" value={formData.category} onChange={(e) => onUpdateField('category', e.target.value)} className="w-full appearance-none bg-surface-container-low text-primary font-body-md text-body-md px-4 py-3 rounded-xl focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary/30 transition-all pr-10 cursor-pointer">
              <option value="">Select a category</option>
              {LISTING_CATEGORIES.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-3.5 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
          </div>
          <FieldError message={errors.category} />
        </div>

        <div>
          <label className="block font-label-md text-label-md text-primary font-semibold mb-2" htmlFor="brand-model">Brand &amp; Model (Optional)</label>
          <input id="brand-model" type="text" placeholder="e.g., Casio, Epson, Trek" value={formData.brandModel} onChange={(e) => onUpdateField('brandModel', e.target.value)} className="w-full bg-surface-container-low text-primary font-body-md text-body-md px-4 py-3 rounded-xl focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary/30 transition-all" />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="font-label-md text-label-md text-primary font-semibold" htmlFor="description">
            Description <span className="text-secondary">*</span>
          </label>
          <span className="font-label-sm text-label-sm text-on-surface-variant">{formData.description.length} / 800 chars</span>
        </div>
        <textarea id="description" rows={4} maxLength={800} placeholder="Describe what is included, how the item works, and any care instructions..." value={formData.description} onChange={(e) => onUpdateField('description', e.target.value)} className="w-full bg-surface-container-low text-primary font-body-md text-body-md p-4 rounded-xl focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary/30 transition-all resize-y" />
        <FieldError message={errors.description} />
      </div>

      <div>
        <span className="block font-label-md text-label-md text-primary font-semibold mb-3">
          Product Condition <span className="text-secondary">*</span>
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="condition-group">
          {CONDITION_OPTIONS.map((option) => {
            const isSelected = formData.condition === option.value;
            return (
              <label key={option.value} className={`cursor-pointer relative p-3.5 rounded-xl transition-all flex flex-col gap-1 ${isSelected ? 'bg-secondary-container/40 ring-2 ring-secondary' : 'bg-surface-container-low hover:bg-surface-container'}`}>
                <input type="radio" name="condition" value={option.value} checked={isSelected} onChange={() => onUpdateField('condition', option.value)} className="sr-only" />
                <div className="flex items-center justify-between">
                  <span className="font-title-md text-title-md text-primary font-semibold flex items-center gap-1.5">
                    {option.value}
                    {isSelected && <span className="material-symbols-outlined text-[16px] text-secondary">check_circle</span>}
                  </span>
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center ${isSelected ? 'bg-secondary' : 'bg-surface-container-high'}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-surface-container-lowest" />
                  </span>
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant">{option.description}</span>
              </label>
            );
          })}
        </div>
        <FieldError message={errors.condition} />
      </div>
    </section>
  );
}

// 3. Rental Details Section: Daily rental price, campus meetup point, and availability toggle
export function RentalDetailsSection({ formData, errors, onUpdateField }: SectionProps) {
  const availabilityModes = [
    { value: 'available' as const, label: 'Available for booking', dotClass: 'bg-secondary animate-pulse' },
    { value: 'paused' as const, label: 'Keep unlisted / paused', dotClass: 'bg-outline' },
  ];

  return (
    <section className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
      <div>
        <h2 className="font-headline-md text-headline-md text-primary font-bold">3. Rental Details</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Set your daily rental rate and preferred on-campus exchange location.
        </p>
      </div>

      <div className="bg-surface-container-low p-5 rounded-xl">
        <label className="block font-label-md text-label-md text-primary font-semibold mb-2" htmlFor="price-input">
          Daily Rental Price <span className="text-secondary">*</span>
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-surface-container-lowest rounded-xl px-4 py-2.5 shadow-sm max-w-[220px]">
            <span className="font-headline-md text-headline-md font-bold text-primary mr-1">{brandConfig.currencySymbol}</span>
            <input id="price-input" type="number" min="1" step="1" placeholder="0" value={formData.dailyPrice} onChange={(e) => onUpdateField('dailyPrice', e.target.value)} className="font-headline-md text-headline-md font-bold text-primary w-24 bg-transparent focus:outline-none" />
            <span className="font-body-md text-body-md text-on-surface-variant font-medium">/ day</span>
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5 text-secondary">
              <span className="material-symbols-outlined text-[18px]">payments</span>
              <span className="font-label-sm text-label-sm font-semibold">Student-friendly daily rate</span>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant">Zero listing fees. Direct student hand-off.</span>
          </div>
        </div>
        <FieldError message={errors.dailyPrice} />
      </div>

      <div>
        <label className="block font-label-md text-label-md text-primary font-semibold mb-2" htmlFor="meetup-spot">
          Preferred Campus Meetup Point <span className="text-secondary">*</span>
        </label>
        <div className="relative">
          <input id="meetup-spot" type="text" placeholder="Enter a campus pickup spot (e.g., Central Library Steps or Student Union)" value={formData.meetupSpot} onChange={(e) => onUpdateField('meetupSpot', e.target.value)} className="w-full bg-surface-container-low text-primary font-body-md text-body-md px-4 py-3 rounded-xl focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary/30 transition-all pl-11" />
          <span className="material-symbols-outlined absolute left-3.5 top-3.5 text-secondary text-[20px]">near_me</span>
        </div>
        <FieldError message={errors.meetupSpot} />
      </div>

      <div>
        <span className="block font-label-md text-label-md text-primary font-semibold mb-3">Availability Status</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {availabilityModes.map((mode) => {
            const active = formData.availability === mode.value;
            return (
              <button key={mode.value} type="button" onClick={() => onUpdateField('availability', mode.value)} className={`flex items-center justify-between p-3.5 rounded-xl bg-surface-container-low text-left transition-all ${active ? 'ring-1 ring-secondary/40' : 'opacity-75 hover:opacity-100'}`}>
                <div className="flex items-center gap-2.5">
                  <span className={`w-3 h-3 rounded-full ${mode.dotClass}`} />
                  <span className="font-title-md text-title-md text-primary font-semibold">{mode.label}</span>
                </div>
                <span className="material-symbols-outlined text-secondary text-[20px]">
                  {active ? 'radio_button_checked' : 'radio_button_unchecked'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// 4. Review & Publish Section: Summary pills, full review panel, and publish/preview actions
export function ReviewAndPublishSection({
  formData,
  showReviewModal,
  formErrorBanner,
  submitMessage,
  onOpenReview,
  onCloseReview,
  onSaveDraft,
}: {
  formData: ListingFormData;
  showReviewModal: boolean;
  formErrorBanner: string;
  submitMessage: string;
  onOpenReview: () => void;
  onCloseReview: () => void;
  onSaveDraft: () => void;
}) {
  const parsedPrice = Number(formData.dailyPrice);
  const summaryPills = [
    { icon: 'category', text: formData.category ? formData.category.split('&')[0].trim() : 'No category' },
    { icon: 'verified', text: formData.condition ? `${formData.condition} Condition` : 'No condition' },
    { icon: 'payments', text: formData.dailyPrice.trim() && parsedPrice > 0 ? `${brandConfig.currencySymbol}${parsedPrice} / day` : 'Price not set' },
    { icon: 'location_on', text: formData.meetupSpot.trim() || 'Pickup not set' },
  ];

  return (
    <section className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm flex flex-col gap-6">
      <div>
        <h2 className="font-headline-md text-headline-md text-primary font-bold">4. Review &amp; Publish</h2>
        <div className="flex flex-wrap gap-2 mt-3">
          {summaryPills.map((pill) => (
            <span key={pill.icon} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container text-primary font-label-sm text-label-sm font-semibold">
              <span className="material-symbols-outlined text-[14px]">{pill.icon}</span>
              {pill.text}
            </span>
          ))}
        </div>
      </div>

      {showReviewModal && (
        <div data-testid="listing-review-summary" className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/40 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-title-md text-title-md text-primary font-bold">Listing Review Summary</h3>
            <button type="button" onClick={onCloseReview} className="text-on-surface-variant hover:text-primary font-label-sm text-label-sm underline">
              Hide preview
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-body-sm text-body-sm">
            <p><strong className="text-primary">Item:</strong> {formData.productName}</p>
            <p><strong className="text-primary">Category:</strong> {formData.category}</p>
            <p><strong className="text-primary">Condition:</strong> {formData.condition}</p>
            <p><strong className="text-primary">Daily Rate:</strong> {brandConfig.currencySymbol}{formData.dailyPrice} / day</p>
            <p className="sm:col-span-2"><strong className="text-primary">Pickup Location:</strong> {formData.meetupSpot}</p>
            <p className="sm:col-span-2 text-on-surface-variant">{formData.description}</p>
          </div>
          <div className="flex gap-2 overflow-x-auto pt-1">
            {formData.photos.map((photo, index) => (
              <img key={photo.id} src={photo.url} alt={`Review thumbnail ${index + 1}`} className="w-16 h-12 rounded-lg object-cover border border-outline-variant" />
            ))}
          </div>
        </div>
      )}

      {(formErrorBanner || submitMessage) && (
        <FormAlert errorMessage={formErrorBanner} infoMessage={submitMessage} />
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <button id="publish-btn" type="submit" className="flex-1 inline-flex items-center justify-center gap-2 font-title-md text-title-md font-semibold text-on-secondary bg-secondary hover:bg-on-secondary-fixed-variant transition-colors py-3.5 px-6 rounded-xl shadow-sm">
          <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
          Publish Listing
        </button>
        <button type="button" onClick={onOpenReview} className="inline-flex items-center justify-center gap-2 font-title-md text-title-md font-semibold text-primary bg-surface-container-low hover:bg-surface-container transition-colors py-3.5 px-6 rounded-xl">
          <span className="material-symbols-outlined text-[20px]">visibility</span>
          Preview Full Page
        </button>
      </div>

      <div className="flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm pt-2">
        <button type="button" onClick={onSaveDraft} className="hover:text-primary underline transition-colors">
          Save as Draft
        </button>
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px] text-secondary">security</span>
          Verified .edu credentials required
        </span>
      </div>
    </section>
  );
}
