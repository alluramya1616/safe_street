# import torch
# import torch.nn as nn
# from torchvision import transforms
# from PIL import Image
# import sys
# import json
# import requests
# from io import BytesIO
# from transformers import ViTModel
# import warnings
# import logging
# from pymongo import MongoClient
# import base64  # New import to handle base64 input

# # Suppress warnings
# warnings.filterwarnings("ignore")
# logging.getLogger("transformers").setLevel(logging.ERROR)

# # Labels
# damage_labels = ['Alligator Crack', 'Longitudinal Crack', 'No Damage', 'Pothole', 'Transverse Crack']
# severity_labels = ['Low', 'Moderate', 'Severe', 'nan']

# # MongoDB setup (optional)
# client = MongoClient("mongodb://localhost:27017/")
# db = client["SafeStreetDB"]
# collection = db["predictions"]

# # Define the model
# class MultiOutputModel(nn.Module):
#     def __init__(self, base_model, num_damage_classes, num_severity_classes):
#         super().__init__()
#         self.base_model = base_model
#         vit_feature_size = base_model.config.hidden_size
#         self.fc_damage = nn.Linear(vit_feature_size, num_damage_classes)
#         self.fc_severity = nn.Linear(vit_feature_size, num_severity_classes)

#     def forward(self, x):
#         outputs = self.base_model(x).last_hidden_state[:, 0, :]
#         damage_output = self.fc_damage(outputs)
#         severity_output = self.fc_severity(outputs)
#         return damage_output, severity_output

# # Load model
# device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
# checkpoint_path = "C:/Users/Lenovo/OneDrive/Attachments/Desktop/SafeStreet/model/model_epoch_16.pth"

# with torch.no_grad():
#     base_vit = ViTModel.from_pretrained("google/vit-base-patch16-224")
#     model = MultiOutputModel(base_vit, len(damage_labels), len(severity_labels))
#     model.load_state_dict(torch.load(checkpoint_path, map_location=device))
#     model.to(device)
#     model.eval()

# # Image transform
# transform = transforms.Compose([
#     transforms.Resize((224, 224)),
#     transforms.ToTensor(),
#     transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5])
# ])

# # Prediction function
# def predict_damage(image_input):
#     try:
#         if image_input.startswith("http"):
#             # URL input
#             headers = {'User-Agent': 'Mozilla/5.0'}
#             response = requests.get(image_input, headers=headers, stream=True)
#             image = Image.open(BytesIO(response.content)).convert("RGB")
#         elif len(image_input) > 1000:
#             # Base64 string input
#             image_bytes = BytesIO(base64.b64decode(image_input))
#             image = Image.open(image_bytes).convert("RGB")
#         else:
#             # Local file path
#             image = Image.open(image_input).convert("RGB")
#     except Exception as e:
#         raise ValueError(f"Error loading image: {e}")

#     image = transform(image).unsqueeze(0).to(device)

#     with torch.no_grad():
#         damage_logits, severity_logits = model(image)

#     damage_probs = torch.sigmoid(damage_logits).squeeze().cpu().numpy()
#     predicted_damages = [damage_labels[i] for i in range(len(damage_probs)) if damage_probs[i] > 0.5]

#     severity_probs = torch.softmax(severity_logits, dim=1).squeeze().cpu().numpy()
#     predicted_severity = severity_labels[severity_probs.argmax()]

#     result = {
#         "typeOfDamage": predicted_damages,
#         "severity": predicted_severity,
#         "recommendedAction": "Urgent Repair" if predicted_severity == "Severe" else "Scheduled Repair"
#     }

#     return result

# # CLI usage
# if __name__ == "__main__":
#     if len(sys.argv) < 2:
#         print(json.dumps({"error": "Image path, URL, or base64 string not provided"}))
#         sys.exit(1)

#     image_input = sys.argv[1]
#     try:
#         prediction = predict_damage(image_input)
#         print(json.dumps(prediction))
#     except Exception as e:
#         print(json.dumps({"error": str(e)}))
#         sys.exit(1)
# import pathlib
# import torch
# import torch.nn as nn
# from torchvision import transforms
# from PIL import Image, ImageDraw, ImageFont
# import sys
# import json
# import requests
# from io import BytesIO
# from transformers import ViTModel
# import warnings
# import logging
# from pymongo import MongoClient
# import base64
# import os
# if sys.platform == 'win32':
#     pathlib.PosixPath = pathlib.WindowsPath
# # Suppress warnings
# warnings.filterwarnings("ignore")
# logging.getLogger("transformers").setLevel(logging.ERROR)

# # Labels
# damage_labels = ['Alligator Crack', 'Longitudinal Crack', 'No Damage', 'Pothole', 'Transverse Crack']
# severity_labels = ['Low', 'Moderate', 'Severe', 'nan']

# # MongoDB setup (optional)
# client = MongoClient("mongodb://localhost:27017/")
# db = client["SafeStreetDB"]
# collection = db["predictions"]

# # Define the model
# class MultiOutputModel(nn.Module):
#     def __init__(self, base_model, num_damage_classes, num_severity_classes):
#         super().__init__()
#         self.base_model = base_model
#         vit_feature_size = base_model.config.hidden_size
#         self.fc_damage = nn.Linear(vit_feature_size, num_damage_classes)
#         self.fc_severity = nn.Linear(vit_feature_size, num_severity_classes)

#     def forward(self, x):
#         outputs = self.base_model(x).last_hidden_state[:, 0, :]
#         damage_output = self.fc_damage(outputs)
#         severity_output = self.fc_severity(outputs)
#         return damage_output, severity_output

# # Load device and models
# device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
# base_vit = ViTModel.from_pretrained("google/vit-base-patch16-224")
# classification_model = MultiOutputModel(base_vit, len(damage_labels), len(severity_labels))
# classification_model.load_state_dict(torch.load("model_epoch_16.pth", map_location=device))
# classification_model.to(device).eval()

# # YOLOv5 model
# yolo_model = torch.hub.load('yolov5', 'custom', path='best.pt', source='local')
# yolo_model.to(device).eval()

# # Transform for classification
# transform = transforms.Compose([
#     transforms.Resize((224, 224)),
#     transforms.ToTensor(),
#     transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5])
# ])

# def predict_damage_and_objects(image_input):
#     # Load image
#     if image_input.startswith("http"):
#         response = requests.get(image_input, headers={'User-Agent': 'Mozilla/5.0'}, stream=True)
#         image = Image.open(BytesIO(response.content)).convert("RGB")
#     elif len(image_input) > 1000:
#         image_bytes = BytesIO(base64.b64decode(image_input))
#         image = Image.open(image_bytes).convert("RGB")
#     else:
#         image = Image.open(image_input).convert("RGB")

#     # Save original for drawing
#     draw_image = image.copy()
#     image_tensor = transform(image).unsqueeze(0).to(device)

#     # Classification
#     with torch.no_grad():
#         damage_logits, severity_logits = classification_model(image_tensor)

#     damage_probs = torch.sigmoid(damage_logits).squeeze().cpu().numpy()
#     predicted_damages = [damage_labels[i] for i in range(len(damage_probs)) if damage_probs[i] > 0.5]

#     severity_probs = torch.softmax(severity_logits, dim=1).squeeze().cpu().numpy()
#     predicted_severity = severity_labels[severity_probs.argmax()]

#     # YOLOv5 detection
#     results = yolo_model(draw_image)
#     detections = results.pandas().xyxy[0]

#     # Draw boxes
#     draw = ImageDraw.Draw(draw_image)
#     font = ImageFont.load_default()

#     for _, row in detections.iterrows():
#         label = f"{row['name']} {row['confidence']:.2f}"
#         xy = [row['xmin'], row['ymin'], row['xmax'], row['ymax']]
#         draw.rectangle(xy, outline='red', width=2)
#         draw.text((xy[0], xy[1] - 10), label, fill='red', font=font)

#     output_path = "output_with_boxes.jpg"
#     draw_image.save(output_path)

#     # Save to DB
#     result_data = {
#         "typeOfDamage": predicted_damages,
#         "severity": predicted_severity,
#         "recommendedAction": "Urgent Repair" if predicted_severity == "Severe" else "Scheduled Repair",
#         #"detections": detections.to_dict(orient="records"),
#         "imagePath": output_path
#     }

#     try:
#         inserted = collection.insert_one(result_data)
#         result_data["_id"] = str(inserted.inserted_id)  # Convert ObjectId to string for JSON
#     except Exception as e:
#         result_data["db_error"] = str(e)

#     return result_data

# # CLI usage
# if __name__ == "__main__":
#     if len(sys.argv) < 2:
#         print(json.dumps({"error": "Image path, URL, or base64 string not provided"}))
#         sys.exit(1)

#     image_input = sys.argv[1]
#     try:
#         prediction = predict_damage_and_objects(image_input)
#         print(json.dumps(prediction, indent=2))
#     except Exception as e:
#         print(json.dumps({"error": str(e)}))
#         sys.exit(1)
import pathlib
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image, ImageDraw, ImageFont
import sys
import json
import requests
from io import BytesIO
from transformers import ViTModel
import warnings
import logging
import base64
import os
import pymongo
from dotenv import load_dotenv

# Handle path compatibility on Windows
if sys.platform == 'win32':
    pathlib.PosixPath = pathlib.WindowsPath

warnings.filterwarnings("ignore")
logging.getLogger("transformers").setLevel(logging.ERROR)

# Labels
damage_labels = ['Alligator Crack', 'Longitudinal Crack', 'No Damage', 'Pothole', 'Transverse Crack']
severity_labels = ['Low', 'Moderate', 'Severe', 'nan']
road_labels = ['Not Road', 'Road']

# MongoDB
MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://alluramyareddy99:Ramya3634@cluster0.kg9sb.mongodb.net/safestreet?retryWrites=true&w=majority&appName=Cluster0")
client = pymongo.MongoClient(MONGO_URI)
db = client["SafeStreetDB"]
collection = db["predictions"]

# ViT Model
class MultiOutputModel(nn.Module):
    def __init__(self, base_model, num_damage_classes, num_severity_classes):
        super().__init__()
        self.base_model = base_model
        vit_feature_size = base_model.config.hidden_size
        self.fc_damage = nn.Linear(vit_feature_size, num_damage_classes)
        self.fc_severity = nn.Linear(vit_feature_size, num_severity_classes)

    def forward(self, x):
        outputs = self.base_model(x).last_hidden_state[:, 0, :]
        return self.fc_damage(outputs), self.fc_severity(outputs)

# Load models
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load ResNet18 - Road classifier
road_model = models.resnet18(pretrained=False)
road_model.fc = nn.Linear(road_model.fc.in_features, 2)
road_model.load_state_dict(torch.load("C:/Users/Lenovo/OneDrive/Attachments/Desktop/SafeStreet/model/resnet_road_model1.pth", map_location=device))
road_model.to(device).eval()

# Load ViT classifier
checkpoint_path = "C:/Users/Lenovo/OneDrive/Attachments/Desktop/SafeStreet/model/model_epoch_16.pth"
base_vit = ViTModel.from_pretrained("google/vit-base-patch16-224")
classification_model = MultiOutputModel(base_vit, len(damage_labels), len(severity_labels))
classification_model.load_state_dict(torch.load(checkpoint_path, map_location=device))
classification_model.to(device).eval()

# Load YOLOv5
yolo_model = torch.hub.load(
    r'C:/Users/Lenovo/OneDrive/Attachments/Desktop/SafeStreet/model/yolov5',
    'custom',
    path=r'C:/Users/Lenovo/OneDrive/Attachments/Desktop/SafeStreet/model/best.pt',
    source='local'
)
yolo_model.to(device).eval()

# Transforms
transform_common = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# Main prediction function
def predict_damage_and_objects(image_input):
    # Load image
    if image_input.startswith("http"):
        response = requests.get(image_input, headers={'User-Agent': 'Mozilla/5.0'}, stream=True)
        image = Image.open(BytesIO(response.content)).convert("RGB")
    elif len(image_input) > 1000:
        image_bytes = BytesIO(base64.b64decode(image_input))
        image = Image.open(image_bytes).convert("RGB")
    else:
        image = Image.open(image_input).convert("RGB")

    draw_image = image.copy()

    image_tensor = transform_common(image).unsqueeze(0).to(device)

    # Step 1: Road classification
    with torch.no_grad():
        road_logits = road_model(image_tensor)
        road_pred = torch.argmax(road_logits, dim=1).item()

    if road_pred == 0:  # Not road
        return {
            "isRoad": False,
            "message": "The given image is not of a road. Damage classification and object detection skipped."
        }

    # Step 2: Classification
    with torch.no_grad():
        damage_logits, severity_logits = classification_model(image_tensor)

    damage_probs = torch.sigmoid(damage_logits).squeeze().cpu().numpy()
    predicted_damages = [damage_labels[i] for i in range(len(damage_probs)) if damage_probs[i] > 0.5]

    severity_probs = torch.softmax(severity_logits, dim=1).squeeze().cpu().numpy()
    predicted_severity = severity_labels[severity_probs.argmax()]

    # Step 3: YOLOv5 detection
    results = yolo_model(draw_image)
    detections = results.pandas().xyxy[0]

    draw = ImageDraw.Draw(draw_image)
    font = ImageFont.load_default()

    for _, row in detections.iterrows():
        label = f"{row['name']} {row['confidence']:.2f}"
        xy = [row['xmin'], row['ymin'], row['xmax'], row['ymax']]
        draw.rectangle(xy, outline='red', width=2)
        draw.text((xy[0], xy[1] - 10), label, fill='red', font=font)

    buffer = BytesIO()
    draw_image.save(buffer, format="JPEG")
    base64_image = base64.b64encode(buffer.getvalue()).decode('utf-8')

    result_data = {
        "isRoad": True,
        "typeOfDamage": predicted_damages,
        "severity": predicted_severity,
        "recommendedAction": "Urgent Repair" if predicted_severity == "Severe" else "Scheduled Repair",
        "image": base64_image
    }

    # Save to MongoDB
    try:
        inserted = collection.insert_one(result_data)
        result_data["_id"] = str(inserted.inserted_id)
    except Exception as e:
        result_data["db_error"] = str(e)

    return result_data

# CLI
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Image path, URL, or base64 string not provided"}))
        sys.exit(1)

    image_input = sys.argv[1]
    try:
        prediction = predict_damage_and_objects(image_input)
        print(json.dumps(prediction, indent=2, default=str))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)