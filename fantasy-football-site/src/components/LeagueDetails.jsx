import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import {
  useLeagueHistory,
  useMatchupHistory,
  calculateRecords,
} from "../hooks/useLeagueHistory";
import { API_CONFIG } from "../constants/config";
import AllTimeStats from "./Stats/AllTimeStats";
import "./LeagueDetails.css";

function LeagueDetails({
  leagueData,
  rosters = [],
  users = [],
  nflPlayers = null,
}) {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("rosters");
  const [playoffResults, setPlayoffResults] = useState(null);

  // Fetch league history data
  const {
    drafts,
    previousSeasons,
    loading: historyLoading,
  } = useLeagueHistory(leagueData?.league_id);
  const { matchups, loading: matchupsLoading } = useMatchupHistory(
    leagueData?.league_id,
    previousSeasons
  );

  // Fetch playoff matchup data for ALL previous seasons to determine playoff positions
  useEffect(() => {
    const fetchPlayoffResults = async () => {
      if (!previousSeasons || previousSeasons.length === 0) return;

      try {
        const { BASE_URL } = API_CONFIG;

        // Process each previous season
        const allSeasonResults = await Promise.all(
          previousSeasons.map(async (season) => {
            const prevLeagueId = season.league.league_id;
            const playoffStart =
              season.league.settings?.playoff_week_start || 15;
            const seasonYear = season.league.season;

            // Fetch playoff weeks (typically weeks 15, 16, 17)
            const playoffWeeks = [
              playoffStart,
              playoffStart + 1,
              playoffStart + 2,
            ];
            const matchupPromises = playoffWeeks.map((week) =>
              fetch(`${BASE_URL}/league/${prevLeagueId}/matchups/${week}`)
                .then((res) => (res.ok ? res.json() : []))
                .catch(() => [])
            );

            const [week1, week2, week3] = await Promise.all(matchupPromises);

            // Championship is typically the last week with matchups
            let championshipWeek = null;
            let championshipMatchups = null;

            if (week3 && week3.length > 0) {
              championshipWeek = playoffStart + 2;
              championshipMatchups = week3;
            } else if (week2 && week2.length > 0) {
              championshipWeek = playoffStart + 1;
              championshipMatchups = week2;
            }

            if (!championshipMatchups) {
              return {
                season: seasonYear,
                firstPlace: null,
                secondPlace: null,
                thirdPlace: null,
                toiletBowl: null,
              };
            }

            // Get 1st place from metadata
            const winnerRosterId = Number(
              season.league.metadata?.latest_league_winner_roster_id
            );

            // Find championship matchup (matchup that includes the winner)
            const championshipMatchup = championshipMatchups.filter(
              (m) => m.matchup_id && m.points !== null
            );

            // Group by matchup_id to get head-to-head pairings
            const matchupGroups = {};
            championshipMatchup.forEach((m) => {
              if (!matchupGroups[m.matchup_id]) {
                matchupGroups[m.matchup_id] = [];
              }
              matchupGroups[m.matchup_id].push(m);
            });

            // Find the championship game (contains the winner)
            let runnerUpRosterId = null;
            for (const matchupId in matchupGroups) {
              const teams = matchupGroups[matchupId];
              if (teams.some((t) => t.roster_id === winnerRosterId)) {
                // This is the championship game
                const loser = teams.find((t) => t.roster_id !== winnerRosterId);
                if (loser) {
                  runnerUpRosterId = loser.roster_id;
                }
                break;
              }
            }

            // For 3rd place and toilet bowl, look at other matchups in championship week
            let thirdPlaceRosterId = null;
            let toiletBowlRosterId = null;

            // Get other matchups (not the championship game)
            const otherMatchups = Object.values(matchupGroups).filter(
              (teams) => !teams.some((t) => t.roster_id === winnerRosterId)
            );

            if (otherMatchups.length > 0) {
              // Sort other matchups by total points to identify which is 3rd place vs toilet bowl
              const sortedOtherMatchups = otherMatchups
                .map((teams) => {
                  if (teams.length !== 2) return null;
                  const totalPoints = teams[0].points + teams[1].points;
                  const winner =
                    teams[0].points > teams[1].points ? teams[0] : teams[1];
                  const loser =
                    teams[0].points > teams[1].points ? teams[1] : teams[0];
                  return { teams, totalPoints, winner, loser };
                })
                .filter(Boolean)
                .sort((a, b) => b.totalPoints - a.totalPoints);

              // Special logic for 2022 season (different playoff structure)
              if (seasonYear === "2022") {
                // For 2022: 3rd place is winner of LOWEST scoring matchup
                if (sortedOtherMatchups.length > 0) {
                  thirdPlaceRosterId =
                    sortedOtherMatchups[sortedOtherMatchups.length - 1].winner
                      .roster_id;
                }
                // For 2022: Toilet bowl winner is the LOSER with HIGHEST score
                if (sortedOtherMatchups.length > 0) {
                  const allLosers = sortedOtherMatchups.map((m) => m.loser);
                  const highestScoringLoser = allLosers.sort(
                    (a, b) => b.points - a.points
                  )[0];
                  toiletBowlRosterId = highestScoringLoser.roster_id;
                }
              } else {
                // For all other years: use standard logic
                // Highest scoring non-championship game is likely 3rd place
                if (sortedOtherMatchups[0]) {
                  thirdPlaceRosterId = sortedOtherMatchups[0].winner.roster_id;
                }
                // Lowest scoring non-championship game toilet bowl - winner is the team with LOWEST score (the loser)
                if (sortedOtherMatchups.length > 1) {
                  toiletBowlRosterId =
                    sortedOtherMatchups[sortedOtherMatchups.length - 1].loser
                      .roster_id;
                }
              }
            }

            // If no 3rd place game, look at semifinals (week before championship)
            if (
              !thirdPlaceRosterId &&
              week2 &&
              week2.length > 0 &&
              championshipWeek !== playoffStart + 1
            ) {
              const semiMatchups = week2.filter(
                (m) => m.matchup_id && m.points !== null
              );
              const semiGroups = {};
              semiMatchups.forEach((m) => {
                if (!semiGroups[m.matchup_id]) {
                  semiGroups[m.matchup_id] = [];
                }
                semiGroups[m.matchup_id].push(m);
              });

              // Find the semifinal that didn't produce the champion
              for (const matchupId in semiGroups) {
                const teams = semiGroups[matchupId];
                if (
                  teams.length === 2 &&
                  !teams.some((t) => t.roster_id === winnerRosterId)
                ) {
                  const [team1, team2] = teams;
                  // Winner of this semi is 3rd place (lost in finals or consolation)
                  thirdPlaceRosterId =
                    team1.points > team2.points
                      ? team1.roster_id
                      : team2.roster_id;
                  break;
                }
              }
            }

            return {
              season: seasonYear,
              firstPlace: winnerRosterId,
              secondPlace: runnerUpRosterId,
              thirdPlace: thirdPlaceRosterId,
              toiletBowl: toiletBowlRosterId,
            };
          })
        );

        setPlayoffResults(allSeasonResults);
      } catch (error) {
        console.error("Error fetching playoff results:", error);
        setPlayoffResults(null);
      }
    };

    fetchPlayoffResults();
  }, [previousSeasons]);

  // Build all seasons data array for records calculation
  const allSeasonsData = [
    {
      season: leagueData?.season,
      rosters,
      users,
    },
    ...previousSeasons.map((ps) => ({
      season: ps.league.season,
      rosters: ps.rosters,
      users: ps.users,
    })),
  ];

  // Calculate records from matchup data
  const records = calculateRecords(
    matchups,
    allSeasonsData,
    leagueData?.season
  );

  const tabs = [
    { id: "rosters", label: "Rosters" },
    { id: "managers", label: "Managers" },
    { id: "drafts", label: "Drafts" },
    { id: "trophy-room", label: "Trophy Room" },
    { id: "records", label: "Records" },
  ];

  return (
    <div
      className="league-details-container"
      style={{
        background: theme.bg.secondary,
        border: `1px solid ${theme.border.primary}`,
      }}
    >
      <h1
        className="league-details-title"
        style={{ color: theme.text.primary }}
      >
        League Details
      </h1>

      {/* Tab Navigation */}
      <div className="league-details-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
            style={{
              color:
                activeTab === tab.id ? theme.text.accent : theme.text.secondary,
              borderColor:
                activeTab === tab.id ? theme.border.primary : "transparent",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "rosters" && (
          <RostersSection
            rosters={rosters}
            users={users}
            nflPlayers={nflPlayers}
            theme={theme}
            leagueData={leagueData}
            previousSeasons={previousSeasons}
            loading={historyLoading}
          />
        )}
        {activeTab === "managers" && (
          <ManagersSection
            users={users}
            rosters={rosters}
            theme={theme}
            previousSeasons={previousSeasons}
            matchups={matchups}
            currentSeason={leagueData?.season}
          />
        )}
        {activeTab === "drafts" && (
          <DraftsSection
            leagueData={leagueData}
            drafts={drafts}
            previousSeasons={previousSeasons}
            users={users}
            rosters={rosters}
            nflPlayers={nflPlayers}
            loading={historyLoading}
            theme={theme}
          />
        )}
        {activeTab === "trophy-room" && (
          <TrophyRoomSection
            previousSeasons={previousSeasons}
            playoffResults={playoffResults}
            users={users}
            loading={historyLoading}
            theme={theme}
          />
        )}
        {activeTab === "records" && (
          <RecordsSection
            records={records}
            loading={matchupsLoading}
            theme={theme}
            matchups={matchups}
            allSeasonsData={allSeasonsData}
            currentSeason={leagueData?.season}
            rosters={rosters}
            previousSeasons={previousSeasons}
          />
        )}
      </div>
    </div>
  );
}

// Rosters Section Component
function RostersSection({
  rosters,
  users,
  nflPlayers,
  theme,
  leagueData,
  previousSeasons,
  loading,
}) {
  const [expandedRosters, setExpandedRosters] = useState({});
  const [expandedSeasons, setExpandedSeasons] = useState({});

  const toggleBench = (rosterId, seasonKey = "current") => {
    const key = `${seasonKey}-${rosterId}`;
    setExpandedRosters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleSeason = (season) => {
    setExpandedSeasons((prev) => ({
      ...prev,
      [season]: !prev[season],
    }));
  };

  const getPlayerName = (playerId) => {
    if (!nflPlayers || !playerId) return `Player ${playerId}`;
    const player = nflPlayers[playerId];
    if (!player) return `Player ${playerId}`;
    const name = `${player.first_name || ""} ${player.last_name || ""}`.trim();
    const position = player.position || "";
    const team = player.team || "";
    return position && team ? `${name} (${position}, ${team})` : name;
  };

  const renderRosterCards = (rostersData, usersData, seasonKey = "current") => {
    return rostersData.map((roster) => {
      const user = usersData.find((u) => u.user_id === roster.owner_id);
      const teamName =
        user?.metadata?.team_name ||
        user?.display_name ||
        `Team ${roster.roster_id}`;
      const starters = roster.starters || [];
      const bench = (roster.players || []).filter((p) => !starters.includes(p));
      const benchKey = `${seasonKey}-${roster.roster_id}`;

      return (
        <div
          key={`${seasonKey}-${roster.roster_id}`}
          className="roster-card"
          style={{
            background: theme.bg.tertiary,
            border: `2px solid ${theme.border.primary}`,
          }}
        >
          <div className="roster-header">
            <h3 style={{ color: theme.text.primary }}>{teamName}</h3>
            <div
              className="roster-record"
              style={{ color: theme.text.secondary }}
            >
              {roster.settings?.wins || 0}-{roster.settings?.losses || 0}
              {roster.settings?.ties > 0 && `-${roster.settings.ties}`}
            </div>
          </div>

          <div className="roster-starters">
            <h4 style={{ color: theme.text.accent }}>Starters</h4>
            <div className="players-list">
              {starters.map((playerId, idx) => (
                <div
                  key={`${playerId}-${idx}`}
                  className="player-item"
                  style={{ color: theme.text.primary }}
                >
                  {getPlayerName(playerId)}
                </div>
              ))}
            </div>
          </div>

          {bench.length > 0 && (
            <div className="roster-bench">
              <button
                className="bench-toggle"
                onClick={() => toggleBench(roster.roster_id, seasonKey)}
                style={{
                  color: theme.text.secondary,
                  borderColor: theme.border.primary,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {expandedRosters[benchKey] ? (
                    <polyline points="6 9 12 15 18 9"></polyline>
                  ) : (
                    <polyline points="9 18 15 12 9 6"></polyline>
                  )}
                </svg>
                Bench ({bench.length})
              </button>
              {expandedRosters[benchKey] && (
                <div className="players-list bench-players">
                  {bench.map((playerId, idx) => (
                    <div
                      key={`${playerId}-${idx}`}
                      className="player-item"
                      style={{ color: theme.text.secondary }}
                    >
                      {getPlayerName(playerId)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="rosters-section">
      {/* Current Season Rosters */}
      <div
        className="season-rosters-container"
        style={{
          background: theme.bg.tertiary,
          border: `2px solid ${theme.border.primary}`,
          marginBottom: "20px",
        }}
      >
        <h3
          style={{
            color: theme.text.primary,
            padding: "16px",
            borderBottom: `1px solid ${theme.border.primary}`,
          }}
        >
          {leagueData?.season || "2024"} Season Rosters
        </h3>
        <div className="roster-cards-grid" style={{ padding: "16px" }}>
          {renderRosterCards(rosters, users, "current")}
        </div>
      </div>

      {/* Previous Seasons */}
      {loading && (
        <p style={{ color: theme.text.secondary }}>
          Loading previous seasons...
        </p>
      )}

      {!loading && previousSeasons && previousSeasons.length > 0 && (
        <>
          {previousSeasons.map((season) => {
            const seasonYear = season.league.season;
            const isExpanded = expandedSeasons[seasonYear];

            return (
              <div
                key={season.league.league_id}
                className="season-rosters-container"
                style={{
                  background: theme.bg.tertiary,
                  border: `2px solid ${theme.border.primary}`,
                  marginBottom: "20px",
                  opacity: 0.85,
                }}
              >
                <div
                  className="season-header"
                  onClick={() => toggleSeason(seasonYear)}
                  style={{
                    padding: "16px",
                    borderBottom: isExpanded
                      ? `1px solid ${theme.border.primary}`
                      : "none",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <h3 style={{ color: theme.text.primary, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {isExpanded ? (
                        <polyline points="6 9 12 15 18 9"></polyline>
                      ) : (
                        <polyline points="9 18 15 12 9 6"></polyline>
                      )}
                    </svg>
                    {seasonYear} Season Rosters
                  </h3>
                  <span
                    style={{ color: theme.text.secondary, fontSize: "0.9em" }}
                  >
                    {season.rosters?.length || 0} teams
                  </span>
                </div>
                {isExpanded && (
                  <div
                    className="roster-cards-grid"
                    style={{ padding: "16px" }}
                  >
                    {season.rosters && season.rosters.length > 0 ? (
                      renderRosterCards(
                        season.rosters,
                        season.users,
                        seasonYear
                      )
                    ) : (
                      <p style={{ color: theme.text.tertiary }}>
                        <em>No roster data available for this season</em>
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

// Managers Section Component
function ManagersSection({
  users,
  rosters,
  theme,
  previousSeasons,
  matchups,
  currentSeason,
}) {
  // Calculate all-time stats for each user
  const calculateAllTimeStats = (userId) => {
    let allTimeWins = 0;
    let allTimeLosses = 0;
    let allTimeTies = 0;
    let allTimePointsFor = 0;

    // Add current season stats
    const currentRoster = rosters.find((r) => r.owner_id === userId);
    if (currentRoster) {
      allTimeWins += currentRoster.settings?.wins || 0;
      allTimeLosses += currentRoster.settings?.losses || 0;
      allTimeTies += currentRoster.settings?.ties || 0;
    }

    // Add previous seasons stats
    if (previousSeasons) {
      previousSeasons.forEach((season) => {
        const seasonRoster = season.rosters?.find((r) => r.owner_id === userId);
        if (seasonRoster) {
          allTimeWins += seasonRoster.settings?.wins || 0;
          allTimeLosses += seasonRoster.settings?.losses || 0;
          allTimeTies += seasonRoster.settings?.ties || 0;
        }
      });
    }

    // Calculate all-time points for from matchups
    if (matchups && matchups.length > 0) {
      matchups.forEach(({ season, matchups: weekMatchups }) => {
        if (!weekMatchups) return;
        weekMatchups.forEach((matchup) => {
          // Find roster for this matchup in the appropriate season
          let matchupRoster = null;
          if (season === currentSeason) {
            matchupRoster = rosters.find((r) => r.roster_id === matchup.roster_id);
          } else {
            const seasonData = previousSeasons?.find(
              (s) => s.league.season === season
            );
            matchupRoster = seasonData?.rosters?.find(
              (r) => r.roster_id === matchup.roster_id
            );
          }

          // If this matchup belongs to this user, add the points
          if (matchupRoster && matchupRoster.owner_id === userId) {
            allTimePointsFor += matchup.points || 0;
          }
        });
      });
    }

    return {
      allTimeWins,
      allTimeLosses,
      allTimeTies,
      allTimePointsFor: allTimePointsFor.toFixed(2),
    };
  };

  // Calculate stats for all users and sort by all-time points
  const usersWithStats = users.map((user) => ({
    user,
    allTimeStats: calculateAllTimeStats(user.user_id),
  }));

  // Sort by all-time points for (descending)
  const sortedUsers = usersWithStats.sort(
    (a, b) => parseFloat(b.allTimeStats.allTimePointsFor) - parseFloat(a.allTimeStats.allTimePointsFor)
  );

  return (
    <div className="managers-section">
      {sortedUsers.map(({ user, allTimeStats }) => {
        const roster = rosters.find((r) => r.owner_id === user.user_id);
        const teamName = user.metadata?.team_name || user.display_name;

        return (
          <div
            key={user.user_id}
            className="manager-card"
            style={{
              background: theme.bg.tertiary,
              border: `2px solid ${theme.border.primary}`,
            }}
          >
            {user.avatar && (
              <img
                src={`https://sleepercdn.com/avatars/thumbs/${user.avatar}`}
                alt={user.display_name}
                className="manager-avatar"
              />
            )}
            <h3 style={{ color: theme.text.primary }}>{user.display_name}</h3>
            <p style={{ color: theme.text.accent }}>{teamName}</p>

            {/* Current Season Record */}
            {roster && (
              <div
                className="manager-record"
                style={{ color: theme.text.secondary, marginBottom: "8px" }}
              >
                <strong>Current Season:</strong> {roster.settings?.wins || 0}-
                {roster.settings?.losses || 0}
                {roster.settings?.ties > 0 && `-${roster.settings.ties}`}
              </div>
            )}

            {/* All-Time Record */}
            <div
              className="manager-record"
              style={{ color: theme.text.secondary, marginBottom: "8px" }}
            >
              <strong>All-Time Record:</strong> {allTimeStats.allTimeWins}-
              {allTimeStats.allTimeLosses}
              {allTimeStats.allTimeTies > 0 && `-${allTimeStats.allTimeTies}`}
            </div>

            {/* All-Time Points For */}
            <div
              className="manager-record"
              style={{ color: theme.text.accent, marginBottom: "8px" }}
            >
              <strong>All-Time Points For:</strong>{" "}
              {allTimeStats.allTimePointsFor} pts
            </div>

            <div
              className="manager-bio"
              style={{ color: theme.text.secondary }}
            >
              <em>Bio coming soon...</em>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Drafts Section Component
function DraftsSection({
  leagueData,
  drafts,
  previousSeasons,
  users,
  rosters,
  nflPlayers,
  loading,
  theme,
}) {
  const [expandedRounds, setExpandedRounds] = useState({});

  if (loading) {
    return (
      <div className="drafts-section">
        <p style={{ color: theme.text.secondary }}>Loading draft data...</p>
      </div>
    );
  }

  const toggleRound = (draftId, round, currentIsExpanded) => {
    const key = `${draftId}-${round}`;
    setExpandedRounds((prev) => ({
      ...prev,
      [key]: !currentIsExpanded,
    }));
  };

  const getPlayerName = (playerId) => {
    if (!nflPlayers || !playerId) return `Player ${playerId}`;
    const player = nflPlayers[playerId];
    if (!player) return `Player ${playerId}`;
    const name = `${player.first_name || ""} ${player.last_name || ""}`.trim();
    const position = player.position || "";
    const team = player.team || "";
    return position && team ? `${name} (${position}, ${team})` : name;
  };

  const getTeamName = (userId, seasonUsers) => {
    const user = seasonUsers?.find((u) => u.user_id === userId);
    return user?.metadata?.team_name || user?.display_name || `Team ${userId}`;
  };

  const renderDraftPicks = (draft, seasonUsers, isCurrentSeason = true) => {
    if (!draft || !draft.picks || draft.picks.length === 0) {
      return (
        <p style={{ color: theme.text.tertiary }}>
          <em>No draft picks available</em>
        </p>
      );
    }

    // Group picks by round
    const picksByRound = {};
    draft.picks.forEach((pick) => {
      if (!picksByRound[pick.round]) {
        picksByRound[pick.round] = [];
      }
      picksByRound[pick.round].push(pick);
    });

    // Sort picks within each round by pick number
    Object.keys(picksByRound).forEach((round) => {
      picksByRound[round].sort((a, b) => a.pick_no - b.pick_no);
    });

    const rounds = Object.keys(picksByRound).sort(
      (a, b) => Number(a) - Number(b)
    );
    const totalRounds = draft.settings?.rounds || rounds.length;

    return (
      <div className="draft-rounds">
        {rounds.map((round) => {
          const roundPicks = picksByRound[round];
          const roundNumber = Number(round);
          const key = `${draft.draft_id}-${round}`;

          // Check if this round has been explicitly toggled
          const hasBeenToggled = key in expandedRounds;

          // If toggled, use that value; otherwise use default (first 3 rounds for current season)
          const isExpanded = hasBeenToggled
            ? expandedRounds[key]
            : isCurrentSeason && roundNumber <= 3;

          return (
            <div key={round} className="draft-round">
              <div
                className="draft-round-header"
                onClick={() => toggleRound(draft.draft_id, round, isExpanded)}
                style={{
                  background: theme.bg.secondary,
                  borderLeft: `4px solid ${theme.border.accent}`,
                  cursor: "pointer",
                }}
              >
                <span style={{ color: theme.text.primary, fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {isExpanded ? (
                      <polyline points="6 9 12 15 18 9"></polyline>
                    ) : (
                      <polyline points="9 18 15 12 9 6"></polyline>
                    )}
                  </svg>
                  Round {round}
                </span>
                <span
                  style={{ color: theme.text.secondary, fontSize: "0.9em" }}
                >
                  {roundPicks.length} picks
                </span>
              </div>
              {isExpanded && (
                <div className="draft-picks-grid">
                  {roundPicks.map((pick) => (
                    <div
                      key={pick.pick_id}
                      className="draft-pick-item"
                      style={{
                        background: theme.bg.tertiary,
                        borderLeft: `3px solid ${theme.border.primary}`,
                      }}
                    >
                      <div
                        className="pick-number"
                        style={{ color: theme.text.accent }}
                      >
                        #{pick.pick_no}
                      </div>
                      <div
                        className="pick-player"
                        style={{ color: theme.text.primary }}
                      >
                        {getPlayerName(pick.player_id)}
                      </div>
                      <div
                        className="pick-team"
                        style={{ color: theme.text.secondary }}
                      >
                        {getTeamName(pick.picked_by, seasonUsers)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="drafts-section">
      {/* Current Season Draft */}
      {drafts && drafts.length > 0 && drafts[0] && (
        <div
          className="draft-card"
          style={{
            background: theme.bg.tertiary,
            border: `2px solid ${theme.border.primary}`,
          }}
        >
          <h3 style={{ color: theme.text.primary }}>
            {leagueData?.season || "2024"} Season Draft
          </h3>
          <div className="draft-info" style={{ marginBottom: "20px" }}>
            <div
              style={{
                display: "flex",
                gap: "20px",
                flexWrap: "wrap",
                marginBottom: "8px",
              }}
            >
              <span style={{ color: theme.text.secondary }}>
                <strong>Type:</strong>{" "}
                {drafts[0].type === "snake" ? "Snake Draft" : drafts[0].type}
              </span>
              <span style={{ color: theme.text.secondary }}>
                <strong>Rounds:</strong> {drafts[0].settings?.rounds || "N/A"}
              </span>
              <span style={{ color: theme.text.secondary }}>
                <strong>Status:</strong> {drafts[0].status}
              </span>
              {drafts[0].start_time && (
                <span style={{ color: theme.text.secondary }}>
                  <strong>Date:</strong>{" "}
                  {new Date(drafts[0].start_time).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>
          </div>
          {renderDraftPicks(drafts[0], users, true)}
        </div>
      )}

      {/* Previous Seasons */}
      {previousSeasons && previousSeasons.length > 0 && (
        <>
          {previousSeasons.map((season) => (
            <div
              key={season.league.league_id}
              className="draft-card"
              style={{
                background: theme.bg.tertiary,
                border: `2px solid ${theme.border.primary}`,
                opacity: 0.85,
              }}
            >
              <h3 style={{ color: theme.text.primary }}>
                {season.league.season} Season Draft
              </h3>
              {season.draft ? (
                <>
                  <div className="draft-info" style={{ marginBottom: "16px" }}>
                    <div
                      style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}
                    >
                      <span
                        style={{
                          color: theme.text.secondary,
                          fontSize: "0.9em",
                        }}
                      >
                        <strong>Type:</strong>{" "}
                        {season.draft.type === "snake"
                          ? "Snake"
                          : season.draft.type}
                      </span>
                      <span
                        style={{
                          color: theme.text.secondary,
                          fontSize: "0.9em",
                        }}
                      >
                        <strong>Rounds:</strong>{" "}
                        {season.draft.settings?.rounds || "N/A"}
                      </span>
                      {season.draft.start_time && (
                        <span
                          style={{
                            color: theme.text.secondary,
                            fontSize: "0.9em",
                          }}
                        >
                          <strong>Date:</strong>{" "}
                          {new Date(season.draft.start_time).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                  {renderDraftPicks(season.draft, season.users, false)}
                </>
              ) : (
                <p style={{ color: theme.text.tertiary }}>
                  <em>Draft data not available</em>
                </p>
              )}
            </div>
          ))}
        </>
      )}

      {(!drafts || drafts.length === 0) &&
        (!previousSeasons || previousSeasons.length === 0) && (
          <div
            className="draft-card"
            style={{
              background: theme.bg.tertiary,
              border: `2px solid ${theme.border.primary}`,
            }}
          >
            <p style={{ color: theme.text.tertiary }}>
              <em>No draft data available</em>
            </p>
          </div>
        )}
    </div>
  );
}

// Trophy Room Section Component
function TrophyRoomSection({
  previousSeasons,
  playoffResults,
  users,
  loading,
  theme,
}) {
  if (loading) {
    return (
      <div className="trophy-room-section">
        <p style={{ color: theme.text.secondary }}>
          Loading trophy room data...
        </p>
      </div>
    );
  }

  // Helper to get team name from roster
  const getTeamName = (roster, seasonUsers) => {
    if (!roster) return "TBD";
    const user = seasonUsers?.find((u) => u.user_id === roster.owner_id);
    return (
      user?.metadata?.team_name ||
      user?.display_name ||
      `Team ${roster.roster_id}`
    );
  };

  if (!previousSeasons || previousSeasons.length === 0) {
    return (
      <div className="trophy-room-section">
        <div
          className="trophy-card"
          style={{
            background: theme.bg.tertiary,
            border: `2px solid ${theme.border.primary}`,
          }}
        >
          <h3 style={{ color: theme.text.primary }}>
            Previous Season Champions
          </h3>
          <p style={{ color: theme.text.tertiary }}>
            <em>No previous season data available</em>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="trophy-room-section">
      {previousSeasons.map((season, idx) => {
        // Find playoff results for this season
        const seasonPlayoffResults = playoffResults?.find(
          (result) => result.season === season.league.season
        );

        // Find playoff positions using playoff matchup results
        let firstPlace = null;
        let secondPlace = null;
        let thirdPlace = null;
        let toiletBowl = null;

        if (seasonPlayoffResults) {
          if (seasonPlayoffResults.firstPlace) {
            firstPlace = season.rosters.find(
              (r) => r.roster_id === seasonPlayoffResults.firstPlace
            );
          }
          if (seasonPlayoffResults.secondPlace) {
            secondPlace = season.rosters.find(
              (r) => r.roster_id === seasonPlayoffResults.secondPlace
            );
          }
          if (seasonPlayoffResults.thirdPlace) {
            thirdPlace = season.rosters.find(
              (r) => r.roster_id === seasonPlayoffResults.thirdPlace
            );
          }
          if (seasonPlayoffResults.toiletBowl) {
            toiletBowl = season.rosters.find(
              (r) => r.roster_id === seasonPlayoffResults.toiletBowl
            );
          }
        }

        return (
          <div
            key={season.league.league_id}
            className="trophy-card"
            style={{
              background: theme.bg.tertiary,
              border: `2px solid ${theme.border.primary}`,
            }}
          >
            <h3 style={{ color: theme.text.primary }}>
              {season.league.season} Season Champions
            </h3>
            <div className="trophy-placeholders">
              <div
                className="trophy-item"
                style={{ color: theme.text.primary }}
              >
                🏆 1st Place: {getTeamName(firstPlace, season.users)}
                {firstPlace && (
                  <span
                    style={{
                      color: theme.text.secondary,
                      fontSize: "0.9em",
                      marginLeft: "8px",
                    }}
                  >
                    ({firstPlace.settings?.wins || 0}-
                    {firstPlace.settings?.losses || 0})
                  </span>
                )}
              </div>
              <div
                className="trophy-item"
                style={{ color: theme.text.primary }}
              >
                🥈 2nd Place: {getTeamName(secondPlace, season.users)}
                {secondPlace && (
                  <span
                    style={{
                      color: theme.text.secondary,
                      fontSize: "0.9em",
                      marginLeft: "8px",
                    }}
                  >
                    ({secondPlace.settings?.wins || 0}-
                    {secondPlace.settings?.losses || 0})
                  </span>
                )}
              </div>
              <div
                className="trophy-item"
                style={{ color: theme.text.primary }}
              >
                🥉 3rd Place: {getTeamName(thirdPlace, season.users)}
                {thirdPlace && (
                  <span
                    style={{
                      color: theme.text.secondary,
                      fontSize: "0.9em",
                      marginLeft: "8px",
                    }}
                  >
                    ({thirdPlace.settings?.wins || 0}-
                    {thirdPlace.settings?.losses || 0})
                  </span>
                )}
              </div>
              <div
                className="trophy-item"
                style={{ color: theme.text.tertiary }}
              >
                🚽 Toilet Bowl Winner: {getTeamName(toiletBowl, season.users)}
                {toiletBowl && (
                  <span
                    style={{
                      color: theme.text.secondary,
                      fontSize: "0.9em",
                      marginLeft: "8px",
                    }}
                  >
                    ({toiletBowl.settings?.wins || 0}-
                    {toiletBowl.settings?.losses || 0})
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Records Section Component
function RecordsSection({
  records,
  loading,
  theme,
  matchups,
  allSeasonsData,
  currentSeason,
  rosters,
  previousSeasons
}) {
  if (loading) {
    return (
      <div className="records-section">
        <p style={{ color: theme.text.secondary }}>Loading records data...</p>
      </div>
    );
  }

  const hasData =
    records &&
    (records.highestSingleWeek?.length > 0 ||
      records.lowestSingleWeek?.length > 0 ||
      records.highestSeasonPoints?.length > 0 ||
      records.lowestSeasonPoints?.length > 0);

  if (!hasData) {
    return (
      <div className="records-section">
        <p style={{ color: theme.text.tertiary }}>
          <em>
            No records data available yet. Records will appear as the season
            progresses.
          </em>
        </p>
      </div>
    );
  }

  return (
    <div className="records-section">
      {/* Highest Single Week Scores */}
      {records.highestSingleWeek && records.highestSingleWeek.length > 0 && (
        <div
          className="record-category"
          style={{
            background: theme.bg.tertiary,
            border: `2px solid ${theme.border.primary}`,
          }}
        >
          <h3 style={{ color: theme.text.primary }}>
            All-Time Single Week Scoring Records
          </h3>
          <div className="records-list">
            {records.highestSingleWeek.map((record, idx) => (
              <div
                key={idx}
                className="record-item"
                style={{
                  color: theme.text.primary,
                  borderColor: theme.border.primary,
                }}
              >
                <span
                  className="record-rank"
                  style={{ color: theme.text.accent }}
                >
                  #{idx + 1}
                </span>
                <span className="record-team">{record.team}</span>
                <span
                  className="record-details"
                  style={{ color: theme.text.secondary }}
                >
                  {record.season} - Week {record.week}
                </span>
                <span
                  className="record-score"
                  style={{ color: theme.text.accent }}
                >
                  {record.points} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lowest Single Week Scores */}
      {records.lowestSingleWeek && records.lowestSingleWeek.length > 0 && (
        <div
          className="record-category"
          style={{
            background: theme.bg.tertiary,
            border: `2px solid ${theme.border.primary}`,
          }}
        >
          <h3 style={{ color: theme.text.primary }}>
            All-Time Single Week Scoring Lows
          </h3>
          <div className="records-list">
            {records.lowestSingleWeek.map((record, idx) => (
              <div
                key={idx}
                className="record-item"
                style={{
                  color: theme.text.primary,
                  borderColor: theme.border.primary,
                }}
              >
                <span
                  className="record-rank"
                  style={{ color: theme.text.accent }}
                >
                  #{idx + 1}
                </span>
                <span className="record-team">{record.team}</span>
                <span
                  className="record-details"
                  style={{ color: theme.text.secondary }}
                >
                  {record.season} - Week {record.week}
                </span>
                <span
                  className="record-score"
                  style={{ color: theme.text.tertiary }}
                >
                  {record.points} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Highest Season Points */}
      {records.highestSeasonPoints &&
        records.highestSeasonPoints.length > 0 && (
          <div
            className="record-category"
            style={{
              background: theme.bg.tertiary,
              border: `2px solid ${theme.border.primary}`,
            }}
          >
            <h3 style={{ color: theme.text.primary }}>
              All-Time Highest Season Points
            </h3>
            <div className="records-list">
              {records.highestSeasonPoints.map((record, idx) => (
                <div
                  key={idx}
                  className="record-item"
                  style={{
                    color: theme.text.primary,
                    borderColor: theme.border.primary,
                  }}
                >
                  <span
                    className="record-rank"
                    style={{ color: theme.text.accent }}
                  >
                    #{idx + 1}
                  </span>
                  <span className="record-team">{record.team}</span>
                  <span
                    className="record-details"
                    style={{ color: theme.text.secondary }}
                  >
                    {record.season}
                  </span>
                  <div
                    className="record-score"
                    style={{ color: theme.text.accent }}
                  >
                    <div>{record.points} pts</div>
                    <div
                      className="record-score-avg"
                      style={{ color: theme.text.secondary }}
                    >
                      Avg: {record.average} pts
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Lowest Season Points */}
      {records.lowestSeasonPoints && records.lowestSeasonPoints.length > 0 && (
        <div
          className="record-category"
          style={{
            background: theme.bg.tertiary,
            border: `2px solid ${theme.border.primary}`,
          }}
        >
          <h3 style={{ color: theme.text.primary }}>
            All-Time Lowest Season Points
          </h3>
          <div className="records-list">
            {records.lowestSeasonPoints.map((record, idx) => (
              <div
                key={idx}
                className="record-item"
                style={{
                  color: theme.text.primary,
                  borderColor: theme.border.primary,
                }}
              >
                <span
                  className="record-rank"
                  style={{ color: theme.text.accent }}
                >
                  #{idx + 1}
                </span>
                <span className="record-team">{record.team}</span>
                <span
                  className="record-details"
                  style={{ color: theme.text.secondary }}
                >
                  {record.season}
                </span>
                <div
                  className="record-score"
                  style={{ color: theme.text.tertiary }}
                >
                  <div>{record.points} pts</div>
                  <div
                    className="record-score-avg"
                    style={{ color: theme.text.secondary }}
                  >
                    Avg: {record.average} pts
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comprehensive All-Time Stats */}
      <AllTimeStats
        matchups={matchups}
        allSeasonsData={allSeasonsData}
        currentSeason={currentSeason}
        rosters={rosters}
        previousSeasons={previousSeasons}
      />
    </div>
  );
}

export default LeagueDetails;
