import { Link } from "react-router-dom";
import { useReducedMotion, motion } from "framer-motion";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react";
import { AuthSplitScreen } from "@/components/layout/AuthSplitScreen";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DURATION, EASE } from "@/lib/motion";

export default function ForgotPasswordPage() {
  const prefersReduced = useReducedMotion();

  return (
    <AuthSplitScreen
      image="auth1"
      headline="Secure and streamlined access to your academic future."
      subtext="Reset your password in a few simple steps. We'll send a secure link to your registered email address."
    >
      <motion.div
        className="w-full max-w-md"
        initial={prefersReduced ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.entrance / 1000, ease: EASE.out }}
      >
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-subtle">
          <Mail className="h-6 w-6 text-primary" />
        </div>

        <h2 className="mb-2 text-2xl font-bold text-text-primary">
          Reset your password
        </h2>
        <p className="mb-8 text-text-secondary">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
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

          <Button type="submit" className="w-full" size="lg">
            Send Reset Link
            <ArrowRight className="h-4 w-4" />
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

        <p className="mt-6 text-center text-sm text-text-secondary">
          Need more help?{" "}
          <Link
            to="/contact"
            className="font-medium text-primary hover:text-primary-hover"
          >
            Contact Support
          </Link>
        </p>
      </motion.div>
    </AuthSplitScreen>
  );
}
