import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Snackbar, { SnackbarProps } from "@mui/material/Snackbar";
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ArticleIcon from '@mui/icons-material/Article';

import { generateMockDocuments } from "@/__mock__/documents";
import api from "@/api";
import DocumentEditor from "@/components/DocumentEditor";
import Layout from "@/components/Layout";
import { Document } from "@/models";
import axios from "axios";
import { formatUpdatedAt } from "@/util/general";

const DocumentEditorPage = () => {
  const { id } = useParams<{ id: string }>();
  // TODO: Debounce saving after 5 seconds of inactivity
  // TODO: Start WebSocket connection for real-time collaboration

  const documentRef = useRef<Document | null>(null);

  const [content, setContent] = useState<string>('');
  const [snackbars, setSnackbars] = useState<SnackbarProps[]>([]);

  const fetchDocument = async () => {
    const documents = generateMockDocuments(1);
    const document = documents[0];

    documentRef.current = document;
    setContent(document.content);
  };

  const queueSnackbar = (snackbar: SnackbarProps) => {
    setSnackbars((prev) => [...prev, snackbar]);
  };

  const saveDocument = useCallback(async () => {
    try {
      await api.put(`/documents/${id}`, {});
      queueSnackbar({
        message: 'Changes saved',
        open: true,
        autoHideDuration: 2000,
      })
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
  }, [id]);

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
    setContent(newContent);
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
    fetchDocument();
  }, []);

  return (
    <Layout>
      <Stack spacing={2} direction="column" height="100%">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Stack spacing={1} direction="row" alignItems="center">
            <ArticleIcon color="primary" />
            <Typography variant="h6" component="div" fontWeight={500}>
              {documentRef?.current?.title || 'Untitled Document'}
            </Typography>
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
              startIcon={<PersonAddIcon />}
            >
              Add Collaborators
            </Button>
          </Box>
        </Box>
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
