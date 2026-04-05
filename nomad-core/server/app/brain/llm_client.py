import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")


class LLMClient:
    def __init__(self):
        if not GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY not found in environment variables")

        self.client = Groq(api_key=GROQ_API_KEY)
        self.model = "llama-3.1-8b-instant"

    def generate(self, system_prompt: str, user_input: str) -> dict:
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_input}
                ],
                temperature=0.2
            )

            content = response.choices[0].message.content

            print("\nLLM OUTPUT:\n", content)

            parsed = self._parse_json(content)

            return parsed

        except Exception as e:
            print("LLM Error :", e)
            return {
                "type": "error",
                "message": str(e)
            }

    def _parse_json(self, text: str) -> dict:
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            start = text.find("{")
            end = text.rfind("}")

            if start != -1 and end != -1:
                try:
                    return json.loads(text[start:end + 1])
                except Exception:
                    pass

        return {
            "type": "invalid_json",
            "raw": text
        }
