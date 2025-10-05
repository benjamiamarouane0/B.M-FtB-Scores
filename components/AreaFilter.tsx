

import React from 'react';
import { Area } from '../types';

interface AreaFilterProps {
  areas: Area[];
  topCountries: Area[];
  selectedAreaId: number | null;
  selectedCountryId: number | null;
  onSelectArea: (id: number) => void;
  onSelectCountry: (id: number) => void;
  onSelectMatches: () => void;
  isMatchesViewActive: boolean;
  onSelectTopCompetitions: () => void;
  isTopCompetitionsViewActive: boolean;
}

const AreaFilter: React.FC<AreaFilterProps> = ({ 
  areas, 
  topCountries,
  selectedAreaId, 
  selectedCountryId,
  onSelectArea, 
  onSelectCountry,
  onSelectMatches, 
  isMatchesViewActive,
  onSelectTopCompetitions,
  isTopCompetitionsViewActive
}) => {

  // Filter out continent buttons to simplify the UI as requested.
  const otherContinents = areas.filter(a => a.name !== 'Europe' && a.name !== 'South America' && a.name !== 'World');

  return (
    <div className="mb-6 flex justify-center items-center flex-wrap gap-2 sm:gap-4 bg-brand-card p-2 rounded-full shadow-lg">
      <button
        key="top-competitions-view"
        onClick={onSelectTopCompetitions}
        className={`px-4 py-2 text-sm sm:text-base font-semibold rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-opacity-50
          ${
            isTopCompetitionsViewActive
              ? 'bg-brand-accent text-white shadow-md'
              : 'bg-brand-card-alt text-brand-text-secondary hover:bg-brand-secondary hover:text-white'
          }`}
        aria-pressed={isTopCompetitionsViewActive}
      >
        <span>Top Competitions</span>
      </button>
      <button
        key="matches-view"
        onClick={onSelectMatches}
        className={`px-4 py-2 text-sm sm:text-base font-semibold rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-opacity-50
          ${
            isMatchesViewActive
              ? 'bg-brand-accent text-white shadow-md'
              : 'bg-brand-card-alt text-brand-text-secondary hover:bg-brand-secondary hover:text-white'
          }`}
        aria-pressed={isMatchesViewActive}
      >
        <span>Matches</span>
      </button>

      {topCountries.length > 0 && (
        <div className="px-4 py-2 text-sm sm:text-base font-semibold rounded-full bg-brand-secondary text-brand-text hidden md:flex items-center" aria-hidden="true">
            <span>Best League Countries</span>
        </div>
      )}

      {topCountries.map((country) => (
        <button
          key={country.id}
          onClick={() => onSelectCountry(country.id)}
          className={`px-4 py-2 text-sm sm:text-base font-semibold rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-opacity-50 flex items-center space-x-2
            ${
              selectedCountryId === country.id
                ? 'bg-brand-accent text-white shadow-md'
                : 'bg-brand-card-alt text-brand-text-secondary hover:bg-brand-secondary hover:text-white'
            }`}
          aria-pressed={selectedCountryId === country.id}
        >
          {country.flag && <img src={country.flag} alt={country.code} className="w-5 h-5 rounded-full object-cover" />}
          <span>{country.name}</span>
        </button>
      ))}

      {otherContinents.map((area) => (
        <button
          key={area.id}
          onClick={() => onSelectArea(area.id)}
          className={`px-4 py-2 text-sm sm:text-base font-semibold rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-opacity-50 flex items-center space-x-2
            ${
              selectedAreaId === area.id
                ? 'bg-brand-accent text-white shadow-md'
                : 'bg-brand-card-alt text-brand-text-secondary hover:bg-brand-secondary hover:text-white'
            }`}
          aria-pressed={selectedAreaId === area.id}
        >
          {area.flag && <img src={area.flag} alt={area.code} className="w-5 h-5 rounded-full object-cover hidden sm:inline-block" />}
          <span>{area.name}</span>
        </button>
      ))}
    </div>
  );
};

export default AreaFilter;