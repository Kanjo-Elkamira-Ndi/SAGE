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
import StudentDashboard from "@/app/student/StudentDashboard";
import MyCourses from "@/app/student/MyCourses";
import CourseDetail from "@/app/student/CourseDetail";
import CourseMaterials from "@/app/student/CourseMaterials";
import MaterialViewer from "@/app/student/MaterialViewer";
import AssignmentsList from "@/app/student/AssignmentsList";
import AssignmentDetail from "@/app/student/AssignmentDetail";
import QuizzesList from "@/app/student/QuizzesList";
import QuizInProgress from "@/app/student/QuizInProgress";
import QuizResults from "@/app/student/QuizResults";
import PerformanceDashboard from "@/app/student/PerformanceDashboard";
import NotificationsCenter from "@/app/student/NotificationsCenter";

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
  { path: "/student", element: <StudentDashboard /> },
  { path: "/student/courses", element: <MyCourses /> },
  { path: "/student/courses/:courseId", element: <CourseDetail /> },
  { path: "/student/courses/:courseId/materials", element: <CourseMaterials /> },
  { path: "/student/courses/:courseId/materials/:materialId", element: <MaterialViewer /> },
  { path: "/student/assignments", element: <AssignmentsList /> },
  { path: "/student/assignments/:assignmentId", element: <AssignmentDetail /> },
  { path: "/student/quizzes", element: <QuizzesList /> },
  { path: "/student/quizzes/:quizId", element: <QuizInProgress /> },
  { path: "/student/quizzes/:quizId/results", element: <QuizResults /> },
  { path: "/student/performance", element: <PerformanceDashboard /> },
  { path: "/student/notifications", element: <NotificationsCenter /> },
]);
