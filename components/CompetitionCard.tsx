

import React from 'react';
import { Competition } from '../types';

interface CompetitionCardProps {
  competition: Competition;
  onSelectCompetition: (competition: Competition) => void;
}

const CompetitionCard: React.FC<CompetitionCardProps> = ({ competition, onSelectCompetition }) => {
  return (
    <div
      className="bg-brand-card-alt rounded-lg p-4 shadow-lg hover:bg-brand-secondary transition-all duration-300 cursor-pointer transform hover:-translate-y-1 flex flex-col items-center justify-center text-center"
      onClick={() => onSelectCompetition(competition)}
      role="button"
      tabIndex={0}
      aria-label={`Select ${competition.name}`}
      onKeyPress={(e) => e.key === 'Enter' && onSelectCompetition(competition)}
    >
      <img 
        src={competition.emblem || undefined} 
        alt={`${competition.name} emblem`} 
        className="w-16 h-16 sm:w-20 sm:h-20 object-contain mb-3"
        // Add a fallback for broken image links
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
      <p className="font-semibold text-sm text-brand-text leading-tight">{competition.name}</p>
    </div>
  );
};

export default React.memo(CompetitionCard);