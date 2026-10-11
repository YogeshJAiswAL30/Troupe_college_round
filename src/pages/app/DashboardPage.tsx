import React from 'react';
import { useFairwork } from '../../context/FairworkContext';
import { ClientDashboard } from '../../components/dashboard/ClientDashboard';
import { FreelancerDashboard } from '../../components/dashboard/FreelancerDashboard';

export const DashboardPage: React.FC = () => {
  const { currentUser } = useFairwork();

  // Distinct dashboards based on role
  if (currentUser.role === 'CLIENT') {
    return <ClientDashboard />;
  }

  // FREELANCER (or ARBITRATOR default preview)
  return <FreelancerDashboard />;
};
