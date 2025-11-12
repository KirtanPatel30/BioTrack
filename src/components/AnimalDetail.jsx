import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  CircularProgress,
  Divider,
  Box,
  Chip,
  Fade,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PetsIcon from "@mui/icons-material/Pets";
import EmojiNatureIcon from "@mui/icons-material/EmojiNature";
import TerrainIcon from "@mui/icons-material/Terrain";
import BugReportIcon from "@mui/icons-material/BugReport";
import PublicIcon from "@mui/icons-material/Public";

const API_BASE = "http://127.0.0.1:8000";

export default function AnimalDetail({ animal }) {
  const [open, setOpen] = useState(false);
  const [selectedPredator, setSelectedPredator] = useState(null);
  const [predatorData, setPredatorData] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!animal) {
    return <p style={{ color: "#555" }}>Select an animal to view details.</p>;
  }

  // Extract predator list
  const predators = animal.Predators
    ? animal.Predators.split(/[,;]+/).map((p) => p.trim())
    : [];

  // Function to get dynamic color for predator badges
  const getBadgeColor = (pred) => {
    const lower = pred.toLowerCase();
    if (lower.includes("lion") || lower.includes("tiger")) return "#d32f2f"; // red tone
    if (lower.includes("wolf") || lower.includes("fox")) return "#1976d2"; // blue
    if (lower.includes("eagle") || lower.includes("hawk")) return "#fbc02d"; // yellow
    if (lower.includes("hyena") || lower.includes("dog")) return "#fc3706ff"; // purple
    return "#388e3c"; // default green
  };

  // Handle predator click
  const handlePredatorClick = (pred) => {
    setOpen(true);
    setSelectedPredator(pred);
    setLoading(true);
    setPredatorData(null);

    fetch(`${API_BASE}/search?name=${encodeURIComponent(pred)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0) setPredatorData(data[0]);
        else {
          const singular = pred.endsWith("s") ? pred.slice(0, -1) : pred;
          return fetch(`${API_BASE}/search?name=${encodeURIComponent(singular)}`)
            .then((res) => res.json())
            .then((retry) => {
              if (retry.length > 0) setPredatorData(retry[0]);
            });
        }
      })
      .finally(() => setLoading(false))
      .catch((err) => console.error("Error loading predator:", err));
  };

  // Function to pick an icon for predator badges
  const getPredatorIcon = (pred) => {
    const lower = pred.toLowerCase();
    if (lower.includes("lion") || lower.includes("tiger")) return <PetsIcon />;
    if (lower.includes("eagle") || lower.includes("hawk")) return <PublicIcon />;
    if (lower.includes("wolf") || lower.includes("dog")) return <TerrainIcon />;
    if (lower.includes("hyena")) return <BugReportIcon />;
    return <EmojiNatureIcon />;
  };

  return (
   <div
  style={{
    background: "white",
    padding: "1.8rem",
    borderRadius: "16px",
    boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
    border: "2px solid rgba(25, 118, 210, 0.1)",
    backgroundImage:
      "linear-gradient(135deg, #ffffff 0%, #f9fbff 100%)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "translateY(-3px)";
    e.currentTarget.style.boxShadow = "0 14px 28px rgba(0,0,0,0.12)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.08)";
  }}
>

    
      <h2
  style={{
    fontSize: "2.2rem",
    fontWeight: "800",
    background: "linear-gradient(90deg, #0a4785, #1e88e5)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
  }}
>
  <PetsIcon color="primary" /> {animal.Animal}
</h2>


      <Divider sx={{ margin: "0.8rem 0" }} />

      <Box sx={{ lineHeight: 1.9 }}>
        <Typography>
          <strong>Scientific Name:</strong> {animal["Scientific Name"] || "N/A"}
        </Typography>
        <Typography>
          <strong>Habitat:</strong> {animal.Habitat || "N/A"}
        </Typography>
        <Typography>
          <strong>Conservation Status:</strong>{" "}
          <Chip
            label={animal["Conservation Status"] || "Unknown"}
            color={
              animal["Conservation Status"] === "Endangered"
                ? "error"
                : animal["Conservation Status"] === "Vulnerable"
                ? "warning"
                : "success"
            }
            size="small"
            sx={{ fontWeight: "bold" }}
          />
        </Typography>
        <Typography>
          <strong>Diet:</strong> {animal.Diet || "N/A"}
        </Typography>
      </Box>

      {/*  Predator section */}
      {predators.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <strong>Predators:</strong>{" "}
          {predators.map((pred, index) => (
            <Tooltip key={index} title={`View details about ${pred}`}>
              <Chip
                icon={getPredatorIcon(pred)}
                label={pred}
                onClick={() => handlePredatorClick(pred)}
                sx={{
                  background: `linear-gradient(135deg, ${getBadgeColor(
                    pred
                  )} 0%, ${getBadgeColor(pred)}dd 100%)`,
                  color: "white",
                  fontWeight: "600",
                  cursor: "pointer",
                  marginRight: "0.4rem",
                  marginBottom: "0.3rem",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
                  },
                }}
              />
            </Tooltip>
          ))}
        </div>
      )}

      {/*  Description */}
      <Typography sx={{ marginTop: 2, color: "#333" }}>
        <strong>Description:</strong>{" "}
        {animal.Description && animal.Description.trim() !== ""
          ? animal.Description
          : `The ${animal.Animal} is a ${
              animal.Diet?.toLowerCase() || "fascinating creature"
            } found mainly in ${
              animal.Habitat?.toLowerCase() || "varied habitats"
            }. It is currently listed as ${
              animal["Conservation Status"] || "Unknown"
            }.`}
      </Typography>

      {/*  Modal for Predator Info */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Fade}
        transitionDuration={500}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
            background: "linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: "bold",
            color: "#0a4785",
          }}
        >
           Predator Info — {selectedPredator}
          <IconButton onClick={() => setOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {loading ? (
            <Box sx={{ textAlign: "center", padding: "2rem" }}>
              <CircularProgress />
              <Typography variant="body1" sx={{ marginTop: 2 }}>
                Fetching {selectedPredator} details...
              </Typography>
            </Box>
          ) : predatorData ? (
            <Fade in={true} timeout={400}>
              <Box sx={{ lineHeight: 1.9 }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  {predatorData.Animal}
                </Typography>
                <Typography>
                  <strong>Scientific Name:</strong>{" "}
                  {predatorData["Scientific Name"] || "N/A"}
                </Typography>
                <Typography>
                  <strong>Habitat:</strong> {predatorData.Habitat || "N/A"}
                </Typography>
                <Typography>
                  <strong>Diet:</strong> {predatorData.Diet || "N/A"}
                </Typography>
                <Typography>
                  <strong>Conservation Status:</strong>{" "}
                  <Chip
                    label={predatorData["Conservation Status"] || "Unknown"}
                    color={
                      predatorData["Conservation Status"] === "Endangered"
                        ? "error"
                        : predatorData["Conservation Status"] === "Vulnerable"
                        ? "warning"
                        : "success"
                    }
                    size="small"
                    sx={{ fontWeight: "bold" }}
                  />
                </Typography>
                <Typography sx={{ marginTop: 1.5 }}>
                  <strong>Description:</strong>{" "}
                  {predatorData.Description &&
                  predatorData.Description.trim() !== ""
                    ? predatorData.Description
                    : `The ${predatorData.Animal} is a ${
                        predatorData.Diet?.toLowerCase() ||
                        "fascinating creature"
                      } found mainly in ${
                        predatorData.Habitat?.toLowerCase() || "varied habitats"
                      }. It is currently listed as ${
                        predatorData["Conservation Status"] || "Unknown"
                      }.`}
                </Typography>
              </Box>
            </Fade>
          ) : (
            <Typography
              variant="body1"
              color="error"
              textAlign="center"
              sx={{ padding: "1rem" }}
            >
              No data found for {selectedPredator}.
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
