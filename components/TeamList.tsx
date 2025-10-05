
import React from 'react';
import { CompetitionTeam } from '../types';
import TeamCard from './TeamCard';

interface TeamListProps {
  teams: CompetitionTeam[];
  onSelectTeam: (team: CompetitionTeam) => void;
  isTeamSelectable?: boolean;
}

const TeamList: React.FC<TeamListProps> = ({ teams, onSelectTeam, isTeamSelectable = true }) => {
  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {teams.map(team => (
          <TeamCard
            key={team.id}
            team={team}
            onSelectTeam={onSelectTeam}
            isSelectable={isTeamSelectable}
          />
        ))}
      </div>
    </div>
  );
};

export default TeamList;
