
import React, { useState, useEffect } from 'react';
import { Category, Recipe } from './types';
import Header from './components/Header';
import RecipeGrid from './components/RecipeGrid';
import FridgeMatcher from './components/FridgeMatcher';
import RecipeFormModal from './components/RecipeFormModal';
import RecipeDetailModal from './components/RecipeDetailModal';
import ImageEditor from './components/ImageEditor';
import { generateRecipeImage, searchRecipeVideo, getNutritionInfo } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'recipes' | 'fridge'>('recipes');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [recipeToEdit, setRecipeToEdit] = useState<Recipe | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [imageToEdit, setImageToEdit] = useState<Recipe | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'Tous' | 'Favoris'>('Tous');
  const [sortOrder, setSortOrder] = useState<'recent' | 'alpha'>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('culinai_recipes');
    if (saved) {
      setRecipes(JSON.parse(saved));
    } else {
      const initSamples = async () => {
        setIsGeneratingImage(true);
        const img1 = await generateRecipeImage('Tarte aux Pommes Rustique');
        const img2 = await generateRecipeImage('Pasta à la Carbonara');
        
        const sample: Recipe[] = [
          {
            id: '1',
            title: 'Tarte aux Pommes Rustique',
            category: Category.DESSERT,
            ingredients: ['Pommes', 'Pâte feuilletée', 'Sucre roux', 'Cannelle'],
            instructions: ['Préchauffer le four', 'Étaler la pâte', 'Couper les pommes', 'Cuire 30min'],
            image: img1 || 'https://images.unsplash.com/photo-1535927842701-10a5184c948d?auto=format&fit=crop&q=80&w=800',
            createdAt: Date.now(),
            isFavorite: true,
            prepTime: '45 min',
            rating: 5,
            videoUrl: 'https://www.youtube.com/watch?v=12345678901',
            nutrition: { calories: 320, protein: 4, carbs: 45, fat: 14, advice: "Un dessert classique, riche en glucides. À consommer avec modération." }
          },
          {
            id: '2',
            title: 'Pasta à la Carbonara',
            category: Category.PLAT,
            ingredients: ['Pâtes', 'Oeufs', 'Pecorino', 'Guanciale'],
            instructions: ['Cuire les pâtes', 'Frire le lard', 'Mélanger les oeufs', 'Servir chaud'],
            image: img2 || 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&q=80&w=800',
            createdAt: Date.now() - 100000,
            isFavorite: false,
            prepTime: '20 min',
            rating: 4,
            nutrition: { calories: 650, protein: 25, carbs: 70, fat: 30, advice: "Un plat énergétique et protéiné. Équilibrez avec une salade verte." }
          }
        ];
        setRecipes(sample);
        setIsGeneratingImage(false);
      };
      initSamples();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('culinai_recipes', JSON.stringify(recipes));
  }, [recipes]);

  const handleSaveRecipe = async (recipeData: Omit<Recipe, 'id' | 'createdAt'>, existingId?: string) => {
    let finalImage = recipeData.image;
    let finalVideoUrl = recipeData.videoUrl;
    let finalNutrition = recipeData.nutrition;
    
    if (!finalImage) {
      setIsGeneratingImage(true);
      const generated = await generateRecipeImage(recipeData.title);
      if (generated) finalImage = generated;
      setIsGeneratingImage(false);
    }

    if (!finalVideoUrl) {
      const videoUrl = await searchRecipeVideo(recipeData.title);
      if (videoUrl) finalVideoUrl = videoUrl;
    }

    if (!finalNutrition) {
      const nutrition = await getNutritionInfo(recipeData.title, recipeData.ingredients);
      if (nutrition) finalNutrition = nutrition;
    }

    if (existingId) {
      setRecipes(prev => prev.map(r => r.id === existingId ? { ...r, ...recipeData, image: finalImage, videoUrl: finalVideoUrl, nutrition: finalNutrition } : r));
    } else {
      const newRecipe: Recipe = {
        ...recipeData,
        image: finalImage,
        videoUrl: finalVideoUrl,
        nutrition: finalNutrition,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: Date.now(),
        isFavorite: false
      };
      setRecipes([newRecipe, ...recipes]);
    }
    setIsFormModalOpen(false);
    setRecipeToEdit(null);
  };

  const handleDeleteRecipe = (id: string) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
    if (selectedRecipe?.id === id) setSelectedRecipe(null);
  };

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setRecipes(prev => prev.map(r => r.id === id ? { ...r, isFavorite: !r.isFavorite } : r));
  };

  const handleEditClick = (recipe: Recipe) => {
    setRecipeToEdit(recipe);
    setIsFormModalOpen(true);
    setSelectedRecipe(null);
  };

  const handleUpdateImage = (id: string, newImage: string) => {
    setRecipes(prev => prev.map(r => r.id === id ? { ...r, image: newImage } : r));
    if (selectedRecipe?.id === id) {
      setSelectedRecipe(prev => prev ? { ...prev, image: newImage } : null);
    }
    setImageToEdit(null);
  };

  const sortedAndFilteredRecipes = recipes
    .filter(r => {
      const matchesCategory = selectedCategory === 'Tous' ? true : (selectedCategory === 'Favoris' ? r.isFavorite : r.category === selectedCategory);
      const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            r.ingredients.some(ing => ing.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortOrder === 'recent') {
        return b.createdAt - a.createdAt;
      } else {
        return a.title.localeCompare(b.title);
      }
    });

  return (
    <div className="min-h-screen bg-brand-ghost pb-24">
      <Header activeTab={activeTab} setActiveTab={(tab) => setActiveTab(tab as 'recipes' | 'fridge')} />
      
      <main className="max-w-6xl mx-auto px-4 pt-6">
        {activeTab === 'recipes' && (
          <>
            <div className="mb-8 space-y-6">
              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto">
                <input
                  type="text"
                  placeholder="Rechercher par titre ou ingrédient..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-brand-peach/30 rounded-3xl px-12 py-4 shadow-sm focus:ring-2 focus:ring-brand-deep/20 outline-none transition-all"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-deep transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  <button 
                    onClick={() => setSelectedCategory('Tous')}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${selectedCategory === 'Tous' ? 'bg-brand-deep text-white shadow-md' : 'bg-white text-gray-600 hover:bg-brand-peach'}`}
                  >
                    Tous
                  </button>
                  <button 
                    onClick={() => setSelectedCategory('Favoris')}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors flex items-center gap-2 ${selectedCategory === 'Favoris' ? 'bg-pink-500 text-white shadow-md' : 'bg-white text-pink-500 hover:bg-pink-50'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    Favoris
                  </button>
                  {Object.values(Category).map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-brand-deep text-white shadow-md' : 'bg-white text-gray-600 hover:bg-brand-peach'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-brand-peach/30 text-sm self-end md:self-auto shadow-sm">
                  <span className="text-gray-400 font-bold uppercase text-[10px]">Trier par</span>
                  <select 
                    value={sortOrder} 
                    onChange={(e) => setSortOrder(e.target.value as 'recent' | 'alpha')}
                    className="outline-none bg-transparent font-bold text-brand-deep cursor-pointer"
                  >
                    <option value="recent">Plus récent</option>
                    <option value="alpha">A-Z</option>
                  </select>
                </div>
              </div>
            </div>
            
            <RecipeGrid 
              recipes={sortedAndFilteredRecipes} 
              onRecipeClick={(recipe) => setSelectedRecipe(recipe)}
              onToggleFavorite={toggleFavorite}
            />
            
            {sortedAndFilteredRecipes.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-brand-peach/30 animate-in fade-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-brand-ghost rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">Aucune recette trouvée {searchQuery && `pour "${searchQuery}"`}.</p>
                <button 
                  onClick={() => {setSearchQuery(''); setSelectedCategory('Tous');}}
                  className="mt-4 text-brand-deep font-bold hover:underline"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === 'fridge' && (
          <FridgeMatcher onAddRecipe={handleSaveRecipe} />
        )}
      </main>

      <button 
        onClick={() => { setRecipeToEdit(null); setIsFormModalOpen(true); }}
        className="fixed bottom-24 right-6 md:bottom-10 md:right-10 w-16 h-16 bg-brand-deep text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {isGeneratingImage && (
        <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6">
          <div className="w-16 h-16 border-4 border-brand-peach border-t-brand-deep rounded-full animate-spin mb-4"></div>
          <p className="text-xl font-bold animate-pulse text-center">L'IA prépare votre recette...<br/><span className="text-sm font-normal text-white/80">Ça arrive dans un instant !</span></p>
        </div>
      )}

      {isFormModalOpen && (
        <RecipeFormModal 
          onClose={() => { setIsFormModalOpen(false); setRecipeToEdit(null); }} 
          onSubmit={handleSaveRecipe}
          initialData={recipeToEdit || undefined}
        />
      )}

      {selectedRecipe && (
        <RecipeDetailModal
          recipe={recipes.find(r => r.id === selectedRecipe.id) || selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          onEdit={() => handleEditClick(selectedRecipe)}
          onDelete={handleDeleteRecipe}
          onToggleFavorite={(id) => toggleFavorite(id)}
          onUpdateRating={(id, rating) => {
            setRecipes(prev => prev.map(r => r.id === id ? { ...r, rating } : r));
            if (selectedRecipe.id === id) {
              setSelectedRecipe(prev => prev ? { ...prev, rating } : null);
            }
          }}
          onEditImage={(recipe) => setImageToEdit(recipe)}
        />
      )}

      {imageToEdit && imageToEdit.image && (
        <ImageEditor
          image={imageToEdit.image}
          onSave={(newImage) => handleUpdateImage(imageToEdit.id, newImage)}
          onClose={() => setImageToEdit(null)}
        />
      )}
    </div>
  );
};

export default App;
