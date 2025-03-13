import React from "react";
import { useLocation } from "react-router-dom";

const Detection = () => {
  const location = useLocation();
  const { imgLink, processedImageUrl } = location.state || {};

  if (!imgLink || !processedImageUrl) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", gap: "20px" }}>
      
      {/* Original Image Section */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "400px" }}>
        <h3 style={{ margin: "10px 0" }}>Original Image</h3>
        <div style={{ width: "100%", height: "300px", border: "1px solid black", display: "flex", justifyContent: "center", alignItems: "center" }}>
          {imgLink && <img src={imgLink} alt="Uploaded" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />}
        </div>
      </div>

      {/* Detected Image Section */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "400px" }}>
        <h3 style={{ margin: "10px 0" }}>Detected Image</h3>
        <div style={{ width: "100%", height: "300px", border: "1px solid black", display: "flex", justifyContent: "center", alignItems: "center" }}>
          {processedImageUrl && <img src={processedImageUrl} alt="Processed" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />}
        </div>
      </div>

    </div>
  );
};

export default Detection;