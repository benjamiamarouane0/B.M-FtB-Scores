import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy } from 'react';
import { Match, Area, Competition } from './types';
import { getAreas, getCompetitions, getAllCompetitions, getArea } from './services/matchService';
import Header from './components/Header';
import AreaFilter from './components/AreaFilter';
import CompetitionList from './components/CompetitionList';
import CountryList from './components/CountryList';
import { FootballIcon, BackArrowIcon } from './components/icons';
import FeaturedCompetitions from './components/FeaturedCompetitions';
import FeaturedCountries from './components/FeaturedCountries';
import MatchesView from './components/MatchesView';
import Hero from './components/Hero';
import Modal from './components/Modal';
import useTitle from './components/useTitle';

const MatchDetail = lazy(() => import('./components/MatchDetail'));
const CompetitionDetail = lazy(() => import('./components/CompetitionDetail'));
const TeamDetail = lazy(() => import('./components/TeamDetail'));
const PlayerDetail = lazy(() => import('./components/PlayerDetail'));

const App: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMessage, setLoadingMessage] = useState<string>('Loading fresh data...');
  
  const [allAreas, setAllAreas] = useState<Area[]>([]);
  const [continents, setContinents] = useState<Area[]>([]);
  const [topCountries, setTopCountries] = useState<Area[]>([]);
  const [selectedContinentId, setSelectedContinentId] = useState<number | null>(null);
  
  const [countries, setCountries] = useState<Area[]>([]);
  const [loadingCountries, setLoadingCountries] = useState<boolean>(false);
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);

  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);

  const [searchableCompetitions, setSearchableCompetitions] = useState<Competition[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchDataLoading, setIsSearchDataLoading] = useState(true);
  
  const [isMatchesView, setIsMatchesView] = useState<boolean>(true);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // SEO Title Management
  const baseTitle = 'B.M FtB Scores';
  const baseDescription = `An amazing web app for football scores, highlights, and match details. Get live updates and detailed statistics for the ultimate football fan experience with ${baseTitle}.`;
  
  let pageTitle = `${baseTitle} | Live Football Scores & Highlights`;
  let pageDescription = baseDescription;

  if (isMatchesView) {
      pageTitle = `Daily Matches | ${baseTitle}`;
      pageDescription = `See all live, upcoming, and finished football matches for any selected date.`;
  } else if (!selectedCompetition && !selectedCountryId && !selectedContinentId) {
      pageTitle = `Top Competitions | ${baseTitle}`;
      pageDescription = `Browse top football competitions and leagues from around the world.`;
  }
  useTitle(pageTitle, pageDescription);


  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        setLoadingMessage('Fetching available regions...');
        const fetchedAreas = await getAreas();
        setAllAreas(fetchedAreas);

        const worldAreaId = 2267;
        let fetchedContinents = fetchedAreas.filter(a => a.parentAreaId === worldAreaId || a.id === worldAreaId);
        
        const excludedAreas = new Set([
          'N/C America',
          'Oceania',
          'Arameans Suryoye',
          'Darfur',
          'NF-Board',
          'Occitania',
          'Padania',
          'Provence',
          'Raetia',
          'Sápmi',
          'Southern Cameroon',
          'Tamil Eelam',
          'Two Sicilies',
          'West Indies',
          'Africa',
          'Asia'
        ]);
        
        fetchedContinents = fetchedContinents.filter(a => !excludedAreas.has(a.name));
        
        const areaOrder = ['Europe', 'South America', 'World'];
        const sortedContinents = fetchedContinents.sort((a, b) => {
            const indexA = areaOrder.indexOf(a.name);
            const indexB = areaOrder.indexOf(b.name);
            if (indexA === -1 && indexB === -1) return a.name.localeCompare(b.name);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });
        setContinents(sortedContinents);
        
        const topCountryNames = ['England', 'France', 'Germany', 'Italy', 'Netherlands', 'Portugal', 'Spain', 'Brazil'];
        const filteredTopCountries = fetchedAreas.filter(a => topCountryNames.includes(a.name));
        const sortedTopCountries = filteredTopCountries.sort((a, b) => {
            return topCountryNames.indexOf(a.name) - topCountryNames.indexOf(b.name);
        });
        setTopCountries(sortedTopCountries);
        
        setLoadingMessage('Indexing all competitions for search...');
        const allComps = await getAllCompetitions();
        setSearchableCompetitions(allComps);
        setIsSearchDataLoading(false);

      } catch (e: any) {
        setError(e.message || "An unknown error occurred while fetching initial data.");
        setIsSearchDataLoading(false);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const countryIdsWithCompetitions = useMemo(() => {
    return new Set(searchableCompetitions.map(comp => comp.area.id));
  }, [searchableCompetitions]);

  useEffect(() => {
    if (selectedContinentId === null || searchQuery || isSearchDataLoading) {
       if (selectedContinentId === null) setCountries([]); // Clear countries when going back to home
      return;
    }

    const fetchCountries = async () => {
      setLoadingCountries(true);
      setError(null);
      setCountries([]);
      try {
        const continentArea = await getArea(selectedContinentId);
        const countriesWithLeagues = (continentArea.childAreas || []).filter(country => 
          countryIdsWithCompetitions.has(country.id)
        );
        const sortedCountries = countriesWithLeagues.sort((a, b) => a.name.localeCompare(b.name));
        setCountries(sortedCountries);
      } catch (e: any) {
        setError(e.message || "An unknown error occurred while fetching countries.");
        setCountries([]);
      } finally {
        setLoadingCountries(false);
      }
    };

    fetchCountries();
  }, [selectedContinentId, searchQuery, countryIdsWithCompetitions, isSearchDataLoading]);

  useEffect(() => {
    if (selectedCountryId === null || searchQuery) return;

    const fetchCompetitions = async () => {
      setLoading(true);
      setLoadingMessage('Loading competitions...');
      setError(null);
      setSelectedCompetition(null);
      try {
        const fetchedCompetitions = await getCompetitions(selectedCountryId);
        setCompetitions(fetchedCompetitions);
      } catch (e: any) {
        setError(e.message || "An unknown error occurred while fetching competitions.");
        setCompetitions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCompetitions();
  }, [selectedCountryId, searchQuery]);
  
  const handleSelectContinent = (continentId: number) => {
    setSearchQuery('');
    setSelectedContinentId(continentId);
    setSelectedCountryId(null);
    setSelectedCompetition(null);
    setSelectedMatch(null);
    setSelectedTeamId(null);
    setSelectedPlayerId(null);
    setIsMatchesView(false);
  }

  const handleSelectTopCountry = (countryId: number) => {
    setSearchQuery('');
    setSelectedCountryId(countryId);
    setSelectedContinentId(null);
    setSelectedCompetition(null);
    setSelectedMatch(null);
    setSelectedTeamId(null);
    setSelectedPlayerId(null);
    setIsMatchesView(false);
  };
  
  const handleSelectMatches = () => {
    setSearchQuery('');
    setSelectedContinentId(null);
    setSelectedCountryId(null);
    setSelectedCompetition(null);
    setSelectedMatch(null);
    setSelectedTeamId(null);
    setSelectedPlayerId(null);
    setIsMatchesView(true);
  };

  const handleGoHome = () => {
    setSearchQuery('');
    setSelectedContinentId(null);
    setSelectedCountryId(null);
    setSelectedCompetition(null);
    setSelectedMatch(null);
    setSelectedTeamId(null);
    setSelectedPlayerId(null);
    setIsMatchesView(false);
  };

  const handleSelectCountry = (country: Area) => {
    setSelectedCountryId(country.id);
  }
  
  const searchResults = useMemo(() => {
      if (!searchQuery) return [];
      return searchableCompetitions.filter(comp =>
        comp.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [searchQuery, searchableCompetitions]);

  const handleSelectFeaturedCompetition = (comp: Competition) => {
    // Reset view state for a clean navigation
    setSelectedMatch(null);
    setSelectedTeamId(null);
    setSelectedPlayerId(null);
    setIsMatchesView(false);
    setSearchQuery('');

    // For any featured competition, ensure the back button returns to the home screen
    // by not setting a parent continent or country.
    setSelectedContinentId(null);
    setSelectedCountryId(null);
    
    // Finally, select the competition to show its detail page.
    setSelectedCompetition(comp);
  };

  const renderContent = () => {
    if (error) {
       return (
          <div className="bg-red-900/50 border border-red-400 text-red-100 px-4 py-3 rounded-lg relative text-center" role="alert">
              <strong className="font-bold">Error Fetching Data</strong>
              <span className="block sm:inline ml-2">{error}</span>
          </div>
       );
    }
    
    if (selectedPlayerId) {
      return <PlayerDetail playerId={selectedPlayerId} onBack={() => setSelectedPlayerId(null)} onSelectTeam={setSelectedTeamId} />;
    }
    
    if (selectedTeamId) {
        return <TeamDetail teamId={selectedTeamId} onBack={() => setSelectedTeamId(null)} onSelectPlayer={setSelectedPlayerId} />
    }

    if (selectedMatch) {
      return <MatchDetail match={selectedMatch} onBack={() => setSelectedMatch(null)} />;
    }
    
    if (selectedCompetition) {
      return (
        <CompetitionDetail 
            competition={selectedCompetition}
            onBack={() => { setSelectedCompetition(null); setSelectedMatch(null); }}
            onSelectTeam={setSelectedTeamId}
            onSelectPlayer={setSelectedPlayerId}
            onSelectMatch={setSelectedMatch}
        />
      );
    }
    
    if (searchQuery) {
        if (searchResults.length > 0) {
            return (
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-brand-text mb-6 text-center">Search Results</h2>
                    <CompetitionList competitions={searchResults} onSelectCompetition={(comp) => {
                      const countryArea = allAreas.find(a => a.id === comp.area.id);
                      if(countryArea && countryArea.parentAreaId) {
                          setSelectedContinentId(countryArea.parentAreaId);
                      }
                      setSelectedCountryId(comp.area.id);
                      setSelectedCompetition(comp);
                      setSearchQuery('');
                    }} />
                </div>
            );
        }
        return <p className="text-center pt-16 text-brand-text-secondary">No competitions found for "{searchQuery}".</p>;
    }
    
    if (isMatchesView) {
      return <MatchesView onSelectMatch={setSelectedMatch} />;
    }

    if (selectedCountryId) {
        const country = allAreas.find(a => a.id === selectedCountryId);
        return (
            <div>
                 <div className="flex items-center mb-6">
                    <button onClick={() => { setSelectedCountryId(null); setCompetitions([]); }} className="text-brand-primary hover:text-green-300 transition-colors mr-4 p-2 rounded-full hover:bg-brand-secondary">
                        <BackArrowIcon className="w-5 h-5" />
                    </button>
                    <h2 className="text-2xl sm:text-3xl font-bold text-brand-text">
                      Competitions in {country?.name}
                    </h2>
                </div>
                {loading ? (
                     <div className="flex flex-col items-center justify-center pt-16">
                        <FootballIcon className="w-16 h-16 text-brand-primary animate-pulse" />
                        <p className="text-lg mt-4 text-brand-text-secondary">{loadingMessage}</p>
                    </div>
                ) : competitions.length > 0 ? (
                    <CompetitionList competitions={competitions} onSelectCompetition={setSelectedCompetition} />
                ) : (
                    <p className="text-center pt-16 text-brand-text-secondary">No competitions found for {country?.name}.</p>
                )}
            </div>
        );
    }

    // Home Page View (no continent or country selected)
    if (selectedContinentId === null && !isMatchesView && !selectedCountryId) {
      if (loading || isSearchDataLoading) {
          return (
              <div className="flex flex-col items-center justify-center pt-16">
                  <FootballIcon className="w-16 h-16 text-brand-primary animate-pulse" />
                  <p className="text-lg mt-4 text-brand-text-secondary">{loadingMessage}</p>
              </div>
          );
      }
      return (
          <>
            <Hero />
            <FeaturedCompetitions
                competitions={searchableCompetitions}
                onSelectCompetition={handleSelectFeaturedCompetition}
            />
          </>
      );
    }
    
    // Continent View (continent is selected)
    if (loadingCountries) {
      return (
        <div className="flex flex-col items-center justify-center pt-16">
          <FootballIcon className="w-16 h-16 text-brand-primary animate-pulse" />
          <p className="text-lg mt-4 text-brand-text-secondary">Loading countries...</p>
        </div>
      );
    }

    if (countries.length > 0) {
        const continent = continents.find(c => c.id === selectedContinentId);
        const isEurope = continent?.name === 'Europe';
        const isSouthAmerica = continent?.name === 'South America';
        
        if (isEurope) {
            const europeanFeatured = ['England', 'France', 'Germany', 'Italy', 'Netherlands', 'Portugal', 'Spain'];
            const featuredCountryNames = new Set(europeanFeatured);
            const remainingCountries = countries.filter(c => !featuredCountryNames.has(c.name));
            return (
                <div className="space-y-8">
                    <FeaturedCountries
                        countries={countries}
                        onSelectCountry={handleSelectCountry}
                        title="Best League Countries in Europe"
                        featuredNames={europeanFeatured}
                    />
                    <CountryList
                        countries={remainingCountries}
                        onSelectCountry={handleSelectCountry}
                        title="Other European Countries"
                    />
                </div>
            );
        }

        if (isSouthAmerica) {
            const southAmericanFeatured = ['Brazil', 'Argentina'];
            const featuredCountryNames = new Set(southAmericanFeatured);
            const remainingCountries = countries.filter(c => !featuredCountryNames.has(c.name));
            return (
                <div className="space-y-8">
                    <FeaturedCountries
                        countries={countries}
                        onSelectCountry={handleSelectCountry}
                        title="Best League Countries in South America"
                        featuredNames={southAmericanFeatured}
                    />
                    <CountryList
                        countries={remainingCountries}
                        onSelectCountry={handleSelectCountry}
                        title="Other South American Countries"
                    />
                </div>
            );
        }
        
        const countryListTitle = `Countries in ${continent?.name || ''}`;
        return <CountryList countries={countries} onSelectCountry={handleSelectCountry} title={countryListTitle} />;
    }

    return <p className="text-center pt-16 text-brand-text-secondary">No countries with available leagues found for the selected region.</p>;
  }

  const SuspenseFallback = () => (
      <div className="flex flex-col items-center justify-center pt-16">
        <FootballIcon className="w-16 h-16 text-brand-primary animate-spin" />
        <p className="text-lg mt-4 text-brand-text-secondary">Loading page...</p>
      </div>
  );

  return (
    <div className="min-h-screen bg-brand-background text-brand-text font-sans flex flex-col">
      <Header 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isSearchDisabled={isSearchDataLoading}
        onGoHome={handleSelectMatches}
      />
      <main className="container mx-auto p-4 max-w-5xl flex-grow">
        {!searchQuery && continents.length > 0 && 
         !selectedCompetition && !selectedMatch && !selectedTeamId && !selectedPlayerId && (
            <AreaFilter
                areas={continents}
                topCountries={topCountries}
                selectedAreaId={selectedContinentId}
                selectedCountryId={selectedCountryId}
                onSelectArea={handleSelectContinent}
                onSelectCountry={handleSelectTopCountry}
                onSelectMatches={handleSelectMatches}
                isMatchesViewActive={isMatchesView}
                onSelectTopCompetitions={handleGoHome}
                isTopCompetitionsViewActive={selectedContinentId === null && !isMatchesView && !selectedCountryId}
            />
        )}
        <Suspense fallback={<SuspenseFallback />}>
          {renderContent()}
        </Suspense>
      </main>
      <footer className="bg-brand-secondary text-center p-4 text-brand-text-secondary text-sm">
        <div className="container mx-auto max-w-5xl flex flex-col sm:flex-row justify-between items-center gap-4">
            <p>B.M FtB Scores &copy; 2024. All rights reserved.</p>
            <div className="flex items-center gap-4">
                <button onClick={() => setActiveModal('about')} className="hover:text-brand-primary transition-colors">About Us</button>
                <button onClick={() => setActiveModal('terms')} className="hover:text-brand-primary transition-colors">Terms & Conditions</button>
                <button onClick={() => setActiveModal('contact')} className="hover:text-brand-primary transition-colors">Contact Us</button>
            </div>
        </div>
      </footer>
      <Modal isOpen={activeModal === 'about'} onClose={() => setActiveModal(null)} title="About B.M FtB Scores">
        <div className="space-y-4">
            <p><strong>B.M FtB Scores</strong> is your ultimate destination for live scores, match details, and in-depth statistics from the world of football.</p>
            <p>Our passion is to bring you closer to the game you love. We provide real-time updates, comprehensive competition information, team rosters, and player details, all in one place. Whether you're tracking your favorite team or exploring leagues from around the globe, B.M FtB Scores is your front-row seat to the action.</p>
        </div>
      </Modal>
      <Modal isOpen={activeModal === 'terms'} onClose={() => setActiveModal(null)} title="Terms and Conditions">
        <div className="space-y-4 text-sm">
            <p><strong>1. Acceptance of Terms:</strong> By using B.M FtB Scores, you agree to be bound by these terms. If you do not agree, please do not use the service.</p>
            <p><strong>2. Service Description:</strong> The app provides football-related data, including scores and statistics for informational and entertainment purposes only. While we strive for accuracy, we do not guarantee the correctness or timeliness of the data.</p>
            <p><strong>3. Data Source:</strong> All match data, team information, and logos are provided by a third-party data service. The data is for personal, non-commercial use only. While we strive for accuracy, we do not guarantee the correctness or timeliness of the data provided by our sources.</p>
            <p><strong>4. User Conduct:</strong> You agree not to use the service for any unlawful purpose or to disrupt the service in any way.</p>
            <p><strong>5. Limitation of Liability:</strong> B.M FtB Scores is provided "as is" without any warranties. We are not liable for any damages arising from your use of the service.</p>
            <p><strong>6. Changes to Terms:</strong> We reserve the right to modify these terms at any time. Your continued use of the app constitutes acceptance of the new terms.</p>
        </div>
      </Modal>
       <Modal isOpen={activeModal === 'contact'} onClose={() => setActiveModal(null)} title="Contact Us">
        <div className="space-y-4">
            <p>Have questions, feedback, or want to connect? We'd love to hear from you!</p>
            <div className="space-y-3 pt-2">
                <div>
                    <p className="font-semibold text-brand-text">Email:</p>
                    <a href="mailto:benjamiamarouane0@gmail.com" className="text-blue-400 hover:underline">benjamiamarouane0@gmail.com</a>
                </div>
                <div>
                    <p className="font-semibold text-brand-text">LinkedIn:</p>
                    <a href="https://linkedin.com/in/b-marouane-5aaa4a31b" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">linkedin.com/in/b-marouane-5aaa4a31b</a>
                </div>
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default App;