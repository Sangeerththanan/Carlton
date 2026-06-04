import React, { useState } from "react";
import type { Booking } from "../types/bookingTypes";
import {
  Ban,
  User,
  Eye,
  Download,
  Plane,
  ArrowRightLeft,
  ArrowUpCircle,
  PlusCircle,
} from "lucide-react";
import Modal from "../../../components/Modal";
import { useAuth } from "../../../contexts/AuthContext";
import { useToast } from "../../../contexts/ToastContext";
import { ChangeFlightCard } from "./ChangeFlightCard";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface BookingCardProps {
  booking: Booking;
  onCancel: (id: number, reason: string) => Promise<void>;
  onUpgrade?: (id: number, newClass: string) => Promise<void>;
  onAddServices?: (id: number, services: string[]) => Promise<void>;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onCancel,
  onUpgrade,
  onAddServices,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Modal states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showServicesModal, setShowServicesModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showChangeFlightModal, setShowChangeFlightModal] = useState(false);

  // Data states
  const [cancelReason, setCancelReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const handleCancelClick = async () => {
    setIsSubmitting(true);
    try {
      await onCancel(booking.id, cancelReason);
      setShowCancelModal(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = () => {
    setShowDetailsModal(true);
  };

  const handleDownloadTicket = () => {
    try {
      const doc = new jsPDF();

      // Primary branding / header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("CARLTON AIRLINES", 14, 20);

      doc.setFontSize(14);
      doc.setTextColor(100);
      doc.text("E-TICKET / BOARDING PASS", 14, 28);

      // Top right reference block
      doc.setFontSize(10);
      doc.setTextColor(50);
      doc.text(`Booking Ref:`, 140, 20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0);
      doc.text(`${booking.bookingReference}`, 170, 20);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(50);
      doc.text(`Status:`, 140, 26);
      doc.setTextColor(
        booking.status.toLowerCase() === "confirmed" ? 0 : 255,
        booking.status.toLowerCase() === "confirmed" ? 150 : 0,
        0,
      );
      doc.setFont("helvetica", "bold");
      doc.text(`${booking.status.toUpperCase()}`, 170, 26);

      doc.setDrawColor(200);
      doc.line(14, 32, 196, 32);

      // FLIGHT DETAILS section
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text("FLIGHT ITINERARY", 14, 42);

      autoTable(doc, {
        startY: 46,
        head: [["Flight", "From", "To", "Departure", "Arrival", "Class"]],
        body: [
          [
            booking.flightNumber,
            booking.departure,
            booking.destination,
            new Date(booking.departureTime).toLocaleString(),
            new Date(booking.arrivalTime).toLocaleString(),
            booking.bookingClass || "Economy",
          ],
        ],
        theme: "striped",
        headStyles: { fillColor: [41, 128, 185] },
        margin: { left: 14, right: 14 },
      });

      // PASSENGER DETAILS section
      const finalY = (doc as any).lastAutoTable.finalY || 60;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("PASSENGER DETAILS", 14, finalY + 12);

      autoTable(doc, {
        startY: finalY + 16,
        head: [
          ["Primary User", "Total Seats", "Names", "Special Req", "Add-ons"],
        ],
        body: [
          [
            `${user?.name || ""}`.trim() || "N/A",
            booking.seatsBooked.toString(),
            booking.passengerNames || "N/A",
            booking.specialRequests || "None",
            booking.selectedServices || "None",
          ],
        ],
        theme: "plain",
        styles: { lineWidth: 0.1, lineColor: [200, 200, 200] },
        headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
        margin: { left: 14, right: 14 },
      });

      // PAYMENT DETAILS section
      const finalY2 = (doc as any).lastAutoTable.finalY || finalY + 40;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("PAYMENT SUMMARY", 14, finalY2 + 12);

      autoTable(doc, {
        startY: finalY2 + 16,
        head: [["Total Price", "Payment Status", "Booked Date"]],
        body: [
          [
            `$${booking.totalPrice.toLocaleString()}`,
            booking.isPaid ? "PAID IN FULL" : "PENDING",
            new Date(booking.bookingDate).toLocaleDateString(),
          ],
        ],
        theme: "grid",
        headStyles: { fillColor: [46, 204, 113] },
        margin: { left: 14, right: 14 },
      });

      // Footer
      const pageHeight = doc.internal.pageSize.height;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text(
        "Thank you for flying with Carlton Airlines! Please arrive at the airport 2 hours before departure.",
        14,
        pageHeight - 15,
      );

      doc.save(`ETicket_${booking.bookingReference}.pdf`);
      showToast("E-Ticket PDF downloaded successfully!", "success");
    } catch (e) {
      console.error("Error generating PDF:", e);
      showToast("Failed to generate E-Ticket PDF.", "error");
    }
  };

  const handleChangeFlight = () => {
    setShowChangeFlightModal(true);
  };

  const handleUpgradeSeat = () => {
    setSelectedSeat(booking.bookingClass || "");
    setShowUpgradeModal(true);
  };

  const handleAddServices = () => {
    setShowServicesModal(true);
  };

  const submitUpgrade = async () => {
    if (!selectedSeat) {
      showToast("Please select an upgrade option first.", "error");
      return;
    }
    if (onUpgrade) {
      setIsSubmitting(true);
      try {
        await onUpgrade(booking.id, selectedSeat);
        showToast(`Seat upgrade changed to ${selectedSeat}!`, "success");
        setShowUpgradeModal(false);
        setSelectedSeat("");
      } catch (err) {
        showToast("Failed to upgrade seat", "error");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      showToast("Feature currently unavailable.", "info");
    }
  };

  const submitServices = async () => {
    if (selectedServices.length === 0) {
      showToast("No services selected.", "error");
      return;
    }
    if (onAddServices) {
      setIsSubmitting(true);
      try {
        await onAddServices(booking.id, selectedServices);
        showToast(`Services added successfully!`, "success");
        setShowServicesModal(false);
        setSelectedServices([]);
      } catch (err) {
        showToast("Failed to add services", "error");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      showToast("Feature currently unavailable.", "info");
    }
  };

  // Toggle helper for service checkboxes
  const toggleService = (serviceName: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceName)
        ? prev.filter((s) => s !== serviceName)
        : [...prev, serviceName],
    );
  };

  const getSeatPriceTotal = (className: string) => {
    switch (className) {
      case "Premium Economy":
        return 85;
      case "Business Class":
        return 250;
      case "First Class":
        return 600;
      default:
        return 0;
    }
  };

  const getPriceDelta = (newClass: string) => {
    const oldPrice = getSeatPriceTotal(booking.bookingClass || "Economy");
    const newPrice = getSeatPriceTotal(newClass);
    return (newPrice - oldPrice) * (booking.seatsBooked || 1);
  };

  return (
    <>
      <div className="relative overflow-hidden mb-3 rounded-xl bg-white shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md">
        {/* Header Section (Status & Reference) */}
        <div className="flex items-center justify-between bg-white px-4 py-2 text-[#1C398E] border-b border-gray-100">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#1C398E]/60">
              Booking Ref
            </p>
            <h2 className="text-lg font-bold tracking-wide">
              {booking.bookingReference}
            </h2>
          </div>
          <span className="rounded-full bg-[#1C398E]/10 px-2 py-0.5 text-[10px] font-bold uppercase text-[#1C398E]">
            {booking.status}
          </span>
        </div>

        {/* Main Flight Info */}
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="text-left w-1/3">
              <p className="text-3xl font-black text-[#1C398E]">
                {booking.departure}
              </p>
              <p className="mt-1 text-[16px] font-medium text-gray-500">
                {new Date(booking.departureTime).toLocaleString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div className="flex flex-1 flex-col items-center px-2">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {booking.flightNumber}
              </p>
              <div className="relative flex w-full flex-col items-center justify-center">
                <div className="absolute top-1/2 left-0 right-0 h-[1px] w-full -translate-y-1/2 bg-gray-200" />
                <div className="z-10 bg-white px-2 text-[#1C398E] shadow-[0_0_8px_white]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="rotate-90 transform"
                  >
                    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l6 3.5L7 15l-3.3-.8c-.4-.1-.8.2-1 .6L2 16l4 2 2 4 .9-.4c.3-.4.6-.8.4-1.2L8.5 17l3.5-2 8.2 1.8c.4.1.8-.2.9-.6Z" />
                  </svg>
                </div>
              </div>
              <p className="mt-1 text-[12px] font-bold uppercase tracking-widest text-gray-400">
                {booking.bookingClass || "Economy"}
              </p>
            </div>

            <div className="text-right w-1/3">
              <p className="text-3xl font-black text-[#1C398E]">
                {booking.destination}
              </p>
              <p className="mt-1 text-[10px] font-medium text-gray-500">
                {new Date(booking.arrivalTime).toLocaleString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center px-4">
          <div className="absolute -left-1.5 h-3 w-3 rounded-full bg-gray-50 shadow-inner" />
          <div className="h-[1px] w-full border-t border-dashed border-gray-200" />
          <div className="absolute -right-1.5 h-3 w-3 rounded-full bg-gray-50 shadow-inner" />
        </div>

        {/* Details Section */}
        <div className="bg-gray-50 px-4 pt-3 pb-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-widest text-gray-400">
                Passenger(s)
              </p>
              <div className="mt-0.5">
                {!booking.passengerNames ? (
                  <p className="text-xs font-medium text-[#1C398E]">
                    Not Available
                  </p>
                ) : (
                  booking.passengerNames.split(",").map((name, i) => (
                    <p key={i} className="text-xs font-medium text-[#1C398E]">
                      {name.trim()}
                    </p>
                  ))
                )}
              </div>
            </div>

            <div>
              <p className="text-[12px] font-bold uppercase tracking-widest text-gray-400">
                Seats
              </p>
              <p className="mt-0.7 text-xs font-medium text-[#1C398E]">
                {booking.seatsBooked}
              </p>
              <div className="mt-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Paid Status
                </p>
                <p
                  className={`mt-0.5 text-xs font-medium ${booking.isPaid ? "text-green-600" : "text-red-500"}`}
                >
                  {booking.isPaid ? "Paid" : "Pending"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-[12px] font-bold uppercase tracking-widest text-gray-400">
                Total Price
              </p>
              <p className="mt-0.5 text-base font-bold text-[#1C398E]">
                ${booking.totalPrice.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons Section */}
        <div className="bg-[#f0f9ff] px-4 py-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-t border-blue-100">
          <p className="text-[12px] text-[#1C398E]/70 font-bold uppercase tracking-wide">
            Booked on {new Date(booking.bookingDate).toLocaleDateString()}
          </p>

          <div className="flex flex-wrap gap-1.5 justify-start md:justify-end flex-1">
            <button
              onClick={handleViewDetails}
              className="flex items-center text-white hover:bg-[#2F4E97] border border-transparent text-[10px] font-bold px-2 py-1.5 rounded transition-all bg-[#1C398E] shadow-sm hover:shadow"
              title="View Details"
            >
              <Eye className="w-3.5 h-3.5 mr-1" />
              Details
            </button>

            <button
              onClick={handleDownloadTicket}
              className="flex items-center text-white hover:bg-[#2F4E97] border border-transparent text-[10px] font-bold px-2 py-1.5 rounded transition-all bg-[#1C398E] shadow-sm hover:shadow"
              title="Download E-Ticket"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              E-Ticket
            </button>

            {booking.status.toLowerCase() === "confirmed" && (
              <>
                <button
                  onClick={handleChangeFlight}
                  className="flex items-center text-white hover:bg-[#2F4E97] border border-transparent text-[10px] font-bold px-2 py-1.5 rounded transition-all bg-[#1C398E] shadow-sm hover:shadow"
                  title="Change Flight"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 mr-1" />
                  Change
                </button>
                <button
                  onClick={handleUpgradeSeat}
                  className="flex items-center text-white hover:bg-[#2F4E97] border border-transparent text-[10px] font-bold px-2 py-1.5 rounded transition-all bg-[#1C398E] shadow-sm hover:shadow"
                  title="Upgrade Seat"
                >
                  <ArrowUpCircle className="w-3.5 h-3.5 mr-1" />
                  Upgrade
                </button>
                <button
                  onClick={handleAddServices}
                  className="flex items-center text-white hover:bg-[#2F4E97] border border-transparent text-[10px] font-bold px-2 py-1.5 rounded transition-all bg-[#1C398E] shadow-sm hover:shadow"
                  title="Add Services"
                >
                  <PlusCircle className="w-3.5 h-3.5 mr-1" />
                  Services
                </button>
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="flex items-center text-white hover:bg-red-700 bg-red-600 border border-transparent text-[10px] font-bold px-2 py-1.5 rounded transition-all shadow-sm hover:shadow"
                  title="Cancel Booking"
                >
                  <Ban className="w-3.5 h-3.5 mr-1" />
                  Cancel
                </button>
              </>
            )}

            {booking.status.toLowerCase() === "cancelled" &&
              booking.refundAmount && (
                <div className="text-[10px] text-white font-bold bg-green-600 px-2 py-1.5 rounded flex items-center shadow-sm">
                  ✓ Refunded: ${booking.refundAmount.toLocaleString()}
                </div>
              )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Booking"
      >
        <div className="p-2">
          <p className="text-gray-700 mb-4">
            Are you sure you want to cancel booking{" "}
            <strong>{booking.bookingReference}</strong> for flight{" "}
            {booking.flightNumber}?
          </p>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for cancellation (optional)
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-red-500 focus:border-red-500 min-h-[80px]"
              placeholder="Please let us know why you are cancelling..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3 border-t pt-4">
            <button
              onClick={() => setShowCancelModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm font-medium transition-colors"
              disabled={isSubmitting}
            >
              Keep Booking
            </button>
            <button
              onClick={handleCancelClick}
              disabled={isSubmitting}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Processing..." : "Yes, Cancel Booking"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Change Flight Modal */}
      {showChangeFlightModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <ChangeFlightCard
            booking={booking}
            onCancel={() => setShowChangeFlightModal(false)}
          />
        </div>
      )}

      {/* Details View Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={`Booking Reference: ${booking.bookingReference}`}
      >
        <div className="p-2 space-y-6">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
              <Plane className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-gray-800">Flight Itinerary</h3>
            </div>
            <div className="grid grid-cols-2 gap-y-4">
              <div>
                <p className="text-gray-500 text-xs">Flight Number</p>
                <p className="font-semibold text-gray-900">
                  {booking.flightNumber}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Route</p>
                <p className="font-semibold text-gray-900">
                  {booking.departure} → {booking.destination}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Departure Date & Time</p>
                <p className="font-semibold text-gray-900">
                  {new Date(booking.departureTime).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Arrival Date & Time</p>
                <p className="font-semibold text-gray-900">
                  {new Date(booking.arrivalTime).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
              <User className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-gray-800">
                Passenger Specifications
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-y-4">
              <div>
                <p className="text-gray-500 text-xs">Booked Class</p>
                <p className="font-semibold text-gray-900">
                  {booking.bookingClass}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Total Seats Reserved</p>
                <p className="font-semibold text-gray-900">
                  {booking.seatsBooked}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500 text-xs">Registered Passengers</p>
                <p className="font-semibold text-gray-900">
                  {booking.passengerNames || "Not specified"}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500 text-xs">
                  Special Requests/Assistance
                </p>
                <p className="font-semibold text-gray-900 italic">
                  {booking.specialRequests || "None provided"}
                </p>
              </div>
            </div>
          </div>

          {booking.selectedServices && (
            <div className="bg-gradient-to-br from-[#EBF0FF] to-[#F5F9FF] rounded-lg p-4 border border-[#D6E0F4]">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#D6E0F4]">
                <PlusCircle className="w-5 h-5 text-[#1C398E]" />
                <h3 className="font-bold text-[#1C398E]">Selected Add-ons</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {booking.selectedServices.split(",").map((service, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-3 py-1.5 bg-white border border-[#1C398E] text-[#1C398E] text-xs font-semibold rounded-lg shadow-sm"
                  >
                    ✓ {service.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setShowDetailsModal(false)}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors"
            >
              Close Details
            </button>
          </div>
        </div>
      </Modal>

      {/* Upgrade Seat Modal */}
      <Modal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Change Service Class"
      >
        <div className="p-2">
          <p className="text-gray-600 mb-6 text-sm">
            Current reservation class:{" "}
            <span className="font-bold text-gray-800">
              {booking.bookingClass || "Economy"}
            </span>
            . Choose an available class. Your ticket price will be updated
            accordingly.
          </p>

          <div className="space-y-3 mb-6">
            {[
              {
                id: "Economy",
                title: "Economy",
                desc: "Standard seating and services.",
                color: "gray",
              },
              {
                id: "Premium Economy",
                title: "Premium Economy",
                desc: "Extra legroom and priority boarding.",
                color: "blue",
              },
              {
                id: "Business Class",
                title: "Business Class",
                desc: "Lie-flat seating, fine dining, lounge access.",
                color: "purple",
              },
              {
                id: "First Class",
                title: "First Class",
                desc: "Private suite, dedicated concierge, shower capabilities.",
                color: "teal",
              },
            ].map((cls) => {
              const delta = getPriceDelta(cls.id);
              const isSelected = selectedSeat === cls.id;
              const deltaText =
                delta > 0
                  ? `(+ $${delta.toLocaleString()})`
                  : delta < 0
                    ? `(- $${Math.abs(delta).toLocaleString()})`
                    : `(Current)`;

              return (
                <label
                  key={cls.id}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors border-gray-200 hover:bg-${cls.color}-50 ${
                    isSelected
                      ? `border-${cls.color}-500 bg-${cls.color}-50`
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="upgrade"
                    value={cls.id}
                    checked={isSelected}
                    onChange={(e) => setSelectedSeat(e.target.value)}
                    className={`w-4 h-4 text-${cls.color}-600 border-gray-300 focus:ring-${cls.color}-500 mr-3`}
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {cls.title}{" "}
                      <span className="ml-1 text-sm font-bold">
                        {deltaText}
                      </span>
                    </h4>
                    <p className="text-xs text-gray-500">{cls.desc}</p>
                  </div>
                </label>
              );
            })}
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={submitUpgrade}
              disabled={isSubmitting || selectedSeat === booking.bookingClass}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Processing..." : "Confirm Change"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Services Modal */}
      <Modal
        isOpen={showServicesModal}
        onClose={() => setShowServicesModal(false)}
        title="Add Extra Services to Booking"
      >
        <div className="p-2">
          <p className="text-gray-600 mb-6 text-sm">
            Select additional amenities or requests below. Added costs will be
            billed automatically to your stored payment method.
          </p>

          <div className="space-y-3 mb-6">
            <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedServices.includes("Extra 25kg Baggage ($45)")}
                onChange={() => toggleService("Extra 25kg Baggage ($45)")}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mr-3"
              />
              <div className="flex-1 text-sm font-medium text-gray-700">
                Extra Checked Baggage (25kg - $45)
              </div>
            </label>

            <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedServices.includes("Pre-order Hot Meal ($15)")}
                onChange={() => toggleService("Pre-order Hot Meal ($15)")}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mr-3"
              />
              <div className="flex-1 text-sm font-medium text-gray-700">
                Pre-order In-Flight Hot Meal ($15)
              </div>
            </label>

            <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedServices.includes(
                  "Lounge Access Day Pass ($35)",
                )}
                onChange={() => toggleService("Lounge Access Day Pass ($35)")}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mr-3"
              />
              <div className="flex-1 text-sm font-medium text-gray-700">
                VIP Lounge Day Pass ($35)
              </div>
            </label>

            <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedServices.includes("Travel Insurance ($20)")}
                onChange={() => toggleService("Travel Insurance ($20)")}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mr-3"
              />
              <div className="flex-1 text-sm font-medium text-gray-700">
                Comprehensive Travel Insurance ($20)
              </div>
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button
              onClick={() => setShowServicesModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={submitServices}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors"
            >
              Purchase Services
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
