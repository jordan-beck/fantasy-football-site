import { useState, useEffect } from 'react';

/**
 * Custom hook to fetch and cache NFL player data from Sleeper
 * This is a large dataset (~10MB) so we cache it in memory
 */
let cachedPlayers = null;
let fetchPromise = null;

export function useNFLPlayers() {
  const [players, setPlayers] = useState(cachedPlayers);
  const [loading, setLoading] = useState(!cachedPlayers);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If we already have cached data, use it
    if (cachedPlayers) {
      setPlayers(cachedPlayers);
      setLoading(false);
      return;
    }

    // If a fetch is already in progress, wait for it
    if (fetchPromise) {
      fetchPromise
        .then(data => {
          setPlayers(data);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
      return;
    }

    // Start a new fetch
    setLoading(true);
    fetchPromise = fetch('https://api.sleeper.app/v1/players/nfl')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch players');
        return res.json();
      })
      .then(data => {
        cachedPlayers = data;
        setPlayers(data);
        setError(null);
        return data;
      })
      .catch(err => {
        console.error('Error fetching NFL players:', err);
        setError(err.message);
        throw err;
      })
      .finally(() => {
        setLoading(false);
        fetchPromise = null;
      });

  }, []);

  return { players, loading, error };
}

/**
 * Helper function to get player name from player ID
 */
export function getPlayerName(playerId, playersData) {
  if (!playersData || !playerId) return `Player ${playerId}`;

  const player = playersData[playerId];
  if (!player) return `Player ${playerId}`;

  return `${player.first_name || ''} ${player.last_name || ''}`.trim() || `Player ${playerId}`;
}

/**
 * Helper function to get player full info (name, position, team)
 */
export function getPlayerInfo(playerId, playersData) {
  if (!playersData || !playerId) {
    return {
      name: `Player ${playerId}`,
      position: '',
      team: '',
    };
  }

  const player = playersData[playerId];
  if (!player) {
    return {
      name: `Player ${playerId}`,
      position: '',
      team: '',
    };
  }

  return {
    name: `${player.first_name || ''} ${player.last_name || ''}`.trim() || `Player ${playerId}`,
    position: player.position || '',
    team: player.team || '',
  };
}
