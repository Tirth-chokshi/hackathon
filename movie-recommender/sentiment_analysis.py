import sys
import json
from textblob import TextBlob
from statistics import mean

def analyze_sentiment(reviews):
    if not reviews:
        return {
            "reviews": [],
            "overall": {
                "average_score": 0,
                "total_reviews": 0,
                "sentiment_distribution": {
                    "positive": 0,
                    "neutral": 0,
                    "negative": 0
                }
            }
        }

    results = []
    scores = []
    
    for review in reviews:
        analysis = TextBlob(review)
        sentiment_score = analysis.sentiment.polarity
        scores.append(sentiment_score)
        
        # Determine sentiment label
        if sentiment_score > 0.1:
            sentiment_label = "positive"
        elif sentiment_score < -0.1:
            sentiment_label = "negative"
        else:
            sentiment_label = "neutral"
            
        results.append({
            "review": review,
            "score": sentiment_score,
            "sentiment": sentiment_label
        })
    
    # Calculate sentiment distribution
    sentiment_distribution = {
        "positive": len([r for r in results if r["sentiment"] == "positive"]),
        "neutral": len([r for r in results if r["sentiment"] == "neutral"]),
        "negative": len([r for r in results if r["sentiment"] == "negative"])
    }
    
    overall_stats = {
        "average_score": mean(scores) if scores else 0,
        "total_reviews": len(reviews),
        "sentiment_distribution": sentiment_distribution
    }
    
    return {
        "reviews": results,
        "overall": overall_stats
    }

if __name__ == "__main__":
    try:
        reviews_json = sys.argv[1]
        reviews = json.loads(reviews_json)
        sentiment_results = analyze_sentiment(reviews)
        print(json.dumps(sentiment_results))
    except Exception as e:
        print(json.dumps({
            "error": str(e),
            "reviews": [],
            "overall": {
                "average_score": 0,
                "total_reviews": 0,
                "sentiment_distribution": {
                    "positive": 0,
                    "neutral": 0,
                    "negative": 0
                }
            }
        }))