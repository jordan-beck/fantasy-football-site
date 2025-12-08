import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { getAvatarUrl, getTeamName } from "../utils/avatarUtils";
import "./Matchups.css";

function Matchups({ rosters, users, currentWeek }) {
  const { theme } = useTheme();
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const [matchups, setMatchups] = useState(null);

  useEffect(() => {
    fetch(
      `https://api.sleeper.app/v1/league/1257101142144327682/matchups/${selectedWeek}`
    )
      .then((response) => response.json())
      .then((data) => {
        setMatchups(data);
      })
      .catch((error) => {
        console.error("Error fetching matchups:", error);
      });
  }, [selectedWeek, currentWeek]);

  const getTeamNameById = (rosterId) => {
    const roster = rosters.find((r) => r.roster_id === rosterId);
    if (!roster) return "Unknown Team";
    return getTeamName(roster, users);
  };

  const getTeamAvatarById = (rosterId) => {
    const roster = rosters.find((r) => r.roster_id === rosterId);
    if (!roster) return null;
    return getAvatarUrl(roster, users);
  };

  const groupMatchups = () => {
    const grouped = {};

    matchups.forEach((matchup) => {
      if (!grouped[matchup.matchup_id]) {
        grouped[matchup.matchup_id] = [];
      }
      grouped[matchup.matchup_id].push(matchup);
    });
    return Object.values(grouped);
  };

  if (!matchups || !rosters || !users || !currentWeek) {
    return (
      <div style={{ color: theme.text.primary, padding: "20px" }}>
        Loading matchups...
      </div>
    );
  }

  const pairedMatchups = groupMatchups();

  return (
    <div
      className="matchups-container"
      style={{
        background: theme.bg.secondary,
        border: `1px solid ${theme.border.primary}`,
      }}
    >
      <h2 className="matchups-title" style={{ color: theme.text.primary }}>
        Week {selectedWeek} Matchups
        {selectedWeek === currentWeek && (
          <span
            className="current-week-badge"
            style={{ color: theme.status.success }}
          >
            (Current Week)
          </span>
        )}
      </h2>
      <div className="week-selector">
        <button
          className="week-button"
          onClick={() => setSelectedWeek(selectedWeek - 1)}
          disabled={selectedWeek === 1}
        >
          Previous Week
        </button>
        <span className="week-display" style={{ color: theme.text.primary }}>
          Week {selectedWeek}
        </span>
        <button
          className="week-button"
          onClick={() => setSelectedWeek(selectedWeek + 1)}
          disabled={selectedWeek === 18}
        >
          Next Week
        </button>
      </div>

      <div>
        {pairedMatchups.map((matchupPair, index) => {
          const team1Winning = matchupPair[0]?.points > matchupPair[1]?.points;
          const team2Winning = matchupPair[1]?.points > matchupPair[0]?.points;

          return (
            <div
              key={index}
              className="matchup-card"
              style={{
                background: theme.bg.tertiary,
                border: `1px solid ${theme.border.primary}`,
              }}
            >
              {matchupPair[0] && (
                <div className="matchup-team">
                  <span
                    className={`team-info ${team1Winning ? "winning" : ""}`}
                    style={{ color: theme.text.primary }}
                  >
                    {getTeamAvatarById(matchupPair[0].roster_id) && (
                      <img
                        src={getTeamAvatarById(matchupPair[0].roster_id)}
                        alt="team avatar"
                        className="matchup-avatar"
                      />
                    )}
                    {getTeamNameById(matchupPair[0].roster_id)}
                  </span>
                  <span
                    className={`team-score ${team1Winning ? "winning" : ""}`}
                    style={{ color: theme.text.primary }}
                  >
                    {matchupPair[0].points}
                  </span>
                </div>
              )}
              <div className="matchup-vs" style={{ color: theme.text.secondary }}>
                vs
              </div>

              {matchupPair[1] && (
                <div className="matchup-team">
                  <span
                    className={`team-info ${team2Winning ? "winning" : ""}`}
                    style={{ color: theme.text.primary }}
                  >
                    {getTeamAvatarById(matchupPair[1].roster_id) && (
                      <img
                        src={getTeamAvatarById(matchupPair[1].roster_id)}
                        alt="team avatar"
                        className="matchup-avatar"
                      />
                    )}
                    {getTeamNameById(matchupPair[1].roster_id)}
                  </span>
                  <span
                    className={`team-score ${team2Winning ? "winning" : ""}`}
                    style={{ color: theme.text.primary }}
                  >
                    {matchupPair[1].points}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Matchups;
