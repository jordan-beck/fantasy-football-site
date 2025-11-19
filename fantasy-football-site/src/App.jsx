import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Standings from "./Standings";
import Matchups from "./Matchups";
import ChampionWidget from "./ChampionWidget";
import "./App.css";

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
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout leagueData={leagueData}>
              <ChampionWidget currentLeagueId={leagueData.league_id} />
            </Layout>
          }
        >
          <Route
            index
            element={
              <div>
                <h1>Home Dashboard</h1>
                <p>
                  Main content area - your dashboard components will go here
                </p>
              </div>
            }
          />
          <Route
            path="matchups"
            element={
              <Matchups
                rosters={rosters}
                users={users}
                currentWeek={leagueData.settings.leg}
              />
            }
          />
          <Route
            path="standings"
            element={<Standings rosters={rosters} users={users} />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
