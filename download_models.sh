#!/bin/bash
mkdir -p public/models
cd public/models

BASE_URL="https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights"

wget -nc $BASE_URL/tiny_face_detector_model-weights_manifest.json
wget -nc $BASE_URL/tiny_face_detector_model-shard1

wget -nc $BASE_URL/face_landmark_68_model-weights_manifest.json
wget -nc $BASE_URL/face_landmark_68_model-shard1

wget -nc $BASE_URL/face_recognition_model-weights_manifest.json
wget -nc $BASE_URL/face_recognition_model-shard1
wget -nc $BASE_URL/face_recognition_model-shard2

wget -nc $BASE_URL/ssd_mobilenetv1_model-weights_manifest.json
wget -nc $BASE_URL/ssd_mobilenetv1_model-shard1
wget -nc $BASE_URL/ssd_mobilenetv1_model-shard2

echo "Models downloaded successfully!"
