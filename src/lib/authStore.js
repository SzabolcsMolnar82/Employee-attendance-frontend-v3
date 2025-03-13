import { writable } from 'svelte/store';


// Ellenőrizzük, hogy a kód a böngészőben fut-e (mert a SSR alatt nincs localStorage)
const isBrowser = typeof window !== "undefined";

// Ellenőrizzük, hogy van-e már elmentett token és felhasználónév
const storedUserId = isBrowser ? localStorage.getItem('dolgozoId') : null;
const storedNev = isBrowser ? localStorage.getItem('nev') : null; 
const storedUser = isBrowser ? localStorage.getItem('user') : null;
const storedToken = isBrowser ? localStorage.getItem('token') : null;
const storedIsAdmin = isBrowser ? localStorage.getItem('isAdmin') : null;

export const authStore = writable({
    userId: storedUserId ? parseInt(storedUserId) : null,
    nev: storedNev || null, 
    user: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken || null,
    isAdmin: storedIsAdmin ? JSON.parse(storedIsAdmin) : false
});

// Kijelentkezési függvény
export function logout() {
    if (!isBrowser) return;

    localStorage.removeItem('dolgozoId');
    localStorage.removeItem('nev'); 
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');

    authStore.set({ userId: null, nev: null, user: null, token: null, isAdmin: false });

    //Átirányít a főoldalra
    window.location.href = "/";
}


/*
import { writable } from 'svelte/store';

export const authStore = writable({
    user: null,
    token: null,
    isAdmin: false
});

export function logout() {
    authStore.set({ user: null, token: null, isAdmin: false });
}
*/
