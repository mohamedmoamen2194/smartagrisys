# syntax=docker/dockerfile:1
FROM python:3.10-slim

# Avoid interactive prompts during apt
ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    TF_CPP_MIN_LOG_LEVEL=2 \
    PIP_DEFAULT_TIMEOUT=100 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# System deps for OpenCV and scientific stack
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt ./requirements.txt

# Install Python deps (prefer CPU wheels for PyTorch to avoid CUDA downloads)
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir --extra-index-url https://download.pytorch.org/whl/cpu -r requirements.txt

# Copy the project code and model weights (build context is smart_agri_models/)
COPY . ./smart_agri_models/

# Expose FastAPI port
EXPOSE 8000

# Default command: run the unified API as a module so package imports work
CMD ["python", "-m", "smart_agri_models.main"]
