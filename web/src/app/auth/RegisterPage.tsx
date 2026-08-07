import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useReducedMotion, motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  LockKeyhole,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { AuthSplitScreen } from "@/components/layout/AuthSplitScreen";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DURATION, EASE } from "@/lib/motion";
import { register } from "@/lib/apiClient";
import { sageErrorText } from "@/lib/queryClient";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);
  const prefersReduced = useReducedMotion();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await register(fullName.trim(), email.trim(), password);
      setRegistered(true);
      if (!result.pendingApproval) {
        window.setTimeout(() => navigate("/login"), 1500);
      }
    } catch (err) {
      setError(sageErrorText(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthSplitScreen
      image="auth2"
      headline="Join a community of scholars and innovators."
      subtext="Smart Academy Guidance Engine: Elevating academic journeys through intelligent coordination."
    >
      <motion.div
        className="w-full max-w-md"
        initial={prefersReduced ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.entrance / 1000, ease: EASE.out }}
      >
        {/* Mobile heading */}
        <div className="mb-8 lg:hidden">
          <h1 className="text-2xl font-bold text-text-primary">
            Create your account
          </h1>
          <p className="mt-1 text-text-secondary">
            Start your journey with academic excellence.
          </p>
        </div>

        <h2 className="mb-2 text-2xl font-bold text-text-primary">
          Create your account
        </h2>
        <p className="mb-8 text-text-secondary">
          Start your journey with academic excellence.
        </p>

        {registered ? (
          <div className="rounded-lg border border-success/30 bg-success/10 px-4 py-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success/15">
              <svg
                className="h-6 w-6 text-success"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="mb-1 text-lg font-bold text-text-primary">
              Account created
            </h3>
            <p className="text-sm text-text-secondary">
              Your account is ready. Redirecting you to log in…
            </p>
          </div>
        ) : (
        <form className="space-y-5" onSubmit={onSubmit}>
          {error && (
            <div className="rounded-lg border border-admin-danger-soft bg-admin-danger-soft/40 px-4 py-3 text-sm font-medium text-danger">
              {error}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label
              htmlFor="name"
              className="mb-1.5 block text-sm font-medium text-text-primary"
            >
              Full Name
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                className="pl-10"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-text-primary"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
              <Input
                id="email"
                type="email"
                placeholder="you@university.edu"
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-text-primary"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                className="pl-10 pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary transition-colors hover:text-text-primary"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1.5 block text-sm font-medium text-text-primary"
            >
              Confirm
            </label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm your password"
                className="pl-10 pr-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={submitting}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary transition-colors hover:text-text-primary"
                aria-label={
                  showConfirm
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                {showConfirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="terms"
              className="mt-1 h-4 w-4 rounded border-border accent-primary"
            />
            <label htmlFor="terms" className="text-sm text-text-secondary">
              I agree to the{" "}
              <Link
                to="/terms"
                className="font-medium text-primary hover:text-primary-hover"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                to="/privacy"
                className="font-medium text-primary hover:text-primary-hover"
              >
                Privacy Policy
              </Link>
              .
            </label>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={submitting}
          >
            {submitting ? "Creating account…" : "Create Account"}
            {!submitting && <ArrowRight className="h-4 w-4" />}
          </Button>
        </form>
        )}

        {/* Login link */}
        {registered ? (
          <p className="mt-8 text-center text-sm text-text-secondary">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-primary hover:text-primary-hover"
            >
              Log In
            </Link>
          </p>
        ) : (
        <p className="mt-8 text-center text-sm text-text-secondary">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-primary hover:text-primary-hover"
          >
            Log In
          </Link>
        </p>
        )}
      </motion.div>
    </AuthSplitScreen>
  );
}
