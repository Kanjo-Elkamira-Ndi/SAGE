import { Link } from "react-router-dom";
import { useReducedMotion, motion } from "framer-motion";
import { Mail, RefreshCw, ArrowLeft } from "lucide-react";
import { AuthSplitScreen } from "@/components/layout/AuthSplitScreen";
import { Button } from "@/components/ui/Button";
import { DURATION, EASE } from "@/lib/motion";

export default function CheckEmailPage() {
  const prefersReduced = useReducedMotion();

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

        <div className="space-y-4">
          <Button variant="secondary" className="w-full" size="lg">
            <RefreshCw className="h-4 w-4" />
            Resend email
          </Button>

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
