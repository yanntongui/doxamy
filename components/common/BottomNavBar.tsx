import React from 'react';
import { type NavItem } from '../../types';
// FIX: Replaced ExpensesIcon with TransactionIcon as it's the correct icon component.
import { DashboardIcon, TransactionIcon, GoalsIcon, MoreIcon, PiggyBankIcon } from '../Icons';

interface BottomNavBarProps {
  activeItem: NavItem;
  onNavigate: (item: NavItem) => void;
}

const navItems: { name: NavItem; icon: React.ComponentType<{ className?: string }> }[] = [
  { name: 'Tableau de Bord', icon: DashboardIcon },
  // FIX: Changed 'Dépenses' to 'Transactions' to match the NavItem type and use the correct icon.
  { name: 'Transactions', icon: TransactionIcon },
  { name: 'Budget', icon: PiggyBankIcon },
  { name: 'Objectifs', icon: GoalsIcon },
  { name: 'Plus', icon: MoreIcon },
];

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeItem, onNavigate }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-white dark:bg-dark-card border-t border-gray-200 dark:border-dark-border flex justify-around items-center pb-4 z-40 md:hidden">
      {navItems.map(({ name, icon: Icon }) => (
        <button
          key={name}
          onClick={() => onNavigate(name)}
          className={`flex flex-col items-center justify-center text-xs transition-colors w-1/5 pt-2 ${
            activeItem === name ? 'text-primary' : 'text-gray-500 dark:text-text-secondary hover:text-primary'
          }`}
        >
          <Icon className="w-6 h-6 mb-1" />
          <span>{name}</span>
        </button>
      ))}
    </div>
  );
};

export default BottomNavBar;