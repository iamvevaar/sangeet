import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

function App() {
  const [roomId, setRoomId] = useState('');
  const [song, setSong] = useState(null);
  const [mobileJoined, setMobileJoined] = useState(false);

  useEffect(() => {
    socket.emit('createRoom');

    socket.on('roomCreated', (id) => {
      setRoomId(id);
    });

    socket.on('mobileJoined', () => {
      setMobileJoined(true);
    });

    socket.on('playSong', (selectedSong) => {
      setSong(selectedSong);
    });

    socket.on('error', (message) => {
      alert(message);
    });

    return () => {
      socket.off('roomCreated');
      socket.off('mobileJoined');
      socket.off('playSong');
      socket.off('error');
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8">Sangeet - Web Player</h1>
      {roomId ? (
        <div className="text-center">
          <p className="text-lg mb-2">Enter this code on your mobile device:</p>
          <p className="text-6xl font-mono tracking-widest bg-gray-800 p-4 rounded-lg">{roomId}</p>
          {mobileJoined ? (
             <p className="text-green-400 mt-4">Mobile device connected!</p>
          ) : (
            <p className="text-yellow-400 mt-4">Waiting for mobile device to connect...</p>
          )}
        </div>
      ) : (
        <p>Creating a room...</p>
      )}
      {song && (
        <div className="mt-8 text-center">
          <h2 className="text-2xl">Now Playing</h2>
          <p className="text-xl mt-2">{song}</p>
        </div>
      )}
    </div>
  );
}

export default App;
