'use client'
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Home, ArrowRight, Users } from 'lucide-react';
import axios from 'axios';
import { BACKEND_URL } from '@/config';

const Dashboard = () => {
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateRoom = async () => {
    if (!roomName.trim()) return;
    const token = localStorage.getItem('token')
    console.log(token)
    setIsCreating(true);
    // Simulate API call
    const res = axios.post(`${BACKEND_URL}/room`, {slug: roomName}, {
        headers: {
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}`
        }
    })
    let roomId = (await res).data.roomId
      setIsCreating(false);
      setRoomName('');
      setShowCreateRoom(false);
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-1/3 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-1/3 right-1/4 w-56 h-56 bg-purple-500/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            x: [0, -40, 0],
            y: [0, 40, 0]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-1/2 right-1/3 w-40 h-40 bg-pink-500/15 rounded-full blur-2xl"
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-2xl relative z-10"
      >
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <motion.div 
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl mb-6 shadow-2xl"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Home className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-5xl font-bold text-white mb-4">Dashboard</h1>
          <p className="text-purple-200 text-xl">
            Create and manage your creative spaces
          </p>
        </motion.div>

        {/* Dashboard Card */}
        <motion.div 
          className="backdrop-blur-2xl bg-white/10 p-12 rounded-3xl border border-white/20 shadow-2xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          {!showCreateRoom ? (
            // Initial State - Create Room Button
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-center"
            >
              <motion.div
                className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full mb-8 border border-white/10"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Users className="w-12 h-12 text-purple-200" />
              </motion.div>
              
              <h2 className="text-3xl font-bold text-white mb-4">Ready to Create?</h2>
              <p className="text-purple-200 text-lg mb-10">
                Start by creating a new room to collaborate with others
              </p>
              
              <motion.button
                onClick={() => setShowCreateRoom(true)}
                className="inline-flex items-center px-10 py-5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-300 group text-lg"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="w-6 h-6 mr-3 group-hover:rotate-90 transition-transform duration-300" />
                Create New Room
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
              </motion.button>
            </motion.div>
          ) : (
            // Create Room Form
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <motion.div
                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-pink-500/30 rounded-2xl mb-4 border border-white/10"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Plus className="w-8 h-8 text-purple-200" />
                </motion.div>
                <h2 className="text-3xl font-bold text-white mb-2">Create New Room</h2>
                <p className="text-purple-200">Give your room a memorable name</p>
              </motion.div>

              <div className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="relative group"
                >
                  <input
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="w-full px-6 py-5 bg-slate-800/60 border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-lg"
                    placeholder="Enter room name..."
                    required
                  />
                </motion.div>

                <motion.div 
                  className="flex gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <motion.button
                    type="button"
                    onClick={() => {
                      setShowCreateRoom(false);
                      setRoomName('');
                    }}
                    className="flex-1 py-4 bg-slate-800/60 border border-slate-600/50 text-white font-semibold rounded-2xl hover:bg-slate-700/60 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  
                  <motion.button
                    onClick={handleCreateRoom}
                    disabled={isCreating || !roomName.trim()}
                    className="flex-1 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                    whileHover={{ scale: isCreating || !roomName.trim() ? 1 : 1.02 }}
                    whileTap={{ scale: isCreating || !roomName.trim() ? 1 : 0.98 }}
                  >
                    {isCreating ? (
                      <div className="flex items-center justify-center">
                        <motion.div
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-3"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Creating...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <span>Create Room</span>
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Footer */}
        <motion.p 
          className="text-center text-slate-500 text-sm mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          Collaborate securely with your team
        </motion.p>
      </motion.div>


    </div>
  );
};

export default Dashboard;