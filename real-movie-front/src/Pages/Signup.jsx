//this the signup page
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { EnvelopeClosedIcon, LockClosedIcon, PersonIcon } from '@radix-ui/react-icons'
import toast, { Toaster } from 'react-hot-toast';
import { Link } from 'react-router-dom';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/auth/signup', { 
        username, 
        email, 
        password 
      });
      toast.success('Signup successful! Please login.');
      navigate('/login');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.response?.data?.message || 'Signup failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#2E2E2E] text-white">
      <Toaster 
        position="top-center" 
        toastOptions={{
          success: {
            style: {
              background: '#4CAF50',
              color: '#FFFFFF',
            },
          },
          error: {
            style: {
              background: '#D32F2F',
              color: '#FFFFFF',
            },
          },
        }}
      />
      <Card className="w-full max-w-md bg-[#2E2E2E] border border-[#FFCC99] shadow-lg shadow-[#D32F2F]/20">
        <CardHeader className="space-y-1 border-b border-[#FFCC99]">
          <CardTitle className="text-3xl font-bold text-center text-[#FFCC99]">Join CineMix</CardTitle>
          <CardDescription className="text-[#FFFFFF] text-center">Create your movie journey</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <PersonIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FFCC99]" />
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  required
                  className="pl-10 bg-[#2E2E2E] border-[#FFCC99] text-white placeholder-[#FFCC99] focus:border-[#D32F2F] focus:ring-[#D32F2F]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <EnvelopeClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FFCC99]" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                  className="pl-10 bg-[#2E2E2E] border-[#FFCC99] text-white placeholder-[#FFCC99] focus:border-[#D32F2F] focus:ring-[#D32F2F]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FFCC99]" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="pl-10 bg-[#2E2E2E] border-[#FFCC99] text-white placeholder-[#FFCC99] focus:border-[#D32F2F] focus:ring-[#D32F2F]"
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-md">
              Sign Up
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-[#FFFFFF]">
            Already have an account? 
            <Link to="/login" className="text-[#FFCC99] hover:text-[#D32F2F] font-semibold ml-1 transition duration-300">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Signup;