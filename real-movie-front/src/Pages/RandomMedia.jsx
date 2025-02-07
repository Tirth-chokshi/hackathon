import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Star, Calendar, Clock, ThumbsUp, Bookmark, Share2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast"

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const RandomMedia = () => {
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mediaType, setMediaType] = useState('movie');
  const [savedMedia, setSavedMedia] = useState([]);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [streak, setStreak] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('savedMedia');
    if (saved) {
      setSavedMedia(JSON.parse(saved));
    }
  }, []);

  const fetchRandomMedia = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/api/random', {
        params: { type: mediaType },
      });
      setMedia(response.data);
      setStreak(prev => prev + 1);
    } catch (error) {
      console.error('Error fetching random media:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch random media. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const isMediaSaved = (mediaItem) => {
    return savedMedia.some(item => item.id === mediaItem.id);
  };

  const saveMedia = () => {
    if (media) {
      if (isMediaSaved(media)) {
        toast({
          variant: "warning",
          title: "Already Saved",
          description: `"${media.title || media.name}" is already in your saved list!`,
          duration: 3000,
        });
        return;
      }

      const newSavedMedia = [...savedMedia, media];
      setSavedMedia(newSavedMedia);
      localStorage.setItem('savedMedia', JSON.stringify(newSavedMedia));
      
      toast({
        title: "Saved Successfully",
        description: `"${media.title || media.name}" has been added to your list!`,
        duration: 3000,
      });
    }
  };

  const removeSavedMedia = (id, title) => {
    const newSavedMedia = savedMedia.filter(item => item.id !== id);
    setSavedMedia(newSavedMedia);
    localStorage.setItem('savedMedia', JSON.stringify(newSavedMedia));

    toast({
      title: "Removed",
      description: `"${title}" has been removed from your list.`,
      duration: 3000,
    });
  };

  // Save Button Component
  const SaveButton = ({ media }) => {
    const isSaved = isMediaSaved(media);
    
    return (
      <Button 
        onClick={saveMedia} 
        variant={isSaved ? "secondary" : "default"}
        className="flex items-center gap-2"
        disabled={isSaved}
      >
        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        {isSaved ? 'Saved' : 'Save'}
      </Button>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-3xl font-bold">Movie Magic Generator</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-lg">
                🔥 Streak: {streak}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="discover" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="discover">Discover</TabsTrigger>
              <TabsTrigger value="saved">Saved ({savedMedia.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="discover">
              <div className="space-y-6">
                <div className="flex justify-center gap-4 mb-6">
                  <Button
                    variant={mediaType === 'movie' ? 'default' : 'outline'}
                    onClick={() => setMediaType('movie')}
                  >
                    Movies
                  </Button>
                  <Button
                    variant={mediaType === 'tv' ? 'default' : 'outline'}
                    onClick={() => setMediaType('tv')}
                  >
                    TV Shows
                  </Button>
                  <Button
                    variant={mediaType === 'animation' ? 'default' : 'outline'}
                    onClick={() => setMediaType('animation')}
                  >
                    Animation
                  </Button>
                </div>

                <div className="flex justify-center">
                  <Button
                    size="lg"
                    onClick={fetchRandomMedia}
                    disabled={loading}
                    className="gap-2"
                  >
                    <RefreshCw className={loading ? 'animate-spin' : ''} />
                    {loading ? 'Finding Magic...' : 'Generate Random Media'}
                  </Button>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Skeleton className="h-[400px]" />
                    <div className="space-y-4">
                      <Skeleton className="h-8 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                ) : media ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="relative group">
                      <img
                        src={`https://image.tmdb.org/t/p/w500${media.poster_path}`}
                        alt={media.title || media.name}
                        className="w-full h-[400px] object-cover rounded-lg shadow-xl transition-transform group-hover:scale-105"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                        <h3 className="text-white text-xl font-bold">{media.title || media.name}</h3>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          {media.vote_average?.toFixed(1)}
                        </Badge>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {media.release_date?.split('-')[0] || media.first_air_date?.split('-')[0]}
                        </Badge>
                      </div>
                      <p className="text-gray-600">{media.overview}</p>
                      <div className="flex gap-4">
                        <SaveButton media={media} />
                        <Button
                          variant="outline"
                          onClick={() => setShowShareDialog(true)}
                          className="flex items-center gap-2"
                        >
                          <Share2 className="w-4 h-4" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 italic">Ready to discover something amazing?</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="saved">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedMedia.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <img
                      src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                      alt={item.title || item.name}
                      className="w-full h-48 object-cover"
                    />
                    <CardContent className="p-4">
                      <h4 className="font-semibold truncate">{item.title || item.name}</h4>
                      <div className="flex justify-between items-center mt-4">
                        <Badge variant="secondary">
                          <Star className="w-4 h-4 mr-1" />
                          {item.vote_average?.toFixed(1)}
                        </Badge>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeSavedMedia(item.id, item.title || item.name)}
                        >
                          Remove
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {savedMedia.length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No saved items yet. Start discovering and save some movies!
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AlertDialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Share this recommendation</AlertDialogTitle>
            <AlertDialogDescription>
              {media && (
                <div className="mt-4">
                  <p>Check out "{media.title || media.name}" on Movie Magic Generator!</p>
                  <p className="mt-2">Rating: {media.vote_average?.toFixed(1)} ⭐</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RandomMedia;