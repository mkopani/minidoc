// ********************************************************************
// Documents
export interface Document {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentsListPageResponse {
  documents: Document[];
}

// ********************************************************************
// Users
export interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
}
