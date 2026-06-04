import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { LandingPage } from "./features/landing";
import { LoginPage, ProtectedRoute } from "./features/login";
import { SignupPage } from "./features/signup";
import { DashboardRouter } from "./features/dashboard/components/DashboardRouter";
import FlightsFeature from "./features/flights";

import {
  FlightBookingCustomer,
  FlightBookingPackage,
  FlightConfirmation,
  FlightPayment,
  FlightSearchCustomer,
  MyBookings,
  FlightSearchLoading,
  FlightBookingProcessing,
} from "./features/flights/pages";

import { ProvidersFeature } from "./features/providers";
import { ConstructionPage } from "./features/construction";
import { ProfilePage } from "./features/profile";
import { DashboardLayout } from "./components/DashboardLayout";

import LeisurePlan from "./features/leisurePlan/leisurePlan";

import WebCheckIn from "./features/checkin/pages/WebCheckIn";
import SeatSelection from "./features/checkin/pages/SeatSelection";
import CheckInSuccess from "./features/checkin/pages/CheckInSuccess";

import { ToastProvider } from "./contexts/ToastContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { BookingList } from "./features/bookings";
import CreateLeisurePlan from "./features/leisurePlan/CreateLeisurePlan";
import LeisurePackages from "./features/leisurePlan/LeisurePackages";
import LeisurePlanDetail from "./features/leisurePlan/LeisurePlanDetail";
import CustomLeisurePlan from "./features/leisurePlan/CustomLeisurePlan";
import PaymentSuccess from "./features/leisurePlan/PaymentSuccess";
import PaymentCancel from "./features/leisurePlan/PaymentCancel";
import CustomPaymentPage from "./features/leisurePlan/CustomPaymentPage";

import { TravelPlanPage } from "./features/travelPlans";

function AppContent() {
  const protectedPrefixes = [
    "/dashboard",
    "/leisure-plan",
    "/providers",
    "/bookings",
    "/my-bookings",
    "/checkin",
    "/notification",
    "/profile",
    "/wallet",
    "/travel-plan",
    "/help",
  ];

  const AuthGate = () => {
    const location = useLocation();
    const { checkAuth, markGuest, isAuthenticated, hasCheckedAuth } = useAuth();
    const isProtectedRoute = protectedPrefixes.some((prefix) => location.pathname.startsWith(prefix));

    React.useEffect(() => {
      if (isProtectedRoute) {
        checkAuth();
        return;
      }

      if (!isAuthenticated && !hasCheckedAuth) {
        markGuest();
      }
    }, [checkAuth, hasCheckedAuth, isAuthenticated, isProtectedRoute, markGuest]);

    return null;
  };

  return (
    <Router>
      <AuthGate />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route
          path="/dashboard/:role"
          element={
            <ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>
          }
        />

        <Route
          path="/leisure-plan"
          element={
            <ProtectedRoute>
              <LeisurePlan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leisure-plan/packages"
          element={
            <ProtectedRoute>
              <LeisurePackages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leisure-plan/result"
          element={
            <ProtectedRoute>
              <CustomLeisurePlan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leisure-plan/:id"
          element={
            <ProtectedRoute>
              <LeisurePlanDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leisure-plan/checkout"
          element={
            <ProtectedRoute>
              <CustomPaymentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leisure-plan/payment/success"
          element={<PaymentSuccess />}
        />
        <Route
          path="/leisure-plan/payment/cancel"
          element={<PaymentCancel />}
        />
        <Route
          path="/leisure-plan/create"
          element={
            <ProtectedRoute>
              <CreateLeisurePlan />
            </ProtectedRoute>
          }
        />

        <Route
          path="/flights-loading"
          element={<FlightSearchLoading />}
        />

        <Route
          path="/flight-booking-processing"
          element={<FlightBookingProcessing />}
        />

        <Route
          path="/flights"
          element={<FlightsFeature />}
        />

        <Route
          path="/flight-search-customer"
          element={
            <DashboardLayout>
              <FlightSearchCustomer />
            </DashboardLayout>
          }
        />

        <Route
          path="/flight-booking"
          element={<FlightBookingCustomer />}
        />

        <Route
          path="/flight-package"
          element={<FlightBookingPackage />}
        />

        <Route
          path="/flight-payment"
          element={<FlightPayment />}
        />

        <Route
          path="/flight-confirmation"
          element={<FlightConfirmation />}
        />

        <Route
          path="/providers"
          element={
            <ProtectedRoute>
              <ProvidersFeature />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <BookingList />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <MyBookings />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/checkin"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <WebCheckIn />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/checkin/select-seats"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <SeatSelection />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/checkin/success"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <CheckInSuccess />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/notification"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ConstructionPage title="Notification" />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ProfilePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/wallet"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ConstructionPage title="Wallet" />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/travel-plan"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <TravelPlanPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/help"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ConstructionPage title="Help & Support" />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
