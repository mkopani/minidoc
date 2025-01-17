import { useEffect, useRef } from 'react';
import { v4 as uuid } from 'uuid';
import { WebsocketProvider } from 'y-websocket';
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
      // Initialize WebSocket provider
      const provider = new WebsocketProvider(
        `ws://localhost:8000/ws/documents/`,
        documentId,
        yDocRef.current
      );
      providerRef.current = provider;

      // Handle load event
      provider.on('status', (event: { status: string }) => {
        if (event.status === 'connected') {
          console.log('Connected to WebSocket server');
          onLoad();
        }
      });

      if (provider.ws) {
        // Extract original onmessage handler in order not to override it
        // and prevent Yjs events from being processed
        const originalOnMessage = provider.ws.onmessage;

        // Handle incoming messages for custom events
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
              originalOnMessage.call(provider.ws!, event);
            }
          }
        };
      }
    } catch (error) {
      console.error('Failed to establish WebSocket connection', { error });
    }

    return () => {
      if (providerRef.current) {
        // Clean up provider on unmount
        providerRef.current.destroy();
      }
    };
  }, [documentId]);

  const sendMessage = (
    eventType: WebsocketEventType,
    data: Record<string, unknown> = {}
  ) => {
    // Send message only if WebSocket connection is established
    if (providerRef?.current?.ws && providerRef.current.wsconnected) {
      providerRef.current.ws.send(
        JSON.stringify({ eventType, senderId: senderIdRef.current, ...data })
      );
    }
  };

  // Save publish event
  const publishSaveDocument = () => {
    sendMessage(WebsocketEventType.SAVE);
  };

  // Title update publish event
  const publishUpdateTitle = (title: string) => {
    sendMessage(WebsocketEventType.TITLE_UPDATE, { title });
  };

  return { publishSaveDocument, publishUpdateTitle };
};

export default useWebsocketProvider;
