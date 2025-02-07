from flask import Flask, request, jsonify
import cv2
import numpy as np
import base64
from deepface import DeepFace
from tmdbv3api import TMDb, Movie, Genre
from flask_cors import CORS
import logging
import google.generativeai as genai
genai.configure(api_key='AIzaSyDNx2mtOjxSDwZJZYX0qy5xd1siB55OQY8')
model = genai.GenerativeModel('gemini-pro')
import logging
import json
app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.DEBUG)

# TMDB API setup
tmdb = TMDb()
tmdb.api_key = 'b0ab482e7adb846ca2f97fa3eddd6a59'
movie_api = Movie()
genre_api = Genre()

@app.route("/get-mood-message", methods=["GET"])
def get_mood_message():
    try:
        emotion = request.args.get("emotion")
        if not emotion:
            return jsonify({"error": "Emotion parameter is required"}), 400

        # Create a prompt based on the emotion
        prompt = f"""
        Given that someone is feeling {emotion}, generate two things:
        1. A funny and lighthearted message (2-3 sentences) that acknowledges their mood
        2. An interesting fact related to {emotion} or how it affects movie preferences
        
        Format the response exactly like this JSON:
        {{
            "message": "Your funny message here",
            "fact": "Your interesting fact here"
        }}
        """

        response = model.generate_content(prompt)
        
        try:
            # Extract the content and clean it up
            content = response.text
            # Remove any markdown formatting that might be present
            content = content.replace('```json', '').replace('```', '').strip()
            
            # Log the response for debugging
            logging.debug(f"Gemini response: {content}")
            
            # Try to parse the JSON
            message_data = json.loads(content)
            
            # Validate the response structure
            if not isinstance(message_data, dict) or 'message' not in message_data or 'fact' not in message_data:
                raise ValueError("Invalid response structure")
                
            return jsonify(message_data)
            
        except json.JSONDecodeError as json_err:
            logging.error(f"JSON parsing error: {str(json_err)}")
            # Fallback response when JSON parsing fails
            return jsonify({
                "message": f"Hey there! I see you're feeling {emotion}. Let's find some great movies to match your mood!",
                "fact": "Did you know? Movies can actually influence our mood and emotional state!"
            })
            
        except ValueError as val_err:
            logging.error(f"Validation error: {str(val_err)}")
            # Fallback for invalid structure
            return jsonify({
                "message": response.text[:200],
                "fact": "Did you know? Movies can actually influence our mood and emotional state!"
            })
            
    except Exception as e:
        logging.error(f"Gemini API error: {str(e)}")
        return jsonify({"error": str(e)}), 500
    

def detect_emotion(image_data):
    try:
        # Convert base64 to cv2 image
        img = cv2.imdecode(image_data, cv2.IMREAD_COLOR)
        
        # Save temporary file for DeepFace
        temp_path = "temp_image.jpg"
        cv2.imwrite(temp_path, img)
        
        # Analyze with DeepFace
        analysis = DeepFace.analyze(
            img_path=temp_path,
            actions=['emotion'],
            enforce_detection=False
        )
        
        # Get dominant emotion
        if isinstance(analysis, list):
            emotion = analysis[0]["dominant_emotion"]
        else:
            emotion = analysis["dominant_emotion"]
            
        return emotion
    except Exception as e:
        logging.error(f"Error in emotion detection: {str(e)}")
        raise

def get_movie_recommendations(emotion):
    try:
        # Enhanced emotion to genre mapping
        emotion_to_genre = {
            "happy": ["35", "12"],     # Comedy, Adventure
            "sad": ["18", "10749"],    # Drama, Romance
            "angry": ["28", "53"],     # Action, Thriller
            "surprise": ["878", "14"],  # Sci-Fi, Fantasy
            "neutral": ["10749", "35"], # Romance, Comedy
            "fear": ["27", "53"],      # Horror, Thriller
            "disgust": ["53", "80"],   # Thriller, Crime
        }

        # Get genre IDs for the emotion
        genre_ids = emotion_to_genre.get(emotion.lower(), ["35"])
        
        # Get popular movies
        recommendations = []
        page = 1
        while len(recommendations) < 10 and page <= 3:
            movies = movie_api.popular(page=page)
            for movie in movies:
                if any(str(genre_id) in [str(g) for g in movie.genre_ids] 
                      for genre_id in genre_ids):
                    recommendations.append({
                        "id": movie.id,
                        "title": movie.title,
                        "poster_path": movie.poster_path,
                        "overview": movie.overview,
                        "vote_average": movie.vote_average
                    })
            page += 1
        
        return recommendations[:10]
    except Exception as e:
        logging.error(f"Error in movie recommendations: {str(e)}")
        raise

@app.route("/detect-emotion", methods=["POST"])
def detect_emotion_route():
    try:
        # Get base64 image data
        data = request.json["image"].split(",")[1]
        image_data = np.frombuffer(base64.b64decode(data), np.uint8)
        
        # Detect emotion
        emotion = detect_emotion(image_data)
        return jsonify({"emotion": emotion})
    except Exception as e:
        logging.error(f"Route error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/recommend-movies", methods=["GET"])
def recommend_movies_route():
    try:
        emotion = request.args.get("emotion")
        if not emotion:
            return jsonify({"error": "Emotion parameter is required"}), 400
            
        movies = get_movie_recommendations(emotion)
        return jsonify({"movies": movies})
    except Exception as e:
        logging.error(f"Route error: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)