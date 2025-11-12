import React from "react";
import { FaStar } from "react-icons/fa";

export default function AnimalList({ animals, onSelect, favorites, toggleFavorite }) {
  if (!animals || animals.length === 0) {
    return <p style={{ color: "#555", marginTop: "1rem" }}>No animals found.</p>;
  }

  return (
    <ul style={{ listStyle: "none", paddingLeft: 0 }}>
      {animals.map((animal) => (
        <li
          key={animal._id}
          onClick={() => onSelect(animal._id)}
          style={{
            cursor: "pointer",
            padding: "0.4rem 0.6rem",
            borderBottom: "1px solid #eee",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "1rem",
          }}
        >
          <span>{animal.Animal}</span>

          <FaStar
            onClick={(e) => {
              e.stopPropagation(); // prevent opening details when clicking the star
              toggleFavorite(animal);
            }}
            style={{
              color: favorites.some((f) => f.Animal === animal.Animal)
                ? "#ffd700" // gold if favorited
                : "#ccc",   // gray if not
              cursor: "pointer",
              transition: "color 0.2s ease",
            }}
            title="Add to favorites"
          />
        </li>
      ))}
    </ul>
  );
}
