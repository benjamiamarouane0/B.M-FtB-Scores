import React from 'react';
import { Area } from '../types';
import CountryCard from './CountryCard';

interface CountryListProps {
  countries: Area[];
  onSelectCountry: (country: Area) => void;
  title: string;
}

const CountryList: React.FC<CountryListProps> = ({ countries, onSelectCountry, title }) => {
  if (countries.length === 0) {
    return null;
  }
  
  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl sm:text-3xl font-bold text-brand-text mb-6 text-center">
        {title}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {countries.map(country => (
          <CountryCard
            key={country.id}
            country={country}
            onSelectCountry={onSelectCountry}
          />
        ))}
      </div>
    </div>
  );
};

export default CountryList;
