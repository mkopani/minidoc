import { useNavigate } from 'react-router-dom';
import Button, { ButtonProps } from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';

const CreateDocumentButton = (props: ButtonProps) => {
  const { children = 'Create Document', ...other } = props;

  const navigate = useNavigate();

  const handleClick = () => navigate('/document');

  return (
    <Button
      variant="contained"
      color="primary"
      onClick={handleClick}
      startIcon={<AddIcon />}
      {...other}
    >
      {children}
    </Button>
  );
};

export default CreateDocumentButton;