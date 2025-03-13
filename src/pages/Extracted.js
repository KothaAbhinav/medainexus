import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Extracted = () => {
  const [imgLink, setImgLink] = useState('');
  const navigate = useNavigate();

  const handleConvert = () => {
    const fileInput = document.getElementById("input-file").files[0];
    if (!fileInput) {
      alert("Please upload an image first.");
      return;
    }

    const formData = new FormData();
    formData.append("image", fileInput);

    axios
      .post("http://localhost:5000/process", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        const { extractedText, processedImageUrl } = response.data;
        const timestampedUrl = `${processedImageUrl}?t=${new Date().getTime()}`;
        navigate("/Extracts", { state: { imgLink, processedImageUrl: timestampedUrl, extractedText } });
      })
      .catch((error) => {
        console.error("Error processing image:", error);
        alert("Error processing image. Please try again.");
      });
  };

  useEffect(() => {
    const dropArea = document.getElementById("drop-area");
    const inputFile = document.getElementById("input-file");
    const imageView = document.getElementById("img-view");

    const uploadImage = () => {
      const link = URL.createObjectURL(inputFile.files[0]);
      setImgLink(link);
      imageView.style.backgroundImage = `url(${link})`;
      imageView.style.backgroundSize = "contain";
      imageView.style.backgroundRepeat = "no-repeat";
      imageView.textContent = "";
      imageView.style.border = "none";
    };

    inputFile.addEventListener("change", uploadImage);

    dropArea.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    dropArea.addEventListener("drop", (e) => {
      e.preventDefault();
      inputFile.files = e.dataTransfer.files;
      uploadImage();
    });

    return () => {
      inputFile.removeEventListener("change", uploadImage);
      dropArea.removeEventListener("dragover", (e) => e.preventDefault());
    };
  }, []);

  return (
    <div className="hero" style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "50px" }}>
      <label htmlFor="input-file" id="drop-area" style={{ display: "flex", flexDirection: "column", alignItems: "center", border: "2px dashed black", padding: "20px", cursor: "pointer" }}>
        <input type="file" accept="image/*" id="input-file" hidden />
        <div id="img-view" style={{ width: "300px", height: "300px", display: "flex", justifyContent: "center", alignItems: "center", border: "1px solid black", backgroundSize: "contain", backgroundRepeat: "no-repeat" }}>
          <p style={{ color: "black" }}>Drag your image here</p>
        </div>
        <p style={{ color: "black", marginTop: "10px" }}>Browse</p>
        <span>JPG or PNG up to 10 Mb</span>
      </label>
      <button onClick={handleConvert} style={{ marginTop: "20px", padding: "10px 20px", cursor: "pointer", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "5px" }}>Convert</button>
    </div>
  );
};

export default Extracted;
