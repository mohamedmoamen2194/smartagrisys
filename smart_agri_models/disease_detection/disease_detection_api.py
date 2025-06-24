from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import shutil
import os
from disease_detection_inference import predict

app = FastAPI()

@app.post("/predict")
async def predict_disease(file: UploadFile = File(...)):
    # Save the uploaded file to a temporary location
    try:
        temp_path = f"temp_{file.filename}"
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        result = predict(temp_path)
        os.remove(temp_path)
        return JSONResponse(content=result)
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(status_code=400, detail=str(e)) 