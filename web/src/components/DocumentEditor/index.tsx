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
import { useRef } from 'react';
import * as Y from 'yjs';

interface Props {
  yDocRef: React.MutableRefObject<Y.Doc>;
}

const DocumentEditor = (props: Props) => {
  const { yDocRef } = props;

  const rteRef = useRef<RichTextEditorRef>(null);

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
            document: yDocRef.current,
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
