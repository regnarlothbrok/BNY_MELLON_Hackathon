import os
import base64
import json
import dotenv

import openai

from Utils.PDFParser import processPDF
from Utils.OpenAI import ParseImage

dotenv.load_dotenv()

client = openai.OpenAI()


def parsePDF(path: str, pdf_type=1):
    images = processPDF(path)
    prevData: dict[str, str] = {}
    ret = {}

    for i, image in enumerate(images):
        data = ParseImage(client, image, i > 0, ret)
        if not data:
            continue
        if len(images) > 1 and i == 0 and data:
            ret = data
        for transaction in data["transactions"]:
            ret["transactions"].append(transaction)
    return ret
