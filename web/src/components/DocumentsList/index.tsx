import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useNavigate } from 'react-router-dom';

import api from '@/api';
import type { Document } from '@/models';

import DocumentRow from './DocumentRow';

interface Props {
  documents: Document[];
  onSuccessfulDelete: () => Promise<void>; // TODO: Move this to context
}

interface HeadCell {
  id: keyof Document;
  label: string;
}

const headCells: readonly HeadCell[] = [
  { id: 'title', label: 'Title' },
  { id: 'content', label: '' },
  { id: 'updated_at', label: 'Last Updated' },
];

const DocumentsList = (props: Props) => {
  const { documents, onSuccessfulDelete } = props;

  const navigate = useNavigate();

  const handleRowClick = (document: Document) => {
    navigate(`/document/${document.id}`);
  };

  const handleDeleteDocument = async (document: Document) => {
    await api.delete(`/documents/${document.id}/`);
    await onSuccessfulDelete();
  };

  if (documents.length === 0) {
    return null;
  }

  return (
    <Paper variant="outlined">
      <TableContainer>
        <Table sx={{ width: '100%' }}>
          {/* Head */}
          <TableHead>
            <TableRow>
              {/* Spacer for document icon column */}
              <TableCell padding="checkbox" />

              {headCells.map((headCell) => (
                <TableCell key={headCell.id} align="left">
                  {headCell.label}
                </TableCell>
              ))}

              {/* Spacer for delete button column */}
              <TableCell padding="checkbox" />
            </TableRow>
          </TableHead>

          {/* Body */}
          <TableBody>
            {documents.map((document) => (
              <DocumentRow
                key={document.id}
                document={document}
                onClick={handleRowClick}
                onDelete={handleDeleteDocument}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default DocumentsList;
