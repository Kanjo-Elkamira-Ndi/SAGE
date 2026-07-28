import { useState } from "react";
import { Link } from "react-router-dom";
import { useReducedMotion, motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { AuthSplitScreen } from "@/components/layout/AuthSplitScreen";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DURATION, EASE } from "@/lib/motion";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const prefersReduced = useReducedMotion();

  return (
    <AuthSplitScreen
      image="auth1"
      headline="Welcome Back"
      subtext="Smart Academy Guidance Engine — Elevating the standard of academic excellence. Experience the future of intelligent campus management with SAGE."
    >
      <motion.div
        className="w-full max-w-md"
        initial={prefersReduced ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.entrance / 1000, ease: EASE.out }}
      >
        {/* Mobile heading */}
        <div className="mb-8 lg:hidden">
          <h1 className="text-2xl font-bold text-text-primary">Welcome Back</h1>
          <p className="mt-1 text-text-secondary">
            Smart Academy Guidance Engine
          </p>
        </div>

        <h2 className="mb-2 text-2xl font-bold text-text-primary">Log In</h2>
        <p className="mb-8 text-text-secondary">
          Access your academic dashboard
        </p>

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
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

          {/* Password */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-sm font-medium text-text-primary"
              >
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-primary hover:text-primary-hover"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
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

          {/* Submit */}
          <Button type="submit" className="w-full" size="lg">
            Log In
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        {/* SSO Divider */}
        <div className="my-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-3 text-text-secondary">
                Or continue with
              </span>
            </div>
          </div>
        </div>

        {/* SSO Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" size="md">
            SSO
          </Button>
          <Button variant="secondary" size="md">
            EduID
          </Button>
        </div>

        {/* Register link */}
        <p className="mt-8 text-center text-sm text-text-secondary">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-primary hover:text-primary-hover"
          >
            Register
          </Link>
        </p>
      </motion.div>
    </AuthSplitScreen>
  );
}
