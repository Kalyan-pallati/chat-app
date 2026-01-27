import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth"
import Chat from "./pages/Chat";
import ProtectedRoute from "./components/ProtectedRoute"; // Import your guard
import Home from "./pages/Home";
import FindUsers from "./pages/FindUsers";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes - Anyone can visit these */}
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/find"
          element={
            <ProtectedRoute>
              <FindUsers />
            </ProtectedRoute>
          }
        />

        {/* Redirect unknown pages to login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;