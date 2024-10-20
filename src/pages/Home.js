import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../DataContext";

const Home = () => {
  const [fileData, setFileData] = useState([]);
  const navigate = useNavigate();
  const { setTableData, setIsLoading } = useData();

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setFileData(files.map((file) => ({ file, company: "" })));
  };

  const handleCompanyChange = (index, company) => {
    setFileData((prevData) =>
      prevData.map((item, i) => (i === index ? { ...item, company } : item)),
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (fileData.length === 0 || fileData.some((item) => !item.company)) {
      alert(
        "Please upload at least one file and select a company for each file",
      );
      return;
    }

    setIsLoading(true);
    let allData = [];

    for (const { file, company } of fileData) {
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("pdf_type", company);

      try {
        const response = await fetch("http://localhost:5000/upload", {
          method: "POST",
          body: formData,
          headers: {
            // You may not need this, as FormData automatically sets correct headers
            // "Content-Type": "multipart/form-data",
          },
        });

        if (!response.ok) {
          throw new Error(`API request failed for file: ${file.name}`);
        }

        const data = await response.json();
        const transactionsData = data["transactions"];
        allData = [...allData, ...transactionsData];
      } catch (error) {
        console.error("Error processing file:", file.name, error);
        alert(`An error occurred while processing file: ${file.name}`);
      }
    }

    setTableData(allData);
    setIsLoading(false);
    navigate("/table");
  };

  return (
    <div
      style={{
        backgroundColor: "#a2d2ff",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1
        style={{
          color: "#ffffff",
          fontSize: "2.5rem",
          textAlign: "center",
          marginBottom: "30px",
          textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
          backgroundColor: "#4a90e2",
          padding: "15px 30px",
          borderRadius: "10px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        }}
      >
        BIC Bank Audit System
      </h1>

      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="fileUpload"
            style={{
              display: "block",
              marginBottom: "10px",
              fontWeight: "bold",
            }}
          >
            Upload Audit Files:
          </label>
          <input
            type="file"
            id="fileUpload"
            onChange={handleFileChange}
            accept=".pdf,.docx,.xlsx"
            required
            multiple
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "5px",
            }}
          />
        </div>

        {fileData.map((item, index) => (
          <div key={index} style={{ marginBottom: "20px" }}>
            <p style={{ marginBottom: "5px" }}>{item.file.name}</p>
            <select
              value={item.company}
              onChange={(e) => handleCompanyChange(index, e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "5px",
              }}
            >
              <option value="">-- Select Company --</option>
              <option value="Company B1">Company B1</option>
              <option value="Company B2">Company B2</option>
              <option value="Company B3">Company B3</option>
              <option value="Company B4">Company B4</option>
            </select>
          </div>
        ))}

        <div>
          <button
            type="submit"
            disabled={
              fileData.length === 0 || fileData.some((item) => !item.company)
            }
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor:
                fileData.length === 0 || fileData.some((item) => !item.company)
                  ? "#ccc"
                  : "#4a90e2",
              color: "white",
              border: "none",
              borderRadius: "5px",
              fontSize: "16px",
              cursor:
                fileData.length === 0 || fileData.some((item) => !item.company)
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            Upload and Process
          </button>
        </div>
      </form>
    </div>
  );
};

export default Home;
