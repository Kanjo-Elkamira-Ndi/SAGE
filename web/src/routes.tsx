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
import { RequireAdmin } from "@/context/AuthContext";
import AdminLayout from "@/app/admin/AdminLayout";
import AdminDashboardPage from "@/app/admin/DashboardPage";
import UsersPage from "@/app/admin/UsersPage";
import DepartmentsPage from "@/app/admin/DepartmentsPage";
import CoursesPage from "@/app/admin/CoursesPage";
import CourseFormPage from "@/app/admin/CourseFormPage";
import ActivityLogsPage from "@/app/admin/ActivityLogsPage";
import ReportsPage from "@/app/admin/ReportsPage";
import AtRiskPage from "@/app/admin/AtRiskPage";
import PermissionsPage from "@/app/admin/PermissionsPage";
import AnnouncementsPage from "@/app/admin/AnnouncementsPage";
import LoadingStatePage from "@/app/admin/LoadingStatePage";
import EmptyStatesPage from "@/app/admin/EmptyStatesPage";
import NotFoundPage from "@/app/admin/NotFoundPage";
import AccessDeniedPage from "@/app/admin/AccessDeniedPage";
import ServerErrorPage from "@/app/admin/ServerErrorPage";

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
  {
    path: "/admin",
    element: (
      <RequireAdmin>
        <AdminLayout />
      </RequireAdmin>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: "users", element: <UsersPage /> },
      { path: "departments", element: <DepartmentsPage /> },
      { path: "courses", element: <CoursesPage /> },
      { path: "courses/new", element: <CourseFormPage /> },
      { path: "courses/:courseId", element: <CourseFormPage /> },
      { path: "announcements", element: <AnnouncementsPage /> },
      { path: "activity", element: <ActivityLogsPage /> },
      { path: "reports", element: <ReportsPage /> },
      { path: "reports/at-risk", element: <AtRiskPage /> },
      { path: "permissions", element: <PermissionsPage /> },
      { path: "states/loading", element: <LoadingStatePage /> },
      { path: "states/empty", element: <EmptyStatesPage /> },
      { path: "settings", element: <EmptyStatesPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
  { path: "/admin/403", element: <AccessDeniedPage /> },
  { path: "/admin/500", element: <ServerErrorPage /> },
  { path: "*", element: <NotFoundPage /> },
]);
