from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import cv2
import numpy as np
import tempfile
import os
import boto3
from doctr.models import detection_predictor
from doctr.io import DocumentFile
from doctr.utils.geometry import detach_scores
import logging

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Setup logging
logging.basicConfig(level=logging.DEBUG)


textract = boto3.client('textract', region_name="us-east-2")

# Define the path for static files
UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', 'static/images')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Load the detection model
det_predictor = detection_predictor(arch="db_resnet50", pretrained=True)

@app.route('/')
def home():
    return "Welcome to the MedAI Nexus backend!"  # Simple message for root URL

@app.route("/process", methods=["POST"])
def process_image():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    # Validate file type
    file = request.files["image"]
    if file.content_type not in ["image/jpeg", "image/png"]:
        return jsonify({"error": "Unsupported file type"}), 400

    try:
        # Read the uploaded file
        file_bytes = np.frombuffer(file.read(), np.uint8)
        image = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

        # Save the uploaded image to a temporary file
        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as temp_file:
            input_filename = temp_file.name
            cv2.imwrite(input_filename, image)

        # Run Doctr detection
        doc = DocumentFile.from_images([input_filename])
        results = det_predictor(doc)

        # Debugging: Print out results to understand the structure
        logging.debug(f"Detection results: {results}")

        # Process detection results and draw bounding boxes
        for doc_img, res in zip(doc, results):
            img_shape = doc_img.shape[:2]
            logging.debug(f"Image shape: {img_shape}")

            # Extract words
            words = res.get("words", [])
            logging.debug(f"Words detected: {words}")

            if len(words) > 0:
                coords, _ = detach_scores([words])
                logging.debug(f"Coordinates: {coords}")

                if len(coords) > 0 and len(coords[0]) > 0:  # Ensure coords is not empty
                    for coord in coords[0]:
                        logging.debug(f"Processing coordinate: {coord}")
                        if isinstance(coord, np.ndarray) and coord.shape == (4,):  # Check if coord is in the correct format
                            points = np.array(_to_absolute(coord, img_shape), dtype=np.int32).reshape((-1, 1, 2))
                            cv2.polylines(image, [points], isClosed=True, color=(255, 0, 0), thickness=2)
                        else:
                            logging.warning(f"Invalid coordinate format: {coord}")
            else:
                logging.debug("No words detected")

        # Save processed image to the static folder
        output_filename = os.path.join(app.config['UPLOAD_FOLDER'], "processed_image.jpg")
        cv2.imwrite(output_filename, image)

        #T
        with open(input_filename, "rb") as image_file:
            response = textract.detect_document_text(Document={"Bytes": image_file.read()})

        extracted_text = " ".join([item["Text"] for item in response["Blocks"] if item["BlockType"] == "LINE"])

        # Delete the temporary file
        os.remove(input_filename)

        # Return the URL for the processed image
        return jsonify({"processedImageUrl": f"http://localhost:5000/static/images/processed_image.jpg", "extractedText": extracted_text})
    except Exception as e:
        logging.error(f"Error processing image: {e}", exc_info=True)
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500
from PIL import Image
import torch
from transformers import TrOCRProcessor, VisionEncoderDecoderModel

def predict_prescription(image_path, model_local_path):
    """
    Predict text from a doctor's handwritten prescription image using a locally stored TrOCR model.

    Args:
        image_path (str): Path to the image file.
        model_local_path : C:/Users/mail2/OneDrive/Documents/Abhinav Files/MedAINexus/medainexus/ackend/Final_Training

    Returns:
        str: The predicted text from the image.
    """
    # Load the processor and model from the specified local directory
    processor = TrOCRProcessor.from_pretrained(model_local_path)
    model = VisionEncoderDecoderModel.from_pretrained(model_local_path)
    
    # Open the image and ensure it is in RGB format
    image = Image.open(image_path).convert("RGB")
    
    # Preprocess the image to get the pixel values
    pixel_values = processor(image, return_tensors="pt").pixel_values
    
    # Generate predictions (token IDs) from the model
    generated_ids = model.generate(pixel_values)
    
    # Decode the token IDs to convert them into human-readable text
    predicted_text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
    
    return predicted_text

def _to_absolute(geom, img_shape):
    h, w = img_shape
    # Convert [x_min, y_min, x_max, y_max] to absolute coordinates
    x_min, y_min, x_max, y_max = geom
    return [[x_min * w, y_min * h], [x_max * w, y_min * h], [x_max * w, y_max * h], [x_min * w, y_max * h]]

@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == "__main__":
    port = int(os.getenv('PORT', 5000))
    app.run(port=port, debug=True)