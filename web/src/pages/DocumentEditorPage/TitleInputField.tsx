import TextField, { TextFieldProps } from '@mui/material/TextField';

type Props = Required<Pick<TextFieldProps, 'onChange' | 'onBlur'>> & {
  value: string;
};

const TitleInputField = (props: Props) => {
  const { value, onChange, onBlur } = props;

  // When user hits Enter or Return, blur the input field
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      (event.target as HTMLInputElement).blur();
    }
  };

  return (
    <TextField
      autoFocus
      margin="dense"
      size="small"
      variant="outlined"
      label=""
      placeholder="Enter document title"
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      onKeyDown={handleKeyDown}
      sx={{
        fontWeight: 500,
        minWidth: '200px',
        width: `${Math.min(40, Math.max(value.length, 10))}ch`, // Limit width to 80 characters
        transition: 'width 0.2s ease-in-out',
      }}
    />
  );
};

export default TitleInputField;
