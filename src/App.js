import React, { useState } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";

function App() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescriptionFile, setJobDescriptionFile] = useState(null);
  const [jobDescriptionText, setJobDescriptionText] = useState("");
  const [coverLetter, setCoverLetter] = useState("");

  const onDropResume = (acceptedFiles) => {
    setResumeFile(acceptedFiles[0]);
  };

  const onDropJobDescription = (acceptedFiles) => {
    setJobDescriptionFile(acceptedFiles[0]);
    setJobDescriptionText(""); // Clear manual text input if a file is uploaded
  };

  const handleJobDescriptionChange = (e) => {
    setJobDescriptionText(e.target.value);
    setJobDescriptionFile(null); // Clear the uploaded file if manual input is used
  };

  const generateCoverLetter = async () => {
    if (!resumeFile) {
      alert("Please upload a resume!");
      return;
    }

    if (!jobDescriptionFile && !jobDescriptionText) {
      alert("Please provide a job description (file or text)!");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resumeFile);

    if (jobDescriptionFile) {
      formData.append("job_description_file", jobDescriptionFile);
    } else {
      formData.append("job_description_text", jobDescriptionText);
    }

    try {
      const response = await axios.post("http://127.0.0.1:5000/generate", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setCoverLetter(response.data.cover_letter);
    } catch (error) {
      console.error("Error generating cover letter:", error);
    }
  };

  return (
    <div>
      <h1>Cover Letter Generator</h1>

      <h3>Upload Your Resume:</h3>
      <DropzoneArea onDrop={onDropResume} />

      <h3>Provide Job Description:</h3>
      <p>You can either upload a PDF file or enter the description below:</p>
      <DropzoneArea onDrop={onDropJobDescription} />
      <textarea
        value={jobDescriptionText}
        onChange={handleJobDescriptionChange}
        placeholder="Enter the job description here..."
        rows="5"
        style={{ width: "100%", marginTop: "10px" }}
      ></textarea>

      <button onClick={generateCoverLetter}>Generate Cover Letter</button>

      <h3>Generated Cover Letter:</h3>
      <p>{coverLetter}</p>
    </div>
  );
}

const DropzoneArea = ({ onDrop }) => {
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div
      {...getRootProps()}
      style={{
        border: "2px dashed #cccccc",
        padding: "20px",
        marginBottom: "20px",
        textAlign: "center",
      }}
    >
      <input {...getInputProps()} />
      <p>Drag and drop a file here, or click to select a file</p>
    </div>
  );
};

export default App;
