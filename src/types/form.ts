
export interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

export interface FormTemplateData {
  title?: string;
  description?: string;
  fields?: FormField[];
}

export interface FormBranding {
  primaryColor?: string;
  logo?: string | null;
}

export interface FormData {
  title: string;
  description?: string;
  fields: FormField[];
  branding: FormBranding;
}

export const FIELD_TYPES = [
  { value: 'text', label: 'Text Input' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'select', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' }
] as const;
