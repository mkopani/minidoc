import { SnackbarProps } from '@mui/material/Snackbar';
import { useEffect, useRef } from 'react';

export interface WebSocketMessage {
  content: string;
  title: string;
  is_save?: boolean;
}

type OnMessage = (message: WebSocketMessage) => void;
type OnError = (error: SnackbarProps) => void;
type OnClose = () => void;

const MAX_RETRIES = 5;

interface Props {
  documentId: string;
  onMessage: OnMessage;
  onError: OnError;
  onClose: OnClose;
}

export const useEditorWebSocket = (props: Props) => {
  const { documentId, onMessage, onError, onClose } = props;

  const wsRef = useRef<WebSocket | null>(null);

  // Track number of retries
  const retries = useRef<number>(0);

  const connectWebSocket = () => {
    // Do nothing if document is brand new
    if (!documentId) {
      return;
    }

    if (retries.current >= MAX_RETRIES) {
      console.error('Maximum WebSocket retries reached.');
      onError({ message: 'Failed to establish WebSocket connection' });
      return;
    }

    // TODO: Move domain to env var or config
    const ws = new WebSocket(`ws://localhost:8000/ws/documents/${documentId}/`);
    wsRef.current = ws;

    // Establish connection
    ws.onopen = () => {
      console.log('WebSocket connection established');
      retries.current = 0;
    };

    // Receive concurrent document updates
    ws.onmessage = (event) => {
      const data: WebSocketMessage = JSON.parse(event.data);
      onMessage(data);
    };

    // Close connection
    ws.onclose = () => {
      console.log('WebSocket connection closed. Retrying...');
      retries.current++;
      onClose();
      setTimeout(connectWebSocket, 2000);
    };

    // Handle errors
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      onError({ message: 'Failed to establish WebSocket connection' });
    };
  };

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [documentId]);

  const sendMessage = (message: WebSocketMessage) => {
    const { is_save = false, ...other } = message;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ is_save, ...other }));
    }
  };

  return { sendMessage };
};
