import "./Standings.css";

function Standings({ rosters, users }) {
  const getTeamName = (roster) => {
    const user = users.find((u) => u.user_id === roster.owner_id);
    return user?.metadata?.team_name || user?.display_name || "Unknown Team";
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
            {index + 1}. {getTeamName(roster)}
          </h3>
          <p className="team-record">
            Record: {roster.settings.wins}-{roster.settings.losses}
          </p>
          <p className="team-points">
            Points for: {roster.settings.fpts.toFixed(2)} Points against:{" "}
            {roster.settings.fpts_against.toFixed(2)}
          </p>
        </div>
      ))}
    </div>
  );
}

export default Standings;
