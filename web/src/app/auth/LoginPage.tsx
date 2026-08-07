import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useReducedMotion, motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { AuthSplitScreen } from "@/components/layout/AuthSplitScreen";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DURATION, EASE } from "@/lib/motion";
import { useAuth } from "@/context/AuthContext";
import { sageErrorText } from "@/lib/queryClient";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, sessionMessage, clearSessionMessage } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(sessionMessage);
  const [submitting, setSubmitting] = useState(false);
  const prefersReduced = useReducedMotion();

  const bannerMessage = error ?? sessionMessage;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    clearSessionMessage();
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(sageErrorText(err));
    } finally {
      setSubmitting(false);
    }
  };

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

        {bannerMessage && (
          <div className="mb-5 rounded-lg border border-admin-danger-soft bg-admin-danger-soft/40 px-4 py-3 text-sm font-medium text-danger">
            {bannerMessage}
          </div>
        )}

        <form className="space-y-5" onSubmit={onSubmit}>
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
                required
                autoComplete="email"
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
                required
                autoComplete="current-password"
                placeholder="Enter your password"
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

          {/* Submit */}
          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? "Signing in…" : "Log In"}
            {!submitting && <ArrowRight className="h-4 w-4" />}
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
          <Button variant="secondary" size="md" disabled={submitting}>
            SSO
          </Button>
          <Button variant="secondary" size="md" disabled={submitting}>
            EduID
          </Button>
        </div>

        {/* Register link */}
        <p className="mt-8 text-center text-sm text-text-secondary">
          Don&apos;t have an account?{" "}
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
