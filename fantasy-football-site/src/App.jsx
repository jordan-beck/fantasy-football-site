import { useState, useEffect } from "react";
import Standings from "./Standings";
import Matchups from "./Matchups";

function App() {
  const [leagueData, setLeagueData] = useState(null);
  const [rosters, setRosters] = useState(null);
  const [users, setUsers] = useState(null);

  useEffect(() => {
    //Fetch league info
    fetch("https://api.sleeper.app/v1/league/1257101142144327682")
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setLeagueData(data);
      });
    //Fetch rosters
    fetch("https://api.sleeper.app/v1/league/1257101142144327682/rosters")
      .then((response) => response.json())
      .then((data) => {
        console.log("Rosters:", data);
        setRosters(data);
      });

    //Fetch users
    fetch("https://api.sleeper.app/v1/league/1257101142144327682/users")
      .then((response) => response.json())
      .then((data) => {
        console.log("Users:", data);
        setUsers(data);
      });
  }, []);

  if (!leagueData || !rosters || !users) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{leagueData.name}</h1>
      <p>Season: {leagueData.season}</p>
      <p>Total Rosters: {leagueData.total_rosters}</p>
      <Matchups />
      <Standings rosters={rosters} users={users} />
    </div>
  );
}

export default App;
