import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthCallback } from "@/components/AuthCallback";

const Home = lazy(() => import("@/pages/Home"));
const TurfDetail = lazy(() => import("@/pages/TurfDetail"));
const Booking = lazy(() => import("@/pages/Booking"));
const Bookings = lazy(() => import("@/pages/Bookings"));
const Tournaments = lazy(() => import("@/pages/Tournaments"));
const Offers = lazy(() => import("@/pages/Offers"));
const Login = lazy(() => import("@/pages/Login"));
const More = lazy(() => import("@/pages/More"));
const Admin = lazy(() => import("@/pages/Admin"));
const Receipt = lazy(() => import("@/pages/Receipt"));
const ClientLogin = lazy(() => import("@/pages/ClientLogin"));
const ClientDashboard = lazy(() => import("@/pages/ClientDashboard"));
const ClientSlotManagement = lazy(() => import("@/pages/ClientSlotManagement"));
const ClientBookingManagement = lazy(() => import("@/pages/ClientBookingManagement"));
const ClientProfileSettings = lazy(() => import("@/pages/ClientProfileSettings"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner position="top-center" theme="dark" />
      <BrowserRouter>
        <AuthCallback>
          <Suspense fallback={<div className="min-h-screen bg-background p-6 text-soft">Loading...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/turf/:id" element={<TurfDetail />} />
              <Route path="/booking/new/:turfId" element={<Booking />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/tournaments" element={<Tournaments />} />
              <Route path="/offers" element={<Offers />} />
              <Route path="/login" element={<Login />} />
              <Route path="/more" element={<More />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/receipt" element={<Receipt />} />
              <Route path="/client/login" element={<ClientLogin />} />
              <Route path="/client/dashboard" element={<ClientDashboard />} />
              <Route path="/client/slots" element={<ClientSlotManagement />} />
              <Route path="/client/bookings" element={<ClientBookingManagement />} />
              <Route path="/client/settings" element={<ClientProfileSettings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthCallback>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
