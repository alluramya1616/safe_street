# import sys
# import os
# import google.generativeai as genai

# api_key = os.environ.get("GEMINI_API_KEY")
# if not api_key:
#     raise Exception("GEMINI_API_KEY not found in environment variables")

# genai.configure(api_key=api_key)

# model = genai.GenerativeModel("gemini-1.5-pro")

# type_of_damage = sys.argv[1]
# severity = sys.argv[2]

# prompt = f"""Given the type of road damage and its severity, suggest a recommended action by explaining the road damage for road maintenance in 100 words .

# Type of Damage: {type_of_damage}
# Severity: {severity}

# Provide a short and clear action recommendation."""

# response = model.generate_content(prompt)
# print(response.text.strip())
import sys
import os
import google.generativeai as genai

api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    raise Exception("GEMINI_API_KEY not found in environment variables")

genai.configure(api_key=api_key)

model = genai.GenerativeModel("gemini-1.5-pro")

type_of_damage = sys.argv[1]
severity = sys.argv[2]

prompt = f"""Given the type of road damage and its severity, suggest a recommended action by explaining the road damage for road maintenance in 100 words .

Type of Damage: {type_of_damage}
Severity: {severity}

Provide a short and clear action recommendation."""

response = model.generate_content(prompt)
print(response.text.strip())
