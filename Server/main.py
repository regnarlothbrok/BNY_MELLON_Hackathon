from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS
import Utils.BankData
import os
from werkzeug.utils import secure_filename
import json

app = Flask(__name__)

CORS(app)  # Enable CORS on the Flask app

UPLOAD_FOLDER = "./uploads"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


@app.route("/upload", methods=["POST", "OPTIONS"])
def upload_pdf():
    print(request.files)
    if "pdf" not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files["pdf"]

    pdf_type = request.form.get("pdf_type", None)

    # Check if a valid PDF type is provided
    if not pdf_type:
        return jsonify({"error": "No PDF type provided"}), 400

    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if file:
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(file_path)

        result = Utils.BankData.parsePDF(file_path, pdf_type=int(pdf_type[-1]))

        with open("./temp.json", "w") as f:
            json.dump(result, f)

        return jsonify(result), 200


if __name__ == "__main__":
    app.run(debug=True)
