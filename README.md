#  BioTrack A full stack Web Application


This is a simple FastAPI backend for your Animal Encyclopedia project, using your `Animal Dataset.csv` as the data source.

##  Setup

```bash
cd animal-backend
pip install -r requirements.txt
```

## Run the server

```bash
uvicorn main:app --reload
```

Then open your browser to 👉 http://127.0.0.1:8000/docs to test the API.

## 🌐 Endpoints
- `GET /animals` → Returns the full dataset as JSON
- `GET /animals/{id}` → Returns a single animal by index
- `GET /search?name=lion` → Search animals by name (case-insensitive)
