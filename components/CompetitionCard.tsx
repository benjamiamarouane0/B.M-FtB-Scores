

import React from 'react';
import { Competition } from '../types';

interface CompetitionCardProps {
  competition: Competition;
  onSelectCompetition: (competition: Competition) => void;
  variant?: 'default' | 'featured';
}

const CompetitionCard: React.FC<CompetitionCardProps> = ({ competition, onSelectCompetition, variant = 'default' }) => {
  const isFeatured = variant === 'featured';

  // Conditional classes based on variant
  const cardClasses = isFeatured
    ? 'bg-brand-gold hover:bg-brand-gold-hover'
    : 'bg-brand-card-alt hover:bg-brand-secondary';
  
  const textClasses = isFeatured
    ? 'text-gray-900'
    : 'text-brand-text';

  const emblemBgClass = isFeatured
    ? 'bg-white/50'
    : 'bg-brand-secondary';

  return (
    <div
      className={`rounded-lg p-4 shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 flex flex-col items-center justify-center text-center ${cardClasses}`}
      onClick={() => onSelectCompetition(competition)}
      role="button"
      tabIndex={0}
      aria-label={`Select ${competition.name}`}
      onKeyPress={(e) => e.key === 'Enter' && onSelectCompetition(competition)}
    >
      <img 
        loading="lazy"
        src={competition.emblem || undefined} 
        alt={`${competition.name} emblem`} 
        className={`w-16 h-16 sm:w-20 sm:h-20 object-contain mb-3 rounded-md ${emblemBgClass}`}
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
      <p className={`font-semibold text-sm leading-tight ${textClasses}`}>{competition.name}</p>
    </div>
  );
};

export default React.memo(CompetitionCard);