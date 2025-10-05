
import React, { useState, useEffect } from 'react';
import { TeamDetail as TeamDetailType, Match } from '../types';
import { getTeamDetails } from '../services/matchService';
import { BackArrowIcon, FootballIcon, ShirtIcon, InfoIcon } from './icons';
import SquadList from './SquadList';
import useTitle from './useTitle';

interface TeamDetailProps {
  teamId: number;
  onBack: () => void;
  onSelectPlayer: (playerId: number) => void;
}

type Tab = 'info' | 'squad';

const TeamDetail: React.FC<TeamDetailProps> = ({ teamId, onBack, onSelectPlayer }) => {
  const [team, setTeam] = useState<TeamDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('info');

  useTitle(team ? `${team.name} | B.M FtB Scores` : 'Team Details', team ? `View details, squad, and match information for ${team.name}.` : undefined);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const teamDetails = await getTeamDetails(teamId);
        setTeam(teamDetails);
      } catch (e: any) {
        setError(e.message || "An unknown error occurred.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [teamId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center pt-16">
        <FootballIcon className="w-16 h-16 text-brand-primary animate-pulse" />
        <p className="text-lg mt-4 text-brand-text-secondary">Loading team details...</p>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="text-center pt-16">
        <p className="text-red-400">{error || 'Team not found.'}</p>
        <button onClick={onBack} className="mt-4 text-brand-primary">Go Back</button>
      </div>
    );
  }

  const renderInfo = () => (
    <div className="p-4 space-y-4 bg-brand-card-alt rounded-b-lg">
        <InfoItem label="Full Name" value={team.name} />
        <InfoItem label="Founded" value={team.founded?.toString()} />
        <InfoItem label="Venue" value={team.venue} />
        <InfoItem label="Club Colors" value={team.clubColors} />
        <InfoItem label="Coach" value={team.coach?.name} />
        <InfoItem label="Website" value={team.website ? <a href={team.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{team.website}</a> : 'N/A'} />
    </div>
  );
  
  const InfoItem = ({label, value}: {label: string, value: string | React.ReactNode | undefined | null}) => (
      value ? <div>
          <p className="text-sm text-brand-text-secondary">{label}</p>
          <p className="text-md font-semibold">{value}</p>
      </div> : null
  );

  return (
    <div className="animate-fade-in">
      <div className="flex items-center mb-4">
        <button onClick={onBack} className="text-brand-primary hover:text-green-300 transition-colors mr-4 p-2 rounded-full hover:bg-brand-secondary">
          <BackArrowIcon className="w-6 h-6" />
        </button>
        <img src={team.crest} alt={`${team.name} crest`} className="w-12 h-12 mr-4" />
        <h2 className="text-2xl sm:text-4xl font-bold text-brand-text">{team.name}</h2>
      </div>

      <div className="flex border-b border-brand-secondary bg-brand-card-alt rounded-t-lg overflow-hidden">
        <TabButton icon={<InfoIcon/>} label="Info" isActive={activeTab === 'info'} onClick={() => setActiveTab('info')} />
        <TabButton icon={<ShirtIcon/>} label="Squad" isActive={activeTab === 'squad'} onClick={() => setActiveTab('squad')} />
      </div>

      {activeTab === 'info' && renderInfo()}
      {activeTab === 'squad' && <SquadList squad={team.squad} onSelectPlayer={onSelectPlayer} />}
    </div>
  );
};

const TabButton: React.FC<{ icon: React.ReactElement, label: string, isActive: boolean, onClick: () => void }> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex-1 py-3 px-2 text-sm font-medium flex items-center justify-center space-x-2 transition-colors duration-300
        ${isActive ? 'text-brand-primary border-b-2 border-brand-primary bg-brand-secondary' : 'text-brand-text-secondary hover:bg-brand-secondary/50'}`}
    >
        {React.cloneElement(icon, { className: 'w-5 h-5' })}
        <span>{label}</span>
    </button>
);

export default TeamDetail;