import React, { useState } from 'react';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAddStarMutation, useRemoveStarMutation } from '../../redux/api/starApi';

/**
 * StarButton
 * Renders a clickable star icon that toggles the starred state of an item using RTK Query.
 * 
 * Props:
 *   item     - The file or folder object
 *   itemType - 'file' | 'folder'
 *   isStarred - boolean (initial state, optional if we derive it from item.stars)
 */
const StarButton = ({ item, itemType, isStarred: initialStarred }) => {
  const determineInitialState = () => {
    if (initialStarred !== undefined) return initialStarred;
    if (item?.stars && Array.isArray(item.stars)) return item.stars.length > 0;
    return false;
  };

  const [isStarred, setIsStarred] = useState(determineInitialState());
  
  const [addStar, { isLoading: isAdding }] = useAddStarMutation();
  const [removeStar, { isLoading: isRemoving }] = useRemoveStarMutation();
  const isLoading = isAdding || isRemoving;

  const toggleStar = async (e) => {
    e.stopPropagation();
    if (isLoading) return;

    // Optimistic UI update
    const previousState = isStarred;
    setIsStarred(!previousState);

    try {
      const payload = { 
        resourceType: itemType.toUpperCase(), 
        resourceId: item.id 
      };

      if (previousState) {
        await removeStar(payload).unwrap();
      } else {
        await addStar(payload).unwrap();
      }
    } catch (err) {
      // Revert on failure
      setIsStarred(previousState);
      toast.error(err.data?.message || 'Failed to update star');
    }
  };

  return (
    <button
      onClick={toggleStar}
      disabled={isLoading}
      className={`p-1.5 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-cloud-200 ${
        isStarred 
          ? 'text-amber-400 hover:text-amber-500 hover:bg-amber-50' 
          : 'text-slate-300 hover:text-amber-400 hover:bg-cloud-100 opacity-0 group-hover:opacity-100'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={isStarred ? "Remove star" : "Star"}
    >
      <Star size={16} fill={isStarred ? 'currentColor' : 'none'} />
    </button>
  );
};

export default StarButton;
