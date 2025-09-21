'use client'
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Plus, 
  ArrowRight, 
  MessageCircle,
  Search,
  MoreVertical,
  UserCheck,
  Trash2,
  Settings,
  Eye
} from 'lucide-react';
import { useRouter } from "next/navigation";
import axios from 'axios';
import { BACKEND_URL } from '@/config';

interface Room {
  id: string;
  slug: string;
  description?: string;
  createdAt: string;
  // memberCount: number;
  // lastActivity: string;
  // isActive: boolean;
  // createdBy: string;
}

const Dashboard: React.FC = () => {
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeRoomMenu, setActiveRoomMenu] = useState<string | null>(null);

  const router = useRouter();

  // Mock data for existing rooms
  useEffect(() => {
    getRooms();
  }, []);

   async function getRooms() {
    const token = localStorage.getItem("token");

    let options = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    let response = await axios.get(`${BACKEND_URL}/getrooms`, options);
    let rooms = await response.data.rooms
    setRooms(rooms)
  }

  const handleCreateRoom = async () => {
    if (!roomName.trim()) return;
    
    setIsCreating(true);
    
    setRoomName('');
    setRoomDescription('');
    setShowCreateRoom(false);
    setIsCreating(false);
  };

  const handleDeleteRoom = (roomId: string) => {
    setRooms(prev => prev.filter(room => room.id !== roomId));
    setActiveRoomMenu(null);
  };

  const joinRoom = (roomId:string) => {
    router.push(`/canvas/${roomId}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-start justify-center p-4 relative overflow-hidden">
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
        className="w-full max-w-7xl relative z-10 py-8"
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
            Manage your chat rooms and collaborate with your team
          </p>
        </motion.div>

        {/* Search and Actions Bar */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-800/60 border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            />
          </div>
          
          <motion.button
            onClick={() => setShowCreateRoom(true)}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-300 group"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform duration-300" />
            Create Room
          </motion.button>
        </motion.div>

        {/* Rooms List - WhatsApp Style */}
        <motion.div 
          className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 shadow-xl mb-8 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <AnimatePresence>
            {rooms.map((room, index) => (
              <motion.div
                key={room.id}
                className="flex items-center p-4 hover:bg-white/5 transition-all duration-200 relative group border-b border-white/10 last:border-b-0 cursor-pointer"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ x: 4 }}
              >
                {/* Room Avatar */}
                <div className="relative mr-4 flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-pink-500/30 rounded-full flex items-center justify-center border border-white/20">
                    <MessageCircle className="w-6 h-6 text-purple-200" />
                  </div>
                </div>

                {/* Room Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-white font-semibold text-lg truncate pr-2">
                      {room.slug}
                    </h3>
                    {/* <span className="text-slate-400 text-xs flex-shrink-0">
                      {room.lastActivity}
                    </span> */}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-slate-300 text-sm truncate pr-2">
                      {room.description || 'No description'}
                    </p>
                    {/* <div className="flex items-center text-slate-400 text-xs flex-shrink-0">
                      <Users className="w-3 h-3 mr-1" />
                      <span>{room.memberCount}</span>
                    </div> */}
                  </div>
                </div>

                {/* Room Menu */}
                <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveRoomMenu(activeRoomMenu === room.id ? null : room.id);
                    }}
                    className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors duration-200"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  
                  <AnimatePresence>
                    
                      <motion.div
                        className="absolute right-4 top-12 bg-slate-800/90 backdrop-blur-xl border border-slate-600/50 rounded-xl p-2 shadow-xl z-20"
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <button className="flex items-center w-full px-3 py-2 text-sm text-white hover:bg-white/10 rounded-lg transition-colors whitespace-nowrap" onClick={() => joinRoom(room.id)}>
                          <UserCheck className="w-4 h-4 mr-2" />
                          Join Room
                        </button>
                        <button className="flex items-center w-full px-3 py-2 text-sm text-white hover:bg-white/10 rounded-lg transition-colors whitespace-nowrap">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </button>
                        <button className="flex items-center w-full px-3 py-2 text-sm text-white hover:bg-white/10 rounded-lg transition-colors whitespace-nowrap">
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRoom(room.id);
                          }}
                          className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors whitespace-nowrap"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </button>
                      </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Empty State */}
          {rooms.length === 0 && rooms.length === 0 && (
            <motion.div 
              className="text-center py-16 px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full mb-4 border border-white/10">
                <MessageCircle className="w-8 h-8 text-purple-200" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No rooms yet</h3>
              <p className="text-purple-200 mb-6">Create your first chat room to get started</p>
              <motion.button
                onClick={() => setShowCreateRoom(true)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                Create Your First Room
              </motion.button>
            </motion.div>
          )}

          {/* No Search Results */}
          {rooms.length === 0 && rooms.length > 0 && searchTerm && (
            <motion.div 
              className="text-center py-12 px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Search className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No rooms found</h3>
              <p className="text-slate-400">Try adjusting your search terms</p>
            </motion.div>
          )}
        </motion.div>

        {/* Quick Actions */}
        {/* {rooms.length > 0 && (
          <motion.div 
            className="flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <motion.button
              onClick={() => setShowCreateRoom(true)}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-300 group"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform duration-300" />
              Create New Room
              <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
            </motion.button>
          </motion.div>
        )} */}

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

      {/* Create Room Modal */}
      <AnimatePresence>
        {showCreateRoom && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isCreating && setShowCreateRoom(false)}
          >
            <motion.div
              className="w-full max-w-lg backdrop-blur-2xl bg-white/10 p-8 rounded-3xl border border-white/20 shadow-2xl"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-8">
                <motion.div
                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-pink-500/30 rounded-2xl mb-4 border border-white/10"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Plus className="w-8 h-8 text-purple-200" />
                </motion.div>
                <h2 className="text-3xl font-bold text-white mb-2">Create New Room</h2>
                <p className="text-purple-200">Set up a new space for collaboration</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-white font-medium mb-2">Room Name</label>
                  <input
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter room name..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Description (Optional)</label>
                  <textarea
                    value={roomDescription}
                    onChange={(e) => setRoomDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                    placeholder="What's this room about?"
                    rows={3}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <motion.button
                    type="button"
                    onClick={() => {
                      setShowCreateRoom(false);
                      setRoomName('');
                      setRoomDescription('');
                    }}
                    disabled={isCreating}
                    className="flex-1 py-3 bg-slate-800/60 border border-slate-600/50 text-white font-semibold rounded-xl hover:bg-slate-700/60 transition-all duration-300 disabled:opacity-50"
                    whileHover={{ scale: isCreating ? 1 : 1.02 }}
                    whileTap={{ scale: isCreating ? 1 : 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  
                  <motion.button
                    onClick={handleCreateRoom}
                    disabled={isCreating || !roomName.trim()}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
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
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
