import json

import openai

MODEL = "gpt-4o"

functions = [
    {
        "name": "parse_bank_statement",  # Changed to a valid function name
        "description": "Generate the list of all transactions corresponding to the account",
        "parameters": {
            "type": "object",
            "properties": {
                "name": {"type": "string", "description": "name of the account holder"},
                "account_number": {
                    "type": "string",
                    "description": "account number of the account holder",
                },
                "transactions": {
                    "type": "array",
                    "description": "List of transactions made by the user",
                    "items": {
                        "type": "object",
                        "properties": {
                            "transaction_date": {
                                "type": "string",
                                "description": "date of transaction in DD/MM/YYYY format",
                            },
                            "credit_or_debit": {
                                "type": "string",
                                "enum": ["credit", "debit"],
                                "description": "the type of transaction credit or debit",
                            },
                            "amount": {
                                "type": "number",
                                "description": "the transaction amount",
                            },
                            "balance": {
                                "type": "number",
                                "description": "remaining balance in the account",
                            },
                        },
                        "required": [
                            "transaction_date",
                            "credit_or_debit",
                            "amount",
                            "balance",
                        ],
                    },
                },
            },
            "required": ["name", "account_number", "transactions"],
        },
    }
]


def ParseImage(client: openai.OpenAI, image_data, multiple_images=False, args=None):
    prompt = "You are here to parse bank statement documents."
    if multiple_images:
        if not args:
            pass
        else:
            prompt = (
                prompt
                + f'The name of the account holder is {args["name"]} and account number is {args["account_number"]}'
            )
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": prompt,
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/png;base64,{image_data}"},
                    },
                ],
            },
        ],
        tools=[{"type": "function", "function": functions[0]}],
        tool_choice="required",
        temperature=0.0,
    )

    if response:
        if response.choices:
            if response.choices[0].message:
                if response.choices[0].message.tool_calls:
                    return json.loads(
                        response.choices[0].message.tool_calls[0].function.arguments
                    )
    return None
