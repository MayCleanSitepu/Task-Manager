import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user, token } = useAuthStore();

  useEffect(() => {
    if (!token || !user) return;

    const s = io(process.env.NEXT_PUBLIC_API_URL, {
      auth: {
        token: token
      }
    });

    setSocket(s);

    s.on('connect', () => {
      console.log('Connected to WebSocket server');
      s.emit('join', user.id);
    });

    s.on('task_assigned', (data: { title: string; message: string }) => {
      toast.info(data.message, {
        description: 'You have a new task assigned to you.',
        duration: 5000,
      });
    });

    s.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [token, user]);

  return socket;
};
