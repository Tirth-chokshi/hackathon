import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Search, Filter, Star, Calendar, Globe, Film, Tv, ChevronLeft, ChevronRight } from 'lucide-react';

const MovieFinder = () => {
  const navigate = useNavigate();
  const [type, setType] = useState("movie");
  const [genres, setGenres] = useState([]);
  const [streamingProviders, setStreamingProviders] = useState([]);
  const [filters, setFilters] = useState({
    genre: "",
    year: "",
    rating: "",
    language: "",
    cast: "",
    sort_by: "popularity.desc",
    certification: "",
    streaming_provider: "",
  });
  const [results, setResults] = useState([]);
  const [castSearch, setCastSearch] = useState("");
  const [castList, setCastList] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    axios.get(`http://localhost:3000/api/genres/${type}`).then((res) => {
      setGenres(res.data);
    });

    axios
      .get(`http://localhost:3000/api/streaming-providers/${type}`)
      .then((res) => {
        setStreamingProviders(res.data);
      });
  }, [type]);

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/discover", {
        params: {
          type,
          ...filters,
          page: currentPage,
        },
      })
      .then((res) => {
        setResults(res.data.results);
        setTotalPages(res.data.total_pages);
        setTotalResults(res.data.total_results);
      });
  }, [filters, type, currentPage]);

  const searchCast = (query) => {
    setCastSearch(query);
    if (query.length > 2) {
      axios
        .get("http://localhost:3000/api/search/person", { params: { query } })
        .then((res) => {
          setCastList(res.data);
        });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const movieCertifications = [
    { value: "G", label: "G - General Audience" },
    { value: "PG", label: "PG - Parental Guidance" },
    { value: "PG-13", label: "PG-13 - Parents Strongly Cautioned" },
    { value: "R", label: "R - Restricted" },
    { value: "NC-17", label: "NC-17 - Adults Only" },
  ];

  const tvCertifications = [
    { value: "TV-Y", label: "TV-Y - All Children" },
    { value: "TV-Y7", label: "TV-Y7 - Directed to Older Children" },
    { value: "TV-G", label: "TV-G - General Audience" },
    { value: "TV-PG", label: "TV-PG - Parental Guidance" },
    { value: "TV-14", label: "TV-14 - Parents Strongly Cautioned" },
    { value: "TV-MA", label: "TV-MA - Mature Audience" },
  ];

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold flex items-center">
            {type === 'movie' ? <Film className="mr-3" /> : <Tv className="mr-3" />}
            Movie & TV Show Recommender
          </h1>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setType('movie')} 
              className={`px-4 py-2 rounded-full transition ${type === 'movie' ? 'bg-white text-blue-600' : 'hover:bg-blue-500'}`}
            >
              Movies
            </button>
            <button 
              onClick={() => setType('tv')} 
              className={`px-4 py-2 rounded-full transition ${type === 'tv' ? 'bg-white text-blue-600' : 'hover:bg-blue-500'}`}
            >
              TV Shows
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="p-6 bg-gray-50 grid grid-cols-3 gap-4">
          {/* Genre Filter */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Filter className="mr-2 text-blue-500" size={18} /> Genre
            </label>
            <select
              value={filters.genre}
              onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Genres</option>
              {genres.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Rating Filter */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Star className="mr-2 text-yellow-500" size={18} /> Rating
            </label>
            <input
              type="number"
              placeholder="Minimum Rating (0-10)"
              value={filters.rating}
              onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
              min="0"
              max="10"
            />
          </div>

          {/* Year Filter */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Calendar className="mr-2 text-green-500" size={18} /> Year
            </label>
            <input
              type="number"
              placeholder="Release Year"
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
              min="1900"
              max={new Date().getFullYear()}
            />
          </div>

          {/* Language Filter */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Globe className="mr-2 text-red-500" size={18} /> Language
            </label>
            <input
              type="text"
              placeholder="Language Code (e.g., en, fr)"
              value={filters.language}
              onChange={(e) => setFilters({ ...filters, language: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Additional Filters */}
          <div className="relative col-span-3 grid grid-cols-3 gap-4">
            {/* Certification Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Certification
              </label>
              <select
                value={filters.certification}
                onChange={(e) =>
                  setFilters({ ...filters, certification: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">
                  All {type === "movie" ? "Movie" : "TV"} Ratings
                </option>
                {(type === "movie" ? movieCertifications : tvCertifications).map(
                  (cert) => (
                    <option key={cert.value} value={cert.value}>
                      {cert.label}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Streaming Provider Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Streaming Provider
              </label>
              <select
                value={filters.streaming_provider}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    streaming_provider: e.target.value,
                  })
                }
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Providers</option>
                {streamingProviders.map((provider) => (
                  <option key={provider.provider_id} value={provider.provider_id}>
                    {provider.provider_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sorting Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={filters.sort_by}
                onChange={(e) =>
                  setFilters({ ...filters, sort_by: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="popularity.desc">Popularity</option>
                <option value="vote_average.desc">Rating</option>
                <option value="release_date.desc">Release Date</option>
              </select>
            </div>
          </div>

          {/* Cast Search */}
          <div className="col-span-3 relative">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Search className="mr-2 text-purple-500" size={18} /> Cast/Crew Search
            </label>
            <input
              type="text"
              placeholder="Search for an actor or crew member"
              value={castSearch}
              onChange={(e) => searchCast(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
            />
            {castList.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {castList.map((person) => (
                  <div
                    key={person.id}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setFilters({ ...filters, cast: person.id });
                      setCastList([]);
                      setCastSearch(person.name);
                    }}
                  >
                    {person.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Results Grid */}
        <div className="p-6">
          <div className="grid grid-cols-5 gap-6">
            {results.map((item) => (
              <div 
                key={item.id} 
                onClick={() => navigate(`/media/${item.id}?type=${type}`)}
                className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden transform transition hover:scale-105 hover:shadow-xl cursor-pointer"
              >
                <img
                  src={`https://image.tmdb.org/t/p/w500/${item.poster_path}`}
                  alt={item.title || item.name}
                  className="w-full h-96 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-2 truncate">{item.title || item.name}</h3>
                  <div className="flex justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <Star className="mr-1 text-yellow-500" size={16} />
                      {item.vote_average.toFixed(1)}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="mr-1 text-blue-500" size={16} />
                      {item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4)}
                    </div>
                  </div>
                  {item.certification && (
                    <div className="mt-2 text-xs bg-gray-100 rounded px-2 py-1 inline-block">
                      {item.certification}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-8 flex justify-between items-center">
            <div className="text-gray-600">
              Showing {(currentPage - 1) * results.length + 1} - {currentPage * results.length} of {totalResults} results
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={handlePrevPage} 
                disabled={currentPage === 1}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50 hover:bg-blue-600 transition"
              >
                <ChevronLeft className="mr-2" /> Previous
              </button>
              <div className="text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <button 
                onClick={handleNextPage} 
                disabled={currentPage === totalPages}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50 hover:bg-blue-600 transition"
              >
                Next <ChevronRight className="ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieFinder;