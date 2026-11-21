// ============================================================================
// FILE: AuthComponents.tsx
// Purpose: Reusable form elements (IconInput, PasswordInput, FormAlert,
//          CriteriaPill) and campus showcase panels shared by Login and Signup.
// ============================================================================

import { brandConfig } from './config/brand';
import { SAMPLE_ITEMS } from './data';

// Reusable Error / Status Alert Banner for forms and dashboards
export function FormAlert({ errorMessage, infoMessage }: { errorMessage: string; infoMessage: string }) {
  return (
    <>
      {errorMessage && (
        <div role="alert" className="p-3 rounded-lg bg-error-container text-on-error-container text-body-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{errorMessage}</span>
        </div>
      )}
      {infoMessage && (
        <div role="status" className="p-3 rounded-lg bg-surface-container-low text-primary border border-outline-variant/40 text-body-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[18px]">info</span>
          <span>{infoMessage}</span>
        </div>
      )}
    </>
  );
}

interface IconInputProps {
  id: string;
  label: string;
  icon: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  optionalText?: string;
}

export function IconInput({
  id,
  label,
  icon,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  optionalText,
}: IconInputProps) {
  return (
    <div>
      <label className="block font-label-md text-label-md text-primary font-semibold mb-1.5" htmlFor={id}>
        {label}{' '}
        {required && <span className="text-error">*</span>}
        {optionalText && <span className="text-on-surface-variant font-normal font-body-sm">{optionalText}</span>}
      </label>
      <div className="relative flex items-center">
        <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[20px] pointer-events-none">
          {icon}
        </span>
        <input
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest text-primary font-body-md text-body-md placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-secondary/50"
          id={id}
          placeholder={placeholder}
          required={required}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

interface PasswordInputProps {
  id: string;
  label: string;
  icon?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  showPassword: boolean;
  onToggleVisibility: () => void;
}

export function PasswordInput({
  id,
  label,
  icon = 'lock',
  placeholder,
  value,
  onChange,
  showPassword,
  onToggleVisibility,
}: PasswordInputProps) {
  return (
    <div>
      <label className="block font-label-md text-label-md text-primary font-semibold mb-1.5" htmlFor={id}>
        {label} <span className="text-error">*</span>
      </label>
      <div className="relative flex items-center">
        <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[20px] pointer-events-none">
          {icon}
        </span>
        <input
          className="w-full pl-11 pr-11 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest text-primary font-body-md text-body-md placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-secondary/50"
          id={id}
          placeholder={placeholder}
          required
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          aria-label="Toggle password visibility"
          className="absolute right-3.5 text-on-surface-variant hover:text-primary p-1"
          onClick={onToggleVisibility}
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">
            {showPassword ? 'visibility_off' : 'visibility'}
          </span>
        </button>
      </div>
    </div>
  );
}

export function CriteriaPill({ met, label }: { met: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full shadow-sm font-label-sm ${
        met ? 'bg-secondary text-on-secondary' : 'bg-surface text-on-surface-variant'
      }`}
    >
      <span className="material-symbols-outlined text-[14px]">
        {met ? 'check_circle' : 'radio_button_unchecked'}
      </span>
      {label}
    </span>
  );
}

// Left Showcase Column for the Login Page
export function LoginShowcase() {
  return (
    <div className="lg:col-span-6 flex flex-col justify-between space-y-8">
      <div className="space-y-3">
        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight leading-tight">
          Find what you need.<br />
          <span className="text-secondary">Share what you own.</span>
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md">
          Log in to manage your active rentals, respond to incoming requests, or reserve equipment right across campus.
        </p>
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 bg-surface-container-low px-3 py-2 rounded-lg">
          <span className="material-symbols-outlined text-secondary text-[20px]">inventory_2</span>
          <span className="font-label-md text-label-md text-primary">Available Campus Equipment</span>
        </div>

        {SAMPLE_ITEMS.slice(0, 2).map((item) => (
          <div key={item.id} className="flex items-center gap-3.5 p-2 rounded-lg hover:bg-surface-container transition-colors">
            <img className="w-14 h-14 rounded-lg object-cover shrink-0 bg-surface-container-high" alt={item.imageAlt} src={item.imageUrl} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-title-md text-title-md text-primary truncate">{item.name}</span>
                <span className="font-title-md text-title-md text-primary font-bold shrink-0">
                  {brandConfig.currencySymbol}{item.pricePerDay}<span className="font-body-sm text-body-sm text-on-surface-variant">/day</span>
                </span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-secondary text-[14px]">location_on</span>
                {item.ownerAndLocation}
              </span>
            </div>
          </div>
        ))}

        <div className="pt-2 flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-secondary text-[18px]">shield</span>Student ID verified
          </span>
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-secondary text-[18px]">credit_card</span>Secured campus escrow
          </span>
        </div>
      </div>
    </div>
  );
}

const SIGNUP_BENEFITS = [
  {
    icon: 'payments',
    title: 'Fair peer-to-peer rates',
    text: 'Affordable daily pricing set directly by community members.',
  },
  {
    icon: 'handshake',
    title: 'Convenient campus handoffs',
    text: 'In-person meetups right in libraries, student centers, and dorm quads.',
  },
  {
    icon: 'savings',
    title: 'Zero listing charges',
    text: 'Free to register and list items. Keep 100% of your listed earnings.',
  },
];

// Left Showcase Column for the Sign Up Page
export function SignupShowcase() {
  return (
    <div className="lg:col-span-5 flex flex-col gap-6">
      <div className="bg-surface-container-low rounded-2xl p-6 sm:p-7 shadow-sm">
        <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight leading-tight mb-3">
          Access more.<br />
          <span className="text-secondary">Own less.</span>
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
          One account to borrow or share. Join your campus community to access quality gear when you need it and earn from what sits idle in your dorm.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        {SAMPLE_ITEMS.slice(0, 4).map((item) => (
          <div key={item.id} className="group bg-surface-container-lowest rounded-xl p-3 shadow-sm">
            <div className="relative w-full h-32 rounded-lg overflow-hidden bg-surface-container mb-2.5">
              <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={item.imageAlt} src={item.imageUrl} />
              <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-primary/80 text-on-primary font-label-sm text-label-sm">
                {brandConfig.currencySymbol}{item.pricePerDay}/day
              </span>
            </div>
            <span className="font-title-md text-body-md text-primary font-semibold truncate block">{item.name}</span>
            <span className="text-on-surface-variant font-body-sm text-body-sm">{item.ownerAndLocation}</span>
          </div>
        ))}
      </div>

      <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm flex flex-col gap-3.5">
        {SIGNUP_BENEFITS.map((benefit) => (
          <div key={benefit.icon} className="flex items-start gap-3">
            <span className="material-symbols-outlined p-1.5 rounded-lg bg-secondary/10 text-secondary text-[18px]">
              {benefit.icon}
            </span>
            <div>
              <h4 className="font-title-md text-body-md text-primary font-semibold">{benefit.title}</h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{benefit.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
