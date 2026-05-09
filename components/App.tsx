import React, { lazy, Suspense, Profiler } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/ui/sonner";
import { TooltipProvider } from "@/ui/tooltip";
import { AuthCallback } from "@/AuthCallback";
import { AdminRoute } from "@/components/AdminRoute";
import { ClientRoute } from "@/components/ClientRoute";
import { DashboardErrorBoundary } from "@/components/DashboardErrorBoundary";

const Home = lazy(() => import("@/pages/Home"));
const TurfDetail = lazy(() => import("@/pages/TurfDetail"));
const Booking = lazy(() => import("@/pages/Booking"));
const BookingDetail = lazy(() => import("@/pages/BookingDetail"));
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
const ClientPlaceholder = lazy(() => import("@/pages/ClientPlaceholder"));
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
              <Route path="/booking/:id" element={<BookingDetail />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/tournaments" element={<Tournaments />} />
              <Route path="/offers" element={<Offers />} />
              <Route path="/login" element={<Login />} />
              <Route path="/more" element={<More />} />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                }
              />
              <Route path="/receipt" element={<Receipt />} />
              <Route path="/client/login" element={<ClientLogin />} />
              <Route
                path="/client/dashboard"
                element={
                  <ClientRoute>
                    <DashboardErrorBoundary>
                      {import.meta.env.DEV ? (
                        <Profiler
                          id="ClientDashboard"
                          onRender={(id, phase, actualDuration) => {
                            console.log(
                              `[Profiler] ${id} ${phase} took ${actualDuration.toFixed(2)}ms`
                            );
                          }}
                        >
                          <ClientDashboard />
                        </Profiler>
                      ) : (
                        <ClientDashboard />
                      )}
                    </DashboardErrorBoundary>
                  </ClientRoute>
                }
              />
              <Route
                path="/client/slots"
                element={
                  <ClientRoute>
                    <ClientSlotManagement />
                  </ClientRoute>
                }
              />
              <Route
                path="/client/bookings"
                element={
                  <ClientRoute>
                    <ClientBookingManagement />
                  </ClientRoute>
                }
              />
              <Route
                path="/client/settings"
                element={
                  <ClientRoute>
                    <ClientProfileSettings />
                  </ClientRoute>
                }
              />
              <Route
                path="/client/photos"
                element={
                  <ClientRoute>
                    <ClientPlaceholder />
                  </ClientRoute>
                }
              />
              <Route
                path="/client/pricing"
                element={
                  <ClientRoute>
                    <ClientPlaceholder />
                  </ClientRoute>
                }
              />
              <Route
                path="/client/turf/edit"
                element={
                  <ClientRoute>
                    <ClientPlaceholder />
                  </ClientRoute>
                }
              />
              <Route
                path="/client/rules"
                element={
                  <ClientRoute>
                    <ClientPlaceholder />
                  </ClientRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthCallback>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
