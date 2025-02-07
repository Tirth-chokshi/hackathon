//this page shows the can search a specifc movie on /list
'use client'

import React, { useState } from 'react'
import axios from 'axios'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Star } from 'lucide-react'

const MediaList = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [mediaList, setMediaList] = useState([])
  const [selectedMedia, setSelectedMedia] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const searchMedia = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get('http://localhost:3000/api/media', {
        params: { query: searchQuery },
      })
      setMediaList(response.data)
    } catch (error) {
      console.error('Error searching media:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMediaDetails = async (id, type) => {
    setIsLoading(true)
    try {
      const response = await axios.get(`http://localhost:3000/api/media/${id}`, {
        params: { type },
      })
      setSelectedMedia(response.data)
    } catch (error) {
      console.error('Error fetching media details:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Media Search</h1>
      <div className="flex gap-2 mb-8">
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for movies, TV shows..."
          className="flex-grow"
        />
        <Button onClick={searchMedia} disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Search'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 zap-8">
        {mediaList.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {mediaList.map((media) => (
                  <li
                    key={media.id}
                    onClick={() => fetchMediaDetails(media.id, media.media_type)}
                    className="cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors"
                  >
                    <div className="flex items-center">
                      <Search className="mr-2 h-4 w-4" />
                      <span>{media.title || media.name}</span>
                      <span className="ml-auto text-sm text-gray-500">({media.media_type})</span>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {selectedMedia && (
          <Card>
            <CardHeader>
              <CardTitle>{selectedMedia.title || selectedMedia.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <img
                  src={`https://image.tmdb.org/t/p/w500${selectedMedia.poster_path}`}
                  alt={selectedMedia.title || selectedMedia.name}
                  className="max-w-full h-auto rounded-lg shadow-lg mb-4"
                />
                <p className="text-sm text-gray-600 mb-4">{selectedMedia.overview}</p>
                <div className="flex justify-between w-full text-sm">
                  <span><strong>Release Date:</strong> {selectedMedia.release_date || selectedMedia.first_air_date}</span>
                  <span className="flex items-center">
                    <Star className="text-yellow-400 mr-1 h-4 w-4" />
                    <strong>{selectedMedia.vote_average.toFixed(1)}</strong>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default MediaList

