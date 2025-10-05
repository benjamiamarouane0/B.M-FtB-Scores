
import React, { useState, useEffect } from 'react';
import { Competition, Match, Standing, CompetitionTeam, Scorer } from '../types';
import { getMatches, getStandings, getCompetitionTeams, getCompetitionScorers } from '../services/matchService';
import StandingsTable from './StandingsTable';
import TeamList from './TeamList';
import ScorersList from './ScorersList';
import MatchList from './MatchList';
import { BackArrowIcon, FootballIcon, StandingsIcon, TeamsIcon, TrophyIcon } from './icons';
import useTitle from './useTitle';

interface CompetitionDetailProps {
  competition: Competition;
  onBack: () => void;
  onSelectTeam: (teamId: number) => void;
  onSelectPlayer: (playerId: number) => void;
  onSelectMatch: (match: Match) => void;
}

type Tab = 'matches' | 'standings' | 'teams' | 'scorers';

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


const CompetitionDetail: React.FC<CompetitionDetailProps> = ({ competition, onBack, onSelectTeam, onSelectPlayer, onSelectMatch }) => {
  const isCopaLibertadores = competition.name === 'Copa Libertadores';
  const isChampionsLeague = competition.name === 'UEFA Champions League';
  const isEuroChampionship = competition.name === 'European Championship';

  const isTournament = isCopaLibertadores || isChampionsLeague || isEuroChampionship;
  const isNationalTeamCompetition = nationalTeamCompetitionNames.has(competition.name);

  const [activeTab, setActiveTab] = useState<Tab>(isTournament ? 'standings' : 'matches');
  
  const [matches, setMatches] = useState<Match[]>([]);
  const [matchesLoading, setMatchesLoading] = useState<boolean>(false);

  const [standings, setStandings] = useState<Standing[]>([]);
  const [standingsLoading, setStandingsLoading] = useState<boolean>(false);

  const [teams, setTeams] = useState<CompetitionTeam[]>([]);
  const [teamsLoading, setTeamsLoading] = useState<boolean>(false);
  
  const [scorers, setScorers] = useState<Scorer[]>([]);
  const [scorersLoading, setScorersLoading] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);

  const pageTitle = `${competition.name} | B.M FtB Scores`;
  const pageDescription = `Follow the ${competition.name} with live scores, standings, teams, and top scorers.`;
  useTitle(pageTitle, pageDescription);

  useEffect(() => {
    // Reset state when competition changes
    setActiveTab(isTournament ? 'standings' : 'matches');
    setMatches([]);
    setStandings([]);
    setTeams([]);
    setScorers([]);
    setError(null);
  }, [competition, isTournament]);
  
  useEffect(() => {
    const fetchMatches = async () => {
        if (matches.length > 0) return;
        setMatchesLoading(true);
        setError(null);
        try {
            const fetchedMatches = await getMatches(competition.id);
            setMatches(fetchedMatches);
        } catch (e: any) {
            setError(e.message || "An error occurred while fetching matches.");
        } finally {
            setMatchesLoading(false);
        }
    };
    
    const fetchStandings = async () => {
      if (standings.length > 0) return;
      setStandingsLoading(true);
      setError(null);
      try {
        const fetchedStandings = await getStandings(competition.id);
        setStandings(fetchedStandings);
      } catch (e: any) {
        setError(e.message || "An unknown error occurred while fetching standings.");
      } finally {
        setStandingsLoading(false);
      }
    };
    
    const fetchTeams = async () => {
      if (teams.length > 0) return;
      setTeamsLoading(true);
      setError(null);
      try {
        const fetchedTeams = await getCompetitionTeams(competition.id);
        setTeams(fetchedTeams);
      } catch (e: any) {
        setError(e.message || "An unknown error occurred while fetching teams.");
      } finally {
        setTeamsLoading(false);
      }
    };
    
    const fetchScorers = async () => {
        if (scorers.length > 0) return;
        setScorersLoading(true);
        setError(null);
        try {
            const fetchedScorers = await getCompetitionScorers(competition.id);
            setScorers(fetchedScorers);
        } catch (e: any) {
            setError(e.message || "An unknown error occurred while fetching top scorers.");
        } finally {
            setScorersLoading(false);
        }
    };

    switch (activeTab) {
        case 'matches': fetchMatches(); break;
        case 'standings': fetchStandings(); break;
        case 'teams': fetchTeams(); break;
        case 'scorers': fetchScorers(); break;
    }

  }, [competition.id, activeTab, matches.length, standings.length, teams.length, scorers.length]);

  useEffect(() => {
    if (activeTab !== 'matches') {
        return;
    }

    const fetchLiveUpdates = async () => {
        try {
            const fetchedMatches = await getMatches(competition.id);
            setMatches(fetchedMatches);
        } catch (e: any) {
            console.warn(`Could not fetch live updates for ${competition.name}:`, e.message);
        }
    };

    const intervalId = setInterval(fetchLiveUpdates, 60000); // Poll every 60 seconds

    return () => clearInterval(intervalId);
  }, [activeTab, competition.id]);

  const renderContent = () => {
    if (error) {
       return (
          <div className="bg-red-900/50 border border-red-400 text-red-100 px-4 py-3 rounded-lg relative text-center mt-6" role="alert">
              <strong className="font-bold">Error Fetching Data</strong>
              <span className="block sm:inline ml-2">{error}</span>
          </div>
       );
    }
    
    switch (activeTab) {
        case 'matches':
            if (matchesLoading) return <p className="text-center pt-16 text-brand-text-secondary">Loading matches...</p>;
            return matches.length > 0 
                ? <MatchList matches={matches} onSelectMatch={onSelectMatch} /> 
                : <p className="text-center pt-16 text-brand-text-secondary">No matches found for {competition.name}.</p>;
        case 'standings':
            if (standingsLoading) return <p className="text-center pt-16 text-brand-text-secondary">Loading standings...</p>;
            return <StandingsTable standings={standings} />;
        case 'teams':
            if (teamsLoading) return <p className="text-center pt-16 text-brand-text-secondary">Loading teams...</p>;
            return teams.length > 0 ? <TeamList teams={teams} onSelectTeam={(team) => onSelectTeam(team.id)} isTeamSelectable={!isNationalTeamCompetition} /> : <p className="text-center pt-16 text-brand-text-secondary">No teams found for {competition.name}.</p>;
        case 'scorers':
            if (scorersLoading) return <p className="text-center pt-16 text-brand-text-secondary">Loading top scorers...</p>;
            return scorers.length > 0 ? <ScorersList scorers={scorers} onSelectPlayer={(player) => onSelectPlayer(player.id)} /> : <p className="text-center pt-16 text-brand-text-secondary">Top scorers data not available for {competition.name}.</p>;
        default:
            return null;
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center">
        <button onClick={onBack} className="text-brand-primary hover:text-green-300 transition-colors mr-4 p-2 rounded-full hover:bg-brand-secondary">
          <BackArrowIcon className="w-5 h-5" />
        </button>
        <h2 className="text-2xl sm:text-3xl font-bold text-brand-text">
          {competition.name}
        </h2>
      </div>

      <div className="flex border-b border-brand-secondary bg-brand-card-alt rounded-t-lg overflow-hidden">
        {!isTournament && <TabButton icon={<FootballIcon/>} label="Matches" isActive={activeTab === 'matches'} onClick={() => setActiveTab('matches')} />}
        <TabButton icon={<StandingsIcon/>} label="Standings" isActive={activeTab === 'standings'} onClick={() => setActiveTab('standings')} />
        <TabButton icon={<TeamsIcon/>} label="Teams" isActive={activeTab === 'teams'} onClick={() => setActiveTab('teams')} />
        <TabButton icon={<TrophyIcon/>} label="Scorers" isActive={activeTab === 'scorers'} onClick={() => setActiveTab('scorers')} />
      </div>
      
      <div>
        {renderContent()}
      </div>
    </div>
  );
};


interface TabButtonProps {
    icon: React.ReactElement<{ className?: string }>;
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ icon, label, isActive, onClick}) => (
    <button
        onClick={onClick}
        className={`flex-1 py-3 px-2 text-sm font-medium flex items-center justify-center space-x-2 transition-colors duration-300
        ${isActive ? 'text-brand-primary border-b-2 border-brand-primary bg-brand-secondary' : 'text-brand-text-secondary hover:bg-brand-secondary/50'}`}
    >
        {React.cloneElement(icon, { className: 'w-5 h-5' })}
        <span>{label}</span>
    </button>
)

export default CompetitionDetail;