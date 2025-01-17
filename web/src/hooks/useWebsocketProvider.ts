import { useEffect, useRef } from 'react';
import { v4 as uuid } from 'uuid';
import { WebsocketProvider } from 'y-websocket'
import * as Y from 'yjs';

export enum WebsocketEventType {
  SAVE = 'SAVE',
  TITLE_UPDATE = 'TITLE_UPDATE',
}

interface Props {
  documentId: string;
  yDocRef: React.MutableRefObject<Y.Doc>;
  onTitleUpdate: (title: string) => void;
  onSave: () => void;
  onLoad: () => void;
}

const useWebsocketProvider = (props: Props) => {
  const { documentId, yDocRef, onTitleUpdate, onSave, onLoad } = props;

  const providerRef = useRef<WebsocketProvider | null>(null);
  const senderIdRef = useRef<string>(uuid());

  useEffect(() => {
    try {
      const provider = new WebsocketProvider(
        `ws://localhost:8000/ws/documents/`,
        documentId,
        yDocRef.current,
      );
      providerRef.current = provider;

      provider.on('status', (event: { status: string }) => {
        if (event.status === 'connected') {
          console.log('Connected to WebSocket server');
          onLoad();
        }
      });

      if (provider.ws) {
        const originalOnMessage = provider.ws.onmessage;
        provider.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            // Ignore messages sent by the current user
            if (data?.senderId === senderIdRef.current) {
              return;
            }

            switch (data.eventType) {
              case WebsocketEventType.SAVE:
                onSave();
                break;
              case WebsocketEventType.TITLE_UPDATE:
                onTitleUpdate(data.title);
                break;
            }
          } catch {
            // Do nothing; message contains byte changes for Yjs
            if (originalOnMessage) {
              console.log('This ran')
              originalOnMessage.call(provider.ws!, event);
            }
          }
        };
      }

      // onLoad();
    } catch (error) {
      console.error('Failed to establish WebSocket connection', { error });
    }

    return () => {
      if (providerRef.current) {
        providerRef.current.destroy(); // Clean up provider on unmount
      }
    };
  }, [documentId]);

  const sendMessage = (eventType: WebsocketEventType, data: Record<string, unknown> = {}) => {
    if (providerRef?.current?.ws && providerRef.current.wsconnected) {
      providerRef.current.ws.send(
        JSON.stringify({ eventType, senderId: senderIdRef.current, ...data })
      );
    }
  };

  const publishSaveDocument = () => {
    sendMessage(WebsocketEventType.SAVE);
  };

  const publishUpdateTitle = (title: string) => {
    sendMessage(WebsocketEventType.TITLE_UPDATE, { title });
  }

  return { publishSaveDocument, publishUpdateTitle };
};

export default useWebsocketProvider;
