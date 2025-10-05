

import React from 'react';
import { SquadMember } from '../types';

interface PlayerCardProps {
  player: SquadMember;
  onSelectPlayer: (playerId: number) => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, onSelectPlayer }) => {
  return (
    <div 
        className="bg-brand-background rounded-lg p-3 shadow-md hover:bg-brand-secondary transition-colors duration-200 cursor-pointer flex items-center space-x-4"
        onClick={() => onSelectPlayer(player.id)}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => e.key === 'Enter' && onSelectPlayer(player.id)}
    >
        {player.shirtNumber && (
            <div className="flex-shrink-0 w-10 h-10 bg-brand-card-alt border border-brand-secondary rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-brand-text">{player.shirtNumber}</span>
            </div>
        )}
        <div className="flex-grow">
            <p className="font-semibold text-brand-text">{player.name}</p>
            <p className="text-sm text-brand-text-secondary">{player.nationality}</p>
        </div>
    </div>
  );
};

export default React.memo(PlayerCard);