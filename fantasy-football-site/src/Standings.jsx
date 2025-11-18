import "./Standings.css";

function Standings({ rosters, users }) {
  const getTeamName = (roster) => {
    const user = users.find((u) => u.user_id === roster.owner_id);
    return user?.metadata?.team_name || user?.display_name || "Unknown Team";
  };

  const getTeamAvatar = (roster) => {
    const user = users.find((u) => u.user_id === roster.owner_id);
    return user?.metadata?.avatar || null;
  };

  //Sort Rosters by wins, then by points
  const sortedRosters = [...rosters].sort((a, b) => {
    if (b.settings.wins !== a.settings.wins) {
      return b.settings.wins - a.settings.wins;
    }
    return b.settings.fpts - a.settings.fpts;
  });

  return (
    <div className="standings-container">
      <h2 className="standings-title">League Standings</h2>
      {sortedRosters.map((roster, index) => (
        <div key={roster.roster_id} className="team-card">
          <h3 className="team-header">
            {index + 1}.
            {getTeamAvatar(roster) && (
              <img
                src={getTeamAvatar(roster)}
                alt="team icon"
                style={{
                  width: "30px",
                  height: "30px",
                  marginLeft: "10px",
                  marginRight: "10px",
                  borderRadius: "50%",
                }}
              />
            )}
            {getTeamName(roster)}
          </h3>
          <div className="team-stats">
            <p className="stat-item">
              <span className="stat-label">Record: </span>
              {roster.settings.wins}-{roster.settings.losses}
            </p>
            <p className="stat-item">
              <span className="stat-item">Points for: </span>
              {roster.settings.fpts}
              <span className="stat-item"> | Points against: </span>{" "}
              {roster.settings.fpts_against}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Standings;
