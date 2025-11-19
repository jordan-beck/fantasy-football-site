import { useState, useEffect } from "react";
import "./Matchups.css";

function Matchups({ rosters, users, currentWeek }) {
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const [matchups, setMatchups] = useState(null);

  useEffect(() => {
    fetch(
      `https://api.sleeper.app/v1/league/1257101142144327682/matchups/${selectedWeek}`
    )
      .then((response) => response.json())
      .then((data) => {
        console.log("Matchups:", data);
        setMatchups(data);
      })
      .catch((error) => {
        console.error("Error fetching matchups:", error);
      });
  }, [selectedWeek, currentWeek]);

  const getTeamName = (rosterId) => {
    const roster = rosters.find((r) => r.roster_id === rosterId);
    if (!roster) return "Unknown Team";

    const user = users.find((u) => u.user_id === roster.owner_id);
    return user?.metadata?.team_name || user?.display_name || "Unknown Team";
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
    return <div>Loading matchups...</div>;
  }

  const pairedMatchups = groupMatchups();

  return (
    <div className="matchups-container">
      <h2 className="matchups-title">
        Week {selectedWeek} Matchups
        {selectedWeek === currentWeek && (
          <span className="current-week-badge">(Current Week)</span>
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
        <span className="week-display">Week {selectedWeek}</span>
        <button
          className="week-button"
          onClick={() => setSelectedWeek(selectedWeek + 1)}
          disabled={selectedWeek === 18}
        >
          Next Week
        </button>
      </div>

      <div>
        {pairedMatchups.map((matchupPair, index) => (
          <div key={index} className="matchup-card">
            {matchupPair[0] && (
              <div className="matchup-team">
                <span
                  className="team-info"
                  style={{
                    fontWeight:
                      matchupPair[0].points > matchupPair[1]?.points
                        ? "bold"
                        : "normal",
                  }}
                >
                  {getTeamName(matchupPair[0].roster_id)}
                </span>
                <span
                  className="team-score"
                  style={{
                    fontWeight:
                      matchupPair[0].points > matchupPair[1]?.points
                        ? "bold"
                        : "normal",
                  }}
                >
                  {matchupPair[0].points}
                </span>
              </div>
            )}
            <div className="matchup-vs">vs</div>

            {matchupPair[1] && (
              <div className="matchup-team">
                <span
                  className="team-info"
                  style={{
                    fontWeight:
                      matchupPair[1].points > matchupPair[0]?.points
                        ? "bold"
                        : "normal",
                  }}
                >
                  {getTeamName(matchupPair[1].roster_id)}
                </span>
                <span
                  className="team-score"
                  style={{
                    fontWeight:
                      matchupPair[1].points > matchupPair[0]?.points
                        ? "bold"
                        : "normal",
                  }}
                >
                  {matchupPair[1].points}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Matchups;
