import React, { useState } from 'react';
import { Star } from 'lucide-react';

/**
 * StarRating Component
 * Displays or allows interaction with star ratings (1-5 with half-star support)
 *
 * @param {number} rating - Current rating value (1-5, supports 0.5 increments)
 * @param {function} onRatingChange - Callback when rating changes (for input mode)
 * @param {boolean} interactive - Whether stars are clickable
 * @param {string} size - Size: 'sm', 'md', 'lg'
 * @param {boolean} showValue - Whether to show numeric rating value
 */
const StarRating = ({
  rating = 0,
  onRatingChange,
  interactive = false,
  size = 'md',
  showValue = false,
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const starSize = sizeClasses[size] || sizeClasses.md;

  // Calculate which part of each star should be filled
  const getStarFill = starIndex => {
    const currentRating = interactive && hoverRating > 0 ? hoverRating : rating;
    const diff = currentRating - starIndex;

    if (diff >= 1) return 'full'; // Fully filled
    if (diff >= 0.5) return 'half'; // Half filled
    return 'empty'; // Empty
  };

  const handleStarClick = (starIndex, isHalf) => {
    if (!interactive || !onRatingChange) return;

    const newRating = isHalf ? starIndex + 0.5 : starIndex + 1;
    onRatingChange(newRating);
  };

  const handleStarHover = (starIndex, isHalf) => {
    if (!interactive) return;

    const newRating = isHalf ? starIndex + 0.5 : starIndex + 1;
    setHoverRating(newRating);
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center" onMouseLeave={handleMouseLeave}>
        {[0, 1, 2, 3, 4].map(index => {
          const fill = getStarFill(index);

          return (
            <div
              key={index}
              className={`relative ${interactive ? 'cursor-pointer' : ''}`}
            >
              {/* Background star (empty) */}
              <Star
                className={`${starSize} text-gray-300`}
                fill="currentColor"
              />

              {/* Filled overlay */}
              <div
                className="absolute top-0 left-0 overflow-hidden"
                style={{
                  width:
                    fill === 'full' ? '100%' : fill === 'half' ? '50%' : '0%',
                }}
              >
                <Star
                  className={`${starSize} text-yellow-400`}
                  fill="currentColor"
                />
              </div>

              {/* Clickable areas for half and full */}
              {interactive && (
                <>
                  {/* Left half */}
                  <div
                    className="absolute top-0 left-0 h-full w-1/2"
                    onClick={() => handleStarClick(index, true)}
                    onMouseEnter={() => handleStarHover(index, true)}
                  />
                  {/* Right half */}
                  <div
                    className="absolute top-0 right-0 h-full w-1/2"
                    onClick={() => handleStarClick(index, false)}
                    onMouseEnter={() => handleStarHover(index, false)}
                  />
                </>
              )}
            </div>
          );
        })}
      </div>

      {showValue && (
        <span className="ml-2 text-sm font-medium text-gray-700">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
