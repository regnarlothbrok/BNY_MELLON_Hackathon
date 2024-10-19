import base64
import pdf2image
import io


def processPDF(pdf):
    images = pdf2image.convert_from_path(pdf)

    base64_images = []

    for image in images:
        buffer = io.BytesIO()
        image.save(buffer, format="JPEG")

        image_bytes = buffer.getvalue()
        encoded_image = base64.b64encode(image_bytes).decode("utf-8")

        base64_images.append(encoded_image)

        buffer.close()

    return base64_images
