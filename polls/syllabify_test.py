# from syllabify import syllabify

# word = syllabify("linguistics")
# for syllable in word.syllables:
#     print(f"Onset: {syllable.onset}")
#     print(f"Nucleus: {syllable.nucleus}")
#     print(f"Coda: {syllable.coda}")

import os
from dotenv import load_dotenv
import requests
import json

load_dotenv("polls/.env")

# First API call with reasoning
response = requests.post(
    url="https://openrouter.ai/api/v1/chat/completions",
    headers={
    "Authorization": f"Bearer {os.environ.get("API_KEY")}",
    "Content-Type": "application/json",
    },
    data=json.dumps({
    "model": "openrouter/free",
    "messages": [
        {
            "role": "user",
            "content": "Im going to give you a phrase, separate JUST THE FIRST WORD into syllables using semicolons in the next prompt. Example: abandon -> a;ban;don. IGNORE EVERYTHING AFTER THE FIRST WORD. Return only the lowercase syllabified word."
        }
        ],
    "reasoning": {"enabled": True}
    })
)

# Preserve the assistant message with reasoning_details
messages = [
    {
        "role": "user",
        "content": "Separate this word into syllables using semicolons. Return only the lowercase syllabified word."
    },
    {
        "role": "user",
        "content": f"abalos"
    }
]

with open(f"polls\cmudict-0.txt", "r", encoding="utf-8") as file:
    for line in file:
        string = line.strip()
        print(string)

        messages[1]["content"] = string

        # Second API call - model continues reasoning from where it left off
        response = requests.post(
            
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
            "Authorization": f"Bearer {os.environ.get("API_KEY")}",
            "Content-Type": "application/json",
            },
            data=json.dumps({
            "model": "openrouter/free",
            "messages": messages,  # Includes preserved reasoning_details
            "reasoning": {"enabled": True}
            })
        )

        # Extract the assistant message with reasoning_details
        response = response.json()
        print('response: ', response)
        response = response['choices'][0]['message']['content']
        print('response: ', response)

        with open("new_cmudict.txt", "w", encoding="utf-8") as file:
            file.write(response)




