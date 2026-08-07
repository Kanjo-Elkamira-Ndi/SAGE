/**
 * Global TanStack Query client for the admin console.
 * - Retries transient network failures (never 4xx API errors, never mutations).
 * - Maps SageApiError / SageNetworkError to user-facing copy once, here.
 */
import {
  QueryClient,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import { SageApiError, SageNetworkError } from "@/lib/apiClient";

const onError = (error: unknown) => {
  if (error instanceof SageApiError) {
    if (error.status === 429) {
      console.warn(`[api] rate limited (${error.code}): ${error.message}`);
    }
    return;
  }
  if (error instanceof SageNetworkError) {
    console.warn(`[api] network: ${error.message}`);
  }
};

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError }),
  mutationCache: new MutationCache({ onError }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) =>
        error instanceof SageNetworkError && failureCount < 2,
    },
    mutations: {
      retry: false,
    },
  },
});

/** Single error-code → copy map (§0.3). Screens render this; never raw server messages. */
export function sageErrorText(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (error instanceof SageApiError) {
    switch (error.code) {
      case "AUTH_INVALID_CREDENTIALS":
        return "Incorrect email or password.";
      case "USER_PENDING_APPROVAL":
        return "Your account is awaiting admin approval.";
      case "USER_DEACTIVATED":
        return "This account has been deactivated.";
      case "TOO_MANY_REQUESTS":
        return "Too many attempts — try again shortly.";
      case "EMAIL_TAKEN":
        return "An account already exists for that email.";
      case "RESET_TOKEN_INVALID":
        return "This reset link is invalid. Request a new one.";
      case "RESET_TOKEN_USED":
        return "This reset link has already been used.";
      case "RESET_TOKEN_EXPIRED":
        return "This reset link has expired.";
      case "FORBIDDEN_ROLE":
        return "You do not have permission to perform this action.";
      case "DEPARTMENT_CODE_TAKEN":
        return "A department with this code already exists.";
      case "USER_NOT_FOUND":
        return "User not found.";
      case "ANNOUNCEMENT_NOT_FOUND":
        return "Announcement not found.";
      case "VALIDATION_ERROR":
        return error.fieldErrors
          ? "Please correct the highlighted fields."
          : (error.message || "Invalid input.");
      default:
        return error.message || fallback;
    }
  }
  if (error instanceof SageNetworkError) {
    return "Cannot reach the server. Check your connection.";
  }
  return fallback;
}
