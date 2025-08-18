export interface StartWorkflowFormData {
  id?: string;
  name?: string;
  type?: string;
  taskQueue?: string;
}

export interface StartWorkflowAdapter {
  fetchAttributes(): Promise<StartWorkflowFormData>;
  onSuccess?: (attributes: StartWorkflowFormData) => Promise<void>;
  onCancel?: () => void;
}
