import { useState , useEffect} from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

const songs = ['Song 1', 'Song 2', 'Song 3', 'Song 4', 'Song 5'];

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

  const handleSelectSong = (song) => {
    socket.emit('selectSong', { roomId, song });
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
      ) : (
        <div>
          <h2 className="text-2xl mb-4">Select a Song</h2>
          <div className="grid grid-cols-2 gap-4">
            {songs.map((song) => (
              <button
                key={song}
                onClick={() => handleSelectSong(song)}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                {song}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Mobile;