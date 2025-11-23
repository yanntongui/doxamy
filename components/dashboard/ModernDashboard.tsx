import React, { useMemo, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { NavItem } from '../../types';
import {
    TrendUpIcon, TrendDownIcon, ShoppingBagIcon, CarIcon, HouseIcon,
    TargetIcon, CalendarIcon, FilterIcon, SparklesIcon, PiggyBankIcon,
    SunIcon, MoonIcon
} from '../Icons';
import { motion } from 'framer-motion';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';

const categoryColors: { [key: string]: string } = {
    'Alimentation': '#F59E0B', // Amber
    'Transport': '#3B82F6',   // Blue
    'Logement': '#10B981',    // Emerald
    'Loisirs': '#8B5CF6',     // Violet
    'Santé': '#EF4444',       // Red
    'Éducation': '#6366F1',   // Indigo
    'Shopping': '#EC4899',    // Pink
    'Services': '#64748B',    // Slate
    'Autre': '#9CA3AF',       // Gray
};

const COLORS = Object.values(categoryColors);

interface ModernDashboardProps {
    onNavigate: (screen: NavItem) => void;
}

const ModernDashboard: React.FC<ModernDashboardProps> = ({ onNavigate }) => {
    const { transactions, goals, userProfile, accounts } = useAppContext();
    const { theme, toggleTheme } = useTheme();
    const [period, setPeriod] = useState<'current' | 'last'>('current');

    // --- Data Processing ---
    const dashboardData = useMemo(() => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonth = lastMonthDate.getMonth();
        const lastMonthYear = lastMonthDate.getFullYear();

        const targetYear = period === 'current' ? currentYear : lastMonthYear;
        const targetMonth = period === 'current' ? currentMonth : lastMonth;

        const filteredTransactions = transactions.filter(tx => {
            const [day, month, year] = tx.date.split('/').map(Number);
            return year === targetYear && (month - 1) === targetMonth;
        });

        const income = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = filteredTransactions.reduce((sum, t) => {
            if (t.type === 'expense') sum += t.amount;
            if (t.type === 'transfer' && t.transferFee) sum += t.transferFee;
            return sum;
        }, 0);

        // Category Data for Pie Chart
        const expensesByCategory = filteredTransactions.reduce((acc, tx) => {
            if (tx.type === 'expense') {
                acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
            }
            return acc;
        }, {} as { [key: string]: number });

        const pieData = Object.entries(expensesByCategory)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        // Daily Data for Area Chart
        const dailyDataMap = new Map<number, number>();
        const daysInMonth = new Date(targetYear, Number(targetMonth) + 1, 0).getDate();

        for (let i = 1; i <= daysInMonth; i++) {
            dailyDataMap.set(i, 0);
        }

        filteredTransactions.filter(t => t.type === 'expense').forEach(tx => {
            const day = parseInt(tx.date.split('/')[0], 10);
            dailyDataMap.set(day, (dailyDataMap.get(day) || 0) + tx.amount);
        });

        const areaData = Array.from(dailyDataMap.entries()).map(([day, amount]) => ({
            day: day.toString(),
            amount
        }));

        const globalBalance = accounts.reduce((sum, acc) => sum + acc.currentBalance, 0);

        return {
            income,
            expenses,
            balance: income - expenses,
            pieData,
            areaData,
            globalBalance
        };
    }, [transactions, period, accounts]);

    // --- Animation Variants ---
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <motion.div
            className="p-4 lg:p-8 space-y-6 min-h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0d1117] dark:via-[#1a1f2e] dark:to-[#0d1117]"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Decorative Gradient Blob for Dark Mode */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[120px] mix-blend-screen dark:block hidden"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px] mix-blend-screen dark:block hidden"></div>
            </div>

            <div className="relative z-10 space-y-6">
                {/* Header Section */}
                <motion.div variants={itemVariants} className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <img src={userProfile.avatar} alt="Profile" className="w-14 h-14 rounded-full border-2 border-white dark:border-gray-700 shadow-md" />
                            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Bon retour,</p>
                            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{userProfile.name}</h1>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            title={theme === 'light' ? 'Passer en mode sombre' : 'Passer en mode clair'}
                        >
                            {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                        </button>
                        <div className="flex bg-white dark:bg-gray-800 rounded-full p-1 shadow-sm border border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => setPeriod('current')}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${period === 'current' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            >
                                Ce mois
                            </button>
                            <button
                                onClick={() => setPeriod('last')}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${period === 'last' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            >
                                Mois dernier
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Main Stats Cards */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Global Balance */}
                    <div className="glass-card p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <PiggyBankIcon className="w-24 h-24 text-primary" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Solde Global</p>
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                            {dashboardData.globalBalance.toLocaleString('fr-FR')} <span className="text-lg text-gray-500">FCFA</span>
                        </h2>
                        <div className="flex items-center text-sm text-green-500 bg-green-100 dark:bg-green-900/30 w-fit px-2 py-1 rounded-md">
                            <TrendUpIcon className="w-4 h-4 mr-1" />
                            <span>+12% vs mois dernier</span>
                        </div>
                    </div>

                    {/* Income */}
                    <div className="glass-card p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <TrendUpIcon className="w-24 h-24 text-green-500" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Revenus</p>
                        <h2 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                            +{dashboardData.income.toLocaleString('fr-FR')} <span className="text-lg text-gray-500">FCFA</span>
                        </h2>
                        <p className="text-sm text-gray-400">Total encaissé</p>
                    </div>

                    {/* Expenses */}
                    <div className="glass-card p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <TrendDownIcon className="w-24 h-24 text-red-500" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Dépenses</p>
                        <h2 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
                            -{dashboardData.expenses.toLocaleString('fr-FR')} <span className="text-lg text-gray-500">FCFA</span>
                        </h2>
                        <p className="text-sm text-gray-400">Total dépensé</p>
                    </div>
                </motion.div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Spending Trend Area Chart */}
                    <motion.div variants={itemVariants} className="glass-panel p-6 lg:col-span-2">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                            <TrendUpIcon className="w-5 h-5 mr-2 text-primary" />
                            Évolution des Dépenses
                        </h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dashboardData.areaData}>
                                    <defs>
                                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="day"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                        tickFormatter={(value) => `${value / 1000}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        formatter={(value: number) => [`${value.toLocaleString()} FCFA`, 'Dépense']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="amount"
                                        stroke="#3B82F6"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorAmount)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Category Distribution Pie Chart */}
                    <motion.div variants={itemVariants} className="glass-panel p-6">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                            <ShoppingBagIcon className="w-5 h-5 mr-2 text-primary" />
                            Répartition
                        </h3>
                        <div className="h-[220px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={dashboardData.pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {dashboardData.pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={categoryColors[entry.name] || categoryColors['Autre']} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number) => `${value.toLocaleString()} FCFA`}
                                        contentStyle={{ borderRadius: '8px', border: 'none' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Text */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <p className="text-xs text-gray-500">Total</p>
                                <p className="text-lg font-bold text-gray-800 dark:text-white">
                                    {dashboardData.expenses.toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 space-y-2 max-h-[100px] overflow-y-auto pr-2 custom-scrollbar">
                            {dashboardData.pieData.map((entry, index) => (
                                <div key={index} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: categoryColors[entry.name] || categoryColors['Autre'] }}></div>
                                        <span className="text-gray-600 dark:text-gray-300">{entry.name}</span>
                                    </div>
                                    <span className="font-medium text-gray-800 dark:text-white">{Math.round((entry.value / dashboardData.expenses) * 100)}%</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Goals Section */}
                <motion.div variants={itemVariants} className="glass-panel p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center">
                            <TargetIcon className="w-5 h-5 mr-2 text-primary" />
                            Objectifs Prioritaires
                        </h3>
                        <button onClick={() => onNavigate('goals')} className="text-sm text-primary font-medium hover:underline">Voir tout</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {goals.slice(0, 2).map(goal => {
                            const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                            return (
                                <div key={goal.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                                        <goal.icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between mb-1">
                                            <span className="font-bold text-gray-800 dark:text-white">{goal.name}</span>
                                            <span className="text-sm font-medium text-gray-500">{percent}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                                className="bg-secondary h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${percent}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {goal.currentAmount.toLocaleString()} / {goal.targetAmount.toLocaleString()} FCFA
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                        {goals.length === 0 && (
                            <p className="text-gray-500 text-sm col-span-2 text-center py-4">Aucun objectif défini. Commencez à épargner !</p>
                        )}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default ModernDashboard;
