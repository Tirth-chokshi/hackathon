import requests
import pandas as pd
from time import sleep

def fetch_movie_data(api_key, num_pages=300):
    """
    Fetch movie data from TMDB API and return as a pandas DataFrame
    
    Parameters:
    api_key (str): Your TMDB API key
    num_pages (int): Number of pages to fetch (20 movies per page)
    
    Returns:
    pandas.DataFrame: DataFrame containing movie information
    """
    base_url = "https://api.themoviedb.org/3"
    image_base_url = "https://image.tmdb.org/t/p/w500"  # Base URL for TMDB images
    movies_data = []
    
    for page in range(1, num_pages + 1):
        # Fetch popular movies
        endpoint = f"{base_url}/movie/popular"
        params = {
            "api_key": api_key,
            "page": page,
            "language": "en-US"
        }
        
        response = requests.get(endpoint, params=params)
        
        if response.status_code == 200:
            results = response.json()["results"]
            
            for movie in results:
                # Fetch additional movie details
                movie_id = movie["id"]
                details_endpoint = f"{base_url}/movie/{movie_id}"
                details_params = {
                    "api_key": api_key,
                    "append_to_response": "credits,keywords"
                }
                
                details_response = requests.get(details_endpoint, params=details_params)
                
                if details_response.status_code == 200:
                    details = details_response.json()
                    
                    # Extract director from credits
                    director = next(
                        (crew["name"] for crew in details.get("credits", {}).get("crew", [])
                         if crew["job"] == "Director"),
                        None
                    )
                    
                    # Extract main cast
                    cast = [actor["name"] for actor in details.get("credits", {}).get("cast", [])[:3]]
                    
                    # Extract genres
                    genres = [genre["name"] for genre in details.get("genres", [])]
                    
                    # Extract origin countries
                    origin_countries = [country["name"] for country in details.get("production_countries", [])]
                    
                    # Format release date
                    release_date = details.get("release_date", "")
                    if release_date:
                        release_date = pd.to_datetime(release_date, errors='coerce').strftime('%Y-%m-%d')
                    
                    # Format budget and revenue
                    budget = details.get("budget", 0)
                    budget = f"${budget:,}" if budget else "N/A"
                    
                    revenue = details.get("revenue", 0)
                    revenue = f"${revenue:,}" if revenue else "N/A"
                    
                    # Add poster and backdrop URLs
                    poster_url = f"{image_base_url}{details.get('poster_path')}" if details.get("poster_path") else None
                    backdrop_url = f"{image_base_url}{details.get('backdrop_path')}" if details.get("backdrop_path") else None
                    
                    movie_info = {
                        "id": movie_id,
                        "title": movie["title"],
                        "tagline": details.get("tagline", ""),
                        "release_date": release_date,
                        "overview": movie["overview"],
                        "vote_average": movie["vote_average"],
                        "vote_count": movie["vote_count"],
                        "popularity": movie["popularity"],
                        "director": director,
                        "cast": ", ".join(cast),
                        "genres": ", ".join(genres),
                        "origin_countries": ", ".join(origin_countries),
                        "runtime": details.get("runtime"),
                        "budget": budget,
                        "revenue": revenue,
                        "original_language": details.get("original_language"),
                        "poster_url": poster_url,
                        "backdrop_url": backdrop_url
                    }
                    
                    movies_data.append(movie_info)
                
                # Add delay to avoid hitting rate limits
                sleep(0.25)
        
        print(f"Processed page {page}/{num_pages}")
    
    return pd.DataFrame(movies_data)

def main():
    # Replace with your TMDB API key
    api_key = 'b0ab482e7adb846ca2f97fa3eddd6a59'
    
    # Fetch movie data
    print("Fetching movie data...")
    movies_df = fetch_movie_data(api_key)
    
    # Save to CSV
    output_file = "movies_dataset_with_images.csv"
    movies_df.to_csv(output_file, index=False)
    print(f"Dataset saved to {output_file}")

if __name__ == "__main__":
    main()
