
import React, { useMemo } from 'react';
import { Area } from '../types';
import CountryCard from './CountryCard';

interface FeaturedCountriesProps {
  countries: Area[];
  onSelectCountry: (country: Area) => void;
  title: string;
  featuredNames: string[];
}

const FeaturedCountries: React.FC<FeaturedCountriesProps> = ({ countries, onSelectCountry, title, featuredNames }) => {
  // To ensure a consistent order
  const nameOrderMap = useMemo(() => new Map(featuredNames.map((name, index) => [name, index])), [featuredNames]);

  const featured = useMemo(() => {
    const featuredSet = new Set(featuredNames);
    return countries
      .filter(country => featuredSet.has(country.name))
      .sort((a, b) => (nameOrderMap.get(a.name) ?? 99) - (nameOrderMap.get(b.name) ?? 99));
  }, [countries, featuredNames, nameOrderMap]);

  if (featured.length === 0) {
    return null;
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl sm:text-3xl font-bold text-brand-text mb-6 text-center">
        {title}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {featured.map(country => (
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

export default FeaturedCountries;
