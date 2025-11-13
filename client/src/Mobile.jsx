import { useState , useEffect, useRef} from 'react';
import io from 'socket.io-client';

const socket = io(`http://${window.location.hostname}:3001`);

function Mobile() {
  const [roomId, setRoomId] = useState('');
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = () => {
    if (roomId) {
      socket.emit('joinRoom', roomId);
    }
  };

  useEffect(() => {
    const handleMobileJoined = () => {
      setJoined(true);
      setError('');
    };

    const handleError = (message) => {
      setError(message);
    };

    socket.on('mobileJoined', handleMobileJoined);
    socket.on('error', handleError);

    return () => {
      socket.off('mobileJoined', handleMobileJoined);
      socket.off('error', handleError);
    };
  }, []);

  const [song, setSong] = useState(null);
  const audioRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const audioData = e.target.result;
        setSong(audioData);
        socket.emit('playSong', { roomId, song: audioData });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePlay = () => {
    audioRef.current.play();
    socket.emit('play', { roomId });
  };

  const handlePause = () => {
    audioRef.current.pause();
    socket.emit('pause', { roomId });
  };

  const handleSeek = (event) => {
    const time = event.target.value;
    audioRef.current.currentTime = time;
    socket.emit('seek', { roomId, time });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white p-4">
      <h1 className="text-3xl font-bold mb-8">Sangeet - Mobile Remote</h1>
      {!joined ? (
        <div className="flex flex-col items-center">
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value.toLowerCase())}
            placeholder="Enter Room Code"
            className="p-2 rounded bg-gray-700 text-white text-center font-mono text-lg"
          />
          <button
            onClick={handleJoin}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Join Room
          </button>
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
      ) : !song ? (
        <div>
          <h2 className="text-2xl mb-4">Upload a Song</h2>
          <input
            type="file"
            accept=".mp3"
            onChange={handleFileChange}
            className="bg-gray-700 text-white p-2 rounded"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <h2 className="text-2xl mb-4">Now Playing</h2>
          <audio ref={audioRef} src={song} muted className="hidden" />
          <div className="flex space-x-4">
            <button onClick={handlePlay} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Play</button>
            <button onClick={handlePause} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Pause</button>
          </div>
          <input type="range" defaultValue="0" max={audioRef.current?.duration || 0} onChange={handleSeek} className="w-full mt-4" />
        </div>
      )}
    </div>
  );
}

export default Mobile;