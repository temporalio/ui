import { actions } from '$lib/state/features/counter';
import { createStore } from '$lib/utilities/create-store';

export const counter = createStore((state) => state.counter.value, actions);
