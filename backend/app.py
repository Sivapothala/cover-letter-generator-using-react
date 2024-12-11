import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "./uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_API_URL = "https://api.gemini.com/v1/generate"  # Replace with the actual API URL

@app.route('/generate', methods=['POST'])
def generate_cover_letter():
    # Save uploaded resume
    resume_file = request.files.get("resume")
    if not resume_file:
        return jsonify({"error": "Resume is required"}), 400

    resume_path = os.path.join(UPLOAD_FOLDER, resume_file.filename)
    resume_file.save(resume_path)

    # Handle job description (file or text)
    job_description_file = request.files.get("job_description_file")
    job_description_text = request.form.get("job_description_text")

    if job_description_file:
        job_description_path = os.path.join(UPLOAD_FOLDER, job_description_file.filename)
        job_description_file.save(job_description_path)

        # Convert job description file to text (optional)
        with open(job_description_path, "r") as f:
            job_description = f.read()
    elif job_description_text:
        job_description = job_description_text
    else:
        return jsonify({"error": "Job description is required"}), 400

    # Call Gemini API
    headers = {"Authorization": f"Bearer {GEMINI_API_KEY}"}
    payload = {
        "resume": open(resume_path, "r").read(),
        "job_description": job_description,
    }

    try:
        response = requests.post(GEMINI_API_URL, headers=headers, json=payload)
        response.raise_for_status()  # Raise an error for HTTP codes >= 400
        gemini_response = response.json()
        cover_letter = gemini_response.get("cover_letter", "No cover letter generated")
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500

    return jsonify({"cover_letter": cover_letter})

if __name__ == '__main__':
    app.run(debug=True)
