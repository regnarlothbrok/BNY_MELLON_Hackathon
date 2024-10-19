from flask import Flask, request, jsonify
import Utils.BankData
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)

UPLOAD_FOLDER = "./uploads"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


@app.route("/upload", methods=["POST"])
def upload_pdf():
    print(request.files)
    if "pdf" not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files["pdf"]

    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if file:
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(file_path)

        result = Utils.BankData.parsePDF(file_path)

        return jsonify(result), 200


if __name__ == "__main__":
    app.run(debug=True)
