

import React, { useState, useEffect } from 'react';
import { Person } from '../types';
import { getPersonDetails } from '../services/matchService';
import { BackArrowIcon, FootballIcon } from './icons';
import useTitle from './useTitle';

interface PlayerDetailProps {
  playerId: number;
  onBack: () => void;
  onSelectTeam: (teamId: number) => void;
}

const nationalTeamCompetitionNames = new Set([
  'European Championship',
  'FIFA World Cup',
  'Copa America',
  'Africa Cup',
  'UEFA Nations League',
  'WC Qualification CAF',
  'WC Qualification AFC',
  'WC Qualification UEFA',
  'WC Qualification OFC',
  'WC Qualification CONMEBOL',
  'WC Qualification CONCACAF',
  'FIFA Women\'s World Cup',
  'UEFA Women\'s Euro',
  'Summer Olympics',
  'European Championship Qualifiers',
]);

const PlayerDetail: React.FC<PlayerDetailProps> = ({ playerId, onBack, onSelectTeam }) => {
  const [player, setPlayer] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useTitle(player ? `${player.name} | B.M FtB Scores` : 'Player Details', player ? `View career details and statistics for ${player.name}.` : undefined);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const personDetails = await getPersonDetails(playerId);
        setPlayer(personDetails);
      } catch (e: any) {
        setError(e.message || "An unknown error occurred.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [playerId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center pt-16">
        <FootballIcon className="w-16 h-16 text-brand-primary animate-pulse" />
        <p className="text-lg mt-4 text-brand-text-secondary">Loading player details...</p>
      </div>
    );
  }
  
  if (error || !player) {
    return (
      <div className="text-center pt-16">
        <p className="text-red-400">{error || 'Player not found.'}</p>
        <button onClick={onBack} className="mt-4 text-brand-accent">Go Back</button>
      </div>
    );
  }

  const isNationalTeam = player.currentTeam?.runningCompetitions?.some(c => nationalTeamCompetitionNames.has(c.name));

  return (
    <div className="animate-fade-in bg-brand-card-alt rounded-lg shadow-xl p-6">
      <div className="flex items-start mb-6">
        <button onClick={onBack} className="text-brand-accent hover:text-sky-300 transition-colors mr-4 p-2 -ml-2 rounded-full hover:bg-brand-secondary">
          <BackArrowIcon className="w-6 h-6" />
        </button>
        <div className="flex-grow">
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-text">{player.name}</h2>
            <p className="text-md text-brand-text-secondary">{player.position}</p>
        </div>
        {player.shirtNumber && <div className="text-5xl font-bold text-brand-primary opacity-50">{player.shirtNumber}</div>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoItem label="Nationality" value={player.nationality} />
          <InfoItem label="Date of Birth" value={new Date(player.dateOfBirth).toLocaleDateString()} />
           {player.currentTeam && (
               <div className="md:col-span-2">
                    <p className="text-sm text-brand-text-secondary">Current Team</p>
                    <div 
                        className={`flex items-center space-x-3 p-3 bg-brand-background rounded-lg mt-1 ${!isNationalTeam ? 'cursor-pointer hover:bg-brand-secondary' : 'opacity-70'}`}
                        onClick={!isNationalTeam ? () => onSelectTeam(player.currentTeam.id) : undefined}
                        aria-disabled={!!isNationalTeam}
                    >
                        <img loading="lazy" src={player.currentTeam.crest} alt={player.currentTeam.name} className="w-8 h-8 bg-brand-secondary rounded-lg"/>
                        <span className="text-lg font-semibold">{player.currentTeam.name}</span>
                    </div>
                    {isNationalTeam && <p className="text-xs text-brand-text-secondary mt-1">Detailed team information for national teams is not available.</p>}
                </div>
           )}
      </div>
    </div>
  );
};

const InfoItem: React.FC<{label: string, value: string | undefined | null}> = ({label, value}) => (
    value ? <div className="bg-brand-background p-4 rounded-lg">
        <p className="text-sm text-brand-text-secondary">{label}</p>
        <p className="text-lg font-semibold">{value}</p>
    </div> : null
);

export default PlayerDetail;