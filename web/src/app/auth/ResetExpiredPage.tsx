import { Link } from "react-router-dom";
import { useReducedMotion, motion } from "framer-motion";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { AuthSplitScreen } from "@/components/layout/AuthSplitScreen";
import { Button } from "@/components/ui/Button";
import { DURATION, EASE } from "@/lib/motion";

export default function ResetExpiredPage() {
  const prefersReduced = useReducedMotion();

  return (
    <AuthSplitScreen
      image="auth2"
      headline="Link expired."
      subtext="No worries — we can send you a new reset link. Just enter your email again."
    >
      <motion.div
        className="w-full max-w-md text-center"
        initial={prefersReduced ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.entrance / 1000, ease: EASE.out }}
      >
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger/10">
            <AlertTriangle className="h-8 w-8 text-danger" />
          </div>
        </div>

        <h2 className="mb-3 text-2xl font-bold text-text-primary">
          Reset link expired
        </h2>
        <p className="mb-8 text-text-secondary">
          This password reset link has expired or has already been used. Please
          request a new one to continue.
        </p>

        <div className="space-y-4">
          <Button asChild className="w-full" size="lg">
            <Link to="/forgot-password">Request new link</Link>
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
