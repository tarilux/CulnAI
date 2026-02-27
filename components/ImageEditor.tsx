import React, { useState } from 'react';
import { editRecipeImage } from '../services/geminiService';

interface ImageEditorProps {
  image: string;
  onSave: (newImage: string) => void;
  onClose: () => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ image, onSave, onClose }) => {
  const [currentImage, setCurrentImage] = useState(image);
  const [isEditing, setIsEditing] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  const handleEdit = async (instruction: string) => {
    setIsEditing(true);
    try {
      const result = await editRecipeImage(currentImage, instruction);
      if (result) {
        setCurrentImage(result);
      } else {
        alert("L'édition a échoué. Veuillez réessayer.");
      }
    } catch (error) {
      console.error(error);
      alert("Une erreur est survenue lors de l'édition.");
    } finally {
      setIsEditing(false);
    }
  };

  const styles = [
    { name: 'Améliorer', icon: '✨', instruction: 'Améliore la qualité, la netteté et les couleurs pour rendre le plat plus appétissant.' },
    { name: 'Fond Flou', icon: '📸', instruction: 'Applique un flou artistique (bokeh) sur l\'arrière-plan pour faire ressortir le plat.' },
    { name: 'Style Rustique', icon: '🪵', instruction: 'Applique un style rustique et chaleureux avec des textures de bois et une lumière tamisée.' },
    { name: 'Style Moderne', icon: '🍽️', instruction: 'Applique un style moderne, minimaliste et épuré avec un éclairage studio.' },
    { name: 'Changer Fond', icon: '🖼️', instruction: 'Remplace l\'arrière-plan par un plan de travail de cuisine en marbre élégant.' },
  ];

  return (
    <div className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-5xl rounded-[3rem] overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in zoom-in-95 duration-300">
        
        {/* Preview Area */}
        <div className="w-full md:w-2/3 bg-brand-ghost relative flex items-center justify-center p-8">
          <div className="relative w-full aspect-square max-w-lg rounded-3xl overflow-hidden shadow-2xl">
            <img src={currentImage} alt="Preview" className="w-full h-full object-cover" />
            {isEditing && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                <div className="w-12 h-12 border-4 border-brand-peach border-t-brand-deep rounded-full animate-spin mb-4"></div>
                <p className="font-bold animate-pulse">L'IA retouche votre photo...</p>
              </div>
            )}
          </div>
          
          <button 
            onClick={onClose}
            className="absolute top-6 left-6 p-3 bg-white/80 hover:bg-white rounded-full text-brand-deep shadow-lg transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Controls Area */}
        <div className="w-full md:w-1/3 p-8 md:p-12 flex flex-col bg-white border-l border-brand-peach/20">
          <h2 className="text-3xl font-serif font-bold text-gray-800 mb-2">Édition IA Avancée</h2>
          <p className="text-gray-500 mb-8 text-sm">Utilisez la puissance de Gemini pour sublimer vos photos de plats.</p>

          <div className="space-y-4 mb-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Styles Rapides</h3>
            <div className="grid grid-cols-1 gap-3">
              {styles.map((style) => (
                <button
                  key={style.name}
                  onClick={() => handleEdit(style.instruction)}
                  disabled={isEditing}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-brand-peach/30 hover:border-brand-deep hover:bg-brand-ghost transition-all text-left group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">{style.icon}</span>
                  <div>
                    <div className="font-bold text-brand-deep">{style.name}</div>
                    <div className="text-[10px] text-gray-400 line-clamp-1">{style.instruction}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto space-y-4">
            <div className="relative">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Instruction personnalisée..."
                className="w-full bg-brand-ghost border border-brand-peach/30 rounded-2xl px-5 py-4 pr-14 focus:outline-none focus:ring-2 focus:ring-brand-deep/50 transition-all text-sm"
              />
              <button
                onClick={() => handleEdit(customPrompt)}
                disabled={isEditing || !customPrompt.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-deep text-white rounded-xl hover:bg-brand-muted disabled:opacity-50 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => onSave(currentImage)}
                disabled={isEditing || currentImage === image}
                className="flex-1 bg-brand-deep text-white py-4 rounded-2xl font-bold hover:bg-brand-muted disabled:opacity-50 transition-all shadow-xl shadow-brand-deep/20"
              >
                Appliquer
              </button>
              <button
                onClick={() => setCurrentImage(image)}
                disabled={isEditing || currentImage === image}
                className="px-6 py-4 rounded-2xl font-bold text-gray-500 bg-brand-ghost hover:bg-brand-peach/20 transition-all border border-brand-peach/20"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;