import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import type { Document } from '@/models';
import DocumentRow from './DocumentRow';

interface Props {
  documents: Document[];
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
  const { documents } = props;

  const handleRowClick = (document: Document) => {
    // TODO: Implement navigation to document detail page
    console.log('clicked', document);
  };

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
            </TableRow>
          </TableHead>

          {/* Body */}
          <TableBody>
            {documents.map(document => (
              <DocumentRow key={document.id} document={document} onClick={handleRowClick} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default DocumentsList;
