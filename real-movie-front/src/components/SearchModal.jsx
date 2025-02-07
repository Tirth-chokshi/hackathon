"use client"

import React, { useState, useCallback, useRef, useEffect } from "react"
import { Search, X, Star, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import debounce from "lodash/debounce"

const SearchModal = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [mediaList, setMediaList] = useState([])
  const [selectedMedia, setSelectedMedia] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showSpinner, setShowSpinner] = useState(false)

  const inputRef = useRef(null)

  const openModal = () => {
    setIsOpen(true)
    document.body.style.overflow = "hidden"
    if (document.querySelector(".scroll-area")) {
      document.querySelector(".scroll-area").scrollTop = 0
    }
  }

  const closeModal = () => {
    setIsOpen(false)
    setSearchQuery("")
    setMediaList([])
    setSelectedMedia({})
    document.body.style.overflow = "unset"
  }

  const searchMedia = async (query) => {
    if (!query.trim() || query.length < 3) {
      setMediaList([])
      return
    }

    const spinnerTimeout = setTimeout(() => setShowSpinner(true), 300) // Show spinner after 300ms delay

    setIsLoading(true)
    try {
      const response = await axios.get("http://localhost:3000/api/media", {
        params: { query },
      })
      setMediaList(response.data)
    } catch (error) {
      console.error("Error searching media:", error)
    } finally {
      clearTimeout(spinnerTimeout)
      setShowSpinner(false)
      setIsLoading(false)
    }
  }

  const debouncedSearchMedia = useCallback(
    debounce((query) => searchMedia(query), 300),
    [],
  )

  const fetchMediaDetails = async (id, type) => {
    setIsLoading(true)
    try {
      const response = await axios.get(`http://localhost:3000/api/media/${id}`, {
        params: { type },
      })
      setSelectedMedia(response.data)
    } catch (error) {
      console.error("Error fetching media details:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)

    if (query.length > 2) {
      debouncedSearchMedia(query)
    } else {
      setMediaList([])
    }
  }

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  return (
    <div>
      <Button
        onClick={openModal}
        variant="ghost"
        size="icon"
        className="rounded-full transition-all duration-200 hover:scale-105"
        aria-label="Open search"
      >
        <Search className="w-5 h-5" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={closeModal}
            />

            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 500 }}
              className="relative w-full max-w-3xl bg-background rounded-lg shadow-lg overflow-hidden"
              style={{ maxHeight: "calc(100vh - 2rem)" }}
            >
              <Card className="h-full flex flex-col">
                <div className="flex items-center gap-3 p-4 border-b">
                  <Search className="w-5 h-5 text-muted-foreground" />
                  <Input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={handleInputChange}
                    placeholder="Search for movies..."
                    className="flex-1 text-lg border-none shadow-none focus-visible:ring-0"
                  />
                  <Button
                    onClick={closeModal}
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    aria-label="Close search"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <ScrollArea className="flex-grow overflow-y-auto" style={{ height: "calc(100vh - 180px)" }}>
                  <CardContent className="flex flex-col md:flex-row">
                    <div className="w-full md:w-1/2 md:pr-4 md:border-r">
                      {showSpinner ? (
                        <div className="flex items-center justify-center p-8">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                      ) : (
                        mediaList.length > 0 && (
                          <div className="space-y-2">
                            {mediaList.map((media) => (
                              <motion.div
                                key={media.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                onMouseEnter={() => fetchMediaDetails(media.id, media.media_type)}
                                onMouseLeave={() => setSelectedMedia({})}
                                className="cursor-pointer hover:bg-muted p-3 rounded-lg transition-colors flex items-center"
                              >
                                <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                                <span>{media.title || media.name}</span>
                                <span className="ml-auto text-sm text-muted-foreground">({media.media_type})</span>
                              </motion.div>
                            ))}
                          </div>
                        )
                      )}
                    </div>
                    <div className="w-full md:w-1/2 md:pl-4 md:sticky md:top-0 md:self-start">
                      {Object.keys(selectedMedia).length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className="space-y-4"
                        >
                          <div className="flex flex-col gap-6">
                            <img
                              src={`https://image.tmdb.org/t/p/w500${selectedMedia.poster_path}`}
                              alt={selectedMedia.title || selectedMedia.name}
                              className="w-full rounded-lg shadow-lg object-cover"
                            />
                            <div>
                              <h2 className="text-2xl font-bold mb-2">{selectedMedia.title || selectedMedia.name}</h2>
                              <p className="text-muted-foreground mb-4">{selectedMedia.overview}</p>
                              <div className="flex justify-between items-center">
                                <span>
                                  <strong>Release:</strong> {selectedMedia.release_date || selectedMedia.first_air_date}
                                </span>
                                <span className="flex items-center">
                                  <Star className="text-yellow-400 mr-1 h-4 w-4" />
                                  <strong>{selectedMedia.vote_average.toFixed(1)}</strong>
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                </ScrollArea>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SearchModal

