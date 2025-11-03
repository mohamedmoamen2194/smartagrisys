FROM python:3.10-slim

WORKDIR /app
COPY . .
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

# Run the FastAPI app using uvicorn
CMD ["uvicorn", "crop_rec_api:app", "--host", "0.0.0.0", "--port", "8000"]
