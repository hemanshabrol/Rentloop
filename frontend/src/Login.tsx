// ============================================================================
// FILE: Login.tsx
// Purpose: RentLoop Login Page connected to Supabase Auth
//          (supabase.auth.signInWithPassword). Redirects to the requested
//          destination or /dashboard/owner after successful authentication.
// ============================================================================

import { FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FormAlert, IconInput, LoginShowcase, PasswordInput } from './AuthComponents';
import { AuthLayout } from './Layout';
import { getSafeRedirectPath, supabase } from './supabaseClient';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const redirectPath = getSafeRedirectPath(redirectParam);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Validate required fields and sign in with Supabase Auth
  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) return setErrorMessage('Please enter your email address.');
    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      return setErrorMessage('Please enter a valid email address.');
    }
    if (!password) return setErrorMessage('Please enter your password.');

    setIsSubmitting(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });
    setIsSubmitting(false);

    if (error) {
      const lowerMsg = error.message.toLowerCase();
      if (lowerMsg.includes('email not confirmed')) {
        setErrorMessage('Please confirm your email address before logging in. Check your inbox for the confirmation link.');
      } else if (lowerMsg.includes('invalid login credentials')) {
        setErrorMessage('Invalid email or password. Please check your credentials and try again.');
      } else {
        setErrorMessage(error.message);
      }
      return;
    }

    if (data.session) {
      navigate(redirectPath, { replace: true });
    }
  }

  const signupLink = redirectParam ? `/signup?redirect=${encodeURIComponent(redirectParam)}` : '/signup';

  return (
    <AuthLayout>
      <div className="relative w-full overflow-hidden py-10 lg:py-16 px-6 lg:px-12 flex justify-center items-center">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 right-0 w-[480px] h-[480px] rounded-full bg-primary-fixed/30 blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <LoginShowcase />

          <div className="lg:col-span-6 w-full">
            <div className="bg-surface-container-lowest rounded-xl p-8 sm:p-10 shadow-md border border-outline-variant/30 max-w-lg mx-auto lg:max-w-none">
              <div className="mb-8">
                <h2 className="font-headline-md text-headline-md font-bold text-primary tracking-tight">Welcome back.</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1.5">Your campus marketplace is waiting for you.</p>
              </div>

              <form className="space-y-5" noValidate onSubmit={handleLoginSubmit}>
                <FormAlert errorMessage={errorMessage} infoMessage="" />

                <IconInput
                  id="campus-email"
                  label="Email Address"
                  icon="mail"
                  type="email"
                  placeholder="name@university.edu"
                  value={email}
                  onChange={setEmail}
                  required
                />

                <PasswordInput
                  id="account-password"
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={setPassword}
                  showPassword={showPassword}
                  onToggleVisibility={() => setShowPassword((prev) => !prev)}
                />

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 border-outline-variant text-secondary rounded-sm cursor-pointer"
                      type="checkbox"
                    />
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Remember me</span>
                  </label>
                  <a className="font-label-md text-label-md text-secondary hover:underline" href="#forgot-password">
                    Forgot password?
                  </a>
                </div>

                <button
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-primary text-on-primary font-title-md text-title-md font-semibold shadow-sm hover:bg-primary-container disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                  type="submit"
                >
                  <span>{isSubmitting ? 'Logging in...' : 'Log In'}</span>
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-surface-container-high text-center">
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Don&apos;t have an account yet?{' '}
                  <Link className="font-semibold text-secondary hover:underline ml-1" to={signupLink}>
                    Create an account
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
