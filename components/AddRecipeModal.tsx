
import React, { useState } from 'react';
import { Category, Recipe } from '../types';

interface AddRecipeModalProps {
  onClose: () => void;
  onSubmit: (recipe: Omit<Recipe, 'id' | 'createdAt'>) => void;
}

const AddRecipeModal: React.FC<AddRecipeModalProps> = ({ onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>(Category.PLAT);
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !ingredients || !instructions) return;
    
    onSubmit({
      title,
      category,
      ingredients: ingredients.split(',').map(i => i.trim()),
      instructions: instructions.split('\n').map(i => i.trim()),
      image: imageUrl || `https://picsum.photos/seed/${title}/800/600`
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
        <div className="flex justify-between items-center p-8 border-b border-brand-peach/20 bg-brand-ghost">
          <h2 className="text-2xl font-serif font-bold text-gray-800">Ajouter une recette</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-brand-peach/20 text-gray-400 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 ml-1">Nom du plat</label>
              <input 
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-brand-ghost border border-brand-peach/30 rounded-2xl px-5 py-3 focus:ring-2 focus:ring-brand-deep/50 outline-none"
                placeholder="Ex: Gratin Dauphinois"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 ml-1">Catégorie</label>
              <select 
                value={category}
                onChange={e => setCategory(e.target.value as Category)}
                className="w-full bg-brand-ghost border border-brand-peach/30 rounded-2xl px-5 py-3 focus:ring-2 focus:ring-brand-deep/50 outline-none appearance-none"
              >
                {Object.values(Category).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700 ml-1">Ingrédients (séparés par des virgules)</label>
            <textarea 
              required
              value={ingredients}
              onChange={e => setIngredients(e.target.value)}
              className="w-full bg-brand-ghost border border-brand-peach/30 rounded-2xl px-5 py-3 focus:ring-2 focus:ring-brand-deep/50 outline-none min-h-[100px]"
              placeholder="Oeufs, Lait, Farine..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700 ml-1">Étapes (une par ligne)</label>
            <textarea 
              required
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              className="w-full bg-brand-ghost border border-brand-peach/30 rounded-2xl px-5 py-3 focus:ring-2 focus:ring-brand-deep/50 outline-none min-h-[150px]"
              placeholder="1. Mélanger la farine et les oeufs..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700 ml-1">Lien de l'image (optionnel)</label>
            <input 
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              className="w-full bg-brand-ghost border border-brand-peach/30 rounded-2xl px-5 py-3 focus:ring-2 focus:ring-brand-deep/50 outline-none"
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          <div className="pt-4 sticky bottom-0 bg-white pb-4 flex gap-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-8 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Annuler
            </button>
            <button 
              type="submit"
              className="flex-1 bg-brand-deep text-white px-8 py-4 rounded-2xl font-bold hover:bg-brand-muted transition-colors shadow-xl shadow-brand-deep/20"
            >
              Créer la recette
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRecipeModal;
