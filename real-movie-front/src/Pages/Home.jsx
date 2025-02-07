//this is the home page of the web app

"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import image from "../assets/1303126.jpg"

import {
  Film,
  Popcorn,
  ListVideo,
  Sparkles,
  Sun,
  Moon,
  Star,
  Calendar,
  Clock,
  Heart,
  Tv,
  Trophy,
  Search,
  Play,
} from "lucide-react"
import { theme } from "@/lib/theme"
import { Vortex } from "../components/ui/vortex"
import Hero from "../components/Hero"

const Home = () => {
  const [darkMode, setDarkMode] = useState(false)
  const [selectedGenre, setSelectedGenre] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const genres = useMemo(() => ["Action", "Drama", "Comedy", "Sci-Fi", "Horror", "Romance"], [])

  const streamingServices = useMemo(() => ["Netflix", "Amazon Prime", "Disney+", "Hulu", "HBO Max"], [])

  const trendingMovies = useMemo(
    () => [
      {
        title: "Dune: Part Two",
        rating: "9.2",
        genre: "Sci-Fi",
        image: "/api/placeholder/300/450",
      },
      {
        title: "Poor Things",
        rating: "8.9",
        genre: "Drama",
        image: "/api/placeholder/300/450",
      },
      {
        title: "Oppenheimer",
        rating: "9.1",
        genre: "Biography",
        image: "/api/placeholder/300/450",
      },
      {
        title: "The Batman",
        rating: "8.8",
        genre: "Action",
        image: image,
      },
    ],
    [],
  )

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prevMode) => !prevMode)
  }, [])

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value)
  }, [])

  const handleGenreClick = useCallback((genre) => {
    setSelectedGenre(genre)
  }, [])

  return (
    <div>
      {/* Header */}
      {/* <header
        className="px-8 h-20 flex items-center justify-center sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-black/80"
      >
        <div className="container max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <Popcorn className="h-8 w-8 text-primary" />
            <span className="text-3xl font-bold">MovieMate</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link className="text-lg font-medium hover:text-primary transition-colors" to="#features">
              Features
            </Link>
            <Link className="text-lg font-medium hover:text-primary transition-colors" to="#trending">
              Trending
            </Link>
            <Link className="text-lg font-medium hover:text-primary transition-colors" to="#pricing">
              Pricing
            </Link>
            <Button
              onClick={toggleDarkMode}
              variant="ghost"
              size="icon"
              className="p-3 hover:scale-110 transition-transform"
            >
              {darkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
            </Button>
            <Button className="px-6">Sign In</Button>
          </nav>
        </div>
      </header> */}

      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          genres={genres}
          selectedGenre={selectedGenre}
          onGenreClick={handleGenreClick}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
        />

        {/* Features Section */}
        <section id="features" className="py-20 bg-slate-50 dark:bg-slate-900">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose MovieMate?</h2>
              <p className="text-xl text-muted-foreground">Experience the future of movie discovery</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Sparkles,
                  title: "AI-Powered Recommendations",
                  description: "Our advanced AI learns your taste and suggests movies you'll love",
                },
                {
                  icon: Heart,
                  title: "Personalized Watchlist",
                  description: "Create and organize your perfect movie playlist",
                },
                {
                  icon: Trophy,
                  title: "Curated Collections",
                  description: "Discover hand-picked themed collections and genres",
                },
                {
                  icon: Tv,
                  title: "Stream Availability",
                  description: "Find where to watch across all major platforms",
                },
                {
                  icon: Star,
                  title: "Community Ratings",
                  description: "Real reviews from movie lovers like you",
                },
                {
                  icon: Calendar,
                  title: "New Releases",
                  description: "Stay updated with the latest movies and upcoming releases",
                },
              ].map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="p-6 rounded-xl border bg-white dark:bg-slate-800 transition-all duration-200 hover:shadow-lg hover:scale-105"
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">{title}</h3>
                    <p className="text-muted-foreground">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trending Movies */}
        <section id="trending" className="py-20 bg-white dark:bg-slate-900">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Trending Now</h2>
              <p className="text-xl text-muted-foreground">Most popular movies this week</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {trendingMovies.map((movie) => (
                <div key={movie.title} className="group relative rounded-xl overflow-hidden">
                  <img
                    src={movie.image || "/placeholder.svg"}
                    alt={movie.title}
                    className="w-full h-[450px] object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{movie.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-white/80">{movie.genre}</span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-white">{movie.rating}</span>
                      </div>
                    </div>
                    <Button className="mt-4 w-full gap-2">
                      <Play className="w-4 h-4" /> Watch Trailer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Streaming Services */}
        <section className="py-20 bg-slate-50 dark:bg-slate-900">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Available on All Platforms</h2>
              <p className="text-xl text-muted-foreground">Find where to watch your favorite movies</p>
            </div>

            <div className="flex flex-wrap justify-center gap-8">
              {streamingServices.map((service) => (
                <div key={service} className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-md">
                  <span className="text-lg font-medium">{service}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-white dark:bg-slate-900">
          <div className="container px-4 mx-auto">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Find Your Next Movie?</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join thousands of movie lovers and start discovering films tailored to your taste.
              </p>
              <Button size="lg" className="text-lg px-8">
                Get Started — It's Free
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="space-y-4">
              <Link to="/" className="flex items-center space-x-2">
                <Popcorn className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">MovieMate</span>
              </Link>
              <p className="text-muted-foreground">Your personal movie recommendation companion.</p>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold">Product</h4>
              <ul className="space-y-2">
                <li>
                  <Link className="text-muted-foreground hover:text-primary" to="#">
                    Features
                  </Link>
                </li>
                <li>
                  <Link className="text-muted-foreground hover:text-primary" to="#">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link className="text-muted-foreground hover:text-primary" to="#">
                    API
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <Link className="text-muted-foreground hover:text-primary" to="#">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link className="text-muted-foreground hover:text-primary" to="#">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link className="text-muted-foreground hover:text-primary" to="#">
                    Support
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link className="text-muted-foreground hover:text-primary" to="#">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link className="text-muted-foreground hover:text-primary" to="#">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link className="text-muted-foreground hover:text-primary" to="#">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t text-center text-muted-foreground">
            <p>© 2024 MovieMate. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home

