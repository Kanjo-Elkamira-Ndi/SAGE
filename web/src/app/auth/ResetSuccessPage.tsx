import { Link } from "react-router-dom";
import { useReducedMotion, motion } from "framer-motion";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { AuthSplitScreen } from "@/components/layout/AuthSplitScreen";
import { Button } from "@/components/ui/Button";
import { DURATION, EASE } from "@/lib/motion";

export default function ResetSuccessPage() {
  const prefersReduced = useReducedMotion();

  return (
    <AuthSplitScreen
      image="auth1"
      headline="Password reset successful."
      subtext="Your account is now secure. You can log in with your new credentials."
    >
      <motion.div
        className="w-full max-w-md text-center"
        initial={prefersReduced ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.entrance / 1000, ease: EASE.out }}
      >
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
        </div>

        <h2 className="mb-3 text-2xl font-bold text-text-primary">
          Great! You're all set.
        </h2>
        <p className="mb-8 text-text-secondary">
          Your password has been updated. You can now log in with your new
          credentials to continue your journey.
        </p>

        <div className="space-y-4">
          <Button asChild className="w-full" size="lg">
            <Link to="/login">Continue to Login</Link>
          </Button>

          <p className="text-sm text-text-secondary">
            Having trouble?{" "}
            <Link
              to="/contact"
              className="font-medium text-primary hover:text-primary-hover"
            >
              Contact Support
            </Link>
          </p>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to homepage
          </Link>
        </div>
      </motion.div>
    </AuthSplitScreen>
  );
}
