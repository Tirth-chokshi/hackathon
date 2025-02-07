import React, { useState, useCallback } from "react";
import Webcam from "react-webcam";
import { Camera, X, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Face = () => {
  const [emotion, setEmotion] = useState(null);
  const [movies, setMovies] = useState([]);
  const [geminiResponse, setGeminiResponse] = useState(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const webcamRef = React.useRef(null);

  const captureImage = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!webcamRef.current) {
        throw new Error("Webcam not initialized");
      }

      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        throw new Error("Failed to capture image");
      }

      // Detect emotion
      const emotionResponse = await fetch("http://localhost:5001/detect-emotion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageSrc }),
      });

      if (!emotionResponse.ok) {
        throw new Error("Failed to detect emotion");
      }

      const emotionData = await emotionResponse.json();
      if (emotionData.error) {
        throw new Error(emotionData.error);
      }

      setEmotion(emotionData.emotion);
      setShowWebcam(false);

      // Fetch movie recommendations and Gemini response in parallel
      const [movieResponse, moodResponse] = await Promise.all([
        fetch(`http://localhost:5001/recommend-movies?emotion=${emotionData.emotion}`),
        fetch(`http://localhost:5001/get-mood-message?emotion=${emotionData.emotion}`)
      ]);

      if (!movieResponse.ok || !moodResponse.ok) {
        throw new Error("Failed to fetch recommendations or mood message");
      }

      const movieData = await movieResponse.json();
      const moodData = await moodResponse.json();

      if (movieData.error) {
        throw new Error(movieData.error);
      }

      setGeminiResponse(moodData); // Store the entire response object
      setMovies(movieData.movies);
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            Mood-Based Movie Recommendations
          </CardTitle>
          <CardDescription className="text-center">
            Let us detect your mood and suggest the perfect movies for you
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            {showWebcam ? (
              <div className="relative">
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full rounded-lg shadow-lg"
                  width={640}
                  height={480}
                />
                <div className="mt-4 flex justify-center gap-4">
                  <Button
                    onClick={captureImage}
                    disabled={loading}
                    className="gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    {loading ? "Detecting..." : "Capture and Detect"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowWebcam(false)}
                    className="gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button onClick={() => setShowWebcam(true)} className="mx-auto block">
                <Camera className="w-4 h-4 mr-2" />
                Open Camera
              </Button>
            )}

            {emotion && (
              <div className="text-center py-4">
                <span className="text-lg font-medium">
                  Detected Mood:{" "}
                  <span className="ml-2 text-blue-600 font-semibold capitalize">
                    {emotion}
                  </span>
                </span>
              </div>
            )}

            {geminiResponse && (
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-none">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-6 h-6 text-purple-500 flex-shrink-0 mt-1" />
                    <div className="space-y-2">
                      <p className="text-lg font-medium text-purple-800">
                        {geminiResponse.message}
                      </p>
                      <p className="text-sm text-purple-600">
                        Fun Fact: {geminiResponse.fact}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {movies.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-center">
                  Recommended Movies
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {movies.map((movie) => (
                    <Card key={movie.id} className="overflow-hidden">
                      <img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        className="w-full h-64 object-cover"
                      />
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg">{movie.title}</h3>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                          {movie.overview}
                        </p>
                        <div className="mt-2 text-sm text-gray-500">
                          Rating: {movie.vote_average}/10
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Face;