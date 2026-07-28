import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { DURATION } from "@/lib/motion";

const footerLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/contact", label: "Contact Us" },
  { href: "/docs", label: "Documentation" },
];

export function Footer() {
  const prefersReduced = useReducedMotion();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <motion.div
              whileHover={prefersReduced ? undefined : { scale: 1.05 }}
              transition={{ duration: DURATION.fast / 1000 }}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-text-on-primary"
            >
              S
            </motion.div>
            <span className="text-lg font-bold text-primary">SAGE</span>
          </Link>

          {/* Copyright */}
          <p className="text-sm text-text-secondary">
            &copy; {new Date().getFullYear()} SAGE (Smart Academy Guidance
            Engine). All rights reserved.
          </p>

          {/* Links */}
          <nav className="flex gap-4">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-sm text-text-secondary transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
