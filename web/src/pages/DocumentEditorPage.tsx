import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Snackbar, { SnackbarProps } from "@mui/material/Snackbar";
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ArticleIcon from '@mui/icons-material/Article';
import { useDebouncedCallback } from "use-debounce";

import api from "@/api";
import DocumentEditor from "@/components/DocumentEditor";
import Layout from "@/components/Layout";
import { Document } from "@/models";
import axios from "axios";
import { formatUpdatedAt } from "@/util/general";

const DocumentEditorPage = () => {
  const { id } = useParams<{ id?: string }>();
  // TODO: Start WebSocket connection for real-time collaboration

  const isNewDocument = !id;
  
  const idRef = useRef<string | undefined>(id);
  const documentRef = useRef<Document | null>(null);
  const hasTypingBegunRef = useRef<boolean>(false);
  
  const [content, setContent] = useState<string>('');
  const [snackbars, setSnackbars] = useState<SnackbarProps[]>([]);
  const [documentTitle, setDocumentTitle] = useState<string>('Untitled document');
  const [editingTitle, setEditingTitle] = useState<boolean>(false);

  const fetchDocument = async () => {
    const { data: document } = await api.get<Document>(`/documents/${id}`);

    documentRef.current = document;
    setContent(document.content);
    setDocumentTitle(document.title);
  };

  const queueSnackbar = (snackbar: SnackbarProps) => {
    setSnackbars((prev) => [...prev, snackbar]);
  };

  const saveDocument = useCallback(async (titleOverride?: string) => {
    const title = titleOverride || documentTitle;

    try {
      if (isNewDocument) {
        const response = await api.post<Document>('/documents/', {
          title,
          content,
        });
        documentRef.current = response.data;

        // Update address bar URL with new document ID
        const { id } = response.data;
        idRef.current = id;
        window.history.replaceState({}, '', `/document/${id}`);
      } else {
        await api.put(`/documents/${idRef.current}/`, {});
      }

      queueSnackbar({
        message: 'Changes saved',
        open: true,
        autoHideDuration: 2000,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        queueSnackbar({
          message: 'Error saving changes',
          open: true,
          autoHideDuration: 2000,
        });
      };
      console.error(error);
    }
  }, [content, documentTitle, isNewDocument]);

  const debouncedSaveDocument = useDebouncedCallback(saveDocument, 5000);

  // Implement a method where the document is saved when the user presses Cmd+S on Mac or Ctrl+S on Windows
  const handleSaveShortcut = useCallback((event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 's') {
      event.preventDefault();
      saveDocument();
    }
  }, [saveDocument]);

  useEffect(() => {
    window.addEventListener('keydown', handleSaveShortcut);
    return () => {
      window.removeEventListener('keydown', handleSaveShortcut);
    };
  }, [handleSaveShortcut]);

  const handleChange = (newContent: string) => {
    if (!hasTypingBegunRef.current) {
      hasTypingBegunRef.current = true;
    }
    setContent(newContent);
  };
  
  const handleStartEditingTitle = () => {
    setEditingTitle(true);
  };

  const handleFinishEditingTitle = async () => {
    setEditingTitle(false);
    let title = documentTitle.trim();
    if (!title) {
      title = 'Untitled document';
      setDocumentTitle(title);
    }
    await saveDocument(title);
  };

  const handleOpenCollabDialog = () => {
    // TODO: Uncomment after implementing collaborators dialog
    // setDialogOpen(true);
    console.log('Collaborators dialog open');
  };

  // const handleCloseCollabDialog = () => {
  //   setDialogOpen(false);
  // };

  useEffect(() => {
    if (!isNewDocument) {
      fetchDocument();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce saving after 5 seconds of inactivity
  useEffect(() => {
    if (hasTypingBegunRef.current) {
      debouncedSaveDocument();
    }
  }, [content, debouncedSaveDocument]);

  return (
    <Layout>
      <Stack spacing={2} direction="column" height="100%">
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* TODO: Move this into its own component */}
          <Stack spacing={1} direction="row" alignItems="center" sx={{ display: 'flex' }}>
            <ArticleIcon color="primary" />
            {editingTitle ? (
              <TextField
                autoFocus
                margin="dense"
                size="small"
                variant="outlined"
                label=""
                placeholder="Enter document title"
                value={documentTitle}
                onChange={(event) => setDocumentTitle(event.target.value)}
                onBlur={handleFinishEditingTitle}
                sx={{
                  fontWeight: 500,
                  minWidth: '200px',
                  width: `${Math.min(40, Math.max(documentTitle.length, 10))}ch`, // Limit width to 80 characters
                  transition: "width 0.2s ease-in-out",
                }}
              />
            ) : (
              <Typography
                variant="h6"
                component="div"
                fontWeight={500}
                sx={{
                  '&:hover': {
                    color: 'primary.main',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  },
                }}
                onClick={handleStartEditingTitle}
              >
                {documentTitle}
              </Typography>
            )}
            {documentRef.current ? (
              <Typography variant="body1" color="textSecondary">
                {formatUpdatedAt(documentRef.current.updated_at)}
              </Typography>
            ) : null}
          </Stack>

          <Box>
            <Button
              onClick={handleOpenCollabDialog}
              variant="contained"
              color="primary"
              size="small"
              startIcon={<PersonAddIcon />}
            >
              Collaborate
            </Button>
          </Box>
        </Box>

        {/* Document editor */}
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {documentRef.current ? (
            <DocumentEditor
              currentContent={content}
              onChange={handleChange}
            />
          ) : null}
        </Box>
      </Stack>
      {/* TODO: Implement collaborators dialog */}
      {snackbars.map((snackbar, index) => (
        <Snackbar
          key={index}
          {...snackbar}
          onClose={() => setSnackbars((prev) => prev.filter((_, i) => i !== index))}
        />
      ))}
    </Layout>
  );
};

export default DocumentEditorPage;
