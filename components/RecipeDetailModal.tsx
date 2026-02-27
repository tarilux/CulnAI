
import React, { useState, useEffect } from 'react';
import { Recipe } from '../types';

interface RecipeDetailModalProps {
  recipe: Recipe;
  onClose: () => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onUpdateRating?: (id: string, rating: number) => void;
  onEditImage?: (recipe: Recipe) => void;
}

const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({ 
  recipe, 
  onClose, 
  onEdit, 
  onDelete, 
  onToggleFavorite, 
  onUpdateRating,
  onEditImage
}) => {
  const isSpecialImage = !recipe.image || recipe.image.startsWith('data:');
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (recipe.videoUrl) {
      const timer = setTimeout(() => {
        setShowVideo(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [recipe.videoUrl]);

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const renderVideo = (url: string) => {
    const ytId = getYoutubeId(url);
    if (ytId) {
      return (
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
          title="Video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      );
    }
    // Fallback for other video types (e.g. direct mp4 link)
    return (
      <video 
        src={url} 
        controls 
        autoPlay 
        className="w-full h-full object-cover"
      >
        Votre navigateur ne supporte pas la lecture de vidéos.
      </video>
    );
  };

  const handleShare = () => {
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

  const handleDelete = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette recette définitivement ?')) {
      onDelete(recipe.id);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Left Side: Image or Video */}
        <div className={`w-full md:w-1/2 relative h-64 md:h-auto overflow-hidden bg-brand-ghost ${isSpecialImage && !showVideo ? 'ai-image-glow' : ''}`}>
          {showVideo && recipe.videoUrl ? (
            <div className="w-full h-full bg-black flex items-center justify-center">
              {renderVideo(recipe.videoUrl)}
            </div>
          ) : (
            <img 
              src={recipe.image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&q=80&w=800'} 
              alt={recipe.title}
              className={`w-full h-full object-cover ${isSpecialImage ? 'animate-slow-zoom' : ''}`}
            />
          )}
          
          {/* Category Label - Bottom Left of Image */}
          <div className="absolute bottom-6 left-6 flex gap-2">
            <span className="bg-white/90 backdrop-blur px-4 py-1.5 rounded-full text-sm font-bold text-brand-deep shadow-lg">
              {recipe.category}
            </span>
          </div>

          <div className="absolute top-6 left-6 flex gap-2">
            <button 
              onClick={onClose}
              className="p-3 bg-white/30 backdrop-blur-lg rounded-full text-white hover:bg-white hover:text-brand-deep transition-all shadow-xl md:hidden"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button 
              onClick={() => onToggleFavorite(recipe.id)}
              className={`p-3 backdrop-blur-lg rounded-full shadow-xl transition-all ${recipe.isFavorite ? 'bg-pink-500 text-white' : 'bg-white/30 text-white hover:bg-pink-500'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right Side: Content */}
        <div className="w-full md:w-1/2 flex flex-col p-8 md:p-12 overflow-y-auto custom-scrollbar relative">
          <div className="absolute top-8 right-8 flex gap-2">
             <button 
              onClick={handleDelete}
              className="p-3 bg-red-50 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shadow-sm"
              title="Supprimer la recette"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <button 
              onClick={handleShare}
              className="p-3 bg-brand-ghost rounded-full text-brand-deep hover:bg-brand-peach/20 transition-all flex items-center justify-center shadow-sm"
              title="Partager en texte"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
            <button 
              onClick={() => onEditImage && onEditImage(recipe)}
              className="p-3 bg-brand-ghost rounded-full text-brand-deep hover:bg-brand-peach/20 transition-all flex items-center gap-2 font-bold px-4 shadow-sm"
              title="Édition IA de l'image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Photo IA
            </button>
            <button 
              onClick={onEdit}
              className="p-3 bg-brand-ghost rounded-full text-brand-deep hover:bg-brand-peach/20 transition-all flex items-center gap-2 font-bold px-4 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Éditer
            </button>
            <button 
              onClick={onClose}
              className="p-3 bg-brand-ghost rounded-full text-gray-400 hover:text-brand-deep hover:bg-brand-peach/20 transition-all hidden md:block"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-8 mt-12 md:mt-0">
            <h2 className="text-4xl font-serif font-bold text-gray-800 leading-tight mb-2">{recipe.title}</h2>
            <div className="flex flex-wrap items-center gap-4 mb-4">
               <div className="flex items-center gap-2 text-brand-muted text-sm font-bold">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {recipe.prepTime || 'N/A'}
              </div>
              
              <div className="flex items-center gap-1 text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => onUpdateRating && onUpdateRating(recipe.id, star)}
                    className={`transition-colors ${onUpdateRating ? 'hover:scale-110' : 'cursor-default'} ${star <= (recipe.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>

              <div className="text-gray-400 text-xs font-medium italic">
                Ajoutée le {new Date(recipe.createdAt).toLocaleDateString('fr-FR')}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-1.5 w-20 bg-brand-deep rounded-full"></div>
              <a 
                href={`https://www.google.com/search?q=recette+${encodeURIComponent(recipe.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-brand-deep bg-brand-peach/20 px-3 py-1.5 rounded-full hover:bg-brand-peach/40 transition-colors flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Chercher sur le web
              </a>
            </div>
          </div>

          <div className="space-y-10">
            <section>
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-brand-ghost flex items-center justify-center text-brand-deep">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                  </svg>
                </span>
                Ingrédients
              </h3>
              <ul className="grid grid-cols-1 gap-3">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-600 bg-brand-ghost/50 p-3 rounded-2xl border border-brand-peach/10">
                    <div className="w-2 h-2 rounded-full bg-brand-muted"></div>
                    {ing}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-brand-ghost flex items-center justify-center text-brand-deep">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                </span>
                Préparation
              </h3>
              <ol className="space-y-6">
                {recipe.instructions.map((step, i) => (
                  <li key={i} className="flex gap-5">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-deep text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-brand-deep/20">
                      {i + 1}
                    </span>
                    <p className="text-gray-600 leading-relaxed pt-1">{step}</p>
                  </li>
                ))}
              </ol>
            </section>

            {recipe.nutrition && (
              <section className="bg-brand-ghost/30 p-6 rounded-[2rem] border border-brand-peach/20">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-brand-deep shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </span>
                  Conseils Nutritionnels
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-2xl text-center shadow-sm">
                    <div className="text-2xl font-bold text-brand-deep">{recipe.nutrition.calories}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Calories</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl text-center shadow-sm">
                    <div className="text-2xl font-bold text-brand-deep">{recipe.nutrition.protein}g</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Protéines</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl text-center shadow-sm">
                    <div className="text-2xl font-bold text-brand-deep">{recipe.nutrition.carbs}g</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Glucides</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl text-center shadow-sm">
                    <div className="text-2xl font-bold text-brand-deep">{recipe.nutrition.fat}g</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lipides</div>
                  </div>
                </div>
                {recipe.nutrition.advice && (
                  <div className="bg-white/50 p-4 rounded-2xl text-sm text-gray-600 italic leading-relaxed">
                    <span className="font-bold text-brand-deep not-italic">L'avis du nutritionniste :</span> {recipe.nutrition.advice}
                  </div>
                )}
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailModal;
