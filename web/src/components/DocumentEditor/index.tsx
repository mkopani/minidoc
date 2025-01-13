import './styles.css';

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
import { useEffect, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';

interface Props {
  currentContent: string;
  onChange: (newContent: string) => void;
}

const DocumentEditor = (props: Props) => {
  const { currentContent, onChange } = props;

  const rteRef = useRef<RichTextEditorRef>(null);

  // Debounce the content update to avoid updating the state too frequently
  const debouncedSetContent = useDebouncedCallback((html) => {
    onChange(html);
  }, 300);

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

  // Update editor content when `currentContent` changes
  useEffect(() => {
    if (rteRef?.current?.editor) {
      const editor = rteRef.current.editor;

      // Only update if content is different
      if (editor.getHTML() !== currentContent) {
        editor.commands.setContent(currentContent);
      }
    }
  }, [currentContent]);

  return (
    <div style={{ minHeight: '100%' }} onClick={handleBlankAreaClick}>
      <RichTextEditor
        ref={rteRef}
        className="full-height"
        extensions={[StarterKit, Underline]}
        onUpdate={({ editor }) => {
          const html = editor.getHTML(); // Get current content as HTML
          debouncedSetContent(html); // Update the state with the current content
        }}
        content={currentContent}
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
