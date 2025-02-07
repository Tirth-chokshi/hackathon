import React from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Popcorn, Sun, Moon } from "lucide-react";
import SearchModal from './SearchModal';
import { useTheme } from '../contexts/ThemeContext';

const Navbar = () => {
  const { darkMode, setDarkMode } = useTheme();

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  return (
    <header className="px-8 h-20 flex items-center justify-center sticky top-0 z-50 bg-white dark:bg-slate-900 border-b dark:border-slate-800">
      <div className="container max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3">
          <Popcorn className="h-8 w-8 text-primary" />
          <span className="text-3xl font-bold dark:text-white">MovieMate</span>
        </Link>

        <nav className="flex items-center space-x-8">
          <Link className="text-lg font-medium hover:text-primary transition-colors dark:text-gray-200 dark:hover:text-primary" to="/movie">
            Find Movies
          </Link>
          <Link className="text-lg font-medium hover:text-primary transition-colors dark:text-gray-200 dark:hover:text-primary" to="/random">
            Random
          </Link>
          <Link className="text-lg font-medium hover:text-primary transition-colors dark:text-gray-200 dark:hover:text-primary" to="/playlists">
            Playlists
          </Link>
          <SearchModal />
          <Button
            onClick={toggleDarkMode}
            variant="ghost"
            size="icon"
            className="p-3 hover:scale-110 transition-transform dark:text-white"
          >
            {darkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
          </Button>
          <Link to="/login">
            <Button className="px-6">Sign In</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;