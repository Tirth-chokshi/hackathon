  import { useState, useEffect } from "react";
  import { useLocation } from "react-router-dom";
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  import { Input } from "@/components/ui/input";
  import { Button } from "@/components/ui/button";
  import { Slider } from "@/components/ui/slider";
  import { ScrollArea } from "@/components/ui/scroll-area";
  import { Badge } from "@/components/ui/badge";
  import { Film, X, User, Star, Calendar, AlertCircle } from "lucide-react";
  import { Alert, AlertDescription } from "@/components/ui/alert";
  import { Progress } from "@/components/ui/progress";
  import { Skeleton } from "@/components/ui/skeleton";
  import { motion, AnimatePresence } from "framer-motion";

  export default function Home() {
    const [searchValue, setSearchValue] = useState("");
    const [selectedMovies, setSelectedMovies] = useState([]);
    const [recommendationCount, setRecommendationCount] = useState(5);
    const [recommendations, setRecommendations] = useState({});
    const [loading, setLoading] = useState({});
    const [errors, setErrors] = useState({});
    const [progress, setProgress] = useState(0);
    const location = useLocation();

    useEffect(() => {
      setSelectedMovies([]);
      setRecommendations({});
      setLoading({});
      setErrors({});
    }, [location]);

    const handleKeyDown = (e) => {
      if (e.key === "Enter" && !selectedMovies.includes(searchValue)) {
        addMovie(searchValue);
      }
    };

    const addMovie = (title) => {
      if (!selectedMovies.includes(title) && title.trim()) {
        setSelectedMovies([...selectedMovies, title]);
        fetchRecommendations(title);
        setSearchValue("");
      }
    };

    const removeMovie = (title) => {
      setSelectedMovies(selectedMovies.filter((movie) => movie !== title));
      setRecommendations((prev) => ({ ...prev, [title]: null }));
      setLoading((prev) => ({ ...prev, [title]: false }));
      setErrors((prev) => ({ ...prev, [title]: null }));
    };

    const handleSliderChange = ([value]) => {
      setRecommendationCount(value);
      selectedMovies.forEach(fetchRecommendations);
    };

    const fetchRecommendations = async (title) => {
      setLoading((prev) => ({ ...prev, [title]: true }));
      setErrors((prev) => ({ ...prev, [title]: null }));
      setProgress(0);

      try {
        const response = await fetch("http://127.0.0.1:5000/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            n: recommendationCount,
          }),
        });

        // Simulate progress
        for (let i = 0; i <= 100; i += 10) {
          setProgress(i);
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setRecommendations((prev) => ({ ...prev, [title]: data }));
        } else {
          setErrors((prev) => ({ ...prev, [title]: data }));
        }
      } catch (error) {
        setErrors((prev) => ({
          ...prev,
          [title]: "Error connecting to the server. Please try again.",
        }));
      } finally {
        setLoading((prev) => ({ ...prev, [title]: false }));
      }
    };

    return (
      <div className="p-6 max-w-7xl mx-auto">
        <motion.h1
          className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Movie Recommendation System
        </motion.h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add Movies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Type a movie title and press Enter..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-grow"
              />
              <Button
                onClick={() => addMovie(searchValue)}
                disabled={!searchValue.trim()}
                className="w-full sm:w-auto"
              >
                Add Movie
              </Button>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">
                Number of Recommendations: {recommendationCount}
              </label>
              <Slider
                value={[recommendationCount]}
                onValueChange={handleSliderChange}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
            </div>

            <ScrollArea className="h-20 mt-4">
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {selectedMovies.map((movie) => (
                    <motion.div
                      key={movie}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1 px-3 py-1"
                      >
                        <Film className="h-3 w-3 mr-1" />
                        {movie}
                        <button
                          onClick={() => removeMovie(movie)}
                          className="ml-1 hover:text-red-500"
                          aria-label={`Remove ${movie}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="grid gap-8">
          <AnimatePresence>
            {selectedMovies.map((movie) => (
              <motion.div
                key={movie}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader className="bg-primary text-primary-foreground">
                    <CardTitle className="flex justify-between items-center">
                      <span>Recommendations for "{movie}"</span>
                      {loading[movie] && <span className="text-sm">Loading...</span>}
                    </CardTitle>
                    {loading[movie] && <Progress value={progress} className="w-full mt-2" />}
                  </CardHeader>
                  <CardContent className="pt-6">
                    {errors[movie] && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errors[movie]}</AlertDescription>
                      </Alert>
                    )}

                    {recommendations[movie] && recommendations[movie].length > 0 ? (
                      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {recommendations[movie].map((rec, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                          >
                            <Card className="bg-secondary h-full flex flex-col">
                              {rec.poster_url ? (
                                <img
                                  src={rec.poster_url || "/placeholder.svg"}
                                  alt={rec.title}
                                  className="w-full h-48 object-cover"
                                />
                              ) : (
                                <div className="w-full h-48 bg-muted flex items-center justify-center">
                                  <Film className="h-12 w-12 text-muted-foreground" />
                                </div>
                              )}
  <CardContent className="p-4 flex-grow flex flex-col">
    <h3 className="text-lg font-bold mb-2">{rec.title}</h3>
    <p className="text-muted-foreground mb-4 line-clamp-3 flex-grow">{rec.overview}</p>
    <div className="grid grid-cols-2 gap-2 text-sm">
      <div className="flex items-center">
        <Film className="h-4 w-4 mr-2" />
        <span>{rec.genres}</span>
      </div>
      <div className="flex items-center">
        <User className="h-4 w-4 mr-2" />
        <span>{rec.director}</span>
      </div>
      <div className="flex items-center">
        <Star className="h-4 w-4 mr-2" />
        <span>{rec.rating}/10</span>
      </div>
      <div className="flex items-center">
        <Calendar className="h-4 w-4 mr-2" />
        <span>{rec.release_date}</span>
      </div>
      <div className="col-span-2 flex items-center mt-2">
        <Progress value={rec.similarity_score * 100} className="h-2" />
        <span className="ml-2 text-xs">{(rec.similarity_score * 100).toFixed(1)}% match</span>
      </div>
    </div>
  </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {[...Array(recommendationCount)].map((_, index) => (
                          <Card key={index} className="bg-secondary">
                            <Skeleton className="w-full h-48" />
                            <CardContent className="p-4">
                              <Skeleton className="h-6 w-3/4 mb-2" />
                              <Skeleton className="h-4 w-full mb-4" />
                              <Skeleton className="h-4 w-full mb-2" />
                              <Skeleton className="h-4 w-full mb-2" />
                              <div className="grid grid-cols-2 gap-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

        </div>
      </div>
    )
  }

