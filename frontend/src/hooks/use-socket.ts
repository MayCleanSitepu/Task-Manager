import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { user, token } = useAuthStore();

  useEffect(() => {
    if (!token || !user) return;

    const socket = io(process.env.NEXT_PUBLIC_API_URL, {
      auth: {
        token: token
      }
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      socket.emit('join', user.id);
    });

    socket.on('task_assigned', (data: { title: string; message: string }) => {
      toast.info(data.message, {
        description: 'You have a new task assigned to you.',
        duration: 5000,
      });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    return () => {
      socket.disconnect();
    };
  }, [token, user]);

  return socketRef.current;
};
