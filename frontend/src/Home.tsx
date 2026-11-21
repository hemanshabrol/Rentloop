// ============================================================================
// FILE: Home.tsx
// Purpose: Combines the Homepage layout, C++ backend health status check,
//          and modular homepage sections from HomeSections.tsx.
// ============================================================================

import { useEffect, useState } from 'react';
import {
  CategorySection,
  EcosystemAndCtaSection,
  FeaturedProductsSection,
  HeroSection,
  HowItWorksSection,
} from './HomeSections';
import { Footer, Navbar } from './Layout';
import { fetchHealthStatus } from './services/apiClient';
import { HealthResponse } from './types/api';

export default function Home() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [backendOffline, setBackendOffline] = useState(false);

  // Check C++17 backend connectivity (/api/v1/health) when the homepage loads
  useEffect(() => {
    fetchHealthStatus()
      .then(setHealth)
      .catch(() => setBackendOffline(true));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-surface font-body-md text-on-surface antialiased">
      <Navbar activePage="home" />

      <main id="top" className="w-full pt-20 bg-surface">
        <div className="w-full bg-surface-container-high text-on-surface-variant text-center py-2 px-margin-mobile md:px-margin font-label-sm text-label-sm tracking-wide">
          <span className="inline-flex items-center gap-1.5 justify-center">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            Direct student-to-student verification enabled across campus hubs.
          </span>
        </div>

        <div className="w-full max-w-7xl mx-auto px-margin-mobile md:px-margin flex flex-col gap-space-xl">
          <HeroSection />
          <CategorySection />
          <FeaturedProductsSection />
          <HowItWorksSection />
          <EcosystemAndCtaSection />
        </div>
      </main>

      <Footer health={health} backendOffline={backendOffline} />
    </div>
  );
}
