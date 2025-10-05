import React from 'react';
import { Competition } from '../types';
import CompetitionCard from './CompetitionCard';

interface CompetitionListProps {
  competitions: Competition[];
  onSelectCompetition: (competition: Competition) => void;
}

const CompetitionList: React.FC<CompetitionListProps> = ({ competitions, onSelectCompetition }) => {
  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {competitions.map(comp => (
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

export default CompetitionList;