// ********************************************************************
// Documents
export interface Document {
  id: string;
  title: string;
  readable_content: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentsListPageResponse {
  documents: Document[];
}
