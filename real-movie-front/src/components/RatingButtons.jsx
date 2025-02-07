"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { ThumbsUp, Award, ThumbsDown, Loader2 } from "lucide-react"
import { toast } from "react-hot-toast"
import { cn } from "../lib/utils"

export default function RatingButtons({ media }) {
  const [selectedRating, setSelectedRating] = useState(null)
  const [counts, setCounts] = useState({ good: 0, better: 0, worst: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchRatings()
  }, [media.id])

  const fetchRatings = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/media/${media.id}/ratings`, {
        withCredentials: true,
      })
      setCounts(response.data.counts)

      const userRating = response.data.ratings.find((r) => r.userId.username === localStorage.getItem("username"))
      if (userRating) {
        setSelectedRating(userRating.rating)
      }
    } catch (error) {
      console.error("Error fetching ratings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRate = async (rating) => {
    setSubmitting(true)
    try {
      await axios.post(
        `http://localhost:3000/api/media/${media.id}/rate`,
        {
          rating,
          mediaType: media.media_type || "movie",
          title: media.title || media.name,
          posterPath: media.poster_path,
        },
        { withCredentials: true },
      )

      setSelectedRating(rating)
      fetchRatings()
      toast.success("Rating saved!")
    } catch (error) {
      toast.error("Error saving rating")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-4 shadow-xl">
      <div className="absolute inset-0 bg-grid-white/[0.02]" />
      <div className="relative flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <h3 className="text-lg font-semibold text-gold-500 sm:text-xl">Rate this {media.media_type || "movie"}</h3>

        <div className="flex flex-wrap gap-2 sm:flex-nowrap">
          <RatingButton
            icon={ThumbsUp}
            label="Good"
            count={counts.good}
            onClick={() => handleRate("good")}
            selected={selectedRating === "good"}
            disabled={submitting}
            color="green"
          />
          <RatingButton
            icon={Award}
            label="Better"
            count={counts.better}
            onClick={() => handleRate("better")}
            selected={selectedRating === "better"}
            disabled={submitting}
            color="blue"
          />
          <RatingButton
            icon={ThumbsDown}
            label="Worst"
            count={counts.worst}
            onClick={() => handleRate("worst")}
            selected={selectedRating === "worst"}
            disabled={submitting}
            color="red"
          />
        </div>

        <div className="flex items-center space-x-2 rounded-lg bg-gray-800/50 px-3 py-1 text-sm">
          <span className="font-medium text-gray-400">Total:</span>
          <span className="font-bold text-gold-500">{counts.total}</span>
        </div>
      </div>
    </div>
  )
}

function RatingButton({ icon: Icon, label, count, onClick, selected, disabled, color }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group flex items-center justify-between gap-2 rounded-lg border px-3 py-2 transition-all duration-300",
        selected
          ? `border-${color}-500 bg-${color}-500/20`
          : `border-gray-700 bg-gray-800/50 hover:border-${color}-500/50 hover:bg-${color}-500/10`,
      )}
    >
      <div className="flex items-center gap-2">
        <Icon
          className={cn(
            "h-4 w-4 transition-transform duration-300 group-hover:scale-110",
            selected ? `text-${color}-400` : `text-gray-400 group-hover:text-${color}-400`,
          )}
        />
        <span className="text-xs font-medium sm:text-sm">{label}</span>
      </div>
      <span className={cn("text-xs", selected ? `text-${color}-300` : "text-gray-500")}>{count}</span>
    </button>
  )
}

