
import React, { useState } from 'react';
import { Recipe } from '../types';

interface RecipeGridProps {
  recipes: Recipe[];
  onRecipeClick: (recipe: Recipe) => void;
  onToggleFavorite: (id: string, e?: React.MouseEvent) => void;
}

const RecipeCard: React.FC<{ 
  recipe: Recipe; 
  onRecipeClick: (recipe: Recipe) => void; 
  onToggleFavorite: (id: string, e?: React.MouseEvent) => void;
  onShare: (e: React.MouseEvent, recipe: Recipe) => void;
}> = ({ recipe, onRecipeClick, onToggleFavorite, onShare }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const creationDate = new Date(recipe.createdAt).toLocaleDateString('fr-FR');
  
  // Detect if image is missing or AI generated (base64)
  const isSpecialImage = !recipe.image || recipe.image.startsWith('data:');

  return (
    <div 
      onClick={() => onRecipeClick(recipe)}
      className="bg-white rounded-3xl overflow-hidden recipe-card-shadow border border-brand-peach/20 hover:-translate-y-1 transition-transform cursor-pointer group flex flex-col relative"
    >
      <div className={`h-56 overflow-hidden relative bg-brand-ghost ${isSpecialImage ? 'ai-image-glow' : ''}`}>
        {!imgLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-brand-peach border-t-brand-deep rounded-full animate-spin"></div>
          </div>
        )}
        <img 
          src={recipe.image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&q=80&w=800'} 
          alt={recipe.title}
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'} ${isSpecialImage ? 'animate-slow-zoom' : 'group-hover:scale-105'}`}
        />
        
        {/* Category Label - Now at bottom left of image */}
        <div className="absolute bottom-4 left-4 flex gap-2">
          <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-brand-deep shadow-sm">
            {recipe.category}
          </span>
        </div>

        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button 
            onClick={(e) => onToggleFavorite(recipe.id, e)}
            className={`p-2 rounded-full backdrop-blur-md transition-all ${recipe.isFavorite ? 'bg-pink-500 text-white shadow-lg shadow-pink-200' : 'bg-white/80 text-pink-500 hover:bg-pink-50'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </button>
          <button 
            onClick={(e) => onShare(e, recipe)}
            className="bg-white/80 backdrop-blur-md p-2 rounded-full text-brand-deep hover:bg-brand-deep hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold mb-1 group-hover:text-brand-deep transition-colors line-clamp-1">{recipe.title}</h3>
        
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1.5 text-brand-muted text-[10px] font-bold uppercase tracking-wide">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {recipe.prepTime || 'N/A'}
          </div>
          
          {recipe.rating && recipe.rating > 0 ? (
            <div className="flex items-center gap-0.5 text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${i < (recipe.rating || 0) ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          ) : null}

          <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wide ml-auto">
            {creationDate}
          </div>
        </div>

        <p className="text-gray-500 text-sm mb-4 line-clamp-2">
          {recipe.ingredients.length} ingrédients • {recipe.instructions.length} étapes
        </p>
        <div className="flex flex-wrap gap-1 mt-auto">
          {recipe.ingredients.slice(0, 3).map((ing, i) => (
            <span key={i} className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
              {ing}
            </span>
          ))}
          {recipe.ingredients.length > 3 && (
            <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
              +{recipe.ingredients.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const RecipeGrid: React.FC<RecipeGridProps> = ({ recipes, onRecipeClick, onToggleFavorite }) => {
  const handleShare = (e: React.MouseEvent, recipe: Recipe) => {
    e.stopPropagation();

    const appUrl = window.location.href;
    const recipeText = `
🍽️ RECETTE CULINAI : ${recipe.title.toUpperCase()}
⏱️ TEMPS : ${recipe.prepTime || 'Non spécifié'}

🛒 INGRÉDIENTS :
${recipe.ingredients.map(ing => `- ${ing}`).join('\n')}

👨‍🍳 PRÉPARATION :
${recipe.instructions.map((step, i) => `${i + 1}. ${step}`).join('\n')}

Lien de l'app : ${appUrl}
Partagé depuis CulinAI ✨
`.trim();

    const shareData: ShareData = {
      title: recipe.title,
      text: recipeText,
    };

    if (appUrl.startsWith('http')) {
      shareData.url = appUrl;
    }

    if (navigator.share) {
      navigator.share(shareData).catch((error) => {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          navigator.clipboard.writeText(recipeText).then(() => {
            alert("La recette a été copiée dans le presse-papier !");
          });
        }
      });
    } else {
      navigator.clipboard.writeText(recipeText).then(() => {
        alert("La recette a été copiée dans le presse-papier !");
      });
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {recipes.map(recipe => (
        <RecipeCard 
          key={recipe.id} 
          recipe={recipe} 
          onRecipeClick={onRecipeClick} 
          onToggleFavorite={onToggleFavorite} 
          onShare={handleShare}
        />
      ))}
    </div>
  );
};

export default RecipeGrid;
