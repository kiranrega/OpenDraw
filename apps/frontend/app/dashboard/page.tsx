'use client'
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette,
  Plus, 
  ArrowRight, 
  MessageSquare,
  Search,
  LogIn,
  Trash2,
  Settings,
  User as UserIcon,
} from 'lucide-react';
import { useRouter } from "next/navigation";
import axios from 'axios';
import { BACKEND_URL } from '@/config';
import { useProtectedRoute } from '@/hooks/useAuth';

interface Room {
  id: string;
  slug: string;
  description?: string;
  createdAt: string;
}

const Dashboard: React.FC = () => {
  useProtectedRoute();
  
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    getRooms();
  }, []);

   async function getRooms() {
    setLoading(true);
    const token = localStorage.getItem("token");
    const options = {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    };
    try {
      const response = await axios.get(`${BACKEND_URL}/getrooms`, options);
      setRooms(response.data.rooms);
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateRoom = async () => {
    if (!roomName.trim()) return;
    setIsCreating(true);
    setCreateError(null);

    try {
      const token = localStorage.getItem("token");
      const options = { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } };
      const res = await axios.post(`${BACKEND_URL}/createroom`, { slug: roomName.trim(), description: roomDescription }, options);
      const createdRoom = res.data.room;
      if (createdRoom) {
        setRooms(prev => [createdRoom, ...prev]);
      } else {
        await getRooms();
      }
      setRoomName('');
      setRoomDescription('');
      setShowCreateRoom(false);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.response?.data?.errors?.slug?.[0] || "Failed to create room";
      setCreateError(errorMessage);
      console.error("Create room error:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm("Delete this room? This cannot be undone.")) return;
    const token = localStorage.getItem("token");
    const options = { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } };
    try {
      await axios.post(`${BACKEND_URL}/deleteroom`, { roomId }, options);
      setRooms(prev => prev.filter(room => room.id !== roomId));
    } catch (err) {
      console.error("Delete room failed:", err);
    }
  };

  const joinRoom = (roomId: string) => {
    router.push(`/canvas/${roomId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/signin');
  };

  const filteredRooms = rooms.filter(room => 
    room.slug.toLowerCase().includes(searchTerm.toLowerCase()) || 
    room.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-950/80 backdrop-blur-md border-b border-gray-900 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => router.push('/')}>
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <Palette className="w-4 h-4 text-gray-950" />
              </div>
              <span className="text-xl font-semibold text-white">OpenDraw</span>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowCreateRoom(true)}
                className="hidden sm:flex items-center space-x-2 bg-white text-gray-950 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Room</span>
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-gray-900 hover:bg-gray-850 text-gray-300 hover:text-white px-3 py-2 rounded-lg border border-gray-800 transition-colors text-sm font-medium cursor-pointer"
                title="Logout"
              >
                <UserIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-light text-white mb-4 tracking-tight">
            Dashboard
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl leading-relaxed">
            Manage your collaborative drawing rooms and start sketching ideas that come to life.
          </p>
        </motion.div>

        <div className="mb-10 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-colors"
            />
          </div>
          <button 
            onClick={() => setShowCreateRoom(true)}
            className="sm:hidden flex items-center justify-center space-x-2 bg-white text-gray-950 px-4 py-3 rounded-xl font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>New Room</span>
          </button>
        </div>

        {/* Rooms Grid / Loading / Empty State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <motion.div 
              className="w-12 h-12 border-4 border-gray-800 border-t-white rounded-full mb-4" 
              animate={{ rotate: 360 }} 
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }} 
            />
            <p className="text-gray-500 font-medium animate-pulse">Loading your rooms...</p>
          </div>
        ) : rooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredRooms.map((room, index) => (
                <motion.div
                  key={room.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group relative bg-gray-900/40 border border-gray-800 hover:border-gray-700 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full cursor-pointer overflow-hidden"
                  onClick={() => joinRoom(room.id)}
                >
                  {/* Subtle hand-drawn accent background */}
                  <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                    <Palette className="w-32 h-32 text-white transform rotate-12" />
                  </div>

                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-gray-950 border border-gray-800 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                        <MessageSquare className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
                      </div>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => { e.stopPropagation(); /* Settings logic */ }} 
                          className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteRoom(room.id); }} 
                          className="p-2 text-gray-500 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2 truncate">{room.slug}</h3>
                      <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed mb-6">
                        {room.description || 'No description provided for this drawing space.'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-800/50">
                      <span className="text-xs text-gray-500 font-medium">
                        {new Date(room.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <div className="flex items-center text-sm font-medium text-white group-hover:translate-x-1 transition-transform">
                        <span>Enter</span>
                        <ArrowRight className="ml-1.5 w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredRooms.length === 0 && (
              <div className="col-span-full text-center py-20">
                <Search className="w-16 h-16 text-gray-800 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No matches found</h3>
                <p className="text-gray-400">We couldn't find any rooms matching &quot;{searchTerm}&quot;.</p>
              </div>
            )}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="text-center py-20 bg-gray-900/20 border border-dashed border-gray-800 rounded-3xl"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-900 rounded-2xl mb-6">
              <Plus className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">No drawing rooms yet</h3>
            <p className="text-gray-400 mb-8 max-w-sm mx-auto">Create your first room to start collaborating with your team in real-time.</p>
            <button 
              onClick={() => setShowCreateRoom(true)} 
              className="bg-white text-gray-950 px-8 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all shadow-lg hover:shadow-xl cursor-pointer"
            >
              Create Your First Room
            </button>
          </motion.div>
        )}
      </main>

      {/* Footer (Matching Landing Page) */}
      <footer className="bg-black border-t border-gray-950 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-3 text-white">
              <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                <Palette className="w-3.5 h-3.5 text-gray-950" />
              </div>
              <span className="font-semibold text-base">OpenDraw</span>
              <span className="text-gray-500 text-sm">© 2025</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors">GitHub</a>
              <a href="#" className="hover:text-white transition-colors">Documentation</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Create Room Modal - Re-styled */}
      <AnimatePresence>
        {showCreateRoom && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isCreating && setShowCreateRoom(false)}
          >
            <motion.div
              className="w-full max-w-lg bg-gray-950 p-8 rounded-2xl border border-gray-900 shadow-2xl"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-8">
                <h2 className="text-3xl font-light text-white mb-2">New Room</h2>
                <p className="text-gray-400">Set up a space for your next big idea.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-gray-400 font-medium mb-2 text-sm">Room Name</label>
                  <input type="text" value={roomName} onChange={(e) => {
                    setRoomName(e.target.value);
                    setCreateError(null);
                  }}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 transition-colors"
                    placeholder="e.g. Website Wireframe" required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-medium mb-2 text-sm">Description (Optional)</label>
                  <textarea value={roomDescription} onChange={(e) => setRoomDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 transition-colors resize-none"
                    placeholder="Briefly describe what you'll be drawing..." rows={3}
                  />
                </div>
                
                {createError && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-red-400 text-sm font-medium">{createError}</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button type="button" onClick={() => setShowCreateRoom(false)} disabled={isCreating}
                    className="w-full py-3 bg-transparent border border-gray-800 text-gray-400 font-medium rounded-xl hover:bg-gray-900 transition-colors disabled:opacity-50 cursor-pointer">
                    Cancel
                  </button>
                  <button onClick={handleCreateRoom} disabled={isCreating || !roomName.trim()}
                    className="w-full py-3 bg-white text-gray-950 font-semibold rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
                  >
                    {isCreating ? (
                      <motion.div className="w-5 h-5 border-2 border-gray-400 border-t-gray-950 rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}/>
                    ) : (
                      <>
                        <span>Create Room</span>
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
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