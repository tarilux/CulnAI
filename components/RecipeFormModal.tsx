
import React, { useState, useEffect } from 'react';
import { Category, Recipe } from '../types';

interface RecipeFormModalProps {
  onClose: () => void;
  onSubmit: (recipe: Omit<Recipe, 'id' | 'createdAt'>, existingId?: string) => void;
  initialData?: Recipe;
}

const RecipeFormModal: React.FC<RecipeFormModalProps> = ({ onClose, onSubmit, initialData }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [category, setCategory] = useState<Category>(initialData?.category || Category.PLAT);
  const [prepTime, setPrepTime] = useState(initialData?.prepTime || '');
  const [ingredients, setIngredients] = useState(initialData?.ingredients.join(', ') || '');
  const [instructions, setInstructions] = useState(initialData?.instructions.join('\n') || '');
  const [imageUrl, setImageUrl] = useState(initialData?.image || '');
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl || '');
  const [rating, setRating] = useState<number>(initialData?.rating || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !ingredients || !instructions) return;
    
    onSubmit({
      title,
      category,
      prepTime,
      ingredients: ingredients.split(',').map(i => i.trim()).filter(Boolean),
      instructions: instructions.split('\n').map(i => i.trim()).filter(Boolean),
      image: imageUrl,
      videoUrl,
      rating
    }, initialData?.id);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
        <div className="flex justify-between items-center p-8 border-b border-brand-peach/20 bg-brand-ghost">
          <h2 className="text-2xl font-serif font-bold text-gray-800">
            {initialData ? 'Éditer la recette' : 'Ajouter une recette'}
          </h2>
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
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Temps de préparation (ex: 20 min)</label>
              <input 
                value={prepTime}
                onChange={e => setPrepTime(e.target.value)}
                className="w-full bg-brand-ghost border border-brand-peach/30 rounded-2xl px-5 py-3 focus:ring-2 focus:ring-brand-deep/50 outline-none"
                placeholder="20 min"
              />
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
            <label className="text-sm font-bold text-gray-700 ml-1">Lien de l'image (optionnel - l'IA peut la générer)</label>
            <input 
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              className="w-full bg-brand-ghost border border-brand-peach/30 rounded-2xl px-5 py-3 focus:ring-2 focus:ring-brand-deep/50 outline-none"
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 ml-1">Lien vidéo YouTube (optionnel)</label>
              <input 
                value={videoUrl}
                onChange={e => setVideoUrl(e.target.value)}
                className="w-full bg-brand-ghost border border-brand-peach/30 rounded-2xl px-5 py-3 focus:ring-2 focus:ring-brand-deep/50 outline-none"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 ml-1">Note (0 à 5)</label>
              <div className="flex items-center gap-2 h-[50px] px-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`transition-colors ${star <= rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
                {rating > 0 && (
                  <button 
                    type="button" 
                    onClick={() => setRating(0)}
                    className="ml-2 text-xs text-gray-400 hover:text-gray-600 underline"
                  >
                    Effacer
                  </button>
                )}
              </div>
            </div>
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
              {initialData ? 'Mettre à jour' : 'Créer la recette'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecipeFormModal;
