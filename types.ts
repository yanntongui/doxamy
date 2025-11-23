// FIX: Import React to resolve 'Cannot find namespace 'React'' error for React.ComponentType.
import React from 'react';

export type NavItem = 'Tableau de Bord' | 'Transactions' | 'Listes' | 'Objectifs' | 'Plus' | 'Budget' | 'Rapports' | 'Profil' | 'Comptes' | 'Famille' | 'Paramètres' | 'Aide' | 'À Propos' | 'Dettes' | 'Catégories';

export interface UserProfile {
  name: string;
  email: string;
  avatar: string; // URL to the avatar image
}

export interface FamilySpace {
  id: string;
  name: string;
  ownerId: string; // The email of the user who created it
  members: string[]; // List of member emails
}

export interface Account {
  id: string;
  name: string;
  type: 'Banque' | 'Espèces' | 'Épargne';
  initialBalance: number;
  familySpaceId?: string; // Link to a family space
}

export interface Transaction {
  id:string;
  accountId: string; // Link to the account (source for transfers)
  date: string;
  category: string; // Not used for transfers
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  frequency: 'ponctuel' | 'hebdomadaire' | 'mensuel' | 'annuel';
  attachmentName?: string;
  destinationAccountId?: string; // For transfers
  transferFee?: number; // For transfers
  debtCreditId?: string; // Link to a debt/credit item
  goalId?: string; // Link to a goal item
}

export interface Contribution {
  date: string; // ISO date string
  amount: number;
}

export interface Goal {
  id: string;
  name: string;
  currentAmount: number;
  targetAmount: number;
  deadline?: string;
  category: 'Épargne Simple' | 'Projet Personnel' | 'Investissement';
  icon: React.ComponentType<{ className?: string }>;
  contributions: Contribution[];
}

export interface ShoppingListItem {
    id: string;
    name: string;
    quantity: number;
    estimatedPrice: number;
    actualPrice?: number;
    purchased: boolean;
}

export interface Analysis {
    planned: number;
    spent: number;
    difference: number;
    percentageDiff: number;
    insight: string;
}

export interface ShoppingList {
    id: string;
    name: string;
    items: ShoppingListItem[];
    analysis?: Analysis;
    date: string;
    status: 'active' | 'archived';
    isExpenseCreated?: boolean;
    receiptFileName?: string;
}

// New types for the detailed budget plan
export interface BudgetLine {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  notes?: string;
}

export interface BudgetSection {
  title: string;
  lines: BudgetLine[];
}

export interface BudgetPlan {
  id: string;
  date: string;
  income: number;
  method: '50/30/20' | '50/25/25' | 'zero';
  sections: BudgetSection[];
  familySpaceId?: string; // Link to a family space
}

export interface DebtCreditContribution {
  date: string;
  amount: number;
}

export interface DebtCreditItem {
  id: string;
  name: string;
  type: 'debt' | 'credit'; // 'debt' = I owe, 'credit' = someone owes me
  totalAmount: number;
  amountPaid: number;
  contributions: DebtCreditContribution[];
  familySpaceId?: string;
}

export interface Checklist {
  addedAccount: boolean;
  addedTransaction: boolean;
  createdBudget: boolean;
  setGoal: boolean;
}