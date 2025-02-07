import os
from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler
from fuzzywuzzy import process
import datetime
from flask_cors import CORS 

app = Flask(__name__)
CORS(app)

class MovieRecommender:
    def __init__(self, csv_path):
        self.movies_df = pd.read_csv(csv_path)
        self.movies_df.fillna('', inplace=True)
        self.prepare_data()
    
    def prepare_data(self):
        C = self.movies_df['vote_average'].mean()
        m = self.movies_df['vote_count'].quantile(0.90)
        
        def weighted_rating(x, m=m, C=C):
            v = x['vote_count']
            R = x['vote_average']
            return (v / (v + m) * R) + (m / (m + v) * C)
            
        self.movies_df['weighted_rating'] = self.movies_df.apply(weighted_rating, axis=1)
        self.movies_df['release_date'] = pd.to_datetime(self.movies_df['release_date'], errors='coerce')
        current_date = datetime.datetime.now()
        self.movies_df['days_since_release'] = (current_date - self.movies_df['release_date']).dt.days
        
        scaler = MinMaxScaler()
        self.movies_df['normalized_popularity'] = scaler.fit_transform(self.movies_df[['popularity']].fillna(0))
        self.movies_df['normalized_rating'] = scaler.fit_transform(self.movies_df[['weighted_rating']].fillna(0))
        self.movies_df['combined_features'] = self.movies_df.apply(self._combine_features, axis=1)
        
        self.tfidf = TfidfVectorizer(stop_words='english', ngram_range=(1, 2), max_features=5000)
        self.tfidf_matrix = self.tfidf.fit_transform(self.movies_df['combined_features'])
        self.cosine_sim = cosine_similarity(self.tfidf_matrix, self.tfidf_matrix)
    
    def _combine_features(self, row):
        features = [
            row['title'] * 3,
            row['genres'] * 2,
            row['overview'],
            row['director'] * 2,
            row['cast']
        ]
        return ' '.join([str(feature) for feature in features if feature])
    
    def find_closest_title(self, input_title, threshold=80):
        titles = self.movies_df['title'].tolist()
        closest_match = process.extractOne(input_title, titles)
        return closest_match[0] if closest_match and closest_match[1] >= threshold else None
    
    def recommend_movies(self, input_title, n=5):
        closest_title = self.find_closest_title(input_title)
        if not closest_title:
            return f"No similar titles found for '{input_title}'."
        
        idx = self.movies_df[self.movies_df['title'] == closest_title].index[0]
        input_genres = set(self.movies_df.iloc[idx]['genres'].split(', '))
        
        sim_scores = []
        for i, sim in enumerate(self.cosine_sim[idx]):
            if i != idx and sim > 0.1:
                score = sim
                
                # Genre similarity bonus
                movie_genres = set(self.movies_df.iloc[i]['genres'].split(', '))
                genre_similarity = len(input_genres & movie_genres) / len(input_genres | movie_genres)
                score += genre_similarity * 0.2
                
                sim_scores.append((i, score))
        
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        movie_indices = [score[0] for score in sim_scores[:n]]
        
        recommendations = [{
            'title': self.movies_df.iloc[i]['title'],
            'genres': self.movies_df.iloc[i]['genres'],
            'director': self.movies_df.iloc[i]['director'],
            'cast': self.movies_df.iloc[i]['cast'],
            'release_date': self.movies_df.iloc[i]['release_date'].strftime('%Y-%m-%d') if pd.notna(self.movies_df.iloc[i]['release_date']) else 'N/A',
            'rating': round(self.movies_df.iloc[i]['vote_average'], 1),
            'overview': self.movies_df.iloc[i]['overview'],
            'poster_url': self.movies_df.iloc[i]['poster_url'] if pd.notna(self.movies_df.iloc[i]['poster_url']) else ''
        } for i in movie_indices]
        
        return recommendations

recommender = MovieRecommender('movies_dataset_with_images.csv')

@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.json
    title = data.get('title', '')
    n = data.get('n', 5)
    recommendations = recommender.recommend_movies(title, n=n)
    return jsonify(recommendations)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
