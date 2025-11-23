
import React, { useState, useMemo, useRef } from 'react';
import { type ShoppingListItem, type Transaction, type Analysis, type ShoppingList } from '../types';
import { TrashIcon, TrendUpIcon, TrendDownIcon, ShoppingListIcon, CheckCircleIcon, CameraIcon } from '../components/Icons';
import { useAppContext } from '../context/AppContext';

// FIX: Add props interface to accept onBack prop from App.tsx
interface ShoppingListScreenProps {
  onBack: () => void;
}

const ShoppingListScreen: React.FC<ShoppingListScreenProps> = ({ onBack }) => {
  const { handleAddTransaction, accounts } = useAppContext();
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [mode, setMode] = useState<'list' | 'shop' | 'analysis'>('list');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const activeList = useMemo(() => lists.find(l => l.id === activeListId), [lists, activeListId]);

  // Handlers for lists
  const handleStartNewList = () => {
    const newList: ShoppingList = {
      id: Date.now().toString(),
      name: `Nouvelle Liste - ${new Date().toLocaleDateString('fr-FR')}`,
      items: [],
      date: new Date().toLocaleDateString('fr-FR'),
      status: 'active',
    };
    setLists(prev => [newList, ...prev]);
    setActiveListId(newList.id);
    setMode('list'); // Stay in list mode to edit
    setReceiptFile(null);
  };

  const handleDeleteList = (id: string) => {
    setLists(lists.filter(list => list.id !== id));
    if (activeListId === id) {
      setActiveListId(null);
    }
  };

  const handleViewListDetails = (list: ShoppingList) => {
    setActiveListId(list.id);
    setReceiptFile(null);
    if (list.status === 'active') {
      setMode('list');
    } else {
      setMode('analysis');
    }
  };

  // Handlers for items within the active list
  const updateActiveList = (updates: Partial<ShoppingList>) => {
    if (!activeListId) return;
    setLists(lists.map(l => l.id === activeListId ? { ...l, ...updates } : l));
  };

  const handleAddItem = (newItem: ShoppingListItem) => {
    if (!activeList) return;
    updateActiveList({ items: [...activeList.items, newItem] });
  };

  const handleRemoveItem = (itemId: string) => {
    if (!activeList) return;
    updateActiveList({ items: activeList.items.filter(item => item.id !== itemId) });
  };

  const handleItemUpdate = (itemId: string, itemUpdates: Partial<ShoppingListItem>) => {
    if (!activeList) return;
    updateActiveList({
      items: activeList.items.map(item => item.id === itemId ? { ...item, ...itemUpdates } : item)
    });
  };

  const { totalEstimated, totalActual, budgetRemaining, analysis } = useMemo(() => {
    if (!activeList) return { totalEstimated: 0, totalActual: 0, budgetRemaining: 0, analysis: null };

    if (activeList.status === 'archived' && activeList.analysis) {
      const totalEstimated = activeList.items.reduce((sum, item) => sum + (item.estimatedPrice * item.quantity), 0);
      return { totalEstimated, totalActual: activeList.analysis.spent, budgetRemaining: 0, analysis: activeList.analysis };
    }

    const items = activeList.items;
    const totalEstimated = items.reduce((sum, item) => sum + (item.estimatedPrice * item.quantity), 0);
    const purchasedItems = items.filter(i => i.purchased);
    const totalActual = purchasedItems.reduce((sum, item) => sum + ((item.actualPrice ?? 0) * item.quantity), 0);
    const budgetRemaining = totalEstimated - totalActual;
    const plannedForPurchased = purchasedItems.reduce((sum, item) => sum + (item.estimatedPrice * item.quantity), 0);
    const difference = totalActual - plannedForPurchased;
    const percentageDiff = plannedForPurchased > 0 ? (difference / plannedForPurchased) * 100 : 0;

    let insight = "Bonne gestion de votre budget de courses !";
    if (purchasedItems.length > 0) {
      const itemWithBiggestDiff = purchasedItems.map(item => ({
        ...item,
        diff: ((item.actualPrice ?? item.estimatedPrice) - item.estimatedPrice) / item.estimatedPrice
      })).sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))[0];

      if (itemWithBiggestDiff && Math.abs(itemWithBiggestDiff.diff) > 0.1) {
        insight = `${itemWithBiggestDiff.name} a coûté ${Math.round(itemWithBiggestDiff.diff * 100)}% ${itemWithBiggestDiff.diff > 0 ? 'plus cher' : 'moins cher'} que prévu.`;
      }
    }
    return {
      totalEstimated,
      totalActual,
      budgetRemaining,
      analysis: { planned: plannedForPurchased, spent: totalActual, difference, percentageDiff, insight }
    };
  }, [activeList]);

  const handleArchive = (createExpense: boolean) => {
    if (!activeList || !analysis) return;

    if (createExpense) {
      if (accounts.length === 0) {
        alert("Veuillez créer un compte avant d'enregistrer une dépense.");
        return;
      }
      handleAddTransaction({
        accountId: accounts[0].id,
        amount: analysis.spent,
        category: 'Alimentation',
        date: new Date().toLocaleDateString('fr-FR'),
        description: activeList.name || 'Liste de courses',
        type: 'expense'
      });
    }

    updateActiveList({
      status: 'archived',
      analysis,
      isExpenseCreated: createExpense,
      receiptFileName: receiptFile?.name
    });
    setActiveListId(null);
    setReceiptFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
    }
  };

  const handleReceiptClick = () => {
    fileInputRef.current?.click();
  };

  // Sub-Components for rendering
  const ItemEntryForm = () => {
    const [newItemName, setNewItemName] = useState('');
    const [newItemQty, setNewItemQty] = useState(1);
    const [newItemPrice, setNewItemPrice] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newItemName || !newItemPrice || newItemQty <= 0) return;
      handleAddItem({
        id: Date.now().toString(),
        name: newItemName,
        quantity: newItemQty,
        estimatedPrice: parseFloat(newItemPrice),
        purchased: false,
      });
      setNewItemName('');
      setNewItemQty(1);
      setNewItemPrice('');
    };

    return (
      <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-card p-3 rounded-lg space-y-3 mt-4">
        <p className="font-bold text-dark dark:text-light text-center">Ajouter un article</p>
        <div className="grid grid-cols-2 gap-2">
          <input type="text" placeholder="Nom de l'article" value={newItemName} onChange={e => setNewItemName(e.target.value)} className="col-span-2 w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-black dark:text-white placeholder-gray-500" />
          <input type="number" placeholder="Quantité" value={newItemQty} onChange={e => setNewItemQty(parseInt(e.target.value) || 1)} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-black dark:text-white placeholder-gray-500" />
          <input type="number" placeholder="Prix estimé" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-black dark:text-white placeholder-gray-500" />
        </div>
        <button type="submit" className="w-full bg-primary text-white font-bold py-2 rounded-lg">Ajouter</button>
      </form>
    );
  };

  const renderListView = () => {
    if (!activeList) return null;
    return (
      <div>
        <button onClick={() => setActiveListId(null)} className="text-primary font-bold mb-4">&lt; Retour à toutes les listes</button>
        <div className="bg-white dark:bg-dark-card p-4 rounded-xl mb-4 text-center">
          <p className="text-sm text-gray-500 dark:text-text-secondary">Budget Total Estimé</p>
          <p className="text-3xl font-bold text-primary">{totalEstimated.toLocaleString('fr-FR')} FCFA</p>
        </div>
        <input type="text" placeholder="Nom de la liste" value={activeList.name} onChange={e => updateActiveList({ name: e.target.value })} className="w-full px-4 py-3 bg-white dark:bg-dark-card border border-gray-300 dark:border-gray-600 rounded-lg mb-4 text-dark dark:text-light" />
        <div className="space-y-2 mb-6">
          {activeList.items.map(item => (
            <div key={item.id} className="bg-white dark:bg-dark-card p-3 rounded-lg flex justify-between items-center">
              <div>
                <span className="font-medium text-dark dark:text-light">{item.name}</span>
                <span className="text-sm text-gray-500 dark:text-text-secondary"> (x{item.quantity})</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-gray-600 dark:text-text-secondary">~{(item.estimatedPrice * item.quantity).toLocaleString('fr-FR')} FCFA</span>
                <button onClick={() => handleRemoveItem(item.id)} className="text-danger hover:text-red-700">
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          {activeList.items.length === 0 && <p className="text-center text-gray-500 dark:text-text-secondary py-4">Ajoutez des articles à votre liste.</p>}
        </div>
        <ItemEntryForm />
        <button onClick={() => setMode('shop')} disabled={activeList.items.length === 0} className="mt-6 w-full bg-secondary text-white font-bold py-3 rounded-lg disabled:bg-gray-400">Passer en Mode Shopping</button>
      </div>
    );
  };

  const renderShoppingView = () => {
    if (!activeList) return null;
    return (
      <div>
        <div className="sticky top-0 bg-light dark:bg-dark-bg py-4 mb-4 z-10 -mx-4 px-4">
          <div className="bg-white dark:bg-dark-card p-4 rounded-xl text-center">
            <p className="text-sm text-gray-500 dark:text-text-secondary">Budget Restant (Estimé)</p>
            <p className={`text-3xl font-bold ${budgetRemaining >= 0 ? 'text-primary' : 'text-danger'}`}>{budgetRemaining.toLocaleString('fr-FR')} FCFA</p>
          </div>
        </div>
        <div className="space-y-3">
          {activeList.items.map(item => (
            <div key={item.id} className={`bg-white dark:bg-dark-card p-3 rounded-lg flex items-center space-x-3 transition-opacity ${item.purchased ? 'opacity-60' : ''}`}>
              <input type="checkbox" className="h-6 w-6 rounded text-primary focus:ring-primary border-gray-300 dark:border-gray-600" checked={item.purchased} onChange={e => handleItemUpdate(item.id, { purchased: e.target.checked })} />
              <div className="flex-grow">
                <p className={`font-medium text-dark dark:text-light ${item.purchased ? 'line-through' : ''}`}>{item.name} (x{item.quantity})</p>
                <p className="text-xs text-text-muted dark:text-gray-500">Prévu: {item.estimatedPrice.toLocaleString('fr-FR')} FCFA</p>
              </div>
              <input type="number" placeholder="Prix réel" defaultValue={item.actualPrice} onChange={e => handleItemUpdate(item.id, { actualPrice: parseFloat(e.target.value) || 0 })} className="w-28 p-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-right text-dark dark:text-light placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary" />
            </div>
          ))}
        </div>
        <div className="mt-6">
          <button onClick={() => setMode('analysis')} className="w-full bg-primary text-white font-bold py-3 rounded-lg">Terminer & Analyser</button>
        </div>
      </div>
    );
  };

  const renderAnalysisView = () => {
    if (!activeList || !analysis) return null;
    const { planned, spent, difference, percentageDiff, insight } = analysis;
    return (
      <div className="space-y-4">
        {activeList.status === 'archived' && (
          <button onClick={() => setActiveListId(null)} className="text-primary font-bold mb-4">&lt; Retour à toutes les listes</button>
        )}
        <div className="bg-white dark:bg-dark-card p-4 rounded-xl grid grid-cols-3 text-center divide-x dark:divide-gray-700">
          <div><p className="text-xs text-gray-500 dark:text-text-secondary">Prévu</p><p className="font-bold text-lg dark:text-light">{planned.toLocaleString('fr-FR')}</p></div>
          <div><p className="text-xs text-gray-500 dark:text-text-secondary">Dépensé</p><p className="font-bold text-lg dark:text-light">{spent.toLocaleString('fr-FR')}</p></div>
          <div>
            <p className="text-xs text-gray-500 dark:text-text-secondary">Écart</p>
            <div className={`font-bold text-lg flex items-center justify-center ${difference <= 0 ? 'text-success' : 'text-danger'}`}>
              {difference > 0 ? <TrendUpIcon className="w-4 h-4" /> : <TrendDownIcon className="w-4 h-4" />}
              <span>{Math.abs(difference).toLocaleString('fr-FR')}</span>
            </div>
          </div>
        </div>
        <div className="bg-accent/20 text-accent-800 dark:text-yellow-200 dark:bg-yellow-500/20 p-3 rounded-lg text-sm font-medium text-center">{insight}</div>
        <div className="bg-white dark:bg-dark-card p-4 rounded-xl">
          <h3 className="font-bold mb-3 text-dark dark:text-light">Détails des Achats</h3>
          <div className="space-y-2 text-sm">{activeList.items.filter(i => i.purchased || activeList.status === 'archived').map(item => (<div key={item.id} className="grid grid-cols-3 items-center gap-2"><span className="font-medium text-dark dark:text-light">{item.name}</span><span className="text-gray-500 dark:text-text-secondary text-right">{item.estimatedPrice.toLocaleString('fr-FR')}</span><span className={`font-semibold text-right ${((item.actualPrice ?? item.estimatedPrice) - item.estimatedPrice) > 0 ? 'text-danger' : 'text-success'}`}>{item.actualPrice?.toLocaleString('fr-FR')}</span></div>))}</div>
        </div>
        {activeList.status === 'active' && (
          <div className="mt-6 space-y-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
              capture="environment"
            />
            <button
              onClick={handleReceiptClick}
              className={`w-full flex items-center justify-center space-x-2 py-3 rounded-lg transition-colors border-2 ${receiptFile || activeList.receiptFileName ? 'bg-secondary/20 text-secondary border-secondary' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-dark-border'
                }`}
            >
              <CameraIcon className="w-5 h-5" />
              <span>{receiptFile || activeList.receiptFileName ? 'Reçu ajouté' : 'Ajouter un reçu'}</span>
            </button>
            {(receiptFile || activeList.receiptFileName) && (
              <p className="text-center text-sm text-gray-600 dark:text-text-muted -mt-2">
                Fichier: {receiptFile?.name || activeList.receiptFileName}
              </p>
            )}
            <button onClick={() => handleArchive(true)} className="w-full flex items-center justify-center bg-secondary text-white font-bold py-3 rounded-lg hover:bg-green-600 transition-colors">
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              Enregistrer la Dépense et Archiver
            </button>
            <button onClick={() => handleArchive(false)} className="w-full bg-gray-600 text-white font-bold py-3 rounded-lg hover:bg-gray-700 transition-colors">
              Archiver sans Dépense
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderHistory = () => (
    <div>
      <button onClick={handleStartNewList} className="w-full bg-primary text-white font-bold py-3 rounded-lg mb-6 hover:bg-blue-700">
        Commencer une Nouvelle Liste
      </button>
      <h2 className="font-bold text-dark dark:text-light text-lg mb-3">Mes Listes</h2>
      <div className="space-y-3">
        {lists.length === 0 && <p className="text-center text-gray-500 dark:text-text-secondary py-4">Aucune liste pour le moment.</p>}
        {lists.map(list => (
          <div key={list.id} className="bg-white dark:bg-dark-card p-4 rounded-xl flex justify-between items-center">
            <div onClick={() => handleViewListDetails(list)} className="flex-grow cursor-pointer flex items-center">
              <div>
                <p className="font-bold text-dark dark:text-light">{list.name}</p>
                <p className="text-sm text-gray-500 dark:text-text-secondary">{list.date}</p>
                {list.status === 'archived' && <span className="text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded-full mt-1 inline-block">Archivée</span>}
                {list.status === 'active' && <span className="text-xs font-medium text-blue-600 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300 px-2 py-0.5 rounded-full mt-1 inline-block">En cours</span>}
              </div>
              {list.receiptFileName && <CameraIcon className="w-4 h-4 text-text-muted ml-3" title={`Reçu: ${list.receiptFileName}`} />}
            </div>
            <button onClick={() => handleDeleteList(list.id)} className="text-danger p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full">
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    if (activeListId && activeList) {
      switch (mode) {
        case 'list': return renderListView();
        case 'shop': return renderShoppingView();
        case 'analysis': return renderAnalysisView();
      }
    }
    return renderHistory();
  }

  return (
    <div className="p-4 bg-light dark:bg-gray-900 min-h-full">
      <div className="flex items-center space-x-3 mb-4">
        <ShoppingListIcon className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold text-dark dark:text-light">
          {activeListId && activeList ? activeList.name : "Listes de Courses"}
        </h1>
      </div>
      {renderContent()}
    </div>
  );
};

export default ShoppingListScreen;
