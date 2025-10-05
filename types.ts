export interface Area {
  id: number;
  name: string;
  code: string;
  flag: string | null;
  parentAreaId?: number | null;
  parentArea?: string | null;
  childAreas?: Area[];
}

export interface Competition {
  id: number;
  name: string;
  code: string;
  emblem: string | null;
  area: {
    id: number;
    name: string;
    flag: string | null;
  }
}

export interface Team {
  id: number;
  name: string;
  logo: string;
}

export enum MatchEventType {
  GOAL = 'GOAL',
  YELLOW_CARD = 'YELLOW_CARD',
  RED_CARD = 'RED_CARD',
  SUBSTITUTION = 'SUBSTITUTION',
}

export interface MatchEvent {
  minute: number;
  type: MatchEventType;
  player: string;
  teamId: number;
  detail?: string;
}

export interface MatchStats {
  possession: number;
  shots: number;
  shotsOnTarget: number;
  corners: number;
  fouls: number;
}

export interface Match {
  id: number;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number | null;
  awayScore: number | null;
  status: 'FT' | 'HT' | 'LIVE' | 'UPCOMING' | 'POSTPONED' | 'SUSPENDED' | 'CANCELLED';
  minute?: number;
  date: string;
  league: string;
  area?: {
    id: number;
    name: string;
    flag: string | null;
  };
  events: MatchEvent[];
  homeStats?: MatchStats;
  awayStats?: MatchStats;
  highlightsUrl?: string;
}

export interface StandingTeam {
  id: number;
  name: string;
  crest: string;
}

export interface TableEntry {
  position: number;
  team: StandingTeam;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export interface Standing {
  stage: string;
  type: 'TOTAL' | 'HOME' | 'AWAY';
  group: string | null;
  table: TableEntry[];
}

export interface CompetitionTeam {
  id: number;
  name: string;
  shortName: string | null;
  tla: string | null;
  crest: string;
  address: string | null;
  website: string | null;
  founded: number | null;
  clubColors: string | null;
  venue: string | null;
}

export interface Scorer {
  player: {
    id: number;
    name: string;
    nationality: string;
  };
  team: {
    id: number;
    name: string;
    crest: string;
  };
  goals: number;
  assists: number | null;
  penalties: number | null;
}

export interface Coach {
  id: number | null;
  name: string | null;
  nationality: string | null;
}

export interface SquadMember {
  id: number;
  name: string;
  position: string;
  dateOfBirth: string;
  nationality: string;
  shirtNumber: number | null;
}

export interface TeamDetail extends CompetitionTeam {
  runningCompetitions: Competition[];
  coach: Coach;
  squad: SquadMember[];
}

export interface Person {
    id: number;
    name: string;
    firstName: string;
    lastName: string | null;
    dateOfBirth: string;
    nationality: string;
    position: string;
    shirtNumber: number | null;
    currentTeam: TeamDetail;
}

export interface Head2Head {
    aggregates: {
        numberOfMatches: number;
        totalGoals: number;
        homeTeam: {
            id: number;
            name: string;
            wins: number;
            draws: number;
            losses: number;
        };
        awayTeam: {
            id: number;
            name: string;
            wins: number;
            draws: number;
            losses: number;
        };
    };
    matches: Match[];
}