import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useTheme } from './contexts/ThemeContext';
import { useLeagueData } from './hooks/useLeagueData';
import Layout from './components/Layout';
import Home from './components/Home';
import Standings from './components/Standings';
import Matchups from './components/Matchups';
import ChampionWidget from './components/ChampionWidget';
import './App.css';

/**
 * Main App Component
 * Handles routing and data fetching for the fantasy football application
 */
function App() {
  const { theme } = useTheme();
  const { leagueData, rosters, users, loading, error } = useLeagueData();

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
      <Routes>
        <Route
          path="/"
          element={
            <Layout leagueData={leagueData}>
              <ChampionWidget currentLeagueId={leagueData.league_id} />
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
