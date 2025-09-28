'use client'
import React, { useState, useEffect, useRef } from 'react';
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

interface Room {
  id: string;
  slug: string;
  description?: string;
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const router = useRouter();

  useEffect(() => {
    getRooms();
  }, []);

   async function getRooms() {
    
    // Original API call logic
    const token = localStorage.getItem("token");
    let options = {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    };
    try {
      let response = await axios.get(`${BACKEND_URL}/getrooms`, options);
      setRooms(response.data.rooms);
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
    }
  }

  const handleCreateRoom = async () => {
    if (!roomName.trim()) return;
    setIsCreating(true);

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
    } catch (err) {
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
      // call backend to delete room; adjust endpoint name if yours differs
      await axios.post(`${BACKEND_URL}/deleteroom`, { roomId }, options);
      setRooms(prev => prev.filter(room => room.id !== roomId));
    } catch (err) {
      console.error("Delete room failed:", err);
      // optionally show toast/error to user
    }
  };

  const joinRoom = (roomId: string) => {
    router.push(`/canvas/${roomId}`);
  };

  const filteredRooms = rooms.filter(room => 
    room.slug.toLowerCase().includes(searchTerm.toLowerCase()) || 
    room.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2" onClick={() => router.push('/')}>
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <Palette className="w-4 h-4 text-gray-900" />
              </div>
              <span className="text-xl font-semibold text-white">DrawFlow</span>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowCreateRoom(true)}
                className="hidden sm:flex items-center space-x-2 bg-white text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-semibold"
              >
                <Plus className="w-4 h-4" />
                <span>Create Room</span>
              </button>
              <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-light text-white mb-2">Dashboard</h1>
          <p className="text-gray-400 mb-8">Manage your collaborative drawing rooms.</p>
          
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search rooms by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-400 transition-colors"
            />
          </div>
        </motion.div>

        {/* Rooms List */}
        <motion.div 
          className="bg-black border border-gray-800 rounded-xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <AnimatePresence>
            {filteredRooms.map((room) => (
              <motion.div
                key={room.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center p-4 hover:bg-gray-900 transition-colors duration-200 relative group border-b border-gray-800 last:border-b-0"
              >
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  <MessageSquare className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate pr-2">{room.slug}</h3>
                    <p className="text-gray-400 text-sm truncate pr-2">{room.description || 'No description'}</p>
                </div>
                
                {/* Action Icon Buttons */}
                <div className="ml-4 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button onClick={() => joinRoom(room.id)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full" title="Join Room">
                        <LogIn className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full" title="Settings">
                        <Settings className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteRoom(room.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-full" title="Delete Room">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Empty/No Results States */}
          {rooms.length === 0 && (
            <div className="text-center py-16 px-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800 rounded-full mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No rooms yet</h3>
              <p className="text-gray-400 mb-6">Create your first room to start drawing.</p>
              <button onClick={() => setShowCreateRoom(true)} className="bg-white text-gray-900 px-6 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                Create Room
              </button>
            </div>
          )}
          {rooms.length > 0 && filteredRooms.length === 0 && (
            <div className="text-center py-12 px-4">
              <Search className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No rooms found</h3>
              <p className="text-gray-400">Your search for "{searchTerm}" did not match any rooms.</p>
            </div>
          )}
        </motion.div>
      </main>

      {/* Create Room Modal */}
      <AnimatePresence>
        {showCreateRoom && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isCreating && setShowCreateRoom(false)}
          >
            <motion.div
              className="w-full max-w-lg bg-gray-900 p-8 rounded-xl border border-gray-800"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-800 rounded-xl mb-4">
                  <Plus className="w-7 h-7 text-gray-300" />
                </div>
                <h2 className="text-2xl font-semibold text-white mb-1">Create New Room</h2>
                <p className="text-gray-400">Set up a new space for collaboration.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-gray-300 font-medium mb-2 text-sm">Room Name</label>
                  <input type="text" value={roomName} onChange={(e) => setRoomName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-400 transition-colors"
                    placeholder="e.g. 'Project Phoenix Design'" required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-2 text-sm">Description (Optional)</label>
                  <textarea value={roomDescription} onChange={(e) => setRoomDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-400 transition-colors resize-none"
                    placeholder="What's this room about?" rows={3}
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <button type="button" onClick={() => setShowCreateRoom(false)} disabled={isCreating}
                    className="w-full py-3 bg-transparent border border-gray-700 text-gray-300 font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50">
                    Cancel
                  </button>
                  <button onClick={handleCreateRoom} disabled={isCreating || !roomName.trim()}
                    className="w-full py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed group">
                    {isCreating ? (
                      <>
                        <motion.div className="w-5 h-5 border-2 border-gray-400 border-t-gray-900 rounded-full mr-2" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}/>
                        <span>Creating...</span>
                      </>
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