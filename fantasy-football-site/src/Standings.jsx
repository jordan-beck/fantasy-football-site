function Standings({ rosters, users }) {
  const getTeamName = (roster) => {
    const user = users.find((u) => u.user_id === roster.owner_id);
    return user ? user.display_name : "Unknown Team";
  };
  return (
    <div>
      <h2>League Standings</h2>
      {rosters.map((roster) => (
        <div
          key={roster.roster_id}
          style={{
            marginBottom: "10px",
            padding: "10px",
            border: "1px solid #ccc",
          }}
        >
          <h3>{getTeamName(roster)}</h3>
          <p>Team {roster.roster_id}</p>
          <p>
            Wins: {roster.settings.wins} - Losses: {roster.settings.losses}
          </p>
          <p>
            Points for: {roster.settings.fpts} Points against:{" "}
            {roster.settings.fpts_against}
          </p>
        </div>
      ))}
    </div>
  );
}

export default Standings;
