<script>
    import { onMount } from 'svelte';
    import { checkIn, checkOut, getAttendance, getMonthlyAttendance } from '../../lib/api.js';
    import { authStore } from '../../lib/authStore.js';

    let userId = null;
    let token = null;
    let attendance = [];
    let monthlyAttendance = [];
    let message = "";

    onMount(async () => {

        if (typeof window === "undefined") return; // Ha SSR módban fut, ne csináljon semmit
        authStore.subscribe(({ user, token: authToken }) => {
            userId = user;
            token = authToken;
            console.log("🔹 Beállított userId:", userId);
        });

        if (!userId) {
            console.error("❌ Hiba: userId nem található az authStore-ban!");
            message = "Hiba: Nem sikerült azonosítani a dolgozót!";
            return;
        }

        try {
            console.log("🔹 Napi jelenlét lekérése...");
            attendance = await getAttendance(userId, token);
            console.log("✅ Napi jelenlét adatok:", attendance);

            console.log("🔹 Havi jelenlét lekérése...");
            monthlyAttendance = await getMonthlyAttendance(userId, token);
            console.log("✅ Havi jelenlét adatok:", monthlyAttendance);
        } catch (error) {
            console.error("❌ Hiba az adatok lekérésekor:", error.message);
            message = "Hiba történt az adatok betöltésekor!";
        }
    });

    async function handleCheckIn() {
        if (!userId) {
            console.error("❌ Hiba: userId nem elérhető a check-in során!");
            message = "Hiba: Dolgozó azonosító nem található!";
            return;
        }

        console.log("🔹 Check-in próbálkozás userId:", userId);
        try {
            message = await checkIn(userId, token);
            attendance = await getAttendance(userId, token);
            console.log("✅ Check-in sikeres:", message);
        } catch (error) {
            console.error("❌ Hiba a check-in során:", error.message);
            message = error.message;
        }
    }

    async function handleCheckOut() {
        if (!userId) {
            console.error("❌ Hiba: userId nem elérhető a check-out során!");
            message = "Hiba: Dolgozó azonosító nem található!";
            return;
        }

        console.log("🔹 Check-out próbálkozás userId:", userId);
        try {
            message = await checkOut(userId, token);
            attendance = await getAttendance(userId, token);
            console.log("✅ Check-out sikeres:", message);
        } catch (error) {
            console.error("❌ Hiba a check-out során:", error.message);
            message = error.message;
        }
    }
</script>

<main>
    <h1>Dolgozói Dashboard</h1>
    <p>{message}</p>

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