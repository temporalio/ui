import type { ApplicationDispatch } from './../state/index';
import { derived } from 'svelte/store';
import { state, dispatch, ApplicationState } from '$lib/state';
import {
  CaseReducerActions,
  bindActionCreators,
  AnyAction,
} from '@reduxjs/toolkit';

export type CreateStoreFromStateType = (
  state: ApplicationState,
  actions: CaseReducerActions<AnyAction>,
) => any;

export const createStore: CreateStoreFromStateType = (selector, actions) => {
  const { subscribe } = derived(state, selector);

  return {
    subscribe,
    ...bindActionCreators<CaseReducerActions<AnyAction>, ApplicationDispatch>(
      actions,
      dispatch,
    ),
  };
};
