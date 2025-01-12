import { useNavigate } from 'react-router-dom';
import Button, { ButtonProps } from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';

type Props = Omit<ButtonProps, 'children'>;

const CreateDocumentButton = (props: Props) => {
  const navigate = useNavigate();

  const handleClick = () => navigate('/document');

  return (
    <Button
      variant="contained"
      color="primary"
      onClick={handleClick}
      startIcon={<AddIcon />}
      {...props}
    >
      Create Document
    </Button>
  );
};

export default CreateDocumentButton;