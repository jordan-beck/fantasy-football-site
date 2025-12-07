import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useTheme } from './contexts/ThemeContext';
import { useLeagueData } from './hooks/useLeagueData';
import { useTransactions } from './hooks/useTransactions';
import { useNFLPlayers } from './hooks/useNFLPlayers';
import Layout from './components/Layout';
import Home from './components/Home';
import Standings from './components/Standings';
import Matchups from './components/Matchups';
import Transactions from './components/Transactions';
import LeagueDetails from './components/LeagueDetails';
import ChampionWidget from './components/ChampionWidget';
import RecentTransactions from './components/RecentTransactions';
import ScrollToTop from './components/ScrollToTop';
import './App.css';

/**
 * Main App Component
 * Handles routing and data fetching for the fantasy football application
 */
function App() {
  const { theme } = useTheme();
  const { leagueData, rosters, users, loading, error } = useLeagueData();
  const { players: nflPlayers } = useNFLPlayers();

  // Fetch transactions using the current week from league data
  const currentWeek = leagueData?.settings?.leg || 1;
  const { transactions, loading: transactionsLoading } = useTransactions(
    leagueData?.league_id,
    currentWeek,
    users,
    rosters,
    nflPlayers
  );

  // Loading state
  if (loading) {
    return (
      <div
        style={{
          padding: '40px',
          textAlign: 'center',
          color: theme.text.primary,
          fontSize: '18px',
        }}
      >
        Loading...
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        style={{
          padding: '40px',
          textAlign: 'center',
          color: theme.status.error,
          fontSize: '18px',
        }}
      >
        Error loading league data: {error}
      </div>
    );
  }

  // Main app with routing

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={
            <Layout leagueData={leagueData}>
              <ChampionWidget currentLeagueId={leagueData.league_id} />
              <RecentTransactions transactions={transactions} />
            </Layout>
          }
        >
          <Route
            index
            element={<Home leagueData={leagueData} rosters={rosters} users={users} />}
          />
          <Route
            path="matchups"
            element={
              <Matchups
                rosters={rosters}
                users={users}
                currentWeek={leagueData.settings.leg}
              />
            }
          />
          <Route
            path="standings"
            element={<Standings rosters={rosters} users={users} />}
          />
          <Route
            path="transactions"
            element={<Transactions transactions={transactions} />}
          />
          <Route
            path="league-details"
            element={
              <LeagueDetails
                leagueData={leagueData}
                rosters={rosters}
                users={users}
                nflPlayers={nflPlayers}
              />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
