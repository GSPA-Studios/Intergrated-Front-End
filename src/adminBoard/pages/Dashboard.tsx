import React from 'react';
import DashboardHeader from '../components/Dashboard/DashboardHeader';
import SummaryCards from '../components/Dashboard/SummaryCards';
import LatestFitsTable from '../components/Dashboard/LatestFitsTable';
import UserManagementButton from '../components/Dashboard/UserManagementButton';
import SidebarNav from '../components/Dashboard/SidebarNav';
import { useAuth } from '../hooks/useAuth';
import { useFits } from '../hooks/useFits';
import '../styles/dashboard.css';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { latestFits, isLoading, error } = useFits();

  if (isLoading) return <div className="loading-container"><div className="loading-spinner"></div><p>Loading...</p></div>;
  if (error) return <div className="error-container">Error loading dashboard data: {error.message}</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-sidebar">
        <SidebarNav />
      </div>
      <div className="dashboard-content">
        <DashboardHeader />
        <SummaryCards />
        <LatestFitsTable fits={latestFits} />
        <UserManagementButton />
      </div>
    </div>
  );
};

export default Dashboard; 