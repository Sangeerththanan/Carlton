import React from 'react';
import { useParams } from 'react-router-dom';
import { AdminDashboard } from './AdminDashboard';
import { TicketDashboard } from './TicketDashboard';
import { FinanceDashboard } from './FinanceDashboard';
import { OperationsDashboard } from './OperationsDashboard';
import { CustomerDashboard } from './CustomerDashboard';

export const DashboardRouter: React.FC = () => {
  const { role } = useParams<{ role: string }>();

  switch (role?.toLowerCase()) {
    case 'admin':
      return <AdminDashboard />;
    case 'ticketofficer':
      return <TicketDashboard />;
    case 'financeofficer':
      return <FinanceDashboard />;
    case 'operationsmanager':
      return <OperationsDashboard />;
    case 'customer':
      return <CustomerDashboard />;
    default:
      return <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unknown Role</h1>
          <p className="text-gray-600">The role '{role}' is not recognized.</p>
        </div>
      </div>;
  }
};
