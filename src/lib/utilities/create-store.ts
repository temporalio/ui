import { derived } from 'svelte/store';
import { AnyAction, bindActionCreators } from '@reduxjs/toolkit';
import {
  state,
  dispatch,
  ApplicationState,
  ApplicationDispatch,
} from '$lib/state';

type ActionCreators = { [key: string]: AnyAction };

export type CreateStoreFromStateType<T = any> = (
  selector: (state: ApplicationState) => T,
  actions: ActionCreators,
) => T;

export const createStore: CreateStoreFromStateType = (selector, actions) => {
  const { subscribe } = derived(state, selector);

  return {
    subscribe,
    ...bindActionCreators<any, ApplicationDispatch>(actions, dispatch),
  };
};
