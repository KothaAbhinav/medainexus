import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const Extract = () => {
  const { imgLink, extractedText } = useLocation().state || {};
  const [medicineExtraction, setMedicineExtraction] = useState("");

  useEffect(() => {
    if (extractedText) {
      axios
        .post("http://localhost:5003/medicine-extraction", { prescriptionText: extractedText })
        .then((response) => {
          setMedicineExtraction(response.data.extraction);
        })
        .catch((error) => {
          console.error("Error during medicine extraction:", error);
          setMedicineExtraction("Error during medicine extraction.");
        });
    }
  }, [extractedText]);

  if (!imgLink) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "20px",
        }}
      >
        {/* Uploaded Image Section */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "400px" }}>
          <h3 style={{ margin: "10px 0" }}>Uploaded Image</h3>
          <div
            style={{
              width: "100%",
              height: "300px",
              border: "1px solid black",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {imgLink && <img src={imgLink} alt="Uploaded" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />}
          </div>
        </div>

        {/* Extracted Text Section */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "400px" }}>
          <h3 style={{ margin: "10px 0" }}>Extracted Text</h3>
          <textarea
            value={extractedText || "No text extracted"}
            readOnly
            style={{ width: "100%", height: "300px", border: "1px solid black", padding: "10px" }}
          />
        </div>
      </div>

      {/* Medicine Extraction Result Heading (Now Outside the Box) */}
      <h3 style={{ marginTop: "20px", textAlign: "center" }}>Medicine Extraction Result</h3>

      {/* Medicine Extraction Result Section */}
      <div
        style={{
          width: "80%",
          border: "1px solid black",
          padding: "10px",
          marginLeft: "auto",
          marginRight: "auto",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ whiteSpace: "pre-line" }}>
          {medicineExtraction
            ? medicineExtraction
                .split("\n\n")
                .map((block, index) => {
                  const lines = block.split("\n").map(line => line.trim());

                  if (lines.length >= 3) {
                    let medicineName = lines[0].replace("Medicine Name:", "").trim();
                    medicineName = medicineName.replace(/:$/, ""); // Remove trailing colon if present

                    return (
                      <div key={index} style={{ marginBottom: "15px" }}>
                        <p>
                          <strong>{medicineName}</strong> : {lines[1]}
                        </p>
                        <p style={{ marginLeft: "20px" }}>{lines[2]}</p>
                        <p style={{ marginLeft: "20px" }}>{lines[3]}</p>
                      </div>
                    );
                  }
                  return <p key={index}>{block}</p>;
                })
            : "No extraction result available"}
        </div>
      </div>
    </div>
  );
};

export default Extract;
