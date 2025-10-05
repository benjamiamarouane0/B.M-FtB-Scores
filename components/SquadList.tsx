
import React, { useMemo } from 'react';
import { SquadMember } from '../types';
import PlayerCard from './PlayerCard';

interface SquadListProps {
  squad: SquadMember[];
  onSelectPlayer: (playerId: number) => void;
}

const SquadList: React.FC<SquadListProps> = ({ squad, onSelectPlayer }) => {
  const groupedSquad = useMemo(() => {
    const groups: Record<string, SquadMember[]> = {
      'Goalkeeper': [],
      'Defence': [],
      'Midfield': [],
      'Offence': [],
    };
    squad.forEach(player => {
      const position = player.position || 'Unknown';
      if (groups[position]) {
        groups[position].push(player);
      } else {
         if(!groups['Attack']) groups['Attack'] = [];
         groups['Attack'].push(player); // Fallback for other offensive roles
      }
    });
    // Fix for API sometimes returning 'Offence' and sometimes 'Attack'
    if (groups['Offence'] && groups['Offence'].length > 0) {
        if(!groups['Attack']) groups['Attack'] = [];
        groups['Attack'] = [...groups['Attack'], ...groups['Offence']];
        delete groups['Offence'];
    }

    return groups;
  }, [squad]);

  const positionOrder: (keyof typeof groupedSquad)[] = ['Goalkeeper', 'Defence', 'Midfield', 'Offence', 'Attack'];
  
  return (
    <div className="p-4 bg-brand-card-alt rounded-b-lg space-y-6">
      {positionOrder.map(position => {
        const players = groupedSquad[position];
        if (!players || players.length === 0) return null;
        return (
          <div key={position}>
            <h3 className="text-xl font-bold text-brand-primary mb-3">{position}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {players.map(player => (
                <PlayerCard key={player.id} player={player} onSelectPlayer={onSelectPlayer} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SquadList;