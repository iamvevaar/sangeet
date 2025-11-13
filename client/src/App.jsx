import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const socket = io(`http://${window.location.hostname}:3001`);

function App() {
  const [roomId, setRoomId] = useState('');
  const [song, setSong] = useState(null);
  const [mobileJoined, setMobileJoined] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    socket.emit('createRoom');

    socket.on('roomCreated', (id) => {
      setRoomId(id);
    });

    socket.on('mobileJoined', () => {
      setMobileJoined(true);
    });

    socket.on('playSong', (audioData) => {
      setSong(audioData);
    });

    socket.on('play', () => {
      audioRef.current.play();
    });

    socket.on('pause', () => {
      audioRef.current.pause();
    });

    socket.on('seek', (time) => {
      audioRef.current.currentTime = time;
    });

    socket.on('error', (message) => {
      alert(message);
    });

    return () => {
      socket.off('roomCreated');
      socket.off('mobileJoined');
      socket.off('playSong');
      socket.off('play');
      socket.off('pause');
      socket.off('seek');
      socket.off('error');
    };
  }, []);

  useEffect(() => {
    if (song && audioRef.current) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Autoplay was prevented:", error);
          // Autoplay was prevented.
          // We can't do much here without user interaction,
          // but the user can still manually play from the controls.
        });
      }
    }
  }, [song]);

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
          <audio ref={audioRef} src={song} controls autoPlay className="mt-4" />
        </div>
      )}
    </div>
  );
}

export default App;
