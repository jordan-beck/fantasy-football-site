import { useState, useEffect } from 'react';
import { API_CONFIG } from '../constants/config';

/**
 * Custom hook to fetch and manage league data
 * Centralizes all API calls for league information
 */
export function useLeagueData() {
  const [leagueData, setLeagueData] = useState(null);
  const [rosters, setRosters] = useState(null);
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeagueData = async () => {
      try {
        setLoading(true);
        const { BASE_URL, LEAGUE_ID, ENDPOINTS } = API_CONFIG;

        // Fetch all data in parallel
        const [leagueResponse, rostersResponse, usersResponse] = await Promise.all([
          fetch(`${BASE_URL}${ENDPOINTS.LEAGUE(LEAGUE_ID)}`),
          fetch(`${BASE_URL}${ENDPOINTS.ROSTERS(LEAGUE_ID)}`),
          fetch(`${BASE_URL}${ENDPOINTS.USERS(LEAGUE_ID)}`),
        ]);

        if (!leagueResponse.ok || !rostersResponse.ok || !usersResponse.ok) {
          throw new Error('Failed to fetch league data');
        }

        const [league, rostersList, usersList] = await Promise.all([
          leagueResponse.json(),
          rostersResponse.json(),
          usersResponse.json(),
        ]);

        setLeagueData(league);
        setRosters(rostersList);
        setUsers(usersList);
        setError(null);
      } catch (err) {
        console.error('Error fetching league data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeagueData();
  }, []);

  return { leagueData, rosters, users, loading, error };
}
