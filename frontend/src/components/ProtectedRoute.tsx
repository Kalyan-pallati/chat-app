import { Navigate } from "react-router-dom";
import { useAuthStore, type AuthState } from "../store/authStore"; 
import { useEffect } from "react";
import type { JSX } from "react";

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const token = useAuthStore((state: AuthState) => state.token);
  const logout = useAuthStore((state: AuthState) => state.logout);

  useEffect(() => {
    if (token) {
      try {
        const payloadBase64 = token.split(".")[1];
        const decodedPayload = atob(payloadBase64);
        const payload = JSON.parse(decodedPayload);

        console.log(payload.exp * 1000);
        console.log(Date.now());
        const isExpired = payload.exp * 1000 < Date.now();
        
        if (isExpired) {
          console.warn("Session expired. Logging out automatically.");
          logout();
        }
      } catch (error) {
        console.error("Failed to parse token:", error);
        logout();
      }
    }
  }, [token, logout]);

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
}