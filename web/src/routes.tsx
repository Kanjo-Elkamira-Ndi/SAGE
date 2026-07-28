import { createBrowserRouter } from "react-router-dom";
import { MarketingLayout } from "@/components/layout/MarketingLayout";
import LandingPage from "@/app/marketing/LandingPage";
import AboutPage from "@/app/marketing/AboutPage";
import FeaturesPage from "@/app/marketing/FeaturesPage";
import ContactPage from "@/app/marketing/ContactPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MarketingLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "about", element: <AboutPage /> },
      { path: "features", element: <FeaturesPage /> },
      { path: "contact", element: <ContactPage /> },
    ],
  },
]);
