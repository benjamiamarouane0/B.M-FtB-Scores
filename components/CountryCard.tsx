

import React from 'react';
import { Area } from '../types';

interface CountryCardProps {
  country: Area;
  onSelectCountry: (country: Area) => void;
}

const CountryCard: React.FC<CountryCardProps> = ({ country, onSelectCountry }) => {
  return (
    <div
      className="bg-brand-card-alt rounded-lg p-4 shadow-lg hover:bg-brand-secondary transition-all duration-300 cursor-pointer transform hover:-translate-y-1 flex flex-col items-center justify-center text-center"
      onClick={() => onSelectCountry(country)}
      role="button"
      tabIndex={0}
      aria-label={`Select ${country.name}`}
      onKeyPress={(e) => e.key === 'Enter' && onSelectCountry(country)}
    >
      <img 
        src={country.flag || undefined} 
        alt={`${country.name} flag`} 
        className="w-16 h-12 object-contain mb-3"
        onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150/1F2937/E5E7EB?text=N/A'; }}
      />
      <p className="font-semibold text-sm text-brand-text leading-tight">{country.name}</p>
    </div>
  );
};

export default React.memo(CountryCard);