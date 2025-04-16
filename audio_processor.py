from flask import Flask, request, jsonify
import os
import sys
import json
from werkzeug.utils import secure_filename
import numpy as np
import librosa
import tensorflow as tf
from transformers import pipeline

app = Flask(__name__)

# Configure upload folder
UPLOAD_FOLDER = 'uploads/audio'
ALLOWED_EXTENSIONS = {'mp3', 'wav', 'ogg'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Import your custom model functions
from models.emotion_analyzer import analyze_emotions
from models.transcriber import transcribe_audio
from models.summarizer import summarize_conversation

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def process_audio(audio_path):
    try:
        # Load audio file
        y, sr = librosa.load(audio_path)
        
        # Get duration
        duration = librosa.get_duration(y=y, sr=sr)
        minutes = int(duration // 60)
        seconds = int(duration % 60)
        formatted_duration = f"{minutes}:{seconds:02d}"
        
        # Process with your custom models
        transcript = transcribe_audio(audio_path)
        emotions = analyze_emotions(audio_path)
        summary = summarize_conversation(transcript)
        
        # Calculate suggested rating based on emotions
        emotion_scores = {
            'positive': 1.0,
            'neutral': 0.5,
            'negative': 0.0
        }
        
        employee_score = emotion_scores.get(emotions['employee'], 0.5)
        customer_score = emotion_scores.get(emotions['customer'], 0.5)
        
        # Average the scores and map to 1-5 rating
        avg_score = (employee_score + customer_score) / 2
        suggested_rating = int(avg_score * 4) + 1  # Map 0-1 to 1-5
        
        return {
            "transcript": transcript,
            "summary": summary,
            "duration": formatted_duration,
            "employeeEmotion": emotions['employee'],
            "customerEmotion": emotions['customer'],
            "emotionProbabilities": emotions['probabilities'],
            "suggestedRating": suggested_rating,
            "audioFeatures": {
                "duration": duration,
                "sampleRate": sr
            }
        }
    except Exception as e:
        print(f"Error processing audio: {str(e)}")
        return None

@app.route('/process-audio', methods=['POST'])
def process_audio_endpoint():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400
    
    file = request.files['audio']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Process the audio
        result = process_audio(filepath)
        
        if result:
            return jsonify(result)
        else:
            return jsonify({'error': 'Failed to process audio'}), 500
    
    return jsonify({'error': 'Invalid file type'}), 400

if __name__ == '__main__':
    app.run(port=5001)  # Run on a different port than your main backend 