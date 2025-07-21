
export interface QuestionTypeInterface {
  id?: number;
  createdById?: number;
  created: string;
  modifiedById?: number;
  modified?: string;
  errors?: {
    general?: string;
    name?: string;
    usageDescription?: string;
    json?: string;
  };
  name: string;
  usageDescription: string;
  json: string;
  isDefault: boolean;
}
