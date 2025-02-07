//this is the login page of the app 

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { EnvelopeClosedIcon, LockClosedIcon } from '@radix-ui/react-icons';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import image from "../assets/black3.jpg";

import { CardBody, CardContainer, CardItem } from "../components/ui/3d-card";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://localhost:3000/api/auth/login',
        { email, password },
        { withCredentials: true }
      );
      console.log('Login successful!');
      navigate('/select-movies');
    } catch (error) {
      console.error('Login error:', error);
      console.error('Login failed. Please try again.');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat overflow-hidden relative bg-gradient-to-br from-gray-900 to-black"
      style={{ backgroundImage: `url(${image})` }}
    >
      <div className="absolute inset-0 bg-black/20" aria-hidden="true" />

      <Toaster
        position="top-center"
        toastOptions={{
          success: {
            style: {
              background: '#10B981',
              color: '#FFFFFF',
              backdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(16, 185, 129, 0.8)',
            },
          },
          error: {
            style: {
              background: '#EF4444',
              color: '#FFFFFF',
              backdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(239, 68, 68, 0.8)',
            },
          },
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="z-10 w-full max-w-xl px-4"
      >
        <CardContainer containerClassName="relative">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-900/50 via-indigo-900/50 to-violet-900/50 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt animate-border"></div>
            <Card className="relative border-0 shadow-2xl w-[400px] h-[500px] bg-white/10 backdrop-blur-xl backdrop-saturate-150 rounded-[20px]">
              <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-white/5 to-white/10" />
              <CardHeader className="space-y-4 border-b border-white/10 pb-6 pt-8 relative z-10">
                <motion.div
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <CardTitle className="text-5xl font-bold text-center text-white/90 font-inter tracking-tight">
                    CineMix
                  </CardTitle>
                </motion.div>
                <CardDescription className="text-white/70 text-center text-lg font-light">
                  Where classic meets modern
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-8 px-8 pt-8 relative z-10">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <motion.div
                    className="space-y-4"
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    <div className="relative group">
                      <EnvelopeClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 transition-colors group-hover:text-white/80" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                        className="pl-10 h-12 bg-white/5 border-white/20 text-white/90 placeholder-white/50 focus:border-white/40 focus:ring-white/30 transition-all duration-300 rounded-lg backdrop-blur-sm"
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    className="space-y-4"
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                  >
                    <div className="relative group">
                      <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 transition-colors group-hover:text-white/80" />
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                        className="pl-10 h-12 bg-white/5 border-white/20 text-white/90 placeholder-white/50 focus:border-white/40 focus:ring-white/30 transition-all duration-300 rounded-lg backdrop-blur-sm"
                      />
                    </div>
                  </motion.div>

                  <motion.div className="pt-0" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      className="w-full bg-black text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:shadow-xl h-12 backdrop-blur-sm cursor-pointer z-20"
                      style={{ position: 'relative', zIndex: 20 }}
                    >
                      Sign In
                    </Button>
                  </motion.div>
                </form>
              </CardContent>

              <CardFooter className="text-center relative z-10 pt-4 pb-8">
                <div className="text-white/70">
                  New to CineMix?{' '}
                  <Link
                    to="/signup"
                    className="text-white/90 hover:text-white font-semibold ml-1 transition duration-300 border-b border-transparent hover:border-white/50"
                  >
                    Join the screening
                  </Link>
                </div>
              </CardFooter>
            </Card>
          </div>
        </CardContainer>
      </motion.div>
    </div>
  );
};

export default Login;
