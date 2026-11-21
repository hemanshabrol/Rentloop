// ============================================================================
// FILE: data.ts
// Purpose: Shared TypeScript interfaces and static UI constants for categories,
//          "How it works" steps, and Login/Signup decorative showcase cards.
// ============================================================================

export interface CategoryItem {
  name: string;
  key: string;
  description: string;
  icon: string;
  wideOnMobile?: boolean;
}

export interface ProductSpec {
  label: string;
  value: string;
  sublabel: string;
}

export interface RentalItem {
  id: number;
  ownerId?: string;
  name: string;
  subtitle: string;
  categoryKey: string;
  categoryLabel: string;
  locationKey: string;
  ownerName: string;
  ownerInitials: string;
  ownerBio: string;
  ownerAndLocation: string;
  pricePerDay: number;
  badgeNote: string;
  conditionNote: string;
  condition?: string;
  pickupLocation?: string;
  availabilityStatus?: 'available' | 'paused';
  description: string;
  imageUrl: string;
  imageAlt: string;
  galleryImages: string[];
  inclusions: string[];
  specs: ProductSpec[];
}

export interface HowItWorksStep {
  stepNumber: string;
  title: string;
  description: string;
  footerLabel: string;
}

export interface ShowcaseItem {
  id: number;
  name: string;
  ownerAndLocation: string;
  pricePerDay: number;
  imageUrl: string;
  imageAlt: string;
}

export const HOME_CATEGORIES: CategoryItem[] = [
  { name: 'Electronics', key: 'audio', description: 'Monitors, hubs & audio', icon: 'devices' },
  { name: 'Photography', key: 'photography', description: 'Bodies, lenses & rigs', icon: 'photo_camera' },
  { name: 'Sports & Mobility', key: 'mobility', description: 'Bikes, racks & outdoors', icon: 'pedal_bike' },
  { name: 'Academic', key: 'academic', description: 'Calculators, models & lab', icon: 'calculate' },
  { name: 'Event Equipment', key: 'event', description: 'Projectors & sound sets', icon: 'videocam', wideOnMobile: true },
];

export const MARKETPLACE_CATEGORIES = [
  { key: 'all', label: 'All Categories' },
  { key: 'photography', label: 'Photography' },
  { key: 'mobility', label: 'Sports & Mobility' },
  { key: 'event', label: 'Event Equipment' },
  { key: 'academic', label: 'Academic' },
  { key: 'audio', label: 'Audio Tech' },
];

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    stepNumber: '01',
    title: 'Discover',
    description: 'Find equipment and everyday essentials listed by students and staff within walking distance.',
    footerLabel: 'Browse local items',
  },
  {
    stepNumber: '02',
    title: 'Request',
    description: 'Select your required dates and submit a direct rental inquiry straight to the verified owner.',
    footerLabel: 'Set custom duration',
  },
  {
    stepNumber: '03',
    title: 'Get Approved',
    description: 'The owner reviews your timeline and coordinates a straightforward campus pickup spot.',
    footerLabel: 'Coordinate handoff',
  },
  {
    stepNumber: '04',
    title: 'Share & Return',
    description: 'Pick up the gear, finish your project or shoot, and return it safely when your slot concludes.',
    footerLabel: 'Close out cycle',
  },
];

export const HERO_MOSAIC_IMAGES = {
  camera: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCy5AejpEhXMiUj6Bux_9X2VdYL6Ly4lebQCMBtyIp4xY00VxsBDjqqeIz88t6cxN_p9VeQiiwfwnFeA3N8HX5X4jsSej6zdtZnTQuykANsbAy0iS6nMDD0mam4X9gK7DfF4BJryR-Iza9Mxs1sjT7SUMTOhOXNYfv4ymp02NUcFvC9uuw0N_vHQJfYFOEFJrITa29CGd6IQew5s2dEW-Kc6VFGzsi_S4_hd3ox7VA',
  bike: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUeiPdkIAuk6WnYJY2tH1BcSOMD0QdlxpQVH_SSJGIAuhv5QHOUJ5kE4v3APqn-AoFw8j6EuKHLIucdVuuDa-HmVLSd_b0tXr91ZH56CdxsRpJbvOUfhpQtOfZgrWIDnsQ3yyukj-i1x5xcV7_aP_STpOgvWkEjUik05N7tnYE0rgcDM6FXEQentn4Ek42KkdNULc5nUbbL1wU04I2gQNbhdwlXePrdISUdotK2Ao',
  projector: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZ66wrBSOCnhoUNsFFIzI3LrhU6TNzMTxP6rwIL5dWgJJy89gbCcazCJon_Y4wDnjFBAMZMiHBb94UQkNZ0hh2pPIZjdWscIIXXStmpExZN5ymfaassq82PYCVRX--9DjeeZhU7wheC9g0D0paUP4ut_6D3g36-OAfPp81nXorrPehV8D85Es4IUBnWffRs1--Zd_9otKaW1uta0mVumGZUtzNbwSHYvrtbrHqaZI',
};

export const SAMPLE_ITEMS: ShowcaseItem[] = [
  {
    id: 1,
    name: 'Canon EOS R5 Mirrorless Camera',
    ownerAndLocation: 'North Quad Dorms',
    pricePerDay: 800,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnj2Y5vDKxGo_I0ZzjtGS4ITW4IZNzf3DOjYmJThYoIACoMUmos-zkJMuyRRhrZR55z2ucJ_U1f-zECTDq556xkAlMBzieCc26kiJevwY9XhbAI6aM5O_ld5owoDPU3JXEu4tFV9O7Ns3lezJNIzBGXQYwHMJC4Pg_LR3o7Ciw4LjFjf9LFeHKBKcirp-HTfJGTN6DKsqBY6JyM_1JBolSgdOw-9Q8u85MiaNGyrs',
    imageAlt: 'Canon EOS R5 mirrorless digital camera',
  },
  {
    id: 2,
    name: 'Trek Dual Sport Bicycle',
    ownerAndLocation: 'West Dorms',
    pricePerDay: 300,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDy5VXS5uDqAUqIISJ9xR1B4Zv8aoJBayuAJQ4_QnTEeZkVUC27bH506R5L09r8ylT8ybrrZ1v7gn_OjOhQGYona-62aw_O3NHUOrJEgx0p01_4r7qmhcR0lINvbL_fsEXg9eQ7pILroKp32BzmI-Fu8krlmrBEOgyvPYlDeAcS9LIgvm30g8aDF3cQdLaKY0XXU4PtWBer-YK-gcUlQidPxGsBrzJec9z3wgmhOqA',
    imageAlt: 'Trek Dual Sport commuter bicycle',
  },
  {
    id: 3,
    name: 'Epson Cinema Projector',
    ownerAndLocation: 'East Commons',
    pricePerDay: 600,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBcQ9m8qcoWE1GnJTb4x5wdplVAmpMVsm0FlxDYl4LQjG8DPHvHQ0EGwNCNrilRqGP7yj3_HVGimH91THw7cBj_K1ftkTcPzLYXfRJrIoDlW0YdjdEQfTvwg4PLak61Suh52WHAPtJZYbFm-SnLNF3bJoYtJEd2AoFMZQnYDvRcA687CNaHSpymFep1yGSO4K1_d0MlzZRdqqvv9JUVXNiJuAfLgFgkkaObRYTRR08',
    imageAlt: 'Epson 1080p projector',
  },
  {
    id: 4,
    name: 'TI-84 Plus CE Calculator',
    ownerAndLocation: 'Engineering Hall',
    pricePerDay: 100,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFrQkq2EkNiDdx3wknRRl6LvNiioY5BFvZcsUPtUXsKFRw8rnTvB3rNIGC3b2LWXMcHt6M8RCGWT4Hy5K01ZC1xGAQRAiLBWHQp0ejslOUEvidP0KiRpVlDnbRKS2khFqPv40Uhxxk52PYb5egsOiFh0LbMJoeok6ojhx_Ay37D4OkUwHaACxmcjJemF9DxXbiwf3pkMswW7rbSz0qs26HbZaarHm9tKGiuj7EGLU',
    imageAlt: 'TI-84 Plus CE graphing calculator',
  },
];

// ============================================================================
// STUDENT DASHBOARD TYPES
// ============================================================================

export interface OwnerListing {
  item: RentalItem;
  status: 'active' | 'paused';
  pickupLocation: string;
}

export interface OwnerRentalRequest {
  id: string;
  bookingId: number;
  item: RentalItem;
  renterName: string;
  renterDepartment: string;
  requestedDates: string;
  durationDays: number;
  totalPrice: number;
  status: 'pending' | 'approved' | 'declined' | 'returned';
}

export interface ActivePeerRental {
  id: string;
  item: RentalItem;
  renterCampusArea: string;
  dateRange: string;
  totalPrice: number;
  durationDays: number;
  statusLabel: string;
  bookingStatus: 'pending' | 'approved' | 'declined' | 'returned';
}
