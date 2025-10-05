
import React, { useMemo } from 'react';
import { Competition } from '../types';
import CompetitionCard from './CompetitionCard';

interface FeaturedCompetitionsProps {
  competitions: Competition[];
  onSelectCompetition: (competition: Competition) => void;
}

const featuredCompetitionNames = [
  'UEFA Champions League',
  'Premier League',
  'Serie A',
  'Primera Division',
  'Ligue 1',
  'European Championship',
  'Championship',
  'Eredivisie',
  'Primeira Liga',
  'Copa Libertadores',
  'Campeonato Brasileiro Série A',
];

// To ensure a consistent order
const nameOrderMap = new Map(featuredCompetitionNames.map((name, index) => [name, index]));

const FeaturedCompetitions: React.FC<FeaturedCompetitionsProps> = ({ competitions, onSelectCompetition }) => {
  const featured = useMemo(() => {
    const featuredSet = new Set(featuredCompetitionNames);
    return competitions
      .filter(comp => featuredSet.has(comp.name))
      .sort((a, b) => (nameOrderMap.get(a.name) ?? 99) - (nameOrderMap.get(b.name) ?? 99));
  }, [competitions]);

  if (featured.length === 0) {
    return null;
  }

  return (
    <div className="mb-12 animate-fade-in">
      <h2 className="text-2xl sm:text-3xl font-bold text-brand-text mb-6 text-center">
        Top Competitions
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {featured.map(comp => (
          <CompetitionCard 
            key={comp.id} 
            competition={comp} 
            onSelectCompetition={onSelectCompetition} 
          />
        ))}
      </div>
    </div>
  );
};

export default FeaturedCompetitions;