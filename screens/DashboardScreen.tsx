import React from 'react';
import { type NavItem } from '../types';
import ModernDashboard from '../components/dashboard/ModernDashboard';

interface DashboardScreenProps {
  onNavigate: (screen: NavItem) => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate }) => {
  return <ModernDashboard onNavigate={onNavigate} />;
};

export default DashboardScreen;