import './styles.css';

import { Collaboration } from '@tiptap/extension-collaboration';
import Underline from '@tiptap/extension-underline';
import StarterKit from '@tiptap/starter-kit';
import {
  MenuButtonBold,
  MenuButtonItalic,
  MenuButtonUnderline,
  MenuControlsContainer,
  MenuDivider,
  MenuSelectHeading,
  RichTextEditor,
  type RichTextEditorRef,
} from 'mui-tiptap';
import { useCallback, useEffect, useRef } from 'react';
import { WebsocketProvider } from 'y-websocket'
import * as Y from 'yjs';

import api from '@/api';

interface Props {
  documentId?: string;
}

const DocumentEditor = (props: Props) => {
  const { documentId } = props;

  const rteRef = useRef<RichTextEditorRef>(null);
  const ydoc = useRef(new Y.Doc());

  // Initialize the WebSocket provider
  // TODO: Implement a method to send messages to the WebSocket server
  //       Perhaps rewrite useEditorWebSocket?
  useEffect(() => {
    if (!documentId) {
      return;
    }

    const provider = new WebsocketProvider(
      `ws://localhost:8000/ws/documents/`,
      documentId,
      ydoc.current,
    );

    return () => {
      provider.destroy(); // Clean up provider on unmount
    };
  }, [documentId]);

  // Avoid deselecting the editor when clicking on the blank area
  const handleBlankAreaClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (rteRef?.current?.editor) {
      const editor = rteRef.current.editor;

      // Maintain focus
      editor.commands.focus();

      // Check if the click happened below the content
      const editorElement = document.querySelector(
        '.ProseMirror'
      ) as HTMLElement;
      const { bottom } = editorElement.getBoundingClientRect();
      if (event.clientY > bottom) {
        // Set cursor position to the end of the document
        const { size } = editor.state.doc.content;
        editor.commands.setTextSelection(size);
      }
    }
  };

  const saveDocument = async () => {
    // TODO: Send message to WebSocket with eventType `SAVE`

    const content = Y.encodeStateAsUpdate(ydoc.current); // Serialize the Y.Doc
    const jsonContent = JSON.stringify(Array.from(content));

    await api.put(`/api/documents/${documentId}/`, jsonContent);
  };

  // Implement a method where the document is saved when the user presses Cmd+S on Mac or Ctrl+S on Windows
  const handleSaveShortcut = useCallback(
    (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        event.preventDefault();
        saveDocument();
      }
    },
    [saveDocument]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleSaveShortcut);
    return () => {
      window.removeEventListener('keydown', handleSaveShortcut);
    };
  }, [handleSaveShortcut]);

  return (
    <div style={{ minHeight: '100%' }} onClick={handleBlankAreaClick}>
      <RichTextEditor
        ref={rteRef}
        className="full-height"
        extensions={[
          StarterKit.configure({
            history: false,
          }),
          Underline,
          Collaboration.configure({
            document: ydoc.current,
          }),
        ]}
        renderControls={() => (
          <div onClick={(e) => e.stopPropagation()}>
            <MenuControlsContainer className="menu-controls">
              <MenuSelectHeading />
              <MenuDivider />
              <MenuButtonBold />
              <MenuButtonItalic />
              <MenuButtonUnderline />
            </MenuControlsContainer>
          </div>
        )}
      />
    </div>
  );
};

export default DocumentEditor;
