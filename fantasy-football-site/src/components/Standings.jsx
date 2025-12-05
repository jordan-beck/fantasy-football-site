import { useTheme } from "../contexts/ThemeContext";
import { getAvatarUrl, getTeamName } from "../utils/avatarUtils";
import "./Standings.css";

function Standings({ rosters, users }) {
  const { theme } = useTheme();

  //Sort Rosters by wins, then by points
  const sortedRosters = [...rosters].sort((a, b) => {
    if (b.settings.wins !== a.settings.wins) {
      return b.settings.wins - a.settings.wins;
    }
    return b.settings.fpts - a.settings.fpts;
  });

  return (
    <div
      className="standings-container"
      style={{
        background: theme.bg.secondary,
        border: `1px solid ${theme.border.primary}`,
      }}
    >
      <h2 className="standings-title" style={{ color: theme.text.primary }}>
        League Standings
      </h2>
      {sortedRosters.map((roster, index) => (
        <div
          key={roster.roster_id}
          className="team-card"
          style={{
            background: theme.bg.tertiary,
            border: `1px solid ${theme.border.primary}`,
          }}
        >
          <h3 className="team-header" style={{ color: theme.text.primary }}>
            {index + 1}.
            {getAvatarUrl(roster, users) && (
              <img
                src={getAvatarUrl(roster, users)}
                alt="team icon"
                className="team-avatar"
              />
            )}
            {getTeamName(roster, users)}
          </h3>
          <div className="team-stats" style={{ color: theme.text.primary }}>
            <p className="stat-item">
              <span className="stat-label" style={{ color: theme.text.secondary }}>
                Record:{" "}
              </span>
              {roster.settings.wins}-{roster.settings.losses}
            </p>
            <p className="stat-item">
              <span className="stat-label" style={{ color: theme.text.secondary }}>
                Points for:{" "}
              </span>
              {roster.settings.fpts}
              <span className="stat-label" style={{ color: theme.text.secondary }}>
                {" "}
                | Points against:{" "}
              </span>{" "}
              {roster.settings.fpts_against}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Standings;
