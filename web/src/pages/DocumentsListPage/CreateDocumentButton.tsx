import NoteAddIcon from '@mui/icons-material/NoteAdd';
import Button, { ButtonProps } from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';

const CreateDocumentButton = (props: ButtonProps) => {
  const { children = 'Create Document', ...other } = props;

  const navigate = useNavigate();

  const handleClick = () => navigate('/document');

  return (
    <Button
      variant="contained"
      color="primary"
      onClick={handleClick}
      startIcon={<NoteAddIcon />}
      {...other}
    >
      {children}
    </Button>
  );
};

export default CreateDocumentButton;
