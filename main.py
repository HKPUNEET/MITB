# main.py
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import uvicorn
from test_core import analyze_xray  # your function

app = FastAPI(
    title="Pediatric Pneumonia Detection API",
    description="API for analyzing chest X-ray images for pneumonia risk",
    version="1.0.0"
)

# Allow frontend (e.g. React/Vue) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze-xray")
async def analyze_xray_endpoint(
    image: UploadFile = File(...),
    symptoms: Optional[List[str]] = Form(default=[]),           # optional symptoms list
    has_past_history: Optional[bool] = Form(default=False)      # optional history flag
):
    """
    Upload an X-ray image and get pneumonia risk + heatmap.

    - **image**: required file (jpeg/png)
    - **symptoms**: optional list of symptom strings
    - **has_past_history**: optional boolean (past pneumonia?)

    Returns JSON with probabilities, risks, explanation, and base64 heatmap.
    """
    try:
        # Read uploaded image bytes
        image_bytes = await image.read()

        # Call your analyze function
        result = analyze_xray(
            image_input=image_bytes,
            is_bytes=True,
            use_tta=False,                     # change to True if you want TTA
            matched_symptoms=symptoms,
            has_past_history=has_past_history
        )

        return JSONResponse(content=result)

    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


# Health check endpoint (optional)
@app.get("/health")
def health():
    return {"status": "healthy", "message": "Pneumonia Detection API is running"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
