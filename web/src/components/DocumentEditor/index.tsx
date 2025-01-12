import { useRef } from "react";
import { useDebouncedCallback } from "use-debounce";
import StarterKit from "@tiptap/starter-kit";
import Underline from '@tiptap/extension-underline';
import {
  MenuButtonBold,
  MenuButtonItalic,
  MenuButtonUnderline,
  MenuControlsContainer,
  MenuDivider,
  MenuSelectHeading,
  RichTextEditor,
  type RichTextEditorRef,
} from "mui-tiptap";
import './styles.css';

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
      const editorElement = document.querySelector('.ProseMirror') as HTMLElement;
      const { bottom } = editorElement.getBoundingClientRect();
      if (event.clientY > bottom) {
        // Set cursor position to the end of the document
        const { size } = editor.state.doc.content;
        editor.commands.setTextSelection(size);
      }
    }
  }

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
          <MenuControlsContainer className="menu-controls">
            <MenuSelectHeading />
            <MenuDivider />
            <MenuButtonBold />
            <MenuButtonItalic />
            <MenuButtonUnderline />
          </MenuControlsContainer>
        )}
      />
    </div>
  );
};

export default DocumentEditor;