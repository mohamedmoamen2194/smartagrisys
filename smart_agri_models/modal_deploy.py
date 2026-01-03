"""
Modal deployment configuration for SmartAgri Models API

Setup:
1. Install Modal: pip install modal
2. Authenticate: modal token new
3. Set secrets in Modal dashboard: https://modal.com/secrets
   - Create secret named "smart-agri-secrets" with:
     * OPENROUTER_API_KEY (required)
     * OPENROUTER_BASE_URL (optional, default: https://openrouter.ai/api/v1)
     * LLM_MODEL (optional, default: meta-llama/llama-3.1-8b-instruct)

Deploy:
modal deploy smart_agri_models/modal_deploy.py

Serve (for testing):
modal serve smart_agri_models/modal_deploy.py

Get URL:
modal app show smart-agri-models
"""

import modal
import os

# Read requirements.txt and install dependencies
requirements_file = os.path.join(os.path.dirname(__file__), "requirements.txt")
requirements_list = []

if os.path.exists(requirements_file):
    with open(requirements_file, "r") as f:
        lines = f.readlines()
        for line in lines:
            line = line.strip()
            if line and not line.startswith("#"):
                # Extract package name (remove version specifiers and comments)
                pkg = line.split("#")[0].strip()
                if pkg:
                    requirements_list.append(pkg)
else:
    # Fallback: explicit list
    requirements_list = [
        "fastapi>=0.104.1",
        "uvicorn[standard]>=0.24.0",
        "python-multipart>=0.0.6",
        "torch>=2.1.0",
        "torchvision>=0.16.0",
        "scikit-learn>=1.4.0",
        "joblib>=1.3.2",
        "numpy>=1.26.4",
        "pillow>=10.2.0",
        "tensorflow>=2.20.0",
        "opencv-python>=4.10.0.84",
        "segmentation-models-pytorch>=0.5.0",
        "requests>=2.32.3",
        "pandas>=2.0.3",
    ]

# Define the image with all dependencies
image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("libgl1", "libglib2.0-0", "libgomp1")  # For OpenCV and PyTorch
    .pip_install(*requirements_list)
    .add_local_dir("smart_agri_models", "/root/smart_agri_models")
)

# Create the app
app = modal.App("smart-agri-models")

@app.function(
    image=image,
    secrets=[
        modal.Secret.from_name("smart-agri-secrets"),
    ],
    allow_concurrent_inputs=100,
    timeout=300,
)
@modal.asgi_app()
def fastapi_app():
    import sys
    
    # Add to path so imports work
    sys.path.insert(0, "/root")
    
    # Import and return FastAPI app
    from smart_agri_models.main import app as fastapi_application
    return fastapi_application
