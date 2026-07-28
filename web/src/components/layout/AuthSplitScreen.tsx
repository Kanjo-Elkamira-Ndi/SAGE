import { Link } from "react-router-dom";
import auth1 from "@/assets/auth_1.png";
import auth2 from "@/assets/auth_2.png";

const images = { auth1, auth2 } as const;

interface AuthSplitScreenProps {
  children: React.ReactNode;
  headline: string;
  subtext: string;
  image?: keyof typeof images;
}

export function AuthSplitScreen({
  children,
  headline,
  subtext,
  image = "auth1",
}: AuthSplitScreenProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-text-on-primary">
              S
            </div>
            <span className="text-xl font-bold text-primary">SAGE</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              to="/"
              className="text-sm font-medium text-text-secondary transition-colors hover:text-primary"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="text-sm font-medium text-text-secondary transition-colors hover:text-primary"
            >
              About
            </Link>
            <Link
              to="/login"
              className="text-sm font-medium text-primary"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium text-text-secondary transition-colors hover:text-primary"
            >
              Register
            </Link>
          </nav>
        </div>
      </header>

      {/* Split Content */}
      <div className="flex flex-1">
        {/* Left — branded panel with background image */}
        <div className="relative hidden w-1/2 overflow-hidden lg:flex lg:items-center lg:justify-center">
          {/* Background image */}
          <img
            src={images[image]}
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          />
          {/* Dark overlay for text readability */}
          <div className="pointer-events-none absolute inset-0 bg-primary/60" />
          {/* Gradient overlay for depth */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-primary/40" />

          <div className="relative z-10 mx-auto max-w-md px-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white drop-shadow-lg">
              {headline}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-white/90 drop-shadow">
              {subtext}
            </p>
          </div>
        </div>

        {/* Right — form panel */}
        <div className="flex w-full items-center justify-center px-4 py-12 lg:w-1/2 lg:px-16">
          {children}
        </div>
      </div>
    </div>
  );
}
