import { useState, useEffect } from 'react';
import { StreamChat } from 'stream-chat';
import { Chat } from 'stream-chat-react';
import axios from 'axios';

import { ChannelListContainer, ChannelContainer, Auth } from './components';
import 'stream-chat-react/dist/css/v2/index.css';
import './App.css';

const URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const apiKey = '7wmswvwtvsxv';
const client = StreamChat.getInstance(apiKey);

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [createType, setCreateType] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch authenticated user info from backend:
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${URL}/auth/me`, {
          withCredentials: true,
        });

        const { userId, username, fullName, avatarURL, emailAddress, token } = res.data;

        await client.connectUser({
          id: userId,
          name: username,
          fullName,
          image: avatarURL,
          emailAddress,
        }, token);
        
        setUser(res.data);
      } catch (err) {
        console.error('Auth check failed: ', err.message);
        setUser(null); // Unauthenticated
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    document.title = 'My Chat App'

    return () => {
      if (client.user) {
        client.disconnectUser();
      }
    };
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!user) return <Auth />

  return (
    <div className='app__wrapper'>
      <Chat client={client} theme='team light'>
        <ChannelListContainer
          isCreating={isCreating}
          setIsCreating={setIsCreating}
          setCreateType={setCreateType}
          setIsEditing={setIsEditing}
        />
        <ChannelContainer
          isCreating={isCreating}
          setIsCreating={setIsCreating}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          createType={createType}
        />
      </Chat>
    </div>
  )
}

export default App