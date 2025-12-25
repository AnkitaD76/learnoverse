/**
 * Search Filters Component
 * Advanced filters for course search
 * - Skills (multi-select)
 * - Price range
 * - Level
 * - Sort options
 */

import { useState } from 'react';

const COURSE_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price', label: 'Price (Low to High)' },
];

// Common skill tags (in production, fetch from API)
const COMMON_SKILLS = [
  'JavaScript',
  'Python',
  'React',
  'Node.js',
  'TypeScript',
  'Machine Learning',
  'Data Science',
  'Web Development',
  'Mobile Development',
  'Cloud Computing',
  'DevOps',
  'UI/UX Design',
];

export const SearchFilters = ({ filters, onChange }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (field, value) => {
    const updated = { ...localFilters, [field]: value };
    setLocalFilters(updated);
    onChange(updated);
  };

  const handleSkillToggle = skill => {
    const currentSkills = localFilters.skills || [];
    const updated = currentSkills.includes(skill)
      ? currentSkills.filter(s => s !== skill)
      : [...currentSkills, skill];
    handleChange('skills', updated);
  };

  const handlePriceChange = (field, value) => {
    const numValue = value === '' ? undefined : Number(value);
    handleChange(field, numValue);
  };

  const handleReset = () => {
    const resetFilters = {
      skills: [],
      priceMin: undefined,
      priceMax: undefined,
      level: undefined,
      sortBy: 'relevance',
    };
    setLocalFilters(resetFilters);
    onChange(resetFilters);
  };

  return (
    <div className="sticky top-4 space-y-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        <button
          onClick={handleReset}
          className="text-sm text-[#FF6A00] hover:text-[#E55F00]"
        >
          Reset
        </button>
      </div>

      {/* Sort By */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Sort By
        </label>
        <select
          value={localFilters.sortBy || 'relevance'}
          onChange={e => handleChange('sortBy', e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] focus:outline-none"
        >
          {SORT_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Level */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Level
        </label>
        <select
          value={localFilters.level || ''}
          onChange={e => handleChange('level', e.target.value || undefined)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] focus:outline-none"
        >
          <option value="">All Levels</option>
          {COURSE_LEVELS.map(level => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Price (Points)
        </label>
        <div className="space-y-2">
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={localFilters.priceMin ?? ''}
            onChange={e => handlePriceChange('priceMin', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] focus:outline-none"
          />
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={localFilters.priceMax ?? ''}
            onChange={e => handlePriceChange('priceMax', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] focus:outline-none"
          />
        </div>
      </div>

      {/* Skills */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Skills
        </label>
        <div className="max-h-64 space-y-2 overflow-y-auto">
          {COMMON_SKILLS.map(skill => (
            <label
              key={skill}
              className="flex cursor-pointer items-center gap-2 rounded p-1 hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={(localFilters.skills || []).includes(skill)}
                onChange={() => handleSkillToggle(skill)}
                className="h-4 w-4 rounded border-gray-300 text-[#FF6A00] focus:ring-[#FF6A00]"
              />
              <span className="text-sm text-gray-700">{skill}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Selected Filters Count */}
      {(localFilters.skills?.length > 0 ||
        localFilters.priceMin !== undefined ||
        localFilters.priceMax !== undefined ||
        localFilters.level) && (
        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-600">
            {[
              localFilters.skills?.length || 0,
              localFilters.priceMin !== undefined ? 1 : 0,
              localFilters.priceMax !== undefined ? 1 : 0,
              localFilters.level ? 1 : 0,
            ].reduce((a, b) => a + b, 0)}{' '}
            filter(s) active
          </p>
        </div>
      )}
    </div>
  );
};
