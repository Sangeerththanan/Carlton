import { useState } from 'react';
import { useFlights } from '../hooks/useFlights';
import { FlightCard, FlightForm } from '../components';
import Modal from '@/components/Modal';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import type { Flight } from '../types/flightTypes';

const FlightList = () => {
  const { flights, loading, error, createFlight, updateFlight, deleteFlight } = useFlights();
  const { showSuccess, showError, toasts, removeToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingFlight, setEditingFlight] = useState<Flight | undefined>();

  const getErrorMessage = (error: unknown): string => {
    // Check for specific validation error message from backend
    const axiosError = error as any;
    if (axiosError?.response?.data) {
      const data = axiosError.response.data;
      
      // Check if the data itself is a string error message (ASP.NET Core BadRequest with string)
      if (typeof data === 'string') return data;
      
      // Direct message field (ASP.NET Core BadRequest)
      if (data.message) return data.message;
      
      // Title field (often used for main error)
      if (data.title) return data.title;
      
      // Detail field
      if (data.detail) return data.detail;
      
      // Errors object (validation errors)
      if (data.errors) {
        const firstError = Object.values(data.errors)[0];
        if (Array.isArray(firstError)) return firstError[0];
        if (typeof firstError === 'string') return firstError;
      }
    }
    
    // Network error
    if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
      return error.message;
    }
    
    // Default fallback
    return 'An unexpected error occurred. Please try again.';
  };

  const handleCreate = async (flightData: any) => {
    try {
      await createFlight(flightData);
      showSuccess('Flight created successfully!');
      setShowForm(false);
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message);
    }
  };

  const handleUpdate = async (id: number, flightData: any) => {
    try {
      await updateFlight(id, flightData);
      showSuccess('Flight updated successfully!');
      setShowForm(false);
      setEditingFlight(undefined);
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this flight?')) {
      try {
        await deleteFlight(id);
        showSuccess('Flight deleted successfully!');
      } catch (error) {
        const message = getErrorMessage(error);
        showError(message);
      }
    }
  };

  const handleEdit = (flight: Flight) => {
    setEditingFlight(flight);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingFlight(undefined);
  };

  const handleAddNew = () => {
    setShowForm(true);
    setEditingFlight(undefined);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading flights...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Flight Management</h1>
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Add New Flight
        </button>
      </div>

      <Modal
        isOpen={showForm}
        onClose={handleCancel}
        title={editingFlight ? 'Edit Flight' : 'Create New Flight'}
      >
        <FlightForm
          flight={editingFlight}
          onSubmit={editingFlight ? (data) => handleUpdate(editingFlight.id, data) : handleCreate}
          onCancel={handleCancel}
        />
      </Modal>

      {flights.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No flights found</div>
          <button
            onClick={handleAddNew}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Create Your First Flight
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-4 text-gray-600">
            Showing {flights.length} flight{flights.length !== 1 ? 's' : ''}
          </div>
          {flights.map((flight) => (
            <FlightCard
              key={flight.id}
              flight={flight}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>

      {/* Toast Container */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
};

export default FlightList;
