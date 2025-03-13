import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
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
        const processedImageUrl = response.data.processedImageUrl;
        // Add a timestamp to the URL to avoid caching issues
        const timestampedUrl = `${processedImageUrl}?t=${new Date().getTime()}`;
        navigate("/detection", { state: { imgLink, processedImageUrl: timestampedUrl } });
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
    <div className="hero">
      <label htmlFor="input-file" id="drop-area">
        <input type="file" accept="image/*" id="input-file" hidden />
        <div id="img-view">
          <p style={{ color: "black" }}>Drag your image here</p>
          <img src="/icon.jpg" style={{ width: "30px", height: "30px" }} alt="Icon" />
          <p style={{ color: "black" }}>Browse</p>
          <span>JPG or PNG up to 10 Mb</span>
        </div>
      </label>
      <button onClick={handleConvert}>Convert</button>
    </div>
  );
};

export default Home;