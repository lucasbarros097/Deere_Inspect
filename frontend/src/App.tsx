import { useState, useCallback, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import SplashScreen from "@/components/SplashScreen";
import NetworkStatusBar from "@/components/NetworkStatusBar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AuthProvider, useAuth } from "@/store/AuthContext";

import Home from "./pages/Home.tsx";
import InspectionPage from "./pages/InspectionPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import Admin from "./pages/Admin.tsx";
import AdminGate from "./components/AdminGate";
import LoginPage from "./pages/LoginPage.tsx";
import ChangePasswordPage from "./pages/ChangePasswordPage.tsx";
import SobreNos from "./pages/SobreNos.tsx";
import Ferramentas from "./pages/Ferramentas.tsx";
import Index from "./pages/Index.tsx";
import Navbar from "./components/Navbar";
import SetupAdmin from "./pages/SetupAdmin.tsx";
import { ChatWidget } from "./features/chat/ChatWidget";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const [showSplash, setShowSplash] = useState(true);
  const handleSplashFinish = useCallback(() => setShowSplash(false), []);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect to setup page if the backend reports that no users exist
  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL + "/api/setup/needs")
      .then((res) => res.json())
      .then((data) => {
        if (data.needs_setup && location.pathname !== "/setup") {
          navigate("/setup", { replace: true });
        }
      })
      .catch(() => {
        // ignore errors – let the app function normally
      });
  }, [location.pathname, navigate]);

  // Pages where Navbar should NOT be shown
  const hideNavbarPaths = ["/login", "/setup", "/trocar-senha"];
  const showNavbar = !hideNavbarPaths.includes(location.pathname);

  return (
    <>
      <NetworkStatusBar />
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
      {!showSplash && showNavbar && <Navbar />}
      {!showSplash && (
        <main className={showNavbar ? "pb-20 md:pb-0" : ""}>
          <Routes>
          <Route path="/setup" element={<SetupAdmin />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/trocar-senha" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />
          <Route path="/" element={<Home />} />
          <Route path="/sobre-nos" element={<SobreNos />} />
          <Route path="/ferramentas" element={<ProtectedRoute><Ferramentas /></ProtectedRoute>} />
          <Route path="/ferramentas/analise-tecnica" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/ferramentas/analise-tecnica/:id" element={<ProtectedRoute><InspectionPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminGate><Admin /></AdminGate></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ChatWidget />
      </main>
      )}
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;