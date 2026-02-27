
import React, { useState, useRef } from 'react';
import { suggestRecipeFromIngredients, analyzeFridgeImage } from '../services/geminiService';
import { Category, Recipe, SuggestedRecipe } from '../types';

interface FridgeMatcherProps {
  onAddRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt'>) => void;
}

const INGREDIENT_CLIPARTS: Record<string, string> = {
  'pomme': '🍎', 'banane': '🍌', 'tomate': '🍅', 'poulet': '🍗', 'oeuf': '🥚', 'lait': '🥛', 'fromage': '🧀',
  'carotte': '🥕', 'oignon': '🧅', 'ail': '🧄', 'pomme de terre': '🥔', 'riz': '🍚', 'pâtes': '🍝', 'boeuf': '🥩',
  'poisson': '🐟', 'crevette': '🍤', 'citron': '🍋', 'fraise': '🍓', 'orange': '🍊', 'avocat': '🥑', 'brocoli': '🥦',
  'champignon': '🍄', 'poivron': '🫑', 'aubergine': '🍆', 'concombre': '🥒', 'salade': '🥬', 'maïs': '🌽', 'beurre': '🧈',
  'pain': '🍞', 'miel': '🍯', 'chocolat': '🍫', 'sucre': '🧂', 'sel': '🧂', 'poivre': '🧂', 'huile': '🫗', 'vin': '🍷',
  'bière': '🍺', 'eau': '💧', 'yaourt': '🍦', 'jambon': '🥓', 'lard': '🥓', 'saucisse': '🌭', 'farine': '🥡'
};

const getClipart = (ingredient: string) => {
  const lower = ingredient.toLowerCase();
  for (const [key, emoji] of Object.entries(INGREDIENT_CLIPARTS)) {
    if (lower.includes(key)) return emoji;
  }
  return '📦'; // Default clipart
};

const FridgeMatcher: React.FC<FridgeMatcherProps> = ({ onAddRecipe }) => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [potIngredients, setPotIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedRecipe[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [isGameMode, setIsGameMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !ingredients.includes(inputValue.trim()) && !potIngredients.includes(inputValue.trim())) {
      setIngredients([...ingredients, inputValue.trim()]);
      setInputValue('');
    }
  };

  const removeIngredient = (idx: number, fromPot: boolean = false) => {
    if (fromPot) {
      setPotIngredients(potIngredients.filter((_, i) => i !== idx));
    } else {
      setIngredients(ingredients.filter((_, i) => i !== idx));
    }
  };

  const moveToPot = (ingredient: string) => {
    setIngredients(ingredients.filter(i => i !== ingredient));
    setPotIngredients([...potIngredients, ingredient]);
  };

  const moveToFridge = (ingredient: string) => {
    setPotIngredients(potIngredients.filter(i => i !== ingredient));
    setIngredients([...ingredients, ingredient]);
  };

  const handleDragStart = (e: React.DragEvent, ingredient: string, source: 'fridge' | 'pot') => {
    e.dataTransfer.setData('ingredient', ingredient);
    e.dataTransfer.setData('source', source);
  };

  const handleDrop = (e: React.DragEvent, target: 'fridge' | 'pot') => {
    e.preventDefault();
    const ingredient = e.dataTransfer.getData('ingredient');
    const source = e.dataTransfer.getData('source');

    if (source === target) return;

    if (target === 'pot') {
      moveToPot(ingredient);
    } else {
      moveToFridge(ingredient);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleSuggest = async () => {
    const ingredientsToUse = isGameMode ? potIngredients : ingredients;
    if (ingredientsToUse.length === 0) {
      alert(isGameMode ? "Ajoutez des ingrédients dans la marmite !" : "Ajoutez des ingrédients !");
      return;
    }
    setLoading(true);
    setExpandedIndex(null);
    try {
      const res = await suggestRecipeFromIngredients(ingredientsToUse);
      setSuggestions(res);
    } catch (err) {
      console.error(err);
      alert("Désolé, une erreur est survenue lors de la génération.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoAnalysis = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      const detected = await analyzeFridgeImage(base64);
      if (detected.length > 0) {
        const newIngredients = Array.from(new Set([...ingredients, ...detected]));
        setIngredients(newIngredients);
        setIsGameMode(true); // Switch to game mode when photo is analyzed
      } else {
        alert("L'IA n'a pas pu détecter d'ingrédients clairs. Essayez une autre photo.");
      }
      setAnalyzing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveToMyRecipes = (suggestion: SuggestedRecipe) => {
    onAddRecipe({
      title: suggestion.title,
      category: Category.PLAT,
      prepTime: suggestion.prepTime,
      ingredients: suggestion.ingredients,
      instructions: suggestion.steps,
      image: '', // Will trigger auto-generation in App.tsx
      nutrition: suggestion.nutrition
    });
    alert(`"${suggestion.title}" a été ajoutée à vos recettes !`);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-brand-peach/30 mb-10">
        <h2 className="text-3xl font-serif font-bold mb-2 text-gray-800 text-center">
          {isGameMode ? "Cuisinons !" : "Qu'y a-t-il dans votre frigo ?"}
        </h2>
        <p className="text-gray-500 mb-8 text-center">
          {isGameMode ? "Glissez les ingrédients dans la marmite pour créer une recette." : "L'IA de CulinAI va vous proposer plusieurs idées sur mesure."}
        </p>

        {!isGameMode && (
          <div className="flex flex-col gap-4 mb-6 max-w-2xl mx-auto">
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={analyzing}
              className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 border-2 border-dashed transition-all ${analyzing ? 'bg-gray-50 border-gray-200 text-gray-400' : 'bg-brand-ghost border-brand-peach/50 text-brand-muted hover:border-brand-deep hover:text-brand-deep'}`}
            >
              {analyzing ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                  Analyse de votre frigo...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Scanner mon frigo (IA)
                </>
              )}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              capture="environment"
              onChange={handlePhotoAnalysis} 
            />

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-100"></div>
              <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">ou saisir manuellement</span>
              <div className="flex-1 h-px bg-gray-100"></div>
            </div>

            <form onSubmit={addIngredient} className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ex: Tomates, Poulet..."
                className="flex-1 bg-brand-ghost border border-brand-peach/30 rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-brand-deep/50 transition-all"
              />
              <button 
                type="submit"
                className="bg-brand-deep text-white px-6 py-3 rounded-2xl font-bold hover:bg-brand-muted transition-colors shadow-lg shadow-brand-deep/20"
              >
                Ajouter
              </button>
            </form>
          </div>
        )}

        {isGameMode ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10 items-start">
            {/* Virtual Fridge Illustration */}
            <div className="flex flex-col items-center">
              <div 
                className="w-full max-w-[280px] bg-slate-100 rounded-t-[40px] rounded-b-xl border-4 border-slate-300 shadow-xl relative min-h-[450px] flex flex-col overflow-hidden"
                onDrop={(e) => handleDrop(e, 'fridge')}
                onDragOver={handleDragOver}
              >
                {/* Fridge Handle */}
                <div className="absolute right-4 top-1/3 w-2 h-24 bg-slate-400 rounded-full shadow-inner z-20"></div>
                {/* Fridge Divider */}
                <div className="absolute top-[40%] left-0 w-full h-1 bg-slate-300 z-10"></div>
                
                <div className="p-6 pt-12 flex flex-wrap gap-3 flex-1 content-start relative z-10 overflow-y-auto scrollbar-hide">
                  {ingredients.map((ing, idx) => (
                    <div 
                      key={idx} 
                      draggable
                      onDragStart={(e) => handleDragStart(e, ing, 'fridge')}
                      onClick={() => moveToPot(ing)}
                      className="bg-white text-slate-800 p-2 rounded-2xl text-xs font-bold flex flex-col items-center justify-center gap-1 shadow-md border border-slate-200 cursor-pointer hover:scale-110 hover:rotate-3 transition-all animate-in zoom-in w-16 h-16 text-center"
                      title={ing}
                    >
                      <span className="text-2xl">{getClipart(ing)}</span>
                      <span className="truncate w-full px-1">{ing}</span>
                    </div>
                  ))}
                  {ingredients.length === 0 && (
                    <div className="w-full text-center mt-20 text-slate-300 italic flex flex-col items-center gap-2">
                      <span className="text-4xl opacity-20">❄️</span>
                      <span>Frigo vide</span>
                    </div>
                  )}
                </div>
              </div>
              <h3 className="mt-4 text-xl font-bold text-slate-600 flex items-center gap-2">
                Mon Frigo
              </h3>
            </div>

            {/* Virtual Pot Illustration */}
            <div className="flex flex-col items-center">
              <div 
                className="w-full max-w-[320px] bg-brand-deep rounded-b-[80px] rounded-t-xl border-x-[12px] border-b-[12px] border-brand-muted shadow-2xl relative min-h-[300px] flex flex-col mt-12"
                onDrop={(e) => handleDrop(e, 'pot')}
                onDragOver={handleDragOver}
              >
                {/* Pot Handles */}
                <div className="absolute -left-8 top-4 w-8 h-12 border-4 border-brand-muted rounded-l-full"></div>
                <div className="absolute -right-8 top-4 w-8 h-12 border-4 border-brand-muted rounded-r-full"></div>
                
                {/* Steam Animation */}
                {potIngredients.length > 0 && (
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex gap-4">
                    <div className="w-2 h-8 bg-white/20 rounded-full animate-bounce blur-sm" style={{animationDelay: '0s'}}></div>
                    <div className="w-2 h-12 bg-white/20 rounded-full animate-bounce blur-sm" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-8 bg-white/20 rounded-full animate-bounce blur-sm" style={{animationDelay: '0.4s'}}></div>
                  </div>
                )}

                <div className="p-8 flex flex-wrap gap-3 flex-1 content-start relative z-10 overflow-y-auto scrollbar-hide">
                  {potIngredients.map((ing, idx) => (
                    <div 
                      key={idx} 
                      draggable
                      onDragStart={(e) => handleDragStart(e, ing, 'pot')}
                      onClick={() => moveToFridge(ing)}
                      className="bg-white/90 text-brand-deep p-2 rounded-2xl text-xs font-bold flex flex-col items-center justify-center gap-1 shadow-lg cursor-pointer hover:scale-110 hover:-rotate-3 transition-all animate-in zoom-in w-16 h-16 text-center"
                      title={ing}
                    >
                      <span className="text-2xl">{getClipart(ing)}</span>
                      <span className="truncate w-full px-1">{ing}</span>
                    </div>
                  ))}
                  {potIngredients.length === 0 && (
                    <div className="w-full text-center mt-12 text-white/30 italic flex flex-col items-center gap-2">
                      <span className="text-4xl opacity-20">🍲</span>
                      <span>Marmite vide</span>
                    </div>
                  )}
                </div>
              </div>
              <h3 className="mt-8 text-xl font-bold text-brand-deep flex items-center gap-2">
                La Marmite
              </h3>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 mb-10 min-h-[40px] justify-center max-w-2xl mx-auto">
            {ingredients.map((ing, idx) => (
              <span key={idx} className="bg-brand-peach/20 text-brand-deep px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                {ing}
                <button onClick={() => removeIngredient(idx)} className="hover:text-brand-deep/70">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            ))}
            {ingredients.length === 0 && <span className="text-gray-400 italic">Ajoutez vos ingrédients...</span>}
          </div>
        )}

        <div className="flex justify-center gap-4">
          {isGameMode && (
            <button 
              onClick={() => setIsGameMode(false)}
              className="px-6 py-4 rounded-2xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Retour
            </button>
          )}
          <button 
            onClick={handleSuggest}
            disabled={(isGameMode ? potIngredients.length === 0 : ingredients.length === 0) || loading}
            className={`px-10 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl flex items-center justify-center gap-3 ${loading || (isGameMode ? potIngredients.length === 0 : ingredients.length === 0) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-brand-deep text-white hover:bg-brand-muted shadow-brand-deep/30'}`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Chef CulinAI compose...
              </>
            ) : (
              isGameMode ? 'Cook !' : 'Trouver des recettes'
            )}
          </button>
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="space-y-6 animate-in fade-in duration-700">
          <h3 className="text-2xl font-serif font-bold text-gray-800 mb-6 flex items-center gap-3">
            <span className="w-1.5 h-8 bg-brand-deep rounded-full"></span>
            Suggestions de Chef CulinAI
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {suggestions.map((s, idx) => (
              <div 
                key={idx} 
                className={`bg-white rounded-3xl p-6 shadow-sm border transition-all flex flex-col ${expandedIndex === idx ? 'md:col-span-3 border-brand-deep ring-1 ring-brand-deep' : 'border-brand-peach/20 hover:border-brand-soft hover:-translate-y-1'}`}
              >
                <div className="flex flex-col h-full">
                  <div className="mb-4">
                    <h4 className="text-xl font-bold text-brand-deep mb-1">{s.title}</h4>
                    <div className="flex items-center gap-2 mb-2 text-brand-muted text-[10px] font-bold uppercase">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {s.prepTime}
                    </div>
                    <p className="text-gray-500 text-sm line-clamp-2 italic">"{s.description}"</p>
                  </div>

                  {expandedIndex === idx ? (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-top-4 duration-300">
                      <div>
                        <h5 className="font-bold text-gray-800 mb-3 border-b border-brand-peach pb-1 text-sm uppercase tracking-wider">Ingrédients</h5>
                        <ul className="space-y-2">
                          {s.ingredients.map((ing, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                              <span className="text-brand-deep mt-1">•</span> {ing}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-bold text-gray-800 mb-3 border-b border-brand-peach pb-1 text-sm uppercase tracking-wider">Préparation</h5>
                        <ol className="space-y-4">
                          {s.steps.map((step, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                              <span className="w-5 h-5 bg-brand-peach/30 text-brand-deep rounded-full flex-shrink-0 flex items-center justify-center font-bold text-[10px]">{i + 1}</span>
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                      <div className="md:col-span-2 flex gap-4 mt-6">
                        <button 
                          onClick={() => handleSaveToMyRecipes(s)}
                          className="flex-1 bg-brand-deep text-white py-3 rounded-2xl font-bold hover:bg-brand-muted transition-all flex items-center justify-center gap-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Enregistrer la recette
                        </button>
                        <button 
                          onClick={() => setExpandedIndex(null)}
                          className="px-6 py-3 rounded-2xl font-bold text-gray-500 hover:bg-brand-ghost transition-colors border border-gray-200"
                        >
                          Réduire
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-auto">
                      <button 
                        onClick={() => setExpandedIndex(idx)}
                        className="w-full bg-brand-ghost text-brand-deep py-2 rounded-xl font-bold hover:bg-brand-peach/20 transition-colors text-sm"
                      >
                        Visualiser la recette
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FridgeMatcher;
