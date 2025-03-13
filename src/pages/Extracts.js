import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const Extract = () => {
  // Retrieve state passed via navigation: uploaded image, processed image URL, and the extracted text (e.g., via OCR)
  const { imgLink, processedImageUrl, extractedText } = useLocation().state || {};
  const [medicineExtraction, setMedicineExtraction] = useState("");

  // Once the component loads and if extractedText is available,
  // call the medicine extraction endpoint (running on port 5003) to get the medicine names and dosages.
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

  // Display a loading message if the required image links are not available yet.
  if (!imgLink || !processedImageUrl) {
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

        {/* Processed Image Section */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "400px" }}>
          <h3 style={{ margin: "10px 0" }}>Processed Image</h3>
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
            {processedImageUrl && <img src={processedImageUrl} alt="Processed" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />}
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

      {/* Medicine Extraction Result Section */}
      <div
        style={{
          marginTop: "20px",
          width: "80%",
          border: "1px solid black",
          padding: "10px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <h3>Medicine Extraction Result</h3>
        <p>{medicineExtraction || "No extraction result available"}</p>
      </div>
    </div>
  );
};

export default Extract;
