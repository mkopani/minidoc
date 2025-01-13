import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar, { SnackbarProps } from "@mui/material/Snackbar";
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ArticleIcon from '@mui/icons-material/Article';

import api from "@/api";
import DocumentEditor from "@/components/DocumentEditor";
import Layout from "@/components/Layout";
import { Document } from "@/models";
import axios from "axios";
import { formatUpdatedAt } from "@/util/general";
import TitleInputField from "./TitleInputField";

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

  const isLoading = !(isNewDocument || content);

  const fetchDocument = async () => {
    const { data } = await api.get<Document>(`/documents/${id}`);

    documentRef.current = data;
    setContent(data.content);
    setDocumentTitle(data.title);
  };

  const queueSnackbar = (snackbar: SnackbarProps) => {
    setSnackbars((prev) => [...prev, snackbar]);
  };

  const saveDocument = useCallback(async (titleOverride?: string) => {
    const title = titleOverride || documentTitle;

    try {
      if (isNewDocument) {
        const { data } = await api.post<Document>('/documents/', {
          title,
          content,
        });
        // Update ref
        documentRef.current = data;

        // Update address bar URL with new document ID
        const { id } = data;
        idRef.current = id;
        window.history.replaceState({}, '', `/document/${id}`);
      } else {
        const { data } = await api.patch(`/documents/${idRef.current}/`, {
          title,
          content,
        });
        // Update ref
        documentRef.current = data;
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

  const handleChangeTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDocumentTitle(event.target.value);
  }

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
          <Stack spacing={1} direction="row" alignItems="center" sx={{ display: 'flex' }}>
            <ArticleIcon color="primary" />
            {editingTitle ? (
              <TitleInputField
                value={documentTitle}
                onChange={handleChangeTitle}
                onBlur={handleFinishEditingTitle}
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
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            width: '100%',
            justifyContent: 'center',
            alignItems: isLoading ? 'center' : undefined,
          }}
        >
          {isLoading ? (
            <CircularProgress color="primary" size="3rem" />
          ) : (
            <DocumentEditor
              currentContent={content}
              onChange={handleChange}
            />
          )}
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
