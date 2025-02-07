import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './Pages/Home';
import MovieFinder from './Pages/MovieFinder';
import RandomMedia from './Pages/RandomMedia';
import MediaList from './Pages/MediaList';
import MediaDetails from './Pages/MediaDetails';
import Reco from './Pages/Reco';
import Face from './Pages/Face';
import Login from './Pages/Login';
import Signup from './Pages/Signup';
import PlaylistsPage from './Pages/PlaylistsPage';
import RankedMovies from './Pages/RankedMovies';
import { ThemeProvider } from './contexts/ThemeContext';


const App = () => {
  return (
    <Router>
      <ThemeProvider>

      <div className="min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/movie" element={<MovieFinder/>} />
          <Route path="/random" element={<RandomMedia />} />
          <Route path="/list" element={<MediaList />} />
          <Route path="/media/:id" element={<MediaDetails />} />
          <Route path="/reco" element={<Reco />} />
          <Route path="/face" element={<Face />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/playlists" element={<PlaylistsPage />} />
          <Route path="/ranked" element={<RankedMovies />} />
        </Routes>
      </div>
      </ThemeProvider>
    </Router> 
  );
};

export default App;