import { useState, useEffect } from "react";

function Matchups() {
  const [selectedWeek, setSelectedWeek] = useState(11);
  const [matchups, setMatchups] = useState(null);

  useEffect(() => {
    fetch(
      `https://api.sleeper.app/v1/league/1257101142144327682/matchups/${selectedWeek}`
    )
      .then((response) => response.json())
      .then((data) => {
        console.log("Matchups:", data);
        setMatchups(data);
      });
  }, [selectedWeek]);

  if (!matchups) {
    return <div>Loading matchups...</div>;
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h2>Week {selectedWeek} Matchups</h2>
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => setSelectedWeek(selectedWeek - 1)}
          disabled={selectedWeek === 1}
        >
          Previous Week
        </button>
        <span style={{ margin: "0 10px" }}>Week {selectedWeek}</span>
        <button
          onClick={() => setSelectedWeek(selectedWeek + 1)}
          disabled={selectedWeek === 18}
        >
          Next Week
        </button>
      </div>

      <div>
        {matchups.map((matchup, index) => (
          <div
            key={index}
            style={{
              marginBottom: "15px",
              padding: "15px",
              border: "1px solid #ccc",
            }}
          >
            <p>Roster ID: {matchup.roster_id}</p>
            <p>Points: {matchup.points}</p>
            <p>Matchup ID: {matchup.matchup_id}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Matchups;
