import ArticleIcon from '@mui/icons-material/Article';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar, { SnackbarProps } from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import api from '@/api';
import DocumentEditor from '@/components/DocumentEditor';
import Layout from '@/components/Layout';
import {
  useEditorWebSocket,
  type WebSocketMessage,
} from '@/hooks/useEditorWebSocket';
import { Document } from '@/models';
import { formatUpdatedAt } from '@/util/general';

import TitleInputField from './TitleInputField';

const DocumentEditorPage = () => {
  const { id } = useParams<{ id?: string }>();
  // TODO: Start WebSocket connection for real-time collaboration

  const isNewDocument = !id;

  // const idRef = useRef<string | undefined>(id);
  // const documentRef = useRef<Document | null>(null);
  const hasTypingBegunRef = useRef<boolean>(false);

  const [content, setContent] = useState<string>('');
  const [snackbars, setSnackbars] = useState<SnackbarProps[]>([]);
  const [title, setTitle] = useState<string>('Untitled document');
  const [editingTitle, setEditingTitle] = useState<boolean>(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string>('');

  const isLoading = !(isNewDocument || content);

  const queueSnackbar = (snackbar: SnackbarProps) => {
    setSnackbars((prev) => [...prev, snackbar]);
  };

  const handleWebSocketMessage = (message: WebSocketMessage) => {
    const { content, title: receivedTitle, is_save: isSave } = message;
    setContent(content);

    const now = new Date().toISOString();

    // Update the last updated time if the document was saved earlier than 500ms ago
    // in order to prevent unnecessary state change
    if (
      isSave &&
      new Date(now).getTime() - new Date(lastUpdatedAt).getTime() > 500
    ) {
      setLastUpdatedAt(now);
    }
    if (receivedTitle !== title) {
      setTitle(receivedTitle);
    }
  };

  const handleWebSocketError = (error: SnackbarProps) => {
    queueSnackbar(error);
  };

  const handleWebSocketClose = () => {
    if (content) {
      saveDocument();
    }
  };

  const { sendMessage } = useEditorWebSocket({
    documentId: id || '',
    onMessage: handleWebSocketMessage,
    onError: handleWebSocketError,
    onClose: handleWebSocketClose,
  });

  const fetchDocument = async () => {
    const { data } = await api.get<Document>(`/documents/${id}`);

    setContent(data.content);
    setTitle(data.title);
    setLastUpdatedAt(data.updated_at);
  };

  const saveDocument = useCallback(
    async (titleOverride?: string) => {
      const finalTitle = titleOverride || title;

      try {
        let savedDocument: Document;
        if (isNewDocument) {
          const { data } = await api.post<Document>('/documents/', {
            title: finalTitle,
            content,
          });
          savedDocument = data;

          // Update address bar URL with new document ID
          window.history.replaceState({}, '', `/document/${data.id}`);
        } else {
          const { data } = await api.patch(`/documents/${id}/`, {
            title: finalTitle,
            content,
          });
          savedDocument = data;
        }

        setTitle(savedDocument.title);
        setLastUpdatedAt(savedDocument.updated_at);

        sendMessage({ content, title: title, is_save: true });

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
        }
        console.error(error);
      }
    },
    [content, title, isNewDocument]
  );

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

  const handleChangeContent = (newContent: string) => {
    if (!hasTypingBegunRef.current) {
      hasTypingBegunRef.current = true;
    }
    setContent(newContent);
    sendMessage({ content: newContent, title: title });
  };

  const handleStartEditingTitle = () => {
    setEditingTitle(true);
  };

  const handleChangeTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const handleFinishEditingTitle = async () => {
    setEditingTitle(false);
    let newTitle = title.trim();
    if (!newTitle) {
      newTitle = 'Untitled document';
      setTitle(title);
    }
    await saveDocument(title);
    sendMessage({ content, title: newTitle });
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
  }, [isNewDocument]);

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
          <Stack
            spacing={1}
            direction="row"
            alignItems="center"
            sx={{ display: 'flex' }}
          >
            <ArticleIcon color="primary" />
            {editingTitle ? (
              <TitleInputField
                value={title}
                onChange={handleChangeTitle}
                onBlur={handleFinishEditingTitle}
              />
            ) : (
              <Tooltip title="Click to edit" arrow>
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
                  {title || 'Untitled document'}
                </Typography>
              </Tooltip>
            )}
            {lastUpdatedAt ? (
              <Typography variant="body1" color="textSecondary">
                {formatUpdatedAt(lastUpdatedAt)}
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
              onChange={handleChangeContent}
            />
          )}
        </Box>
      </Stack>

      {/* TODO: Implement collaborators dialog */}
      {snackbars.map((snackbar, index) => (
        <Snackbar
          key={index}
          {...snackbar}
          onClose={() =>
            setSnackbars((prev) => prev.filter((_, i) => i !== index))
          }
        />
      ))}
    </Layout>
  );
};

export default DocumentEditorPage;
