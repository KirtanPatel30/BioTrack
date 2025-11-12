import React, { useState, useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import AnimalList from "./components/AnimalList";
import AnimalDetail from "./components/AnimalDetail";
import SearchBar from "./components/SearchBar";
import Dashboard from "./Dashboard";
import Quiz from "./Quiz";
import Login from "./Login";
import Image from "./Image"; 
import { FaStar } from "react-icons/fa";

const API_BASE = "http://127.0.0.1:8000";
function AnimalDetailPage() {
  const { name } = useParams();
  const [animal, setAnimal] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/search?name=${encodeURIComponent(name)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0) setAnimal(data[0]);
      })
      .catch((err) => console.error("Error loading animal:", err));
  }, [name]);

  if (!animal)
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>Loading {name}...</h2>
      </div>
    );

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "900px",
        margin: "0 auto",
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <AnimalDetail animal={animal} />
    </div>
  );
}

export default function App() {
  const [animals, setAnimals] = useState([]);
  const [filteredAnimals, setFilteredAnimals] = useState([]);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortOption, setSortOption] = useState("none");
  const [currentUser, setCurrentUser] = useState(null);
  const [favorites, setFavorites] = useState([]);

  //Load all animals
  useEffect(() => {
    fetch(`${API_BASE}/animals`)
      .then((res) => res.json())
      .then((data) => {
        const withIds = data.map((item, index) => ({ ...item, _id: index }));
        setAnimals(withIds);
        setFilteredAnimals(withIds);
      })
      .catch((err) => console.error("Error loading animals:", err));
  }, []);

  //  Select one animal for detail
  const handleSelect = (id) => {
    fetch(`${API_BASE}/animals/${id}`)
      .then((res) => res.json())
      .then((data) => setSelectedAnimal(data))
      .catch((err) => console.error("Error loading animal:", err));
  };

//  Select an animal by name (used when clicking predators)
const handleSelectByName = (name) => {
  fetch(`${API_BASE}/search?name=${encodeURIComponent(name)}`)
    .then((res) => res.json())
    .then((data) => {
      if (data.length > 0) {
        setSelectedAnimal(data[0]); // Show matching animal
      } else {
        // Try again with singular version
        const singular = name.endsWith("s") ? name.slice(0, -1) : name;
        fetch(`${API_BASE}/search?name=${encodeURIComponent(singular)}`)
          .then((res) => res.json())
          .then((retry) => {
            if (retry.length > 0) {
              setSelectedAnimal(retry[0]);
            } else {
              alert(`No data found for "${name}".`);
            }
          });
      }
    })
    .catch((err) => console.error("Error fetching predator info:", err));
};


  //  Search animals
  const handleSearch = (query) => {
    if (!query) {
      applyFiltersAndSorting(animals);
    } else {
      fetch(`${API_BASE}/search?name=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((filtered) => {
          fetch(`${API_BASE}/animals`)
            .then((res) => res.json())
            .then((allData) => {
              const withIds = filtered.map((animal) => {
                const originalIndex = allData.findIndex(
                  (a) => a.Animal === animal.Animal
                );
                return { ...animal, _id: originalIndex };
              });
              applyFiltersAndSorting(withIds);
            });
        });
    }
  };

  //  Apply filters + sorting
  useEffect(() => {
    applyFiltersAndSorting(animals);
  }, [filterStatus, sortOption, animals]);

  const applyFiltersAndSorting = (baseList) => {
    let list = [...baseList];
    if (filterStatus !== "All") {
      list = list.filter((a) => a["Conservation Status"] === filterStatus);
    }
    if (sortOption === "name-asc") {
      list.sort((a, b) => a.Animal.localeCompare(b.Animal));
    } else if (sortOption === "name-desc") {
      list.sort((a, b) => b.Animal.localeCompare(a.Animal));
    }
    setFilteredAnimals(list);
  };

  //  Random Animal
  const handleRandom = () => {
    if (filteredAnimals.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredAnimals.length);
      const randomAnimal = filteredAnimals[randomIndex];
      fetch(`${API_BASE}/animals/${randomAnimal._id}`)
        .then((res) => res.json())
        .then((data) => setSelectedAnimal(data));
    }
  };

  //  LOGIN HANDLER
  const handleLogin = (username) => {
    setCurrentUser(username);
    const users = JSON.parse(localStorage.getItem("users")) || {};
    setFavorites(users[username]?.favorites || []);
  };

  //  LOGOUT HANDLER
  const handleLogout = () => {
    setCurrentUser(null);
  };

  //  FAVORITE TOGGLE
  const toggleFavorite = (animal) => {
    if (!currentUser) return;

    const users = JSON.parse(localStorage.getItem("users")) || {};
    const user = users[currentUser] || { password: "", favorites: [] };

    const exists = user.favorites.find((f) => f.Animal === animal.Animal);
    if (exists) {
      user.favorites = user.favorites.filter((f) => f.Animal !== animal.Animal);
    } else {
      user.favorites.push(animal);
    }

    users[currentUser] = user;
    localStorage.setItem("users", JSON.stringify(users));
    setFavorites(user.favorites);
  };


  //  Show login page first if not logged in
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div
      style={{
  fontFamily: "Segoe UI, Roboto, sans-serif",
  background: "linear-gradient(135deg, #e3f2fd 0%, #f0f8ff 100%)",
  minHeight: "100vh",
  margin: 0,
}}

    >
      {/* 🌟 HEADER */}
      <header
        style={{
          backgroundColor: "#0a4785",
          color: "white",
          padding: "1rem 2rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >
        {/* Left: Title */}
        <h1 style={{ margin: 0, fontWeight: "700", fontSize: "1.4rem" }}>
          BioTrack – A Fullstack Web Application
        </h1>

        {/* Center: Navigation */}
        <nav>
          <Link
            to="/"
            style={{
              color: "white",
              marginRight: "1.5rem",
              textDecoration: "none",
              fontWeight: "500",
            }}
          >
            Home
          </Link>
          <Link
            to="/dashboard"
            style={{
              color: "white",
              textDecoration: "none",
              fontWeight: "500",
              marginRight: "1.5rem",
            }}
          >
            Dashboard
          </Link>
          <Link
            to="/quiz"
            style={{
              color: "white",
              textDecoration: "none",
              fontWeight: "500",
              marginRight: "1.5rem",
            }}
          >
            Quiz Mode
          </Link>
          {/* 🆕 New Navigation Link */}
          <Link
            to="/identify"
            style={{
              color: "white",
              textDecoration: "none",
              fontWeight: "500",
              marginRight: "1.5rem",
            }}
          >
            Image Identification
          </Link>
        </nav>

        {/* Right: Welcome + Logout */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontWeight: "500" }}> Welcome, {currentUser}</span>
          <button
            onClick={handleLogout}
            style={{
              padding: "0.4rem 0.8rem",
              background: "#ef5350",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* 🧭 ROUTES */}
      <Routes>
        {/* HOME PAGE */}
        <Route
          path="/"
          element={
            <div
              style={{
                display: "flex",
                padding: "1.5rem",
                gap: "1.5rem",
                maxWidth: "1200px",
                margin: "0 auto",
              }}
            >
              {/* Sidebar */}
              <div
                style={{
                  flex: "0 0 320px",
                  background: "white",
                  padding: "1rem",
                  borderRadius: "10px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                  height: "fit-content",
                }}
              >
                <SearchBar onSearch={handleSearch} />

                {/* Filter Dropdown */}
                <div style={{ marginBottom: "1rem" }}>
                  <label>
                    <strong>Filter by Conservation Status:</strong>
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      borderRadius: "6px",
                      marginTop: "0.3rem",
                    }}
                  >
                    <option value="All">All</option>
                    <option value="Least Concern">Least Concern</option>
                    <option value="Near Threatened">Near Threatened</option>
                    <option value="Vulnerable">Vulnerable</option>
                    <option value="Endangered">Endangered</option>
                    <option value="Critically Endangered">
                      Critically Endangered
                    </option>
                  </select>
                </div>

                {/* Sort Dropdown */}
                <div style={{ marginBottom: "1rem" }}>
                  <label>
                    <strong>Sort by:</strong>
                  </label>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      borderRadius: "6px",
                      marginTop: "0.3rem",
                    }}
                  >
                    <option value="none">None</option>
                    <option value="name-asc">Name (A–Z)</option>
                    <option value="name-desc">Name (Z–A)</option>
                  </select>
                </div>

                {/* Random Animal */}
                <button
                  onClick={handleRandom}
                  style={{
                    width: "100%",
                    padding: "0.6rem",
                    background: "#2e7d32",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Show Random Animal
                </button>

                {/* Favorites Section */}
                <div
                  style={{
                    marginTop: "1rem",
                    background: "#f8f9fa",
                    padding: "0.8rem",
                    borderRadius: "8px",
                    boxShadow: "inset 0 0 4px rgba(0,0,0,0.05)",
                  }}
                >
                  <h3 style={{ marginTop: 0 }}>My Favorites</h3>
                  {favorites.length === 0 ? (
                    <p style={{ fontSize: "0.9rem", color: "#555" }}>
                      No favorites yet.
                    </p>
                  ) : (
                    <ul
                      style={{
                        listStyle: "none",
                        paddingLeft: 0,
                        marginTop: "0.5rem",
                      }}
                    >
                      {favorites.map((a) => (
                        <li key={a.Animal} style={{ marginBottom: "0.3rem" }}>
                          ⭐ {a.Animal}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Animal List */}
                <div style={{ marginTop: "1rem" }}>
                  <AnimalList
                    animals={filteredAnimals}
                    onSelect={handleSelect}
                    favorites={favorites}
                    toggleFavorite={toggleFavorite}
                  />
                </div>
              </div>

              {/* Details Panel */}
              <div
                style={{
                  flex: 1,
                  background: "white",
                  padding: "1.5rem",
                  borderRadius: "10px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                }}
              >
                <AnimalDetail animal={selectedAnimal} onSelect={handleSelectByName} />

              </div>
            </div>
          }
        />

        {/* QUIZ PAGE */}
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/*  New route for Image Identification */}
        <Route path="/identify" element={<Image />} />
        <Route path="/animal/:name" element={<AnimalDetailPage />} />

      </Routes>
    </div>
  );
}
