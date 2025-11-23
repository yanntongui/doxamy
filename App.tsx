


import React, { useState, useCallback } from 'react';
import OnboardingScreen from './screens/OnboardingScreen';
import TransactionsScreen from './screens/ExpensesScreen';
import ShoppingListScreen from './screens/ShoppingListScreen';
import GoalsScreen from './screens/GoalsScreen';
import MoreScreen from './screens/MoreScreen';
import BudgetScreen from './screens/BudgetScreen';
import ReportScreen from './screens/ReportScreen';
import ProfileScreen from './screens/ProfileScreen';
import AccountsScreen from './screens/AccountsScreen';
import FamilyModeScreen from './screens/FamilyModeScreen';
import SettingsScreen from './screens/SettingsScreen';
import HelpScreen from './screens/HelpScreen';
import AboutScreen from './screens/AboutScreen';
import DebtScreen from './screens/DebtScreen';
import CategoriesScreen from './screens/CategoriesScreen';
import BottomNavBar from './components/common/BottomNavBar';
import Sidebar from './components/common/Sidebar';
import { type NavItem } from './types';
import { PlusIcon } from './components/Icons';
import { useAppContext } from './context/AppContext';
import DashboardScreen from './screens/DashboardScreen';
import InitialSetupWizard from './components/common/InitialSetupWizard';

const App: React.FC = () => {
  const { onboardingComplete, handleOnboardingFinish, initialSetupComplete, handleSetupFinish, loading } = useAppContext();
  const [activeScreen, setActiveScreen] = useState<NavItem>('Tableau de Bord');
  const [showAddTransaction, setShowAddTransaction] = useState(false);

  const handleNavigate = useCallback((screen: NavItem) => {
    setActiveScreen(screen);
    if (screen !== 'Transactions') {
      setShowAddTransaction(false);
    }
  }, []);

  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 'Tableau de Bord':
        return <DashboardScreen onNavigate={handleNavigate} />;
      case 'Transactions':
        return <TransactionsScreen
          showAddForm={showAddTransaction}
          setShowAddForm={setShowAddTransaction}
        />;
      case 'Listes':
        return <ShoppingListScreen onBack={() => handleNavigate('Plus')} />;
      case 'Objectifs':
        return <GoalsScreen />;
      case 'Plus':
        return <MoreScreen onNavigate={handleNavigate} />;
      case 'Budget':
        return <BudgetScreen />;
      case 'Rapports':
        return <ReportScreen onBack={() => handleNavigate('Plus')} />;
      case 'Profil':
        return <ProfileScreen onBack={() => handleNavigate('Plus')} />;
      case 'Comptes':
        return <AccountsScreen onBack={() => handleNavigate('Plus')} />;
      case 'Famille':
        return <FamilyModeScreen onBack={() => handleNavigate('Plus')} />;
      case 'Paramètres':
        return <SettingsScreen onBack={() => handleNavigate('Plus')} />;
      case 'Aide':
        return <HelpScreen onBack={() => handleNavigate('Plus')} />;
      case 'À Propos':
        return <AboutScreen onBack={() => handleNavigate('Plus')} />;
      case 'Dettes':
        return <DebtScreen onBack={() => handleNavigate('Plus')} />;
      case 'Catégories':
        return <CategoriesScreen onBack={() => handleNavigate('Plus')} />;
      default:
        return <DashboardScreen onNavigate={handleNavigate} />;
    }
  };

  const FloatingActionButton = () => (
    <button
      onClick={() => {
        handleNavigate('Transactions');
        setShowAddTransaction(true);
      }}
      className="fixed z-30 bottom-28 left-1/2 -translate-x-1/2 md:bottom-8 md:right-8 md:left-auto md:translate-x-0 w-16 h-16 bg-primary rounded-full text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
      aria-label="Ajouter une transaction"
    >
      <PlusIcon className="w-8 h-8" />
    </button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-light dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!onboardingComplete) {
    return <OnboardingScreen onFinish={handleOnboardingFinish} />;
  }

  if (!initialSetupComplete) {
    return <InitialSetupWizard onFinish={handleSetupFinish} />;
  }

  return (
    <div className="bg-light dark:bg-gray-900 min-h-screen">
      <Sidebar activeItem={activeScreen} onNavigate={handleNavigate} />
      <main className="md:ml-64 pb-24 md:pb-4">
        {renderActiveScreen()}
      </main>
      <FloatingActionButton />
      <BottomNavBar activeItem={activeScreen} onNavigate={handleNavigate} />
    </div>
  );
};

export default App;