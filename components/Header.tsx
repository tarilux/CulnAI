
import React from 'react';

interface HeaderProps {
  activeTab: 'recipes' | 'fridge';
  setActiveTab: (tab: 'recipes' | 'fridge') => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="bg-white border-b border-brand-peach/30 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-brand-deep rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-brand-deep/20">
            C
          </div>
          <h1 className="text-2xl font-serif font-bold text-brand-deep hidden sm:block">CulinAI</h1>
        </div>

        <nav className="flex items-center bg-brand-ghost rounded-full p-1 border border-brand-peach/20">
          <button 
            onClick={() => setActiveTab('recipes')}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'recipes' ? 'bg-brand-deep text-white shadow-md' : 'text-gray-500 hover:text-brand-muted'}`}
          >
            Mes Recettes
          </button>
          <button 
            onClick={() => setActiveTab('fridge')}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'fridge' ? 'bg-brand-deep text-white shadow-md' : 'text-gray-500 hover:text-brand-muted'}`}
          >
            Le Frigo
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Membre</p>
            <p className="text-sm font-bold text-brand-muted italic">Chef Gourmet</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
