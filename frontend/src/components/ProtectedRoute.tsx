import { Navigate } from "react-router-dom";
import { useAuthStore, type AuthState } from "../store/authStore"; // Import the type
import type { JSX } from "react";

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const token = useAuthStore((state: AuthState) => state.token);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}