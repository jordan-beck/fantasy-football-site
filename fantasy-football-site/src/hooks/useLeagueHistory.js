import { useState, useEffect } from 'react';
import { API_CONFIG } from '../constants/config';

/**
 * Custom hook to fetch league history including draft and previous season data
 */
export function useLeagueHistory(leagueId) {
  const [drafts, setDrafts] = useState([]);
  const [previousSeasons, setPreviousSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeagueHistory = async () => {
      if (!leagueId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { BASE_URL } = API_CONFIG;

        // Fetch current league data to get draft IDs and previous league ID
        const leagueResponse = await fetch(`${BASE_URL}/league/${leagueId}`);
        const leagueData = await leagueResponse.json();

        // Fetch all drafts for this league
        const draftIds = [leagueData.draft_id, ...(leagueData.metadata?.latest_league_winner_roster_id ? [] : [])];
        const draftPromises = draftIds.filter(Boolean).map(async draftId => {
          try {
            const draftRes = await fetch(`${BASE_URL}/draft/${draftId}`);
            if (!draftRes.ok) return null;
            const draftData = await draftRes.json();

            // Fetch draft picks for this draft
            const picksRes = await fetch(`${BASE_URL}/draft/${draftId}/picks`);
            const picks = picksRes.ok ? await picksRes.json() : [];

            return { ...draftData, picks };
          } catch (err) {
            return null;
          }
        });

        const draftsData = (await Promise.all(draftPromises)).filter(Boolean);
        setDrafts(draftsData);

        // Fetch previous seasons recursively
        const previousSeasonsData = [];
        let prevLeagueId = leagueData.previous_league_id;
        let depth = 0;
        const maxDepth = 5; // Limit to prevent infinite loops

        while (prevLeagueId && depth < maxDepth) {
          try {
            const prevLeagueResponse = await fetch(`${BASE_URL}/league/${prevLeagueId}`);
            if (!prevLeagueResponse.ok) break;

            const prevLeagueData = await prevLeagueResponse.json();

            // Fetch previous season rosters for standings
            const prevRostersResponse = await fetch(`${BASE_URL}/league/${prevLeagueId}/rosters`);
            const prevRosters = prevRostersResponse.ok ? await prevRostersResponse.json() : [];

            // Fetch previous season users
            const prevUsersResponse = await fetch(`${BASE_URL}/league/${prevLeagueId}/users`);
            const prevUsers = prevUsersResponse.ok ? await prevUsersResponse.json() : [];

            // Fetch previous season draft data
            let prevDraft = null;
            if (prevLeagueData.draft_id) {
              try {
                const draftRes = await fetch(`${BASE_URL}/draft/${prevLeagueData.draft_id}`);
                if (draftRes.ok) {
                  const draftData = await draftRes.json();

                  // Fetch draft picks (only first 3 rounds for previous seasons to keep it concise)
                  const picksRes = await fetch(`${BASE_URL}/draft/${prevLeagueData.draft_id}/picks`);
                  const allPicks = picksRes.ok ? await picksRes.json() : [];
                  const picks = allPicks.filter(pick => pick.round <= 3); // Only first 3 rounds

                  prevDraft = { ...draftData, picks };
                }
              } catch (err) {
                console.error('Error fetching previous season draft:', err);
              }
            }

            previousSeasonsData.push({
              league: prevLeagueData,
              rosters: prevRosters,
              users: prevUsers,
              draft: prevDraft,
            });

            prevLeagueId = prevLeagueData.previous_league_id;
            depth++;
          } catch (err) {
            console.error('Error fetching previous season:', err);
            break;
          }
        }

        setPreviousSeasons(previousSeasonsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching league history:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeagueHistory();
  }, [leagueId]);

  return { drafts, previousSeasons, loading, error };
}

/**
 * Custom hook to fetch all matchup data for records calculation
 * Fetches matchups from current season AND all previous seasons
 */
export function useMatchupHistory(leagueId, previousSeasons = [], totalWeeks = 18) {
  const [matchups, setMatchups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMatchupHistory = async () => {
      if (!leagueId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { BASE_URL, ENDPOINTS } = API_CONFIG;

        // Fetch current season's league data to get the season year
        const currentLeagueResponse = await fetch(`${BASE_URL}/league/${leagueId}`);
        const currentLeagueData = await currentLeagueResponse.json();
        const currentSeason = currentLeagueData.season;

        // Function to fetch matchups for a specific league
        const fetchLeagueMatchups = async (leagueIdToFetch, seasonYear) => {
          const weekPromises = [];
          for (let week = 1; week <= totalWeeks; week++) {
            weekPromises.push(
              fetch(`${BASE_URL}${ENDPOINTS.MATCHUPS(leagueIdToFetch, week)}`)
                .then(res => res.ok ? res.json() : [])
                .catch(() => [])
            );
          }

          const weeklyMatchups = await Promise.all(weekPromises);
          return weeklyMatchups.map((weekData, idx) => ({
            week: idx + 1,
            season: seasonYear,
            matchups: weekData,
          }));
        };

        // Fetch current season matchups
        const currentMatchups = await fetchLeagueMatchups(leagueId, currentSeason);

        // Fetch previous seasons matchups
        const previousMatchupsPromises = previousSeasons.map(season =>
          fetchLeagueMatchups(season.league.league_id, season.league.season)
        );

        const previousMatchupsArrays = await Promise.all(previousMatchupsPromises);

        // Combine all matchups (current + all previous seasons)
        const allMatchups = [
          ...currentMatchups,
          ...previousMatchupsArrays.flat(),
        ];

        setMatchups(allMatchups);
        setError(null);
      } catch (err) {
        console.error('Error fetching matchup history:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMatchupHistory();
  }, [leagueId, previousSeasons, totalWeeks]);

  return { matchups, loading, error };
}

/**
 * Calculate records from matchup data across all seasons
 * @param {Array} matchups - Array of matchup data with season info
 * @param {Array} allSeasonsData - Array containing current rosters/users and previous seasons data
 * @param {string} currentSeason - Current season year to exclude from low records
 */
export function calculateRecords(matchups, allSeasonsData, currentSeason) {
  const records = {
    highestSingleWeek: [],
    lowestSingleWeek: [],
    highestSeasonPoints: [],
    lowestSeasonPoints: [],
    allTimeStats: {},
  };

  if (!matchups || matchups.length === 0) {
    return records;
  }

  // Build team name mappings for all seasons
  const getTeamNameForSeason = (rosterId, season) => {
    // Find the right season's data
    const seasonData = allSeasonsData.find(s => s.season === season);
    if (!seasonData) return `Team ${rosterId}`;

    const roster = seasonData.rosters?.find(r => r.roster_id === rosterId);
    if (!roster) return `Team ${rosterId}`;

    const user = seasonData.users?.find(u => u.user_id === roster.owner_id);
    return user?.metadata?.team_name || user?.display_name || `Team ${rosterId}`;
  };

  // Track season points for each roster per season
  const seasonPoints = {}; // key: "season-rosterId"
  const allWeekScores = [];

  // Process all matchups
  matchups.forEach(({ week, season, matchups: weekMatchups }) => {
    if (!weekMatchups) return;

    weekMatchups.forEach(matchup => {
      const rosterId = matchup.roster_id;
      const points = matchup.points || 0;

      // Skip if no points (incomplete week)
      if (points === 0) return;

      const seasonKey = `${season}-${rosterId}`;
      const teamName = getTeamNameForSeason(rosterId, season);

      // Track season totals
      if (!seasonPoints[seasonKey]) {
        seasonPoints[seasonKey] = {
          season,
          rosterId,
          teamName,
          total: 0,
          weeks: 0,
        };
      }
      seasonPoints[seasonKey].total += points;
      seasonPoints[seasonKey].weeks++;

      // Track all week scores for high/low records
      allWeekScores.push({
        rosterId,
        teamName,
        week,
        season,
        points,
      });
    });
  });

  // Sort week scores
  const sortedByPoints = [...allWeekScores].sort((a, b) => b.points - a.points);

  // Get top 10 highest single week scores
  records.highestSingleWeek = sortedByPoints.slice(0, 10).map(score => ({
    team: score.teamName,
    week: score.week,
    season: score.season,
    points: score.points.toFixed(2),
  }));

  // Get top 10 lowest single week scores (filter out zeros AND current season)
  records.lowestSingleWeek = sortedByPoints
    .filter(score => score.points > 0 && score.season !== currentSeason)
    .slice(-10)
    .reverse()
    .map(score => ({
      team: score.teamName,
      week: score.week,
      season: score.season,
      points: score.points.toFixed(2),
    }));

  // Calculate highest/lowest season points
  const seasonPointsArray = Object.values(seasonPoints);

  records.highestSeasonPoints = seasonPointsArray
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)
    .map(team => ({
      team: team.teamName,
      season: team.season,
      points: team.total.toFixed(2),
      average: (team.total / team.weeks).toFixed(2),
    }));

  // Lowest season points - exclude current season
  records.lowestSeasonPoints = seasonPointsArray
    .filter(team => team.season !== currentSeason)
    .sort((a, b) => a.total - b.total)
    .slice(0, 10)
    .map(team => ({
      team: team.teamName,
      season: team.season,
      points: team.total.toFixed(2),
      average: (team.total / team.weeks).toFixed(2),
    }));

  // All-time stats
  records.allTimeStats = {
    totalGamesPlayed: allWeekScores.length,
    averageScore: (allWeekScores.reduce((sum, s) => sum + s.points, 0) / allWeekScores.length).toFixed(2),
    highestScore: sortedByPoints[0],
    lowestScore: sortedByPoints.filter(s => s.season !== currentSeason)[sortedByPoints.length - 1],
  };

  return records;
}
