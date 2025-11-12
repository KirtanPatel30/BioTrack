

/* using a Machine Learning model.

User selects an image
store the selected image using React state (setFile)
generate an instant preview using URL.createObjectURL()
function does:
 Creates FormData()
 Sends image → backend via POST request
 Waits for predictions
Displays:
Top 3 ML predictions
Closest match from your dataset (Habitat, Status)
What FastAPI does
1. Accepts the uploaded image
Reads the file
Converts to RGB
Resizes to 224 x 224 for MobileNetV2
2. Runs the ML model
You load MobileNetV2, a pretrained CNN model.
It returns:
Predicted label (ex: "lion")
Confidence score
3. Converts ML result into readable text
Example:
african_lion → African Lion
4. Matches it with your CSV dataset
Searches your animal CSV for the closest match.
5. Returns JSON with:
Predictions (top 3)
Exact match if found in dataset


User uploads an image
The frontend takes any picture (jpg, png) and sends it to the backend using a POST request:
POST /identify
We send the image as FormData

Backend reads and prepares the image
FastAPI receives the image, opens it using Pillow (PIL), and prepares it:
Convert to RGB
Resize to 224 × 224 (the size MobileNetV2 expects)
Convert it into a NumPy array
Normalize the pixel values


The image is passed into MobileNetV2
MobileNetV2 = a pre-trained image classifier from Google.
Think of it as:
“An AI model that has already seen millions of images and can recognize many animals.”


MobileNetV2 knows general animals.

But your dataset has extra information:
Habitat
Conservation status
Diet
Predators
Description
*/




//  Image Identification Component
// Allows user to upload an image and identifies the animal using ML model (MobileNetV2)

import React, { useState } from "react";

const API_BASE = "http://127.0.0.1:8000";

export default function Image() {
  // Stores the selected image file
  const [file, setFile] = useState(null);

  // Preview image before uploading
  const [preview, setPreview] = useState(null);

  // Loading state while waiting for backend prediction
  const [loading, setLoading] = useState(false);

  // Stores ML predictions (top 3 results)
  const [result, setResult] = useState(null);

  // Stores closest dataset match (name, habitat, status)
  const [match, setMatch] = useState(null);

  // Handles uploading the image to backend
  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setResult(null);
    setMatch(null);

    // Build form data to send image file
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Send image -FastAPI backend
      const res = await fetch(`${API_BASE}/identify`, {
        method: "POST",
        body: formData,
      });

      // Receive ML model results + CSV lookup match
      const data = await res.json();
      setResult(data.predictions || []);
      setMatch(data.closest_match || []);
    } catch (err) {
      console.error("Error identifying animal:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h2 className="text-2xl font-bold mb-4">Image Identification</h2>

      {/*  File input */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const selected = e.target.files[0];
          setFile(selected);
          setPreview(URL.createObjectURL(selected));
        }}
        className="border p-2 rounded mb-4"
      />

      {/*  Show preview */}
      {preview && (
        <img
          src={preview}
          alt="preview"
          className="rounded-lg shadow-md mb-4"
          width="250"
        />
      )}

      {/* Identify button */}
      <button
        onClick={handleUpload}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        disabled={loading}
      >
        {loading ? "Identifying..." : "Upload & Identify"}
      </button>

      {/*  Display ML top predictions */}
      {result && (
        <div className="mt-6 text-left w-full max-w-md">
          <h3 className="text-lg font-semibold mb-2">Top Predictions:</h3>
          <ul className="list-disc list-inside">
            {result.map((r, i) => (
              <li key={i}>
                {r.description} — {(r.probability * 100).toFixed(2)}%
              </li>
            ))}
          </ul>
        </div>
      )}

      {/*  Display closest match from your CSV dataset */}
      {match && match.length > 0 && (
        <div className="mt-6 bg-gray-100 p-4 rounded-lg shadow-md w-full max-w-md">
          <h3 className="text-lg font-semibold mb-2">Closest Match in Dataset:</h3>
          <p><strong>Name:</strong> {match[0].Animal}</p>
          <p><strong>Habitat:</strong> {match[0].Habitat}</p>
          <p><strong>Status:</strong> {match[0]["Conservation Status"]}</p>
        </div>
      )}
    </div>
  );
}
