"""import pathlib
from flask import Flask
import torch
import torch.nn as nn
from torchvision import transforms, models
from transformers import ViTModel
from PIL import Image
import requests
import base64
import sys
import json
import os
from io import BytesIO
import logging
import warnings
from pymongo import MongoClient
if sys.platform == 'win32':
    pathlib.PosixPath = pathlib.WindowsPath

#app = Flask(__name__)
# Suppress warnings
warnings.filterwarnings("ignore")
logging.getLogger("transformers").setLevel(logging.ERROR)

# Labels
damage_labels = ['Alligator Crack', 'Longitudinal Crack', 'No Damage', 'Pothole', 'Transverse Crack']
severity_labels = ['Low', 'Moderate', 'Severe', 'nan']

# MongoDB setup (optional)
client = MongoClient("mongodb://localhost:27017/")
db = client["SafeStreetDB"]
collection = db["predictions"]

# Setup device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ---------------- Model Definitions ----------------

class MultiOutputModel(nn.Module):
    def __init__(self, base_model, num_damage_classes, num_severity_classes):
        super().__init__()
        self.base_model = base_model
        vit_feature_size = base_model.config.hidden_size
        self.fc_damage = nn.Linear(vit_feature_size, num_damage_classes)
        self.fc_severity = nn.Linear(vit_feature_size, num_severity_classes)

    def forward(self, x):
        outputs = self.base_model(x).last_hidden_state[:, 0, :]
        damage_output = self.fc_damage(outputs)
        severity_output = self.fc_severity(outputs)
        return damage_output, severity_output

# ---------------- Load Models ----------------

# Load ViT base + multi-output model
vit_base = ViTModel.from_pretrained("google/vit-base-patch16-224")
vit_model = MultiOutputModel(vit_base, len(damage_labels), len(severity_labels))
vit_model.load_state_dict(torch.load("model_epoch_16.pth", map_location=device))
vit_model.to(device)
vit_model.eval()

# Load ResNet road classifier
road_classifier = models.resnet18()
road_classifier.fc = nn.Linear(road_classifier.fc.in_features, 2)
road_classifier.load_state_dict(torch.load("resnet_road_model.pth", map_location=device))
road_classifier.to(device)
road_classifier.eval()

# Load YOLOv5 model
yolo_model = torch.hub.load('yolov5', 'custom', path='best.pt', source='local', force_reload=True)

# ---------------- Transforms ----------------

vit_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5])
])

road_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

# ---------------- Image Loader ----------------

def load_image(image_input):
    try:
        if image_input.startswith("http"):
            headers = {'User-Agent': 'Mozilla/5.0'}
            response = requests.get(image_input, headers=headers, stream=True)
            return Image.open(BytesIO(response.content)).convert("RGB")
        elif len(image_input) > 1000:
            image_bytes = BytesIO(base64.b64decode(image_input))
            return Image.open(image_bytes).convert("RGB")
        else:
            return Image.open(image_input).convert("RGB")
    except Exception as e:
        raise ValueError(f"Error loading image: {e}")

# ---------------- Prediction Logic ----------------

def predict_all(image_input):
    image = load_image(image_input)

    # Step 1: Road Classification
    road_input = road_transform(image).unsqueeze(0).to(device)
    with torch.no_grad():
        road_output = road_classifier(road_input)
        is_road = road_output.argmax(1).item() == 1  # 1 = road

    if not is_road:
        return {
            "isRoad": False,
            "message": "Not a valid road image.",
            "typeOfDamage": [],
            "severity": None,
            "recommendedAction": None,
            "yoloObjects": []
        }

    # Step 2: Damage & Severity Classification
    vit_input = vit_transform(image).unsqueeze(0).to(device)
    with torch.no_grad():
        damage_logits, severity_logits = vit_model(vit_input)

    damage_probs = torch.sigmoid(damage_logits).squeeze().cpu().numpy()
    predicted_damages = [damage_labels[i] for i in range(len(damage_probs)) if damage_probs[i] > 0.5]

    severity_probs = torch.softmax(severity_logits, dim=1).squeeze().cpu().numpy()
    predicted_severity = severity_labels[severity_probs.argmax()]

    # Step 3: YOLO Object Detection
    results = yolo_model(image)
    yolo_results = []
    for *xyxy, conf, cls in results.xyxy[0]:
        yolo_results.append({
            "bbox": [float(x) for x in xyxy],
            "confidence": float(conf),
            "class": yolo_model.names[int(cls)]
        })

    # MongoDB Logging
    doc = {
        "isRoad": True,
        "typeOfDamage": predicted_damages,
        "severity": predicted_severity,
        "recommendedAction": "Urgent Repair" if predicted_severity == "Severe" else "Scheduled Repair",
        "yoloObjects": yolo_results
    }
    collection.insert_one(doc)

    return doc

# ---------------- CLI Interface ----------------

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python predict.py <image_path_or_url_or_base64>"}))
        sys.exit(1)

    image_input = sys.argv[1]
    try:
        result = predict_all(image_input)
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
"""
"""import pathlib
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import sys
import json
import requests
from io import BytesIO
from transformers import ViTModel
import warnings
import logging
from pymongo import MongoClient
import base64
import os
if sys.platform == 'win32':
    pathlib.PosixPath = pathlib.WindowsPath
# Suppress warnings
warnings.filterwarnings("ignore")
logging.getLogger("transformers").setLevel(logging.ERROR)

# Labels
damage_labels = ['Alligator Crack', 'Longitudinal Crack', 'No Damage', 'Pothole', 'Transverse Crack']
severity_labels = ['Low', 'Moderate', 'Severe', 'nan']

# MongoDB setup (optional)
client = MongoClient("mongodb://localhost:27017/")
db = client["SafeStreetDB"]
collection = db["predictions"]

# Device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ----------- Load ViT Model for Damage & Severity Classification -----------

class MultiOutputModel(nn.Module):
    def __init__(self, base_model, num_damage_classes, num_severity_classes):
        super().__init__()
        self.base_model = base_model
        vit_feature_size = base_model.config.hidden_size
        self.fc_damage = nn.Linear(vit_feature_size, num_damage_classes)
        self.fc_severity = nn.Linear(vit_feature_size, num_severity_classes)

    def forward(self, x):
        outputs = self.base_model(x).last_hidden_state[:, 0, :]
        damage_output = self.fc_damage(outputs)
        severity_output = self.fc_severity(outputs)
        return damage_output, severity_output

base_vit = ViTModel.from_pretrained("google/vit-base-patch16-224")
vit_model = MultiOutputModel(base_vit, len(damage_labels), len(severity_labels))
vit_model.load_state_dict(torch.load("model_epoch_16.pth", map_location=device))
vit_model.to(device)
vit_model.eval()

vit_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5])
])

# ----------- Load Road Classification Model (ResNet18) -----------

road_model = models.resnet18()
road_model.fc = nn.Linear(road_model.fc.in_features, 2)  # 2 classes: road/no road
road_model.load_state_dict(torch.load("resnet_road_model.pth", map_location=device))
road_model.to(device)
road_model.eval()

road_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

# ----------- Load YOLOv5 for Object Detection -----------

yolo_model = torch.hub.load('yolov5', 'custom', path='best.pt', source='local', force_reload=True)
yolo_model.to(device)
yolo_model.eval()

# ----------- Unified Prediction Function -----------

def load_image(image_input):
    try:
        if image_input.startswith("http"):
            headers = {'User-Agent': 'Mozilla/5.0'}
            response = requests.get(image_input, headers=headers, stream=True)
            image = Image.open(BytesIO(response.content)).convert("RGB")
        elif len(image_input) > 1000:
            image_bytes = BytesIO(base64.b64decode(image_input))
            image = Image.open(image_bytes).convert("RGB")
        else:
            image = Image.open(image_input).convert("RGB")
        return image
    except Exception as e:
        raise ValueError(f"Error loading image: {e}")

def predict(image_input):
    image = load_image(image_input)

    # Step 1: Road classification
    road_tensor = road_transform(image).unsqueeze(0).to(device)
    with torch.no_grad():
        road_pred = road_model(road_tensor)
        is_road = road_pred.argmax(1).item() == 1  # 1 = road

    result = {"isRoad": bool(is_road)}

    if is_road:
        # Step 2: Damage + Severity classification
        vit_tensor = vit_transform(image).unsqueeze(0).to(device)
        with torch.no_grad():
            damage_logits, severity_logits = vit_model(vit_tensor)

        damage_probs = torch.sigmoid(damage_logits).squeeze().cpu().numpy()
        predicted_damages = [damage_labels[i] for i in range(len(damage_probs)) if damage_probs[i] > 0.5]

        severity_probs = torch.softmax(severity_logits, dim=1).squeeze().cpu().numpy()
        predicted_severity = severity_labels[severity_probs.argmax()]

        # Step 3: Object detection
        temp_path = "temp.jpg"
        image.save(temp_path)
        yolo_results = yolo_model(temp_path)
        detection_summary = yolo_results.pandas().xyxy[0].to_dict(orient="records")
        os.remove(temp_path)

        # Construct result
        result.update({
            "typeOfDamage": predicted_damages,
            "severity": predicted_severity,
            "recommendedAction": "Urgent Repair" if predicted_severity == "Severe" else "Scheduled Repair",
            "objectDetections": detection_summary
        })
    else:
        result["message"] = "This is not a valid road image. Skipping damage and object detection."

    # Save to MongoDB
    inserted_id = collection.insert_one(result).inserted_id
    result["_id"] = str(inserted_id)

    return result

# ----------- CLI Usage -----------

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Please provide image path, URL, or base64 string"}))
        sys.exit(1)

    input_value = sys.argv[1]
    try:
        prediction = predict(input_value)
        print(json.dumps(prediction, indent=2))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)"""
"""import pathlib
import torch
import torch.nn as nn
from torchvision import transforms
from PIL import Image, ImageDraw, ImageFont
import sys
import json
import requests
from io import BytesIO
from transformers import ViTModel
import warnings
import logging
from pymongo import MongoClient
import base64
import os
if sys.platform == 'win32':
    pathlib.PosixPath = pathlib.WindowsPath
# Suppress warnings
warnings.filterwarnings("ignore")
logging.getLogger("transformers").setLevel(logging.ERROR)

# Labels
damage_labels = ['Alligator Crack', 'Longitudinal Crack', 'No Damage', 'Pothole', 'Transverse Crack']
severity_labels = ['Low', 'Moderate', 'Severe', 'nan']

# MongoDB setup (optional)
client = MongoClient("mongodb://localhost:27017/")
db = client["SafeStreetDB"]
collection = db["predictions"]

# Define the model
class MultiOutputModel(nn.Module):
    def __init__(self, base_model, num_damage_classes, num_severity_classes):
        super().__init__()
        self.base_model = base_model
        vit_feature_size = base_model.config.hidden_size
        self.fc_damage = nn.Linear(vit_feature_size, num_damage_classes)
        self.fc_severity = nn.Linear(vit_feature_size, num_severity_classes)

    def forward(self, x):
        outputs = self.base_model(x).last_hidden_state[:, 0, :]
        damage_output = self.fc_damage(outputs)
        severity_output = self.fc_severity(outputs)
        return damage_output, severity_output

# Load device and models
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
base_vit = ViTModel.from_pretrained("google/vit-base-patch16-224")
classification_model = MultiOutputModel(base_vit, len(damage_labels), len(severity_labels))
classification_model.load_state_dict(torch.load("model_epoch_16.pth", map_location=device))
classification_model.to(device).eval()

# YOLOv5 model
yolo_model = torch.hub.load('yolov5', 'custom', path='best.pt', source='local')
yolo_model.to(device).eval()

# Transform for classification
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5])
])

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

    # Save original for drawing
    draw_image = image.copy()
    image_tensor = transform(image).unsqueeze(0).to(device)

    # Classification
    with torch.no_grad():
        damage_logits, severity_logits = classification_model(image_tensor)

    damage_probs = torch.sigmoid(damage_logits).squeeze().cpu().numpy()
    predicted_damages = [damage_labels[i] for i in range(len(damage_probs)) if damage_probs[i] > 0.5]

    severity_probs = torch.softmax(severity_logits, dim=1).squeeze().cpu().numpy()
    predicted_severity = severity_labels[severity_probs.argmax()]

    # YOLOv5 detection
    results = yolo_model(draw_image)
    detections = results.pandas().xyxy[0]

    # Draw boxes
    draw = ImageDraw.Draw(draw_image)
    font = ImageFont.load_default()

    for _, row in detections.iterrows():
        label = f"{row['name']} {row['confidence']:.2f}"
        xy = [row['xmin'], row['ymin'], row['xmax'], row['ymax']]
        draw.rectangle(xy, outline='red', width=2)
        draw.text((xy[0], xy[1] - 10), label, fill='red', font=font)

    output_path = "output_with_boxes.jpg"
    draw_image.save(output_path)

    # Save to DB
    result_data = {
        "typeOfDamage": predicted_damages,
        "severity": predicted_severity,
        "recommendedAction": "Urgent Repair" if predicted_severity == "Severe" else "Scheduled Repair",
        #"detections": detections.to_dict(orient="records"),
        "imagePath": output_path
    }

    try:
        inserted = collection.insert_one(result_data)
        result_data["_id"] = str(inserted.inserted_id)  # Convert ObjectId to string for JSON
    except Exception as e:
        result_data["db_error"] = str(e)

    return result_data

# CLI usage
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Image path, URL, or base64 string not provided"}))
        sys.exit(1)

    image_input = sys.argv[1]
    try:
        prediction = predict_damage_and_objects(image_input)
        print(json.dumps(prediction, indent=2))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)"""
"""import pathlib
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
from pymongo import MongoClient
import base64
import os

# Platform compatibility
if sys.platform == 'win32':
    pathlib.PosixPath = pathlib.WindowsPath

# Suppress warnings
warnings.filterwarnings("ignore")
logging.getLogger("transformers").setLevel(logging.ERROR)

# Labels
damage_labels = ['Alligator Crack', 'Longitudinal Crack', 'No Damage', 'Pothole', 'Transverse Crack']
severity_labels = ['Low', 'Moderate', 'Severe', 'nan']
road_labels = ['road', 'not road']  # Assumes class 0 = road, class 1 = not road

# MongoDB setup (optional)
client = MongoClient("mongodb://localhost:27017/")
db = client["SafeStreetDB"]
collection = db["predictions"]

# ViT Multi-Output Model
class MultiOutputModel(nn.Module):
    def __init__(self, base_model, num_damage_classes, num_severity_classes):
        super().__init__()
        self.base_model = base_model
        vit_feature_size = base_model.config.hidden_size
        self.fc_damage = nn.Linear(vit_feature_size, num_damage_classes)
        self.fc_severity = nn.Linear(vit_feature_size, num_severity_classes)

    def forward(self, x):
        outputs = self.base_model(x).last_hidden_state[:, 0, :]
        damage_output = self.fc_damage(outputs)
        severity_output = self.fc_severity(outputs)
        return damage_output, severity_output

# Load device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load ViT-based classification model
base_vit = ViTModel.from_pretrained("google/vit-base-patch16-224")
classification_model = MultiOutputModel(base_vit, len(damage_labels), len(severity_labels))
classification_model.load_state_dict(torch.load("model_epoch_16.pth", map_location=device))
classification_model.to(device).eval()

# Load YOLOv5 model
yolo_model = torch.hub.load('yolov5', 'custom', path='best.pt', source='local')
yolo_model.to(device).eval()

# Load ResNet18 road classifier
resnet_model = models.resnet18(pretrained=False)
resnet_model.fc = nn.Linear(resnet_model.fc.in_features, 2)
resnet_model.load_state_dict(torch.load("resnet_road_model1.pth", map_location=device))
resnet_model.to(device).eval()

# Transforms
vit_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5])
])

resnet_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

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

    # Save copy for drawing
    draw_image = image.copy()

    # Classification: ViT
    image_tensor_vit = vit_transform(image).unsqueeze(0).to(device)
    with torch.no_grad():
        damage_logits, severity_logits = classification_model(image_tensor_vit)

    damage_probs = torch.sigmoid(damage_logits).squeeze().cpu().numpy()
    predicted_damages = [damage_labels[i] for i in range(len(damage_probs)) if damage_probs[i] > 0.5]

    severity_probs = torch.softmax(severity_logits, dim=1).squeeze().cpu().numpy()
    predicted_severity = severity_labels[severity_probs.argmax()]

    # Object Detection: YOLOv5
    results = yolo_model(draw_image)
    detections = results.pandas().xyxy[0]

    # Draw boxes
    draw = ImageDraw.Draw(draw_image)
    font = ImageFont.load_default()
    for _, row in detections.iterrows():
        label = f"{row['name']} {row['confidence']:.2f}"
        xy = [row['xmin'], row['ymin'], row['xmax'], row['ymax']]
        draw.rectangle(xy, outline='red', width=2)
        draw.text((xy[0], xy[1] - 10), label, fill='red', font=font)

    # Road / Not-Road Classification
    image_tensor_resnet = resnet_transform(image).unsqueeze(0).to(device)
    with torch.no_grad():
        road_output = resnet_model(image_tensor_resnet)
        road_class = torch.argmax(road_output, dim=1).item()
        road_label = road_labels[road_class]

    # Save annotated image
    output_path = "output_with_boxes.jpg"
    draw_image.save(output_path)

    # Create output dictionary
    result_data = {
        "typeOfDamage": predicted_damages,
        "severity": predicted_severity,
        "recommendedAction": "Urgent Repair" if predicted_severity == "Severe" else "Scheduled Repair",
        "roadPresence": road_label,
        "imagePath": output_path
    }

    # Save to MongoDB
    try:
        inserted = collection.insert_one(result_data)
        result_data["_id"] = str(inserted.inserted_id)
    except Exception as e:
        result_data["db_error"] = str(e)

    return result_data

# CLI usage
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Image path, URL, or base64 string not provided"}))
        sys.exit(1)

    image_input = sys.argv[1]
    try:
        prediction = predict_damage_and_objects(image_input)
        print(json.dumps(prediction, indent=2))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)"""
"""import sys
import pathlib
import torch
from torchvision import transforms, models
from PIL import Image
from transformers import ViTModel
import numpy as np

# Patch for Windows compatibility
if sys.platform == 'win32':
    pathlib.PosixPath = pathlib.WindowsPath

# Device configuration
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ----------------------- Load YOLOv5 Model -----------------------
yolo_model = torch.hub.load('yolov5', 'custom', path='best.pt', source='local', force_reload=True)

# ----------------------- Load Road Classifier -----------------------
classifier = models.resnet18()
classifier.fc = torch.nn.Linear(classifier.fc.in_features, 2)  # 2 classes: yes (road), no (not road)
classifier.load_state_dict(torch.load('resnet_road_model1.pth', map_location=device))
classifier = classifier.to(device)
classifier.eval()

# Transform for road classifier
classifier_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# ----------------------- Load ViT-based Damage Model -----------------------
class MultiOutputModel(torch.nn.Module):
    def __init__(self, base_model, num_damage_classes, num_severity_classes):
        super().__init__()
        self.base_model = base_model
        vit_feature_size = base_model.config.hidden_size
        self.fc_damage = torch.nn.Linear(vit_feature_size, num_damage_classes)
        self.fc_severity = torch.nn.Linear(vit_feature_size, num_severity_classes)

    def forward(self, x):
        outputs = self.base_model(x).last_hidden_state[:, 0, :]
        damage_output = self.fc_damage(outputs)
        severity_output = self.fc_severity(outputs)
        return damage_output, severity_output

damage_labels = ['Alligator Crack', 'Longitudinal Crack', 'No Damage', 'Pothole', 'Transverse Crack']
severity_labels = ['Low', 'Moderate', 'Severe', 'nan']

base_vit = ViTModel.from_pretrained("google/vit-base-patch16-224")
vit_model = MultiOutputModel(base_vit, len(damage_labels), len(severity_labels))
vit_model.load_state_dict(torch.load("model_epoch_16.pth", map_location=device))
vit_model = vit_model.to(device)
vit_model.eval()

# Transform for ViT damage model
vit_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.5, 0.5, 0.5],
                         [0.5, 0.5, 0.5])
])

# ----------------------- Prediction Functions -----------------------
def predict_road(image_path):
    image = Image.open(image_path).convert('RGB')
    input_tensor = classifier_transform(image).unsqueeze(0).to(device)
    with torch.no_grad():
        output = classifier(input_tensor)
        prediction = output.argmax(1).item()
        return prediction == 1  # True if "yes" (road)

def predict_damage(image_path):
    image = Image.open(image_path).convert("RGB")
    image_tensor = vit_transform(image).unsqueeze(0).to(device)
    with torch.no_grad():
        damage_logits, severity_logits = vit_model(image_tensor)

    damage_probs = torch.sigmoid(damage_logits).squeeze().cpu().numpy()
    predicted_damages = [damage_labels[i] for i in range(len(damage_probs)) if damage_probs[i] > 0.5]

    severity_probs = torch.softmax(severity_logits, dim=1).squeeze().cpu().numpy()
    predicted_severity = severity_labels[np.argmax(severity_probs)]

    return predicted_damages, predicted_severity

def detect_objects(image_path):
    results = yolo_model(image_path)
    results.render()
    rendered_img = Image.fromarray(results.ims[0])
    rendered_img.save("output.jpg")
    print("YOLOv5 object detection saved as 'output.jpg'.")

# ----------------------- Main -----------------------
if __name__ == "__main__":
    import sys
    if len(sys.argv) != 2:
        print("Usage: python predict.py <image_path>")
        sys.exit(1)

    img_path = sys.argv[1]

    is_road = predict_road(img_path)
    if not is_road:
        print("❌ Not a road image. Skipping damage and object detection.")
    else:
        print("✅ Road image detected.")
        damages, severity = predict_damage(img_path)
        print(f"📋 Predicted Damages: {damages}")
        print(f"🔥 Severity Level: {severity}")
        detect_objects(img_path)"""

"""import pathlib
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
from pymongo import MongoClient
import base64
import os

# Platform compatibility
if sys.platform == 'win32':
    pathlib.PosixPath = pathlib.WindowsPath

# Suppress warnings
warnings.filterwarnings("ignore")
logging.getLogger("transformers").setLevel(logging.ERROR)

# Labels
damage_labels = ['Alligator Crack', 'Longitudinal Crack', 'No Damage', 'Pothole', 'Transverse Crack']
severity_labels = ['Low', 'Moderate', 'Severe', 'nan']
road_labels = ['road', 'not road']  # Assumes class 0 = road, class 1 = not road

# MongoDB setup (optional)
client = MongoClient("mongodb://localhost:27017/")
db = client["SafeStreetDB"]
collection = db["predictions"]

# ViT Multi-Output Model
class MultiOutputModel(nn.Module):
    def __init__(self, base_model, num_damage_classes, num_severity_classes):
        super().__init__()
        self.base_model = base_model
        vit_feature_size = base_model.config.hidden_size
        self.fc_damage = nn.Linear(vit_feature_size, num_damage_classes)
        self.fc_severity = nn.Linear(vit_feature_size, num_severity_classes)

    def forward(self, x):
        outputs = self.base_model(x).last_hidden_state[:, 0, :]
        damage_output = self.fc_damage(outputs)
        severity_output = self.fc_severity(outputs)
        return damage_output, severity_output

# Load device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load ViT-based classification model
base_vit = ViTModel.from_pretrained("google/vit-base-patch16-224")
classification_model = MultiOutputModel(base_vit, len(damage_labels), len(severity_labels))
classification_model.load_state_dict(torch.load("model_epoch_16.pth", map_location=device))
classification_model.to(device).eval()

# Load YOLOv5 model
yolo_model = torch.hub.load('yolov5', 'custom', path='best.pt', source='local')
yolo_model.to(device).eval()

# Load ResNet18 road classifier
resnet_model = models.resnet18(pretrained=False)
resnet_model.fc = nn.Linear(resnet_model.fc.in_features, 2)
resnet_model.load_state_dict(torch.load("resnet_road_model1.pth", map_location=device))
resnet_model.to(device).eval()

# Transforms
vit_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5])
])

resnet_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

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

    # Save copy for drawing
    draw_image = image.copy()

    # Classification: ViT
    image_tensor_vit = vit_transform(image).unsqueeze(0).to(device)
    with torch.no_grad():
        damage_logits, severity_logits = classification_model(image_tensor_vit)

    damage_probs = torch.sigmoid(damage_logits).squeeze().cpu().numpy()
    predicted_damages = [damage_labels[i] for i in range(len(damage_probs)) if damage_probs[i] > 0.5]

    severity_probs = torch.softmax(severity_logits, dim=1).squeeze().cpu().numpy()
    predicted_severity = severity_labels[severity_probs.argmax()]

    # Object Detection: YOLOv5
    results = yolo_model(draw_image)
    detections = results.pandas().xyxy[0]

    # Draw boxes
    draw = ImageDraw.Draw(draw_image)
    font = ImageFont.load_default()
    for _, row in detections.iterrows():
        label = f"{row['name']} {row['confidence']:.2f}"
        xy = [row['xmin'], row['ymin'], row['xmax'], row['ymax']]
        draw.rectangle(xy, outline='red', width=2)
        draw.text((xy[0], xy[1] - 10), label, fill='red', font=font)

    # Road / Not-Road Classification
    image_tensor_resnet = resnet_transform(image).unsqueeze(0).to(device)
    with torch.no_grad():
        road_output = resnet_model(image_tensor_resnet)
        road_class = torch.argmax(road_output, dim=1).item()
        road_label = road_labels[road_class]

    # Save annotated image
    output_path = "output_with_boxes.jpg"
    draw_image.save(output_path)

    # Create output dictionary
    result_data = {
        "typeOfDamage": predicted_damages,
        "severity": predicted_severity,
        "recommendedAction": "Urgent Repair" if predicted_severity == "Severe" else "Scheduled Repair",
        "roadPresence": road_label,
        "imagePath": output_path
    }

    # Save to MongoDB
    try:
        inserted = collection.insert_one(result_data)
        result_data["_id"] = str(inserted.inserted_id)
    except Exception as e:
        result_data["db_error"] = str(e)

    return result_data

# CLI usage
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Image path, URL, or base64 string not provided"}))
        sys.exit(1)

    image_input = sys.argv[1]
    try:
        prediction = predict_damage_and_objects(image_input)
        print(json.dumps(prediction, indent=2))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)"""
"""import pathlib
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
from pymongo import MongoClient
import base64
import os

# Platform compatibility
if sys.platform == 'win32':
    pathlib.PosixPath = pathlib.WindowsPath

# Suppress warnings
warnings.filterwarnings("ignore")
logging.getLogger("transformers").setLevel(logging.ERROR)

# Labels
damage_labels = ['Alligator Crack', 'Longitudinal Crack', 'No Damage', 'Pothole', 'Transverse Crack']
severity_labels = ['Low', 'Moderate', 'Severe', 'nan']
road_labels = ['road', 'not road']  # Assumes class 0 = road, class 1 = not road

# MongoDB setup (optional)
client = MongoClient("mongodb://localhost:27017/")
db = client["SafeStreetDB"]
collection = db["predictions"]

# ViT Multi-Output Model
class MultiOutputModel(nn.Module):
    def __init__(self, base_model, num_damage_classes, num_severity_classes):
        super().__init__()
        self.base_model = base_model
        vit_feature_size = base_model.config.hidden_size
        self.fc_damage = nn.Linear(vit_feature_size, num_damage_classes)
        self.fc_severity = nn.Linear(vit_feature_size, num_severity_classes)

    def forward(self, x):
        outputs = self.base_model(x).last_hidden_state[:, 0, :]
        damage_output = self.fc_damage(outputs)
        severity_output = self.fc_severity(outputs)
        return damage_output, severity_output

# Load device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load ViT-based classification model
base_vit = ViTModel.from_pretrained("google/vit-base-patch16-224")
classification_model = MultiOutputModel(base_vit, len(damage_labels), len(severity_labels))
classification_model.load_state_dict(torch.load("model_epoch_16.pth", map_location=device))
classification_model.to(device).eval()

# Load YOLOv5 model
yolo_model = torch.hub.load('yolov5', 'custom', path='best.pt', source='local')
yolo_model.to(device).eval()

# Load ResNet18 road classifier
resnet_model = models.resnet18(pretrained=False)
resnet_model.fc = nn.Linear(resnet_model.fc.in_features, 2)
resnet_model.load_state_dict(torch.load("resnet_road_model1.pth", map_location=device))
resnet_model.to(device).eval()

# Transforms
vit_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5])
])

resnet_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

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

    # Save copy for drawing
    draw_image = image.copy()

    # Road Classification: ResNet18
    image_tensor_resnet = resnet_transform(image).unsqueeze(0).to(device)
    with torch.no_grad():
        road_output = resnet_model(image_tensor_resnet)
        road_class = torch.argmax(road_output, dim=1).item()
        road_label = road_labels[road_class]

    # If image is not road, return immediately with a message
    if road_label == 'not road':
        return {"message": "The image does not contain a road. No further classification or detection performed."}

    # Classification: ViT (only if the image is road)
    image_tensor_vit = vit_transform(image).unsqueeze(0).to(device)
    with torch.no_grad():
        damage_logits, severity_logits = classification_model(image_tensor_vit)

    damage_probs = torch.sigmoid(damage_logits).squeeze().cpu().numpy()
    predicted_damages = [damage_labels[i] for i in range(len(damage_probs)) if damage_probs[i] > 0.5]

    severity_probs = torch.softmax(severity_logits, dim=1).squeeze().cpu().numpy()
    predicted_severity = severity_labels[severity_probs.argmax()]

    # Object Detection: YOLOv5 (only if the image is road)
    results = yolo_model(draw_image)
    detections = results.pandas().xyxy[0]

    # Draw boxes
    draw = ImageDraw.Draw(draw_image)
    font = ImageFont.load_default()
    for _, row in detections.iterrows():
        label = f"{row['name']} {row['confidence']:.2f}"
        xy = [row['xmin'], row['ymin'], row['xmax'], row['ymax']]
        draw.rectangle(xy, outline='red', width=2)
        draw.text((xy[0], xy[1] - 10), label, fill='red', font=font)

    # Save annotated image
    output_path = "output_with_boxes.jpg"
    draw_image.save(output_path)

    # Create output dictionary
    result_data = {
        "typeOfDamage": predicted_damages,
        "severity": predicted_severity,
        "recommendedAction": "Urgent Repair" if predicted_severity == "Severe" else "Scheduled Repair",
        "imagePath": output_path
    }

    # Save to MongoDB
    try:
        inserted = collection.insert_one(result_data)
        result_data["_id"] = str(inserted.inserted_id)
    except Exception as e:
        result_data["db_error"] = str(e)

    return result_data

# CLI usage
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Image path, URL, or base64 string not provided"}))
        sys.exit(1)

    image_input = sys.argv[1]
    try:
        prediction = predict_damage_and_objects(image_input)
        print(json.dumps(prediction, indent=2))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

"""
"""import pathlib
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
from pymongo import MongoClient
import base64
import os

# Platform compatibility
if sys.platform == 'win32':
    pathlib.PosixPath = pathlib.WindowsPath

# Suppress warnings
warnings.filterwarnings("ignore")
logging.getLogger("transformers").setLevel(logging.ERROR)

# Labels
damage_labels = ['Alligator Crack', 'Longitudinal Crack', 'No Damage', 'Pothole', 'Transverse Crack']
severity_labels = ['Low', 'Moderate', 'Severe', 'nan']
road_labels = ['road', 'not road']  # Assumes class 0 = road, class 1 = not road

# MongoDB setup (optional)
client = MongoClient("mongodb://localhost:27017/")
db = client["SafeStreetDB"]
collection = db["predictions"]

# ViT Multi-Output Model
class MultiOutputModel(nn.Module):
    def __init__(self, base_model, num_damage_classes, num_severity_classes):
        super().__init__()
        self.base_model = base_model
        vit_feature_size = base_model.config.hidden_size
        self.fc_damage = nn.Linear(vit_feature_size, num_damage_classes)
        self.fc_severity = nn.Linear(vit_feature_size, num_severity_classes)

    def forward(self, x):
        outputs = self.base_model(x).last_hidden_state[:, 0, :]
        damage_output = self.fc_damage(outputs)
        severity_output = self.fc_severity(outputs)
        return damage_output, severity_output

# Load device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load ViT-based classification model
base_vit = ViTModel.from_pretrained("google/vit-base-patch16-224")
classification_model = MultiOutputModel(base_vit, len(damage_labels), len(severity_labels))
classification_model.load_state_dict(torch.load("model_epoch_16.pth", map_location=device))
classification_model.to(device).eval()

# Load YOLOv5 model
yolo_model = torch.hub.load('yolov5', 'custom', path='best.pt', source='local')
yolo_model.to(device).eval()

# Load ResNet18 road classifier
resnet_model = models.resnet18(pretrained=False)
resnet_model.fc = nn.Linear(resnet_model.fc.in_features, 2)
resnet_model.load_state_dict(torch.load("resnet_road_model1.pth", map_location=device))
resnet_model.to(device).eval()

# Transforms
vit_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5])
])

resnet_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

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

    # Save copy for drawing
    draw_image = image.copy()

    # Road Classification: ResNet18
    image_tensor_resnet = resnet_transform(image).unsqueeze(0).to(device)
    with torch.no_grad():
        road_output = resnet_model(image_tensor_resnet)
        road_class = torch.argmax(road_output, dim=1).item()
        road_label = road_labels[road_class]

    # If image is not road, return immediately with a message
    if road_label == 'not road':
        return {"message": "The image does not contain a road. No further classification or detection performed."}

    # If the image is classified as 'road', proceed with the rest of the pipeline
    # Classification: ViT (only if the image is road)
    image_tensor_vit = vit_transform(image).unsqueeze(0).to(device)
    with torch.no_grad():
        damage_logits, severity_logits = classification_model(image_tensor_vit)

    damage_probs = torch.sigmoid(damage_logits).squeeze().cpu().numpy()
    predicted_damages = [damage_labels[i] for i in range(len(damage_probs)) if damage_probs[i] > 0.5]

    severity_probs = torch.softmax(severity_logits, dim=1).squeeze().cpu().numpy()
    predicted_severity = severity_labels[severity_probs.argmax()]

    # Object Detection: YOLOv5 (only if the image is road)
    results = yolo_model(draw_image)
    detections = results.pandas().xyxy[0]

    # Draw boxes
    draw = ImageDraw.Draw(draw_image)
    font = ImageFont.load_default()
    for _, row in detections.iterrows():
        label = f"{row['name']} {row['confidence']:.2f}"
        xy = [row['xmin'], row['ymin'], row['xmax'], row['ymax']]
        draw.rectangle(xy, outline='red', width=2)
        draw.text((xy[0], xy[1] - 10), label, fill='red', font=font)

    # Save annotated image
    output_path = "output_with_boxes.jpg"
    draw_image.save(output_path)

    # Create output dictionary
    result_data = {
        "typeOfDamage": predicted_damages,
        "severity": predicted_severity,
        "recommendedAction": "Urgent Repair" if predicted_severity == "Severe" else "Scheduled Repair",
        "imagePath": output_path
    }

    # Save to MongoDB
    try:
        inserted = collection.insert_one(result_data)
        result_data["_id"] = str(inserted.inserted_id)
    except Exception as e:
        result_data["db_error"] = str(e)

    return result_data

# CLI usage
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Image path, URL, or base64 string not provided"}))
        sys.exit(1)

    image_input = sys.argv[1]
    try:
        prediction = predict_damage_and_objects(image_input)
        print(json.dumps(prediction, indent=2))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)"""
import sys
import pathlib
import torch
from torchvision import transforms, models
from PIL import Image
from transformers import ViTModel
import numpy as np
from pymongo import MongoClient
import os

# Patch for Windows compatibility
if sys.platform == 'win32':
    pathlib.PosixPath = pathlib.WindowsPath

# Device configuration
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ----------------------- Load YOLOv5 Model -----------------------
yolo_model = torch.hub.load('yolov5', 'custom', path='best.pt', source='local', force_reload=True)

# ----------------------- Load Road Classifier -----------------------
classifier = models.resnet18()
classifier.fc = torch.nn.Linear(classifier.fc.in_features, 2)  # 2 classes: yes (road), no (not road)
classifier.load_state_dict(torch.load('resnet_road_model1.pth', map_location=device))
classifier = classifier.to(device)
classifier.eval()

# Transform for road classifier
classifier_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# ----------------------- Load ViT-based Damage Model -----------------------
class MultiOutputModel(torch.nn.Module):
    def __init__(self, base_model, num_damage_classes, num_severity_classes):
        super().__init__()
        self.base_model = base_model
        vit_feature_size = base_model.config.hidden_size
        self.fc_damage = torch.nn.Linear(vit_feature_size, num_damage_classes)
        self.fc_severity = torch.nn.Linear(vit_feature_size, num_severity_classes)

    def forward(self, x):
        outputs = self.base_model(x).last_hidden_state[:, 0, :]
        damage_output = self.fc_damage(outputs)
        severity_output = self.fc_severity(outputs)
        return damage_output, severity_output

damage_labels = ['Alligator Crack', 'Longitudinal Crack', 'No Damage', 'Pothole', 'Transverse Crack']
severity_labels = ['Low', 'Moderate', 'Severe', 'nan']

base_vit = ViTModel.from_pretrained("google/vit-base-patch16-224")
vit_model = MultiOutputModel(base_vit, len(damage_labels), len(severity_labels))
vit_model.load_state_dict(torch.load("model_epoch_16.pth", map_location=device))
vit_model = vit_model.to(device)
vit_model.eval()

# Transform for ViT damage model
vit_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.5, 0.5, 0.5],
                         [0.5, 0.5, 0.5])
])

# ----------------------- MongoDB Setup -----------------------
client = MongoClient("mongodb://localhost:27017/")
db = client["SafeStreetDB"]
collection = db["predictions"]

# ----------------------- Prediction Functions -----------------------
def predict_road(image_path):
    image = Image.open(image_path).convert('RGB')
    input_tensor = classifier_transform(image).unsqueeze(0).to(device)
    with torch.no_grad():
        output = classifier(input_tensor)
        prediction = output.argmax(1).item()
        return prediction == 1  # True if "yes" (road)

def predict_damage(image_path):
    image = Image.open(image_path).convert("RGB")
    image_tensor = vit_transform(image).unsqueeze(0).to(device)
    with torch.no_grad():
        damage_logits, severity_logits = vit_model(image_tensor)

    damage_probs = torch.sigmoid(damage_logits).squeeze().cpu().numpy()
    predicted_damages = [damage_labels[i] for i in range(len(damage_probs)) if damage_probs[i] > 0.5]

    severity_probs = torch.softmax(severity_logits, dim=1).squeeze().cpu().numpy()
    predicted_severity = severity_labels[np.argmax(severity_probs)]

    return predicted_damages, predicted_severity

def detect_objects(image_path):
    results = yolo_model(image_path)
    results.render()
    rendered_img = Image.fromarray(results.ims[0])
    rendered_img.save("output.jpg")
    print("YOLOv5 object detection saved as 'output.jpg'.")

# ----------------------- MongoDB Save Function -----------------------
def save_to_mongo(image_path, damages, severity, road_status):
    # Prepare the document
    result_data = {
        "imagePath": image_path,
        "typeOfDamage": damages,
        "severity": severity,
        "roadStatus": road_status,
        "recommendedAction": "Urgent Repair" if severity == "Severe" else "Scheduled Repair"
    }

    try:
        # Insert the document into MongoDB
        inserted = collection.insert_one(result_data)
        result_data["_id"] = str(inserted.inserted_id)
        print(f"Data saved to MongoDB with ID: {result_data['_id']}")
    except Exception as e:
        print(f"Error saving to MongoDB: {str(e)}")

# ----------------------- Main -----------------------
if __name__ == "__main__":
    import sys
    if len(sys.argv) != 2:
        print("Usage: python predict.py <image_path>")
        sys.exit(1)

    img_path = sys.argv[1]

    is_road = predict_road(img_path)
    if not is_road:
        print("❌ Not a road image. Skipping damage and object detection.")
        save_to_mongo(img_path, [], "nan", "Not Road")
    else:
        print("✅ Road image detected.")
        damages, severity = predict_damage(img_path)
        print(f"📋 Predicted Damages: {damages}")
        print(f"🔥 Severity Level: {severity}")
        detect_objects(img_path)
        save_to_mongo(img_path, damages, severity, "Road")
