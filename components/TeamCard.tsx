

import React from 'react';
import { CompetitionTeam } from '../types';

interface TeamCardProps {
  team: CompetitionTeam;
  onSelectTeam: (team: CompetitionTeam) => void;
  isSelectable?: boolean;
}

const TeamCard: React.FC<TeamCardProps> = ({ team, onSelectTeam, isSelectable = true }) => {
  return (
    <div
      className={`bg-brand-card-alt rounded-lg p-4 shadow-lg flex flex-col items-center justify-center text-center transition-all duration-300 ${isSelectable ? 'transform hover:-translate-y-1 hover:bg-brand-secondary cursor-pointer' : 'opacity-70'}`}
      onClick={isSelectable ? () => onSelectTeam(team) : undefined}
      role="button"
      tabIndex={isSelectable ? 0 : -1}
      aria-disabled={!isSelectable}
      aria-label={team.name}
      onKeyPress={isSelectable ? (e) => e.key === 'Enter' && onSelectTeam(team) : undefined}
    >
      <img
        loading="lazy"
        src={team.crest}
        alt={`${team.name} crest`}
        className="w-16 h-16 sm:w-20 sm:h-20 object-contain mb-3 bg-brand-secondary rounded-md"
        onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150/1F2937/E5E7EB?text=N/A'; }}
      />
      <p className="font-semibold text-sm text-brand-text leading-tight">{team.name}</p>
      {team.venue && <p className="text-xs text-brand-text-secondary mt-1">{team.venue}</p>}
    </div>
  );
};

export default React.memo(TeamCard);
