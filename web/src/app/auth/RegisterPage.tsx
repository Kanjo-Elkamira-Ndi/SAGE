import { useState } from "react";
import { Link } from "react-router-dom";
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

const departments = [
  "Computer Science & Engineering",
  "Mathematics & Statistics",
  "Applied Physics",
  "Humanities & Social Sciences",
  "Business Administration",
];

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const prefersReduced = useReducedMotion();

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

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
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
              />
            </div>
          </div>

          {/* Department */}
          <div>
            <label
              htmlFor="department"
              className="mb-1.5 block text-sm font-medium text-text-primary"
            >
              Department
            </label>
            <select
              id="department"
              className="flex h-10 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="" disabled>
                Select your department
              </option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
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
          <Button type="submit" className="w-full" size="lg">
            Create Account
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        {/* Login link */}
        <p className="mt-8 text-center text-sm text-text-secondary">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-primary hover:text-primary-hover"
          >
            Log In
          </Link>
        </p>
      </motion.div>
    </AuthSplitScreen>
  );
}
