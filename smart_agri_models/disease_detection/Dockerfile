FROM pytorch/pytorch:2.3.0-cuda11.8-cudnn8-runtime
WORKDIR /app
COPY . .
RUN pip install --no-cache-dir -r requirements.txt
EXPOSE 8000
CMD ["uvicorn", "disease_detection_api:app", "--host", "0.0.0.0", "--port", "8000"]
