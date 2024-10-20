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
    ret: dict[str, list] = {}
    ret["transactions"] = []

    for i, image in enumerate(images):
        data = ParseImage(client, image, i > 0, ret)
        if not data:
            continue
        for transaction in data["transactions"]:
            ret["transactions"].append(
                {
                    "clientName": data["name"],
                    "bankName": pdf_type,
                    "accountNumber": data["account_number"],
                    "transactionDate": transaction["transaction_date"],
                    "creditDebit": transaction["credit_or_debit"],
                    "description": transaction["description"],
                    "amount": float(transaction["amount"]),
                    "balance": float(transaction["balance"]),
                }
            )
    return ret
