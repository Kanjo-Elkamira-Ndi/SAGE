import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useReducedMotion, motion } from "framer-motion";
import { Mail, RefreshCw, ArrowLeft, Check } from "lucide-react";
import { AuthSplitScreen } from "@/components/layout/AuthSplitScreen";
import { Button } from "@/components/ui/Button";
import { DURATION, EASE } from "@/lib/motion";
import { forgotPassword } from "@/lib/apiClient";
import { sageErrorText } from "@/lib/queryClient";

export default function CheckEmailPage() {
  const prefersReduced = useReducedMotion();
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email ?? "";
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onResend = async () => {
    if (resending || !email) return;
    setResending(true);
    setError(null);
    try {
      await forgotPassword(email);
      setResent(true);
    } catch (err) {
      setError(sageErrorText(err));
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthSplitScreen
      image="auth1"
      headline="Check your email."
      subtext="We've sent a secure link to your registered address. The link will expire in 24 hours."
    >
      <motion.div
        className="w-full max-w-md text-center"
        initial={prefersReduced ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.entrance / 1000, ease: EASE.out }}
      >
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-subtle">
            <Mail className="h-8 w-8 text-primary" />
          </div>
        </div>

        <h2 className="mb-3 text-2xl font-bold text-text-primary">
          Check your email
        </h2>
        <p className="mb-8 text-text-secondary">
          We've sent a password reset link to your email address. Please check
          your inbox and follow the instructions.
        </p>

        {error && (
          <div className="mb-5 rounded-lg border border-admin-danger-soft bg-admin-danger-soft/40 px-4 py-3 text-sm font-medium text-danger">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {resent ? (
            <div className="flex items-center justify-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium text-success">
              <Check className="h-4 w-4" />
              Reset link sent again. Check your inbox.
            </div>
          ) : (
            <Button
              variant="secondary"
              className="w-full"
              size="lg"
              onClick={onResend}
              disabled={resending || !email}
            >
              <RefreshCw className="h-4 w-4" />
              {resending ? "Resending…" : "Resend email"}
            </Button>
          )}

          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
        </div>
      </motion.div>
    </AuthSplitScreen>
  );
}
