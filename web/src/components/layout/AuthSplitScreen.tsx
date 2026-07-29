import auth1 from "@/assets/auth_1.png";
import auth2 from "@/assets/auth_2.png";
import { Navbar } from "./Navbar";

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
      <Navbar />

      {/* Split Content */}
      <div className="flex flex-1">
        {/* Left — branded panel with background image */}
        <div className="relative hidden w-1/2 overflow-hidden lg:flex lg:items-center lg:justify-center">
          <img
            src={images[image]}
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-primary/60" />
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
