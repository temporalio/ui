import type { WorkflowExecutionInfo } from '$types/temporal/api/workflow/v1/message';
import type { ListWorkflowExecutionsResponse } from '$types/temporal/api/workflowservice/v1/request_response';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: { workflows: WorkflowExecutionInfo[] } = { workflows: [] };

const fetchWorkflows = createAsyncThunk(
  'workflows/fetchWorkflows',
  async () => {
    const { executions }: ListWorkflowExecutionsResponse = await fetch(
      `http://localhost:8080/api/v1/namespaces/default/workflows/open`,
    ).then((response) => response.json());

    return executions;
  },
);

export const workflows = createSlice({
  name: 'workflows',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchWorkflows.fulfilled, (state, action) => {
      state.workflows = action.payload;
    });
  },
});

export const actions = { ...workflows.actions, fetchWorkflows };

export default workflows.reducer;
