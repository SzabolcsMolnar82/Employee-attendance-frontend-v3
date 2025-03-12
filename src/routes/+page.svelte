<script>
    import { authStore } from '../lib/authStore.js';
    import { login } from '../lib/api.js';
    import { onMount } from 'svelte';

    let username = '';
    let password = '';
    let errorMessage = '';

    async function handleLogin() {
        const result = await login(username, password);
        if (result) {
            authStore.set(result);

            if (result.isAdmin) {
                window.location.href = '/admin';
            } else {
                window.location.href = '/dashboard';
            }
        } else {
            errorMessage = 'Hibás felhasználónév vagy jelszó!';
        }
    }
</script>

<main>
    <h1>Dolgozói Beléptető Rendszer</h1>
    <form on:submit|preventDefault={handleLogin}>
        <input type="text" placeholder="Felhasználónév" bind:value={username} required />
        <input type="password" placeholder="Jelszó" bind:value={password} required />
        <button type="submit">Bejelentkezés</button>
    </form>
    {#if errorMessage}
        <p style="color: red;">{errorMessage}</p>
    {/if}
</main>
