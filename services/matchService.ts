import { Match, MatchEventType, MatchEvent, Area, Competition, Standing, CompetitionTeam, Scorer, TeamDetail, Person, Head2Head } from '../types';

// Add a CORS proxy to bypass browser-side request restrictions from the API.
const PROXY_URL = 'https://corsproxy.io/?';
const API_BASE_URL = 'https://api.football-data.org/v4';

// The API key provided by the user is now used directly.
const API_KEY = 'b24ba533019d410bbd6fece9b3523bab';

const headers = {
  'X-Auth-Token': API_KEY,
};

// A helper function to wrap API requests and handle rate-limiting with a single retry.
const apiRequest = async (url: string, options: RequestInit): Promise<Response> => {
    const response = await fetch(url, options);

    if (response.ok) {
        return response;
    }

    // Handle rate limiting specifically
    if (response.status === 429) { // Too Many Requests
        const errorData = await response.json().catch(() => ({ message: '' }));
        const message = errorData.message || '';
        const waitMatch = message.match(/Wait (\d+) seconds/);
        
        if (waitMatch) {
            const waitTime = (parseInt(waitMatch[1], 10) + 1) * 1000; // Add a 1-second buffer
            console.warn(`Rate limit hit. Waiting ${waitTime / 1000} seconds before retrying...`);
            
            await new Promise(resolve => setTimeout(resolve, waitTime));
            const retryResponse = await fetch(url, options);

            if (retryResponse.ok) {
                return retryResponse;
            }
            // If retry also fails, throw an error based on the retry response
            const retryErrorData = await retryResponse.json().catch(() => ({ message: `API retry failed with status ${retryResponse.status}` }));
            throw new Error(retryErrorData.message);
        }
    }

    // Generic error handler for other non-ok responses
    const errorData = await response.json().catch(() => ({ message: `API request failed with status ${response.status}` }));
    throw new Error(errorData.message || `API request failed with status ${response.status}`);
};


// Maps API match statuses to the statuses used within the application.
const statusMap: Record<string, Match['status']> = {
  SCHEDULED: 'UPCOMING',
  TIMED: 'UPCOMING',
  IN_PLAY: 'LIVE',
  PAUSED: 'HT',
  FINISHED: 'FT',
  POSTPONED: 'POSTPONED',
  SUSPENDED: 'SUSPENDED',
  CANCELED: 'CANCELLED', // Note the API uses one 'L'
};

// Represents the expected structure of a match object from the API.
interface ApiMatch {
  id: number;
  competition: { id: number; name: string; emblem: string };
  area: { id: number; name: string; flag: string | null };
  utcDate: string;
  status: string;
  minute?: number;
  score: {
    fullTime: { home: number | null; away: number | null } | null;
    halfTime: { home: number | null; away: number | null } | null;
    regularTime: { home: number | null; away: number | null } | null;
  } | null;
  homeTeam: { id: number; name: string; crest: string };
  awayTeam: { id: number; name: string; crest: string };
  goals?: { minute: number; scorer: { name: string }; team: { id: number }; type: string }[];
  bookings?: { minute: number; player: { name: string }; team: { id: number }; card: 'YELLOW' | 'RED' }[];
}

interface ApiArea {
    id: number;
    name: string;
    code: string;
    flag: string | null;
    parentAreaId: number | null;
    parentArea: string | null;
}

interface ApiAreaDetail extends ApiArea {
    childAreas: ApiArea[];
}

interface ApiCompetition {
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


// Transforms a match object from the API into the application's Match type.
const transformApiMatch = (apiMatch: ApiMatch): Match => {
  const status = statusMap[apiMatch.status] || 'UPCOMING';
  
  let homeScore = apiMatch.score?.fullTime?.home ?? null;
  let awayScore = apiMatch.score?.fullTime?.away ?? null;

  // For live matches, fullTime score is null, so we use regularTime or halfTime.
  if (status === 'LIVE' || status === 'HT') {
      homeScore = apiMatch.score?.regularTime?.home ?? apiMatch.score?.halfTime?.home ?? null;
      awayScore = apiMatch.score?.regularTime?.away ?? apiMatch.score?.halfTime?.away ?? null;
  }
  
  return {
    id: apiMatch.id,
    homeTeam: {
      id: apiMatch.homeTeam.id,
      name: apiMatch.homeTeam.name,
      logo: apiMatch.homeTeam.crest,
    },
    awayTeam: {
      id: apiMatch.awayTeam.id,
      name: apiMatch.awayTeam.name,
      logo: apiMatch.awayTeam.crest,
    },
    homeScore,
    awayScore,
    status,
    minute: apiMatch.minute,
    date: apiMatch.utcDate,
    league: apiMatch.competition.name,
    area: apiMatch.area,
    events: [], // Detailed events are fetched separately
  };
};

export const getAreas = async (): Promise<Area[]> => {
    try {
        const requestUrl = `${API_BASE_URL}/areas`;
        const response = await apiRequest(`${PROXY_URL}${encodeURIComponent(requestUrl)}`, { headers });
        const data = await response.json();
        return data.areas.map((area: ApiArea) => ({
            id: area.id,
            name: area.name,
            code: area.code,
            flag: area.flag,
            parentAreaId: area.parentAreaId,
            parentArea: area.parentArea,
        }));
    } catch (error) {
        console.error("Error fetching areas:", error);
        throw error;
    }
};

export const getArea = async (id: number): Promise<Area> => {
    try {
        const requestUrl = `${API_BASE_URL}/areas/${id}`;
        const response = await apiRequest(`${PROXY_URL}${encodeURIComponent(requestUrl)}`, { headers });
        const data: ApiAreaDetail = await response.json();
        return {
            id: data.id,
            name: data.name,
            code: data.code,
            flag: data.flag,
            parentAreaId: data.parentAreaId,
            parentArea: data.parentArea,
            childAreas: (data.childAreas || []).map((area: ApiArea) => ({
                id: area.id,
                name: area.name,
                code: area.code,
                flag: area.flag,
                parentAreaId: area.parentAreaId,
                parentArea: area.parentArea,
            }))
        };
    } catch (error) {
        console.error(`Error fetching area ${id}:`, error);
        throw error;
    }
};

export const getAllCompetitions = async (): Promise<Competition[]> => {
    try {
        const { competitionsData } = await import('./competitionsData');
        const data = competitionsData;
        return data.competitions
            .map((comp: ApiCompetition) => ({
                id: comp.id,
                name: comp.name,
                code: comp.code,
                emblem: comp.emblem,
                area: comp.area
            }))
            .filter((comp: Competition) => comp.emblem); // Filter out competitions without an emblem for a cleaner UI
    } catch (error) {
        console.error("Error fetching all competitions:", error);
        throw error;
    }
};


export const getCompetitions = async (areaId: number): Promise<Competition[]> => {
    try {
        const requestUrl = `${API_BASE_URL}/competitions?areas=${areaId}`;
        const response = await apiRequest(`${PROXY_URL}${encodeURIComponent(requestUrl)}`, { headers });
        const data = await response.json();
        return data.competitions.map((comp: ApiCompetition) => ({
            id: comp.id,
            name: comp.name,
            code: comp.code,
            emblem: comp.emblem,
            area: comp.area,
        })).filter((comp: Competition) => comp.emblem); // Filter out competitions without an emblem for a cleaner UI
    } catch (error) {
        console.error(`Error fetching competitions for area ${areaId}:`, error);
        throw error;
    }
};


export const getMatches = async (competitionId: number): Promise<Match[]> => {
  try {
    const requestUrl = `${API_BASE_URL}/matches?competitions=${competitionId}`;
    const response = await apiRequest(`${PROXY_URL}${encodeURIComponent(requestUrl)}`, { headers });
    const data = await response.json();
    return data.matches.map(transformApiMatch);
  } catch (error) {
    console.error("Error fetching matches:", error);
    throw error;
  }
};

export const getMatchesByDate = async (date: string): Promise<Match[]> => {
    try {
        const requestUrl = `${API_BASE_URL}/matches?date=${date}`;
        const response = await apiRequest(`${PROXY_URL}${encodeURIComponent(requestUrl)}`, { headers });
        const data = await response.json();
        return data.matches.map(transformApiMatch);
    } catch (error) {
        console.error(`Error fetching matches for date ${date}:`, error);
        throw error;
    }
}

export const getStandings = async (competitionId: number): Promise<Standing[]> => {
    try {
        const requestUrl = `${API_BASE_URL}/competitions/${competitionId}/standings`;
        const response = await apiRequest(`${PROXY_URL}${encodeURIComponent(requestUrl)}`, { headers });
        const data = await response.json();
        return data.standings || [];
    } catch (error: any) {
        if (error.message && (error.message.includes('404') || error.message.includes('not found'))) {
            console.warn(`No standings found for competition ${competitionId}. This may be expected for cup competitions.`);
            return [];
        }
        console.error(`Error fetching standings for competition ${competitionId}:`, error);
        throw error;
    }
};

export const getCompetitionTeams = async (competitionId: number): Promise<CompetitionTeam[]> => {
    try {
        const requestUrl = `${API_BASE_URL}/competitions/${competitionId}/teams`;
        const response = await apiRequest(`${PROXY_URL}${encodeURIComponent(requestUrl)}`, { headers });
        const data = await response.json();
        return data.teams || [];
    } catch (error: any) {
        if (error.message && (error.message.includes('404') || error.message.includes('not found'))) {
            console.warn(`No teams found for competition ${competitionId}.`);
            return [];
        }
        console.error(`Error fetching teams for competition ${competitionId}:`, error);
        throw error;
    }
};

export const getMatchDetails = async (match: Match): Promise<Match> => {
    try {
        const requestUrl = `${API_BASE_URL}/matches/${match.id}`;
        const response = await apiRequest(`${PROXY_URL}${encodeURIComponent(requestUrl)}`, { headers });
        const apiMatch: ApiMatch = await response.json();

        const events: MatchEvent[] = [];
        (apiMatch.goals || []).forEach(goal => {
            events.push({
                minute: goal.minute,
                type: MatchEventType.GOAL,
                player: goal.scorer.name,
                teamId: goal.team.id,
                detail: goal.type === 'PENALTY' ? 'Penalty' : undefined,
            });
        });

        (apiMatch.bookings || []).forEach(booking => {
            events.push({
                minute: booking.minute,
                type: booking.card === 'YELLOW' ? MatchEventType.YELLOW_CARD : MatchEventType.RED_CARD,
                player: booking.player.name,
                teamId: booking.team.id,
            });
        });

        events.sort((a, b) => a.minute - b.minute);

        // The free API tier doesn't provide detailed stats, so we return empty stats.
        return {
            ...match,
            ...transformApiMatch(apiMatch), // Re-transform to get latest score/status
            events,
            homeStats: { possession: 0, shots: 0, shotsOnTarget: 0, corners: 0, fouls: 0 },
            awayStats: { possession: 0, shots: 0, shotsOnTarget: 0, corners: 0, fouls: 0 },
        };

    } catch (error) {
        console.error(`Error fetching details for match ${match.id}:`, error);
        return match; // Return original match on error
    }
};

export const getCompetitionScorers = async (competitionId: number): Promise<Scorer[]> => {
    try {
        const requestUrl = `${API_BASE_URL}/competitions/${competitionId}/scorers`;
        const response = await apiRequest(`${PROXY_URL}${encodeURIComponent(requestUrl)}`, { headers });
        const data = await response.json();
        return data.scorers || [];
    } catch (error: any) {
        if (error.message && (error.message.includes('404') || error.message.includes('not found'))) {
            console.warn(`No scorers data found for competition ${competitionId}.`);
            return [];
        }
        console.error(`Error fetching scorers for competition ${competitionId}:`, error);
        throw error;
    }
};

export const getTeamDetails = async (teamId: number): Promise<TeamDetail> => {
    try {
        const requestUrl = `${API_BASE_URL}/teams/${teamId}`;
        const response = await apiRequest(`${PROXY_URL}${encodeURIComponent(requestUrl)}`, { headers });
        return await response.json();
    } catch (error) {
        console.error(`Error fetching details for team ${teamId}:`, error);
        throw error;
    }
};

export const getTeamMatches = async (teamId: number): Promise<Match[]> => {
    try {
        const requestUrl = `${API_BASE_URL}/teams/${teamId}/matches`;
        const response = await apiRequest(`${PROXY_URL}${encodeURIComponent(requestUrl)}`, { headers });
        const data = await response.json();
        return (data.matches || []).map(transformApiMatch);
    } catch (error) {
        console.error(`Error fetching matches for team ${teamId}:`, error);
        throw error;
    }
};

export const getPersonDetails = async (personId: number): Promise<Person> => {
    try {
        const requestUrl = `${API_BASE_URL}/persons/${personId}`;
        const response = await apiRequest(`${PROXY_URL}${encodeURIComponent(requestUrl)}`, { headers });
        return await response.json();
    } catch (error) {
        console.error(`Error fetching details for person ${personId}:`, error);
        throw error;
    }
};


export const getMatchHead2Head = async (matchId: number): Promise<Head2Head> => {
    try {
        const requestUrl = `${API_BASE_URL}/matches/${matchId}/head2head`;
        const response = await apiRequest(`${PROXY_URL}${encodeURIComponent(requestUrl)}`, { headers });
        const data = await response.json();
        const matches = (data.matches || []).map(transformApiMatch);
        return {
            ...data,
            matches,
        };
    } catch (error) {
        console.error(`Error fetching head-to-head for match ${matchId}:`, error);
        throw error;
    }
};