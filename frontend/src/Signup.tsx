// ============================================================================
// FILE: Signup.tsx
// Purpose: RentLoop Sign Up Page connected to Supabase Auth
//          (supabase.auth.signUp). Handles email confirmation and redirects
//          authenticated users to the requested destination or /dashboard/owner.
// ============================================================================

import { FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CriteriaPill, FormAlert, IconInput, PasswordInput, SignupShowcase } from './AuthComponents';
import { AuthLayout } from './Layout';
import { getSafeRedirectPath, supabase } from './supabaseClient';

export default function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const redirectPath = getSafeRedirectPath(redirectParam);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [institution, setInstitution] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // Live password strength criteria checks
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  // Validate required fields and register user with Supabase Auth
  async function handleSignupSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    const trimmedEmail = email.trim();
    if (!fullName.trim()) return setErrorMessage('Please enter your full name.');
    if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      return setErrorMessage('Please enter a valid email address.');
    }
    if (!institution.trim()) return setErrorMessage('Please enter your college or university.');
    if (!password) return setErrorMessage('Please create a password.');
    if (!hasMinLength) return setErrorMessage('Password must be at least 8 characters long.');
    if (password !== confirmPassword) return setErrorMessage('Please make sure your passwords match.');
    if (!agreedToTerms) return setErrorMessage('Please agree to the Terms of Service and Privacy Policy.');

    setIsSubmitting(true);
    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          phone: phone.trim(),
          institution: institution.trim(),
        },
      },
    });
    setIsSubmitting(false);

    if (error) return setErrorMessage(error.message);

    if (data.user?.identities?.length === 0) {
      return setErrorMessage('An account with this email address already exists. Please log in instead.');
    }

    if (data.session) {
      navigate(redirectPath, { replace: true });
      return;
    }

    if (data.user) {
      setInfoMessage(
        `Registration submitted for ${trimmedEmail}. Please check your email inbox and click the confirmation link before logging in.`
      );
    }
  }

  const loginLink = redirectParam ? `/login?redirect=${encodeURIComponent(redirectParam)}` : '/login';

  return (
    <AuthLayout>
      <div className="w-full py-8 md:py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <SignupShowcase />

        <div className="lg:col-span-7 bg-surface-container-lowest rounded-2xl p-6 sm:p-10 shadow-md">
          <div className="mb-7">
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">Join the community.</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1.5">
              Create your account and start sharing useful things with verified students and staff.
            </p>
          </div>

          <form className="space-y-4" noValidate onSubmit={handleSignupSubmit}>
            <FormAlert errorMessage={errorMessage} infoMessage={infoMessage} />

            <IconInput id="fullName" label="Full Name" icon="person_outline" placeholder="e.g., Alex Morgan" value={fullName} onChange={setFullName} required />
            <IconInput id="email" label="Email Address" icon="mail" type="email" placeholder="name@example.com" value={email} onChange={setEmail} required />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <IconInput id="phone" label="Phone Number" icon="call" type="tel" placeholder="+1 (555) 019-2834" value={phone} onChange={setPhone} optionalText="(optional)" />
              <IconInput id="institution" label="College / University" icon="apartment" placeholder="e.g., Stanford University" value={institution} onChange={setInstitution} required />
            </div>

            <PasswordInput
              id="password"
              label="Password"
              placeholder="Create a strong password"
              value={password}
              onChange={setPassword}
              showPassword={showPassword}
              onToggleVisibility={() => setShowPassword((prev) => !prev)}
            />

            <div>
              <PasswordInput
                id="confirmPassword"
                label="Confirm Password"
                icon="lock_reset"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                showPassword={showConfirmPassword}
                onToggleVisibility={() => setShowConfirmPassword((prev) => !prev)}
              />
              {passwordsMismatch && (
                <p className="font-body-sm text-body-sm mt-1 text-error flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span> Passwords do not match
                </p>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-surface-container-low flex flex-col gap-2">
              <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider">Password Criteria</span>
              <div className="flex flex-wrap gap-2 text-body-sm">
                <CriteriaPill met={hasMinLength} label="At least 8 characters" />
                <CriteriaPill met={hasNumber} label="Includes a number" />
                <CriteriaPill met={hasSpecialChar} label="One special character" />
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer pt-1">
              <input checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="mt-1 w-4 h-4 accent-secondary cursor-pointer" type="checkbox" />
              <span className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                I agree to the <a className="text-secondary font-semibold hover:underline" href="#terms">Terms of Service</a> and{' '}
                <a className="text-secondary font-semibold hover:underline" href="#privacy">Privacy Policy</a>. I understand that one account enables both lending and renting on campus.
              </span>
            </label>

            <button
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-xl bg-primary-container text-on-primary font-title-md text-title-md font-semibold shadow-md hover:bg-secondary disabled:opacity-60 transition-all flex items-center justify-center gap-2"
              type="submit"
            >
              <span>{isSubmitting ? 'Creating Account...' : 'Create Account'}</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </form>

          <div className="mt-6 pt-5 flex items-center justify-center gap-1.5 bg-surface-container-low rounded-xl py-3">
            <span className="font-body-md text-body-md text-on-surface-variant">Already have an account?</span>
            <Link className="font-title-md text-body-md text-secondary font-bold hover:underline inline-flex items-center" to={loginLink}>
              Log In <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
