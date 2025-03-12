import { writable } from 'svelte/store';

export const authStore = writable({
    user: null,
    token: null,
    isAdmin: false
});

export function logout() {
    authStore.set({ user: null, token: null, isAdmin: false });
}
