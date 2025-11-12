from fastapi import FastAPI, HTTPException, Query, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
from PIL import Image
import io
import numpy as np
from tensorflow.keras.applications.mobilenet_v2 import (
    MobileNetV2, preprocess_input, decode_predictions
)
import tensorflow as tf

# ------------------------------
# Initialize FastAPI
# ------------------------------
app = FastAPI(title="BioTrack")

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------
# Load dataset
# ------------------------------
DATA_PATH = "data/Animal Dataset.csv"
df = pd.read_csv(DATA_PATH)
df = df.fillna("")

# ------------------------------
# Preload MobileNetV2 model-it is a deep training model created by google t can recognize 1,000 different objects (including many animals).
#MobileNetV2 already comes trained on millions of images (ImageNet dataset).
# ------------------------------
model = MobileNetV2(weights="imagenet")

# ------------------------------
# ROUTE: Get all animals
# ------------------------------
@app.get("/animals")
def get_animals():
    return df.to_dict(orient="records")

# ------------------------------
# ROUTE: Get one animal by ID
# ------------------------------
@app.get("/animals/{animal_id}")
def get_animal(animal_id: int):
    if animal_id < 0 or animal_id >= len(df):
        raise HTTPException(status_code=404, detail="Animal not found")
    return df.iloc[animal_id].to_dict()

# ------------------------------
# ROUTE: Search animals by name
# ------------------------------
@app.get("/search")
def search_animals(name: str = Query(..., description="Name to search for")):
    if "Animal" not in df.columns:
        raise HTTPException(status_code=500, detail="Animal column not found in dataset")

    name = name.strip().lower()
    name_singular = name.rstrip('s')  # handle plural like "Lions" → "Lion"

    # Try multiple matching strategies
    results = df[
        df["Animal"].str.lower().str.contains(name, na=False)
        | df["Animal"].str.lower().str.contains(name_singular, na=False)
    ]

    if results.empty:
        return []  # Avoid crash if nothing matches

    return results.to_dict(orient="records")


# ------------------------------
# ROUTE: Image Identification
# ------------------------------
@app.post("/identify")
async def identify_animal(file: UploadFile = File(...)):
    """
    Identifies an uploaded animal image using MobileNetV2,
    returns top predictions + closest match in the dataset.
    """
    try:
        # Read and preprocess image
        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert("RGB")
        img = img.resize((224, 224))
        img_array = np.expand_dims(np.array(img), axis=0)
        img_array = preprocess_input(img_array)

        # Predict using model
        preds = model.predict(img_array)
        decoded = decode_predictions(preds, top=3)[0]

        # Convert predictions to clean JSON
        results = [
            {"description": name.replace("_", " ").title(), "probability": float(prob)}
            for (_, name, prob) in decoded
        ]

        # Find the closest match in the dataset
        top_guess = decoded[0][1].replace("_", " ").title()
        match = df[df["Animal"].str.contains(top_guess, case=False, na=False)]

        return JSONResponse(
            content={
                "predictions": results,
                "closest_match": match.to_dict(orient="records")[:1] if not match.empty else []
            }
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error identifying image: {str(e)}")

# ------------------------------
# Root route (for quick test)
# ------------------------------
@app.get("/")
def home():
    return {"message": "BioTrack API is running!"}
