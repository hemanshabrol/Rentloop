// ============================================================================
// FILE: ListItem.tsx
// Purpose: List Your Item page controller (/listings/new and /listings/new?edit=:id).
//          Supports creating new listings and editing existing listings via
//          the C++17 backend (POST /api/v1/listings and PATCH /api/v1/listings/:id).
// ============================================================================

import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { brandConfig } from './config/brand';
import { Footer, Navbar } from './Layout';
import {
  EMPTY_LISTING_FORM,
  ListingFormData,
  ListingFormErrors,
  LiveListingPreviewSidebar,
  MAX_PHOTOS,
  OwnerAssuranceBanner,
  validateListingForm,
} from './ListItemPreview';
import {
  ProductInfoSection,
  ProductPhotosSection,
  RentalDetailsSection,
  ReviewAndPublishSection,
} from './ListItemSections';
import {
  createNewListing,
  fetchListingById,
  updateExistingListing,
} from './services/apiClient';

// Compresses an uploaded image file onto a canvas and returns a persistent JPEG data URL
function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(1, 720 / img.width, 540 / img.height);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(String(reader.result));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.72));
      };
      img.onerror = () => reject(new Error('Failed to load image file.'));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}

export default function ListItem() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editParam = searchParams.get('edit');
  const editId = editParam ? Number(editParam) : null;

  const [formData, setFormData] = useState<ListingFormData>(EMPTY_LISTING_FORM);
  const [errors, setErrors] = useState<ListingFormErrors>({});
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [formErrorBanner, setFormErrorBanner] = useState('');

  // When editing an existing listing (?edit=:id), load its current details from the C++ backend
  useEffect(() => {
    if (!editId || Number.isNaN(editId)) {
      setFormData(EMPTY_LISTING_FORM);
      return;
    }

    fetchListingById(editId)
      .then((item) => {
        setFormData({
          photos: item.galleryImages.map((url, idx) => ({
            id: `existing-${idx}`,
            url,
            alt: item.name,
          })),
          productName: item.name,
          category: item.categoryLabel,
          brandModel: item.subtitle === item.categoryLabel ? '' : item.subtitle,
          description: item.description,
          condition: item.condition || 'Excellent',
          dailyPrice: String(item.pricePerDay),
          meetupSpot: item.pickupLocation || item.ownerAndLocation,
          availability: item.availabilityStatus || 'available',
        });
      })
      .catch((err: unknown) => {
        setFormErrorBanner(err instanceof Error ? err.message : 'Unable to load listing for editing.');
      });
  }, [editId]);

  function updateField<K extends keyof ListingFormData>(field: K, value: ListingFormData[K]) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setSubmitMessage('');
    setFormErrorBanner('');
  }

  // Converts user-selected image files into persistent compressed data URLs (up to MAX_PHOTOS)
  async function addPhotoFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;

    const validFiles = Array.from(fileList).filter((file) => file.type.startsWith('image/'));
    if (validFiles.length === 0) {
      setErrors((prev) => ({ ...prev, photos: 'Please select valid image files (JPG, PNG, or WebP).' }));
      return;
    }

    const filesToProcess = validFiles.slice(0, MAX_PHOTOS - formData.photos.length);
    try {
      const dataUrls = await Promise.all(filesToProcess.map(compressImageFile));
      const newPhotos = dataUrls.map((url, idx) => ({
        id: `upload-${Date.now()}-${idx}`,
        url,
        alt: filesToProcess[idx].name || 'Uploaded campus item photo',
      }));
      updateField('photos', [...formData.photos, ...newPhotos]);
    } catch {
      setErrors((prev) => ({ ...prev, photos: 'Could not process one or more selected images.' }));
    }
  }

  function runValidation(): boolean {
    const validationErrors = validateListingForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setFormErrorBanner('Please fix the highlighted fields above before continuing.');
      setSubmitMessage('');
      return false;
    }
    setFormErrorBanner('');
    return true;
  }

  // Publishes a new listing or saves edits to an existing listing via the C++17 backend
  async function handlePublishSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!runValidation() || isPublishing) return;

    setIsPublishing(true);
    setFormErrorBanner('');
    setSubmitMessage('');

    const payload = {
      item_name: formData.productName.trim(),
      category: formData.category.trim(),
      brand_model: formData.brandModel.trim(),
      description: formData.description.trim(),
      condition: formData.condition.trim(),
      daily_price: Math.round(Number(formData.dailyPrice)),
      pickup_location: formData.meetupSpot.trim(),
      availability_status: formData.availability,
      images: formData.photos.map((p) => p.url),
    };

    try {
      const saved =
        editId && !Number.isNaN(editId)
          ? await updateExistingListing(editId, payload)
          : await createNewListing(payload);
      const actionLabel = editId && !Number.isNaN(editId) ? 'updated' : 'published';
      setSubmitMessage(
        `Listing "${saved.item_name}" ${actionLabel} (${brandConfig.currencySymbol}${saved.daily_price}/day)! Redirecting to your dashboard...`
      );
      setTimeout(() => navigate('/dashboard/owner'), 900);
    } catch (err: unknown) {
      setFormErrorBanner(err instanceof Error ? err.message : 'Failed to save listing.');
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen flex flex-col justify-between">
      <Navbar activePage="list-item" />

      <main className="w-full max-w-7xl mx-auto px-margin-mobile md:px-margin py-8 md:py-12">
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary mb-4">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
              {editId ? 'Update your campus listing' : 'Share with your community'}
            </span>
          </div>
          <h1 className="font-display text-headline-lg sm:text-display text-primary font-bold tracking-tight mb-3">
            {editId ? 'Edit your listed item.' : 'Have something worth sharing?'}
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            List your unused products and make them available to verified campus peers who need them. You stay completely in control of every exchange.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form onSubmit={handlePublishSubmit} noValidate className="lg:col-span-7 flex flex-col gap-6">
            <ProductPhotosSection
              photos={formData.photos}
              error={errors.photos}
              onAddFiles={addPhotoFiles}
              onRemovePhoto={(photoId) =>
                updateField('photos', formData.photos.filter((photo) => photo.id !== photoId))
              }
            />

            <ProductInfoSection formData={formData} errors={errors} onUpdateField={updateField} />
            <RentalDetailsSection formData={formData} errors={errors} onUpdateField={updateField} />

            <ReviewAndPublishSection
              formData={formData}
              showReviewModal={showReviewModal}
              formErrorBanner={formErrorBanner}
              submitMessage={submitMessage}
              onOpenReview={() => runValidation() && setShowReviewModal(true)}
              onCloseReview={() => setShowReviewModal(false)}
              onSaveDraft={() =>
                runValidation() &&
                setSubmitMessage('All fields validated. Click Publish Listing to save to the campus marketplace.')
              }
            />
          </form>

          <LiveListingPreviewSidebar data={formData} />
        </div>

        <OwnerAssuranceBanner />
      </main>

      <Footer />
    </div>
  );
}
