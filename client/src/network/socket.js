import { io } from 'socket.io-client';

const serverUrl = import.meta.env.DEV
    ? 'http://localhost:3000'
    : 'https://wwb-5kde.onrender.com';

export const socket = io(serverUrl);