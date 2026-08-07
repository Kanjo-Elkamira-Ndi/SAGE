import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useReducedMotion, motion, AnimatePresence } from "framer-motion";
import { Lock, ArrowRight, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { AuthSplitScreen } from "@/components/layout/AuthSplitScreen";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DURATION, EASE, fadeIn } from "@/lib/motion";
import { resetPassword } from "@/lib/apiClient";
import { sageErrorText } from "@/lib/queryClient";

function getStrength(password: string): {
  level: number;
  label: string;
  color: string;
} {
  if (!password) return { level: 0, label: "None", color: "bg-border" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;

  if (score <= 1) return { level: 1, label: "Weak", color: "bg-danger" };
  if (score === 2) return { level: 2, label: "Fair", color: "bg-warning" };
  if (score === 3) return { level: 3, label: "Good", color: "bg-info" };
  return { level: 4, label: "Strong", color: "bg-success" };
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const prefersReduced = useReducedMotion();
  const strength = getStrength(password);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    if (!token) {
      navigate("/reset-expired", { replace: true });
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(token, password);
      setSubmitted(true);
    } catch (err) {
      const code = err instanceof Error && "code" in err ? (err as { code?: string }).code : undefined;
      if (
        code === "RESET_TOKEN_INVALID" ||
        code === "RESET_TOKEN_USED" ||
        code === "RESET_TOKEN_EXPIRED"
      ) {
        navigate("/reset-expired", { replace: true });
        return;
      }
      setError(sageErrorText(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthSplitScreen
      image="auth2"
      headline="Your security is our priority."
      subtext="We use industry-standard encryption to keep your academic records and personal data safe."
    >
      <motion.div
        className="w-full max-w-md"
        initial={prefersReduced ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.entrance / 1000, ease: EASE.out }}
      >
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="form"
              initial={prefersReduced ? false : fadeIn.initial}
              animate={fadeIn.animate}
              exit={prefersReduced ? undefined : fadeIn.exit}
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-subtle">
                <Lock className="h-6 w-6 text-primary" />
              </div>

              <h2 className="mb-2 text-2xl font-bold text-text-primary">
                Reset Password
              </h2>
              <p className="mb-8 text-text-secondary">
                Please choose a secure new password for your SAGE account.
              </p>

              <form className="space-y-5" onSubmit={onSubmit}>
                {error && (
                  <div className="rounded-lg border border-admin-danger-soft bg-admin-danger-soft/40 px-4 py-3 text-sm font-medium text-danger">
                    {error}
                  </div>
                )}

                {/* New Password */}
                <div>
                  <label
                    htmlFor="newPassword"
                    className="mb-1.5 block text-sm font-medium text-text-primary"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                    <Input
                      id="newPassword"
                      type={showNew ? "text" : "password"}
                      placeholder="Enter new password"
                      className="pl-10 pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={submitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary transition-colors hover:text-text-primary"
                      aria-label={showNew ? "Hide password" : "Show password"}
                    >
                      {showNew ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Strength meter */}
                  <div className="mt-3">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-text-secondary">
                        Password Strength
                      </span>
                      <span className="font-medium text-text-primary">
                        {strength.label}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${
                            i <= strength.level ? strength.color : "bg-border"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-text-secondary">
                      Minimum 8 characters, include a number and a symbol.
                    </p>
                  </div>
                </div>

                {/* Confirm */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-1.5 block text-sm font-medium text-text-primary"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Confirm new password"
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
                        showConfirm ? "Hide password" : "Show password"
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

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={submitting}
                >
                  {submitting ? "Resetting…" : "Reset Password"}
                  {!submitting && <ArrowRight className="h-4 w-4" />}
                </Button>
              </form>

              <div className="mt-6">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-primary"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              className="text-center"
              initial={prefersReduced ? false : fadeIn.initial}
              animate={fadeIn.animate}
              exit={prefersReduced ? undefined : fadeIn.exit}
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <svg
                  className="h-8 w-8 text-success"
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

              <h3 className="mb-2 text-xl font-bold text-text-primary">
                Password Updated
              </h3>
              <p className="mb-8 text-text-secondary">
                Your account security has been updated successfully. You can now
                log in with your new password.
              </p>

              <Button asChild size="lg" className="w-full">
                <Link to="/login">Return to Login</Link>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AuthSplitScreen>
  );
}
