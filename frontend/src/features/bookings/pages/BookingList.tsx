import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useBookings } from "../hooks/useBookings";
import { BookingCard } from "../components/BookingCard";
import { useToast } from "../../../contexts/ToastContext";
import Toast from "../../../components/Toast";

export const BookingList: React.FC = () => {
  const {
    bookings,
    loading,
    error,
    cancelBooking,
    fetchBookings,
    upgradeSeat,
    addServices,
  } = useBookings(false);
  const { showSuccess, showError, toasts, removeToast } = useToast();
  const [activeTab, setActiveTab] = useState<
    "upcoming" | "finished" | "cancelled"
  >("upcoming");

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancelBooking = async (id: number, reason: string) => {
    try {
      await cancelBooking(id, reason);
      showSuccess("Booking cancelled successfully");
    } catch (err: any) {
      showError(err.message || "Failed to cancel booking");
    }
  };

  const handleUpgradeSeat = async (id: number, newClass: string) => {
    try {
      await upgradeSeat(id, newClass);
    } catch (err: any) {
      throw err;
    }
  };

  const handleAddServices = async (id: number, services: string[]) => {
    try {
      await addServices(id, services);
    } catch (err: any) {
      throw err;
    }
  };

  const now = new Date();

  const cancelledBookings = bookings.filter(
    (b) => b.status.toLowerCase() === "cancelled",
  );

  const finishedBookings = bookings.filter(
    (b) =>
      b.status.toLowerCase() === "completed" ||
      (new Date(b.arrivalTime) < now && b.status.toLowerCase() !== "cancelled"),
  );

  const activeBookings = bookings.filter(
    (b) =>
      b.status.toLowerCase() !== "cancelled" &&
      b.status.toLowerCase() !== "completed" &&
      new Date(b.arrivalTime) >= now,
  );

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Bookings</h1>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-sm">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p>{error}</p>
          </div>
        </div>
      )}

      {loading && bookings.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white p-10 rounded-xl shadow-sm text-center border border-gray-100">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15M9 11l3 3L22 4"
            />
          </svg>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            No bookings found
          </h3>
          <p className="text-gray-500 mb-6">
            Looks like you haven't made any flight bookings yet.
          </p>
          <Link
            to="/flight-search-customer"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition duration-150 ease-in-out"
          >
            Search Flights
          </Link>
        </div>
      ) : (
        <div className="flex flex-col space-y-6">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`py-2 px-4 font-semibold text-sm focus:outline-none ${
                activeTab === "upcoming"
                  ? "border-b-2 border-[#1C398E] text-[#1C398E]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Upcoming Trips ({activeBookings.length})
            </button>
            <button
              onClick={() => setActiveTab("finished")}
              className={`py-2 px-4 font-semibold text-sm focus:outline-none ${
                activeTab === "finished"
                  ? "border-b-2 border-gray-600 text-gray-800"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Finished Trips ({finishedBookings.length})
            </button>
            <button
              onClick={() => setActiveTab("cancelled")}
              className={`py-2 px-4 font-semibold text-sm focus:outline-none ${
                activeTab === "cancelled"
                  ? "border-b-2 border-red-600 text-red-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Cancelled Trips ({cancelledBookings.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="mt-4">
            {activeTab === "upcoming" && (
              <section>
                {activeBookings.length > 0 ? (
                  <div className="space-y-4">
                    {activeBookings.map((booking) => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        onCancel={handleCancelBooking}
                        onUpgrade={handleUpgradeSeat}
                        onAddServices={handleAddServices}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 py-8 text-center bg-gray-50 rounded-lg">
                    No upcoming trips.
                  </p>
                )}
              </section>
            )}

            {activeTab === "finished" && (
              <section>
                {finishedBookings.length > 0 ? (
                  <div className="space-y-4 opacity-90">
                    {finishedBookings.map((booking) => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        onCancel={handleCancelBooking}
                        onUpgrade={handleUpgradeSeat}
                        onAddServices={handleAddServices}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 py-8 text-center bg-gray-50 rounded-lg">
                    No finished trips.
                  </p>
                )}
              </section>
            )}

            {activeTab === "cancelled" && (
              <section>
                {cancelledBookings.length > 0 ? (
                  <div className="space-y-4 opacity-75 grayscale-[30%]">
                    {cancelledBookings.map((booking) => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        onCancel={handleCancelBooking}
                        onUpgrade={handleUpgradeSeat}
                        onAddServices={handleAddServices}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 py-8 text-center bg-gray-50 rounded-lg">
                    No cancelled trips.
                  </p>
                )}
              </section>
            )}
          </div>
        </div>
      )}

      {/* Toast Container */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};
