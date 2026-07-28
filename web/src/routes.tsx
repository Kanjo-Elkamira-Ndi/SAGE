import { createBrowserRouter } from "react-router-dom";
import { MarketingLayout } from "@/components/layout/MarketingLayout";
import LandingPage from "@/app/marketing/LandingPage";
import AboutPage from "@/app/marketing/AboutPage";
import FeaturesPage from "@/app/marketing/FeaturesPage";
import ContactPage from "@/app/marketing/ContactPage";
import LoginPage from "@/app/auth/LoginPage";
import RegisterPage from "@/app/auth/RegisterPage";
import ForgotPasswordPage from "@/app/auth/ForgotPasswordPage";
import CheckEmailPage from "@/app/auth/CheckEmailPage";
import ResetPasswordPage from "@/app/auth/ResetPasswordPage";
import ResetSuccessPage from "@/app/auth/ResetSuccessPage";
import ResetExpiredPage from "@/app/auth/ResetExpiredPage";

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
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/check-email", element: <CheckEmailPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },
  { path: "/reset-success", element: <ResetSuccessPage /> },
  { path: "/reset-expired", element: <ResetExpiredPage /> },
]);
