import React, { useMemo } from 'react';
import { DownloadIcon } from '../components/Icons';
import { useAppContext } from '../context/AppContext';

const categoryColors: { [key: string]: { color: string; class: string } } = {
    'Alimentation': { color: 'bg-primary', class: 'text-primary' },
    'Transports': { color: 'bg-secondary', class: 'text-secondary' },
    'Loyer / Remboursement immo': { color: 'bg-accent', class: 'text-accent' },
    'Frais de transfert': { color: 'bg-red-500', class: 'text-red-500' },
    'Autres': { color: 'bg-warning', class: 'text-warning' },
};

interface ReportScreenProps {
    onBack: () => void;
}

const ReportScreen: React.FC<ReportScreenProps> = ({ onBack }) => {
    const { transactions } = useAppContext();

    const reportData = useMemo(() => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const monthName = now.toLocaleString('fr-FR', { month: 'long' });

        const currentMonthTransactions = transactions.filter(tx => {
            const [day, month, year] = tx.date.split('/').map(Number);
            return year === currentYear && (month - 1) === currentMonth;
        });

        const totalIncome = currentMonthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = currentMonthTransactions.reduce((sum, t) => {
            if (t.type === 'expense') {
                sum += t.amount;
            }
            if (t.type === 'transfer' && t.transferFee) {
                sum += t.transferFee;
            }
            return sum;
        }, 0);

        const expensesByCategory: { [key: string]: number } = currentMonthTransactions
            .reduce((acc, tx) => {
                if (tx.type === 'expense') {
                    const mainCategory = tx.category.split(' ')[0]; // Basic grouping
                    acc[mainCategory] = (acc[mainCategory] || 0) + tx.amount;
                }
                if (tx.type === 'transfer' && tx.transferFee) {
                    const feeCategory = 'Frais de transfert';
                    acc[feeCategory] = (acc[feeCategory] || 0) + tx.transferFee;
                }
                return acc;
            }, {} as { [key: string]: number });

        return {
            monthName,
            year: currentYear,
            totalIncome,
            totalExpenses,
            expensesByCategory,
        };
    }, [transactions]);


    const ReportPieChart = ({ data }: { data: { [key: string]: number } }) => {
        const total = Object.values(data).reduce((sum, v) => sum + v, 0);
        if (total === 0) return <div className="w-[120px] h-[120px] rounded-full bg-gray-200 dark:bg-gray-700 mx-auto" />;

        const sortedData = Object.entries(data).sort(([, a], [, b]) => b - a);
        const topCatsMain = sortedData.slice(0, 3);
        const otherAmount = sortedData.slice(3).reduce((sum, [, amount]) => sum + amount, 0);
        if (otherAmount > 0) topCatsMain.push(['Autres', otherAmount]);

        const topCats = topCatsMain.filter(([, amount]) => amount > 0);


        const chartData = topCats.map(([category, amount]) => ({
            name: category,
            percent: (amount / total) * 100,
            colorClass: categoryColors[category]?.class || categoryColors['Autres'].class,
            bgColorClass: categoryColors[category]?.color || categoryColors['Autres'].color,
        }));

        let cumulativePercent = 0;
        const radius = 15.9155;
        const strokeWidth = 8;

        return (
            <>
                <svg width="120" height="120" viewBox="0 0 40 40" className="-rotate-90 mx-auto">
                    <circle className="text-gray-200 dark:text-gray-700" stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" r={radius} cx="20" cy="20" />
                    {chartData.map((item, index) => {
                        const dashArray = `${item.percent * (2 * Math.PI * radius) / 100} ${2 * Math.PI * radius}`;
                        const dashOffset = -cumulativePercent * (2 * Math.PI * radius) / 100;
                        cumulativePercent += item.percent;
                        return <circle key={index} className={item.colorClass} stroke="currentColor" strokeWidth={strokeWidth} strokeDasharray={dashArray} strokeDashoffset={dashOffset} strokeLinecap="round" fill="transparent" r={radius} cx="20" cy="20" />
                    })}
                </svg>
                <div className="mt-4 space-y-2 text-sm text-dark dark:text-light">
                    {chartData.map(item => (
                        <p key={item.name} className="flex items-center"><span className={`inline-block w-3 h-3 rounded-full ${item.bgColorClass} mr-2`}></span>{item.name}: {item.percent.toFixed(0)}%</p>
                    ))}
                </div>
            </>
        )
    };

    return (
        <div className="p-4 bg-light dark:bg-gray-900 min-h-full">
            <div className="flex items-center mb-6">
                <button onClick={onBack} className="text-primary font-bold">&lt; Retour</button>
                <h1 className="text-xl font-bold text-dark dark:text-light mx-auto">Rapport de {reportData.monthName} {reportData.year}</h1>
            </div>

            <div className="space-y-6">
                <div className="bg-white dark:bg-dark-card p-4 rounded-xl grid grid-cols-2 text-center divide-x dark:divide-gray-700">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-text-secondary">Revenus Totaux</p>
                        <p className="font-bold text-lg text-success">{reportData.totalIncome.toLocaleString('fr-FR')} FCFA</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-text-secondary">Dépenses Totales</p>
                        <p className="font-bold text-lg text-danger">-{reportData.totalExpenses.toLocaleString('fr-FR')} FCFA</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-dark-card p-4 rounded-xl">
                    <h3 className="font-bold text-dark dark:text-light mb-4 text-center">Répartition des Dépenses</h3>
                    <ReportPieChart data={reportData.expensesByCategory} />
                </div>

                <div className="bg-white dark:bg-dark-card p-4 rounded-xl">
                    <h3 className="font-bold text-dark dark:text-light mb-2">Insight IA</h3>
                    <p className="text-gray-600 dark:text-text-secondary text-sm">
                        Ce mois-ci, vos dépenses en transport ont augmenté de 15% par rapport à Juin, principalement en raison de la hausse du prix de l'essence. Vous avez cependant bien maîtrisé votre budget alimentation.
                    </p>
                </div>

                <button onClick={() => window.print()} className="w-full flex items-center justify-center bg-primary text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors">
                    <DownloadIcon className="w-5 h-5 mr-2" />
                    Exporter en PDF
                </button>
            </div>
        </div>
    );
};

export default ReportScreen;