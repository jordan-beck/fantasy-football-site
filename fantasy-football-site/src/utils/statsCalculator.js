/**
 * Comprehensive stats calculator for fantasy football league
 * Processes matchup data across all seasons to generate detailed statistics
 */

/**
 * Calculate comprehensive all-time statistics from matchup data
 * @param {Array} matchups - Array of matchup data with season info
 * @param {Array} allSeasonsData - Array containing current rosters/users and previous seasons data
 * @param {string} currentSeason - Current season year
 * @param {Array} rosters - Current season rosters
 * @param {Array} previousSeasons - Previous season data
 */
export function calculateAllTimeStats(matchups, allSeasonsData, currentSeason, rosters, previousSeasons) {
  const stats = {
    scoringExtremes: {},
    consistency: {},
    domination: {},
    seasonRecords: {},
    weekly: {},
    managerRecords: {},
    funStats: {},
  };

  if (!matchups || matchups.length === 0) {
    return stats;
  }

  // Helper to get team name for a roster in a specific season
  const getTeamNameForSeason = (rosterId, season) => {
    const seasonData = allSeasonsData.find(s => s.season === season);
    if (!seasonData) return `Team ${rosterId}`;

    const roster = seasonData.rosters?.find(r => r.roster_id === rosterId);
    if (!roster) return `Team ${rosterId}`;

    const user = seasonData.users?.find(u => u.user_id === roster.owner_id);
    return user?.metadata?.team_name || user?.display_name || `Team ${rosterId}`;
  };

  // Helper to get manager name for a roster in a specific season
  const getManagerNameForSeason = (rosterId, season) => {
    const seasonData = allSeasonsData.find(s => s.season === season);
    if (!seasonData) return null;

    const roster = seasonData.rosters?.find(r => r.roster_id === rosterId);
    if (!roster) return null;

    const user = seasonData.users?.find(u => u.user_id === roster.owner_id);
    return user?.display_name || null;
  };

  // Helper to get user ID for a roster
  const getUserIdForRoster = (rosterId, season) => {
    const seasonData = allSeasonsData.find(s => s.season === season);
    if (!seasonData) return null;
    const roster = seasonData.rosters?.find(r => r.roster_id === rosterId);
    return roster?.owner_id || null;
  };

  // Build matchup pairings for head-to-head analysis
  const allMatchupPairings = [];
  const weeklyScores = [];
  const teamSeasonData = {}; // key: "season-rosterId"

  matchups.forEach(({ week, season, matchups: weekMatchups }) => {
    if (!weekMatchups || weekMatchups.length === 0) return;

    // Group by matchup_id to get pairings
    const matchupGroups = {};
    weekMatchups.forEach(matchup => {
      const rosterId = matchup.roster_id;
      const points = matchup.points || 0;

      if (points === 0) return; // Skip incomplete weeks

      if (!matchupGroups[matchup.matchup_id]) {
        matchupGroups[matchup.matchup_id] = [];
      }
      matchupGroups[matchup.matchup_id].push(matchup);

      // Track weekly scores
      weeklyScores.push({
        rosterId,
        teamName: getTeamNameForSeason(rosterId, season),
        managerName: getManagerNameForSeason(rosterId, season),
        userId: getUserIdForRoster(rosterId, season),
        week,
        season,
        points,
      });

      // Track season data
      const seasonKey = `${season}-${rosterId}`;
      if (!teamSeasonData[seasonKey]) {
        const seasonData = allSeasonsData.find(s => s.season === season);
        const roster = seasonData?.rosters?.find(r => r.roster_id === rosterId);
        teamSeasonData[seasonKey] = {
          season,
          rosterId,
          teamName: getTeamNameForSeason(rosterId, season),
          managerName: getManagerNameForSeason(rosterId, season),
          userId: getUserIdForRoster(rosterId, season),
          scores: [],
          wins: roster?.settings?.wins || 0,
          losses: roster?.settings?.losses || 0,
          ties: roster?.settings?.ties || 0,
          totalPoints: 0,
        };
      }
      teamSeasonData[seasonKey].scores.push(points);
      teamSeasonData[seasonKey].totalPoints += points;
    });

    // Create matchup pairings
    Object.values(matchupGroups).forEach(teams => {
      if (teams.length === 2) {
        const [team1, team2] = teams;
        const winner = team1.points > team2.points ? team1 : team2;
        const loser = team1.points > team2.points ? team2 : team1;
        const margin = Math.abs(team1.points - team2.points);

        allMatchupPairings.push({
          week,
          season,
          team1: {
            rosterId: team1.roster_id,
            teamName: getTeamNameForSeason(team1.roster_id, season),
            points: team1.points,
          },
          team2: {
            rosterId: team2.roster_id,
            teamName: getTeamNameForSeason(team2.roster_id, season),
            points: team2.points,
          },
          winner: {
            rosterId: winner.roster_id,
            teamName: getTeamNameForSeason(winner.roster_id, season),
            points: winner.points,
          },
          loser: {
            rosterId: loser.roster_id,
            teamName: getTeamNameForSeason(loser.roster_id, season),
            points: loser.points,
          },
          margin,
        });
      }
    });
  });

  // ===========================
  // SCORING EXTREMES
  // ===========================

  const sortedByPoints = [...weeklyScores].sort((a, b) => b.points - a.points);

  stats.scoringExtremes.highestScore = sortedByPoints[0] ? {
    team: sortedByPoints[0].teamName,
    points: sortedByPoints[0].points.toFixed(2),
    week: sortedByPoints[0].week,
    season: sortedByPoints[0].season,
  } : null;

  const nonCurrentSeasonScores = sortedByPoints.filter(s => s.season !== currentSeason && s.week !== 18);
  stats.scoringExtremes.lowestScore = nonCurrentSeasonScores[nonCurrentSeasonScores.length - 1] ? {
    team: nonCurrentSeasonScores[nonCurrentSeasonScores.length - 1].teamName,
    points: nonCurrentSeasonScores[nonCurrentSeasonScores.length - 1].points.toFixed(2),
    week: nonCurrentSeasonScores[nonCurrentSeasonScores.length - 1].week,
    season: nonCurrentSeasonScores[nonCurrentSeasonScores.length - 1].season,
  } : null;

  // Biggest blowout
  const sortedByMargin = [...allMatchupPairings].sort((a, b) => b.margin - a.margin);
  stats.scoringExtremes.biggestBlowout = sortedByMargin[0] ? {
    winner: sortedByMargin[0].winner.teamName,
    winnerPoints: sortedByMargin[0].winner.points.toFixed(2),
    loser: sortedByMargin[0].loser.teamName,
    loserPoints: sortedByMargin[0].loser.points.toFixed(2),
    margin: sortedByMargin[0].margin.toFixed(2),
    week: sortedByMargin[0].week,
    season: sortedByMargin[0].season,
  } : null;

  // Closest game
  const closestGame = [...allMatchupPairings].sort((a, b) => a.margin - b.margin)[0];
  stats.scoringExtremes.closestGame = closestGame ? {
    team1: closestGame.team1.teamName,
    team1Points: closestGame.team1.points.toFixed(2),
    team2: closestGame.team2.teamName,
    team2Points: closestGame.team2.points.toFixed(2),
    margin: closestGame.margin.toFixed(2),
    week: closestGame.week,
    season: closestGame.season,
  } : null;

  // Most points in a loss & fewest in a win
  const losingSores = allMatchupPairings.map(m => ({
    team: m.loser.teamName,
    points: m.loser.points,
    week: m.week,
    season: m.season,
  })).sort((a, b) => b.points - a.points);

  stats.scoringExtremes.mostPointsInLoss = losingSores[0] ? {
    team: losingSores[0].team,
    points: losingSores[0].points.toFixed(2),
    week: losingSores[0].week,
    season: losingSores[0].season,
  } : null;

  const winningScores = allMatchupPairings
    .filter(m => m.season !== currentSeason) // Exclude current season
    .map(m => ({
      team: m.winner.teamName,
      points: m.winner.points,
      week: m.week,
      season: m.season,
    }))
    .sort((a, b) => a.points - b.points);

  stats.scoringExtremes.fewestPointsInWin = winningScores[0] ? {
    team: winningScores[0].team,
    points: winningScores[0].points.toFixed(2),
    week: winningScores[0].week,
    season: winningScores[0].season,
  } : null;

  // ===========================
  // CONSISTENCY & AVERAGES
  // ===========================

  stats.consistency.totalGamesPlayed = weeklyScores.length;
  stats.consistency.leagueAverageScore = weeklyScores.length > 0
    ? (weeklyScores.reduce((sum, s) => sum + s.points, 0) / weeklyScores.length).toFixed(2)
    : '0.00';
  stats.consistency.totalPointsScored = weeklyScores.reduce((sum, s) => sum + s.points, 0).toFixed(2);

  // ===========================
  // DOMINATION STATS
  // ===========================

  // Calculate win/loss streaks for each team-season
  const streaks = [];
  Object.values(teamSeasonData).forEach(team => {
    // Get all matchups for this team in chronological order
    const teamMatchups = allMatchupPairings
      .filter(m =>
        (m.team1.rosterId === team.rosterId || m.team2.rosterId === team.rosterId) &&
        m.season === team.season
      )
      .sort((a, b) => a.week - b.week);

    let currentWinStreak = 0;
    let currentLossStreak = 0;
    let maxWinStreak = 0;
    let maxLossStreak = 0;
    let winStreakWeeks = [];
    let lossStreakWeeks = [];
    let maxWinStreakWeeks = [];
    let maxLossStreakWeeks = [];

    teamMatchups.forEach(matchup => {
      const isWinner = matchup.winner.rosterId === team.rosterId;

      if (isWinner) {
        currentWinStreak++;
        winStreakWeeks.push(matchup.week);
        currentLossStreak = 0;
        lossStreakWeeks = [];

        if (currentWinStreak > maxWinStreak) {
          maxWinStreak = currentWinStreak;
          maxWinStreakWeeks = [...winStreakWeeks];
        }
      } else {
        currentLossStreak++;
        lossStreakWeeks.push(matchup.week);
        currentWinStreak = 0;
        winStreakWeeks = [];

        if (currentLossStreak > maxLossStreak) {
          maxLossStreak = currentLossStreak;
          maxLossStreakWeeks = [...lossStreakWeeks];
        }
      }
    });

    if (maxWinStreak > 0) {
      streaks.push({
        type: 'win',
        teamName: team.teamName,
        season: team.season,
        streak: maxWinStreak,
        weeks: maxWinStreakWeeks,
      });
    }

    if (maxLossStreak > 0) {
      streaks.push({
        type: 'loss',
        teamName: team.teamName,
        season: team.season,
        streak: maxLossStreak,
        weeks: maxLossStreakWeeks,
      });
    }
  });

  const winStreaks = streaks.filter(s => s.type === 'win').sort((a, b) => b.streak - a.streak);
  stats.domination.longestWinStreak = winStreaks[0] ? {
    team: winStreaks[0].teamName,
    streak: winStreaks[0].streak,
    season: winStreaks[0].season,
    weeks: `Weeks ${winStreaks[0].weeks[0]}-${winStreaks[0].weeks[winStreaks[0].weeks.length - 1]}`,
  } : null;

  const lossStreaks = streaks.filter(s => s.type === 'loss').sort((a, b) => b.streak - a.streak);
  stats.domination.longestLosingStreak = lossStreaks[0] ? {
    team: lossStreaks[0].teamName,
    streak: lossStreaks[0].streak,
    season: lossStreaks[0].season,
    weeks: `Weeks ${lossStreaks[0].weeks[0]}-${lossStreaks[0].weeks[lossStreaks[0].weeks.length - 1]}`,
  } : null;

  // ===========================
  // SEASON RECORDS
  // ===========================

  const seasonRecords = Object.values(teamSeasonData)
    .filter(team => team.season !== currentSeason) // Only completed seasons
    .map(team => ({
      teamName: team.teamName,
      season: team.season,
      wins: team.wins,
      losses: team.losses,
      ties: team.ties,
      totalPoints: team.totalPoints,
      gamesPlayed: team.wins + team.losses + team.ties,
      winPct: team.wins / (team.wins + team.losses + team.ties),
    }));

  // Best record by win percentage
  const bestRecord = [...seasonRecords].sort((a, b) => b.winPct - a.winPct)[0];
  stats.seasonRecords.bestRecord = bestRecord ? {
    team: bestRecord.teamName,
    season: bestRecord.season,
    record: `${bestRecord.wins}-${bestRecord.losses}${bestRecord.ties > 0 ? `-${bestRecord.ties}` : ''}`,
    winPct: (bestRecord.winPct * 100).toFixed(1),
  } : null;

  // Worst record
  const worstRecord = [...seasonRecords].sort((a, b) => a.winPct - b.winPct)[0];
  stats.seasonRecords.worstRecord = worstRecord ? {
    team: worstRecord.teamName,
    season: worstRecord.season,
    record: `${worstRecord.wins}-${worstRecord.losses}${worstRecord.ties > 0 ? `-${worstRecord.ties}` : ''}`,
    winPct: (worstRecord.winPct * 100).toFixed(1),
  } : null;

  // Most points in a season
  const mostPoints = [...seasonRecords].sort((a, b) => b.totalPoints - a.totalPoints)[0];
  stats.seasonRecords.mostPointsSeason = mostPoints ? {
    team: mostPoints.teamName,
    season: mostPoints.season,
    points: mostPoints.totalPoints.toFixed(2),
    average: (mostPoints.totalPoints / mostPoints.gamesPlayed).toFixed(2),
  } : null;

  // Fewest points in a season
  const fewestPoints = [...seasonRecords].sort((a, b) => a.totalPoints - b.totalPoints)[0];
  stats.seasonRecords.fewestPointsSeason = fewestPoints ? {
    team: fewestPoints.teamName,
    season: fewestPoints.season,
    points: fewestPoints.totalPoints.toFixed(2),
    average: (fewestPoints.totalPoints / fewestPoints.gamesPlayed).toFixed(2),
  } : null;

  // ===========================
  // WEEKLY SUPERLATIVES
  // ===========================

  // Count 150+ point weeks per team
  const high150Counts = {};
  const sub100Counts = {};

  weeklyScores.forEach(score => {
    const key = `${score.teamName}-${score.season}`;

    if (score.points >= 150) {
      high150Counts[key] = (high150Counts[key] || 0) + 1;
    }

    if (score.points < 100) {
      sub100Counts[key] = (sub100Counts[key] || 0) + 1;
    }
  });

  const most150s = Object.entries(high150Counts)
    .map(([key, count]) => {
      const [teamName, season] = key.split('-');
      return { teamName, season, count };
    })
    .sort((a, b) => b.count - a.count)[0];

  stats.weekly.most150PointWeeks = most150s ? {
    team: most150s.teamName,
    season: most150s.season,
    count: most150s.count,
  } : null;

  const mostSub100s = Object.entries(sub100Counts)
    .map(([key, count]) => {
      const [teamName, season] = key.split('-');
      return { teamName, season, count };
    })
    .sort((a, b) => b.count - a.count)[0];

  stats.weekly.mostSub100Weeks = mostSub100s ? {
    team: mostSub100s.teamName,
    season: mostSub100s.season,
    count: mostSub100s.count,
  } : null;

  // ===========================
  // MANAGER RECORDS
  // ===========================

  // Aggregate stats by manager (userId)
  const managerStats = {};

  weeklyScores.forEach(score => {
    if (!score.userId || !score.managerName) return;

    if (!managerStats[score.userId]) {
      managerStats[score.userId] = {
        managerName: score.managerName,
        totalPoints: 0,
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        ties: 0,
        opponentPoints: 0,
      };
    }

    managerStats[score.userId].totalPoints += score.points;
    managerStats[score.userId].gamesPlayed++;
  });

  // Add wins/losses from rosters
  Object.values(teamSeasonData).forEach(team => {
    if (!team.userId) return;
    if (!managerStats[team.userId]) return;

    managerStats[team.userId].wins += team.wins;
    managerStats[team.userId].losses += team.losses;
    managerStats[team.userId].ties += team.ties;
  });

  // Calculate opponent points
  allMatchupPairings.forEach(matchup => {
    const team1UserId = getUserIdForRoster(matchup.team1.rosterId, matchup.season);
    const team2UserId = getUserIdForRoster(matchup.team2.rosterId, matchup.season);

    if (team1UserId && managerStats[team1UserId]) {
      managerStats[team1UserId].opponentPoints += matchup.team2.points;
    }
    if (team2UserId && managerStats[team2UserId]) {
      managerStats[team2UserId].opponentPoints += matchup.team1.points;
    }
  });

  const managerList = Object.values(managerStats).map(m => ({
    ...m,
    winPct: m.wins / (m.wins + m.losses + m.ties) || 0,
    avgScore: m.totalPoints / m.gamesPlayed,
    avgOpponentScore: m.opponentPoints / m.gamesPlayed,
  }));

  // Winningest manager
  const winningest = [...managerList].sort((a, b) => b.winPct - a.winPct)[0];
  stats.managerRecords.winningestManager = winningest ? {
    manager: winningest.managerName,
    record: `${winningest.wins}-${winningest.losses}${winningest.ties > 0 ? `-${winningest.ties}` : ''}`,
    winPct: (winningest.winPct * 100).toFixed(1),
  } : null;

  // Most points all-time
  const mostPointsManager = [...managerList].sort((a, b) => b.totalPoints - a.totalPoints)[0];
  stats.managerRecords.mostPointsManager = mostPointsManager ? {
    manager: mostPointsManager.managerName,
    points: mostPointsManager.totalPoints.toFixed(2),
    average: mostPointsManager.avgScore.toFixed(2),
  } : null;

  // Most unlucky (highest avg opponent score)
  const mostUnlucky = [...managerList].sort((a, b) => b.avgOpponentScore - a.avgOpponentScore)[0];
  stats.managerRecords.mostPointsAgainst = mostUnlucky ? {
    manager: mostUnlucky.managerName,
    avgOpponentScore: mostUnlucky.avgOpponentScore.toFixed(2),
    totalOpponentPoints: mostUnlucky.opponentPoints.toFixed(2),
  } : null;

  // ===========================
  // FUN STATS
  // ===========================

  // Unluckiest team (most points but worst record in a season)
  const unluckiestCandidates = seasonRecords.map(team => ({
    ...team,
    pointsPerWin: team.totalPoints / (team.wins || 1),
    luckScore: team.totalPoints - (team.wins * 100), // Arbitrary metric
  })).sort((a, b) => b.luckScore - a.luckScore);

  stats.funStats.unluckiestTeam = unluckiestCandidates[0] ? {
    team: unluckiestCandidates[0].teamName,
    season: unluckiestCandidates[0].season,
    record: `${unluckiestCandidates[0].wins}-${unluckiestCandidates[0].losses}`,
    points: unluckiestCandidates[0].totalPoints.toFixed(2),
  } : null;

  // Luckiest team (fewest points but good record)
  const luckiestCandidates = seasonRecords
    .filter(team => team.wins > team.losses) // Only winning records
    .map(team => ({
      ...team,
      luckScore: (team.wins * 100) - team.totalPoints,
    }))
    .sort((a, b) => b.luckScore - a.luckScore);

  stats.funStats.luckiestTeam = luckiestCandidates[0] ? {
    team: luckiestCandidates[0].teamName,
    season: luckiestCandidates[0].season,
    record: `${luckiestCandidates[0].wins}-${luckiestCandidates[0].losses}`,
    points: luckiestCandidates[0].totalPoints.toFixed(2),
  } : null;

  return stats;
}
