import { useState, useEffect } from 'react';
import { API_CONFIG, LEAGUE_CONFIG } from '../constants/config';
import { getPlayerName, getPlayerInfo } from './useNFLPlayers';

/**
 * Custom hook to fetch and format league transactions from Sleeper API
 * Fetches transactions for all weeks and combines them into a single sorted list
 */
export function useTransactions(leagueId, currentWeek, users = [], rosters = [], playersData = null) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!leagueId || !currentWeek) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { BASE_URL, ENDPOINTS } = API_CONFIG;

        // Fetch transactions for all weeks up to current week
        const weekPromises = [];
        for (let week = 1; week <= currentWeek; week++) {
          weekPromises.push(
            fetch(`${BASE_URL}${ENDPOINTS.TRANSACTIONS(leagueId, week)}`)
              .then(res => res.ok ? res.json() : [])
              .catch(() => [])
          );
        }

        const weeklyTransactions = await Promise.all(weekPromises);

        // Create roster ID to team name mapping
        const rosterIdToTeamName = createTeamNameMapping(rosters, users);

        // Flatten and format all transactions
        const allTransactions = weeklyTransactions
          .flat()
          .map(tx => formatTransaction(tx, rosterIdToTeamName, playersData))
          .filter(t => t !== null)
          .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date, newest first

        setTransactions(allTransactions);
        setError(null);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [leagueId, currentWeek, users, rosters, playersData]);

  return { transactions, loading, error };
}

/**
 * Create a mapping from roster ID to team name
 */
function createTeamNameMapping(rosters, users) {
  const mapping = {};

  if (!rosters || !users) return mapping;

  rosters.forEach(roster => {
    const user = users.find(u => u.user_id === roster.owner_id);
    const teamName = user?.metadata?.team_name || user?.display_name || `Team ${roster.roster_id}`;
    mapping[roster.roster_id] = teamName;
  });

  return mapping;
}

/**
 * Format a Sleeper transaction into our app's transaction format
 */
function formatTransaction(sleeperTransaction, teamNameMapping = {}, playersData = null) {
  if (!sleeperTransaction) return null;

  const { type, status, creator, created, metadata, roster_ids, settings, adds, drops, waiver_budget } = sleeperTransaction;

  // Skip failed transactions
  if (status !== 'complete') return null;

  // Get transaction timestamp
  const date = new Date(created).toISOString();

  // Helper to get team name from roster ID
  const getTeamName = (rosterId) => teamNameMapping[rosterId] || `Team ${rosterId}`;

  // Format based on transaction type
  switch (type) {
    case 'trade': {
      return {
        type: 'trade',
        team: getTeamName(roster_ids?.[0]),
        description: formatTradeDescription(adds, roster_ids, teamNameMapping, playersData),
        date,
        metadata: sleeperTransaction,
      };
    }

    case 'waiver': {
      const playerAdded = adds ? Object.keys(adds)[0] : null;
      const playerDropped = drops ? Object.keys(drops)[0] : null;
      const rosterIdAdding = adds ? adds[playerAdded] : null;
      const waiverBid = settings?.waiver_bid;

      return {
        type: 'waiver',
        team: getTeamName(rosterIdAdding),
        description: formatWaiverDescription(playerAdded, playerDropped, waiverBid, playersData),
        date,
        metadata: sleeperTransaction,
      };
    }

    case 'free_agent': {
      const playerAdded = adds ? Object.keys(adds)[0] : null;
      const playerDropped = drops ? Object.keys(drops)[0] : null;
      const rosterIdAdding = adds ? adds[playerAdded] : null;

      if (playerAdded && playerDropped) {
        return {
          type: 'add',
          team: getTeamName(rosterIdAdding),
          description: `Added ${formatPlayerInfo(playerAdded, playersData)}, dropped ${formatPlayerInfo(playerDropped, playersData)}`,
          date,
          metadata: sleeperTransaction,
        };
      } else if (playerAdded) {
        return {
          type: 'add',
          team: getTeamName(rosterIdAdding),
          description: `Added ${formatPlayerInfo(playerAdded, playersData)}`,
          date,
          metadata: sleeperTransaction,
        };
      } else if (playerDropped) {
        const rosterIdDropping = drops ? drops[playerDropped] : null;
        return {
          type: 'drop',
          team: getTeamName(rosterIdDropping),
          description: `Dropped ${formatPlayerInfo(playerDropped, playersData)}`,
          date,
          metadata: sleeperTransaction,
        };
      }
      break;
    }

    default:
      return null;
  }

  return null;
}

/**
 * Format player info with position and team
 */
function formatPlayerInfo(playerId, playersData) {
  const playerInfo = getPlayerInfo(playerId, playersData);
  const { name, position, team } = playerInfo;

  if (position && team) {
    return `${name} (${position}, ${team})`;
  } else if (position) {
    return `${name} (${position})`;
  }
  return name;
}

/**
 * Format trade description from adds and roster_ids
 */
function formatTradeDescription(adds, roster_ids, teamNameMapping = {}, playersData = null) {
  if (!adds || !roster_ids) return 'Trade completed';

  const playerIds = Object.keys(adds);
  const playerCount = playerIds.length;
  const teamNames = roster_ids.map(id => teamNameMapping[id] || `Team ${id}`);

  // Get player names with position and team info
  const playerNames = playerIds.map(id => formatPlayerInfo(id, playersData));

  if (teamNames.length === 2) {
    if (playerCount <= 3) {
      return `Trade with ${teamNames[1]}: ${playerNames.join(', ')}`;
    }
    return `Trade with ${teamNames[1]} involving ${playerCount} players`;
  }

  return `Trade involving ${playerCount} player${playerCount > 1 ? 's' : ''} between ${roster_ids.length} teams`;
}

/**
 * Format waiver description
 */
function formatWaiverDescription(playerAdded, playerDropped, waiverBid, playersData = null) {
  const addedPlayerInfo = formatPlayerInfo(playerAdded, playersData);
  let description = `Claimed ${addedPlayerInfo}`;

  if (playerDropped) {
    const droppedPlayerInfo = formatPlayerInfo(playerDropped, playersData);
    description += `, dropped ${droppedPlayerInfo}`;
  }

  if (waiverBid !== undefined && waiverBid !== null) {
    description += ` - FAAB: $${waiverBid}`;
  }

  return description;
}
