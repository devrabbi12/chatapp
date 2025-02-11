import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { io } from 'socket.io-client';
import LoginScreen from './screens/LoginScreen';
import ChatScreen from './screens/ChatScreen';

const Stack = createStackNavigator();
const socket = io('http://10.0.2.2:5000'); // Use 10.0.2.2 for Android emulator

export default function App() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    socket.on('userList', (userList) => {
      setUsers(userList);
    });

    socket.on('previousMessages', (msgs) => {
      setMessages(msgs);
    });

    socket.on('newMessage', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off('userList');
      socket.off('previousMessages');
      socket.off('newMessage');
    };
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    socket.emit('login', userData);
  };

  const sendMessage = (message) => {
    socket.emit('sendMessage', {
      content: message,
      timestamp: new Date(),
    });
  };

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!user ? (
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Chat">
            {(props) => (
              <ChatScreen
                {...props}
                user={user}
                messages={messages}
                users={users}
                onSendMessage={sendMessage}
              />
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
