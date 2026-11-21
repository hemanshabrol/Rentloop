// ============================================================================
// FILE: brand.ts
// Purpose: Central configuration for application branding and campus settings.
// Allows switching between "RentLoop" and "Rentora" in one single place.
// ============================================================================

export const brandConfig = {
  appName: import.meta.env.VITE_APP_NAME || 'RentLoop',
  tagline: 'Access more. Own less.',
  legalEntity: 'RentLoop Inc.',
  copyrightYear: 2025,
  currencySymbol: '₹',
  defaultCampus: 'Thapar Institute of Engineering and Technology',
};

