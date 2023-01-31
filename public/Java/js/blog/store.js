import { writable } from 'svelte/store';

export const accessToken = writable('0');
export const refreshToken = writable('0');
export const id = writable('0');