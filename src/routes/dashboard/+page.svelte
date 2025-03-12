<script>
    import { onMount } from 'svelte';
    import { checkIn, checkOut, getAttendance, getMonthlyAttendance } from '../../lib/api.js';
    import { authStore } from '../../lib/authStore.js';

    let userId, token;
    let attendance = [];
    let monthlyAttendance = [];

    onMount(async () => {
        authStore.subscribe(({ user, token: authToken }) => {
            userId = user;
            token = authToken;
        });
        attendance = await getAttendance(userId, token);
        monthlyAttendance = await getMonthlyAttendance(userId, token);
    });

    async function handleCheckIn() {
        await checkIn(userId, token);
        attendance = await getAttendance(userId, token);
    }

    async function handleCheckOut() {
        await checkOut(userId, token);
        attendance = await getAttendance(userId, token);
    }

</script>

<main>
    <h1>Dolgozói Dashboard</h1>
    <h2>Napi jelenlét</h2>
    <ul>
        {#each attendance as entry}
            <li>{entry.BelepesIdo} - {entry.KilepesIdo ? entry.KilepesIdo : 'Még dolgozik'}</li>
        {/each}
    </ul>

    <button on:click={handleCheckIn}>Elkezdem a munkát</button>
    <button on:click={handleCheckOut}>Befejezem a munkát </button>

    <h2>Havi jelenlét</h2>
    <ul>
        {#each monthlyAttendance as entry}
            <li>{entry.Datum}: {entry.LedolgozottIdoPerc} perc</li>
        {/each}
    </ul>
</main>