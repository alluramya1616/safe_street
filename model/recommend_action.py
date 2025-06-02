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

# Ensure exactly 2 arguments are provided
if len(sys.argv) != 3:
    print("Usage: python recommend_action.py <Type of Damage> <Severity>")
    sys.exit(1)

# Capture inputs with exact formatting
type_of_damage = sys.argv[1].strip()
severity = sys.argv[2].strip()

# Dictionary of recommendations with exact case-sensitive keys
recommendations = {
    ("Alligator Crack", "Low"): "Apply a surface seal to prevent moisture intrusion and slow progression.",
    ("Alligator Crack", "Moderate"): "Use localized patching followed by an asphalt overlay.",
    ("Alligator Crack", "Severe"): "Full-depth reclamation or complete reconstruction is recommended.",
    ("Alligator Crack", "nan"): "Severity unclear. Perform manual inspection before maintenance.",
    
    ("Longitudinal Crack", "Low"): "Monitor and apply crack sealing to stop water infiltration.",
    ("Longitudinal Crack", "Moderate"): "Seal the crack and schedule routine maintenance.",
    ("Longitudinal Crack", "Severe"): "Mill and overlay or perform full-depth patching.",
    ("Longitudinal Crack", "nan"): "Severity not specified. Recommend sealing and monitoring.",
    
    ("Pothole", "Low"): "Use a temporary cold mix patch to prevent growth.",
    ("Pothole", "Moderate"): "Apply hot mix asphalt for semi-permanent repair.",
    ("Pothole", "Severe"): "Full-depth repair and base reconstruction are needed.",
    ("Pothole", "nan"): "Unknown severity. Inspect and patch as needed.",
    
    ("Transverse Crack", "Low"): "Apply crack sealing or fog seal to slow progression.",
    ("Transverse Crack", "Moderate"): "Use crack filling and consider surface treatment.",
    ("Transverse Crack", "Severe"): "Mill and overlay or reconstruct the cracked sections.",
    ("Transverse Crack", "nan"): "Severity not defined. Conduct site survey and apply suitable fix.",
    
    ("No Damage", "Low"): "No action needed. Continue routine inspections.",
    ("No Damage", "Moderate"): "No immediate action. Maintain regular monitoring.",
    ("No Damage", "Severe"): "Re-evaluate severity; possible sensor or labeling error.",
    ("No Damage", "nan"): "No maintenance required. Maintain observation schedule."
}

# Fetch the recommendation
key = (type_of_damage, severity)
recommendation = recommendations.get(key)

# Output result
if recommendation:
    print(f"{recommendation}")
else:
    print("No recommendation found for the provided type of damage and severity.")
