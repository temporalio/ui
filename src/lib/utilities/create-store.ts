import { derived, Readable } from 'svelte/store';
import {
  ActionCreator,
  ActionCreatorsMapObject,
  AnyAction,
  bindActionCreators,
} from '@reduxjs/toolkit';
import { state, dispatch, ApplicationState } from '$lib/state';

type Selector<T> = (state: ApplicationState) => T;

interface Store<T, A> extends Readable<T> {
  actions: ActionCreatorsMapObject<A>;
}

export const createStore = <T, A>(
  selector: Selector<T>,
  actions: ActionCreatorsMapObject<A>,
  initialAction?: () => void,
): Store<T, A> => {
  const boundActions: ActionCreatorsMapObject<A> = bindActionCreators(
    actions,
    dispatch,
  );

  if (initialAction) {
    dispatch((initialAction as ActionCreator<AnyAction>)());
  }

  return {
    ...derived(state, selector),
    actions: { ...boundActions },
  };
};
