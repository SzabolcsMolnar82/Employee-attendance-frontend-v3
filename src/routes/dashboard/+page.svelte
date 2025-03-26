<script>
    import { onMount } from 'svelte';
    import { checkIn, checkOut, getAttendance, getMonthlyAttendance } from '../../lib/api.js';
    import { authStore, logout } from '../../lib/authStore.js';

    let userId = null;
    let nev = null;
    let token = null;
    let attendance = [];
    let monthlyAttendance = [];
    let message = "";
    let isWorking = false;
    let elapsedSeconds = 0;
    let interval;




    $: {
        const { userId: id, token: t, nev: n } = $authStore;
        if (id && t) {
            userId = id;
            token = t;
            nev = n;
            loadAttendanceData(); // <- akkor hívódik meg, amikor már van token és userId
        }
    }

    async function loadAttendanceData() {
        try {
            attendance = (await getAttendance(userId, token)) || [];
            monthlyAttendance = (await getMonthlyAttendance(userId, token)) || { days: [], totalDaysWorked: 0 };
            console.log("📆 Havi jelenlét betöltve:", monthlyAttendance);
        } catch (error) {
            console.error("❌ Hiba az adatok betöltésekor:", error);
            message = "Hiba történt az adatok lekérésekor!";
        }
    }

    async function handleCheckIn() {
        if (!userId || isNaN(userId)) {
            message = "Hiba: Dolgozó azonosító nem található vagy érvénytelen!";
            return;
        }

        try {
            message = await checkIn(userId, token);
            isWorking = true;
            elapsedSeconds = 0;
            interval = setInterval(() => elapsedSeconds++, 1000);
            await loadAttendanceData();
        } catch (error) {
            message = error.message;
        }
    }

    async function handleCheckOut() {
        if (!userId || isNaN(userId)) {
            message = "Hiba: Dolgozó azonosító nem található vagy érvénytelen!";
            return;
        }

        if (!Array.isArray(attendance)) {
            message = "Hiba: A napi jelenlét adatok nincsenek megfelelően betöltve!";
            return;
        }

        const activeShift = attendance.find(entry => entry && !entry.KilepesIdo);
        
        if (!activeShift) {
            message = "Hiba: Nincs aktív műszak!";
            return;
        }

        try {
            const response = await checkOut(userId, token);
            message = response?.Message || "Sikeres műszak zárás!";
            isWorking = false;
            clearInterval(interval);
            await loadAttendanceData();
        } catch (error) {
            message = error.message;
        }
    }


</script>

<main>
    <h1>Dolgozói Dashboard</h1>
    <h1>Üdvözöljük, {nev}!</h1>
    <p>{message}</p>

    <h2>Napi jelenlét</h2>
    <table>
        <thead>
            <tr>
                <th>Belépés ideje</th>
                <th>Kilépés ideje</th>
            </tr>
        </thead>
        <tbody>
            {#each attendance as entry}
                <tr>
                    <td>{new Date(entry.belepesIdo).toLocaleString()}</td>
                    <td>{entry.kilepesIdo ? new Date(entry.kilepesIdo).toLocaleString() : 'Még dolgozik'}</td>
                </tr>
            {/each}
        </tbody>
    </table>

    <button on:click={handleCheckIn} disabled={isWorking}>Elkezdem a munkát</button>
    <button on:click={handleCheckOut} disabled={!isWorking}>Befejezem a munkát</button>

    <p>Munkaidő: {Math.floor(elapsedSeconds / 3600)}:{Math.floor((elapsedSeconds % 3600) / 60)}:{elapsedSeconds % 60}</p>
    
    <h2>Havi jelenlét</h2>
    <ul>
        {#each monthlyAttendance.days as entry}
            <li>{entry.datum} - {Math.floor(entry.ledolgozottIdoPerc / 60)} óra {entry.ledolgozottIdoPerc % 60} perc</li>
           
        {/each}
    </ul>
    <p>Összes ledolgozott nap: {monthlyAttendance.totalDaysWorked}</p>

    <button on:click={logout} style="margin-top: 20px; background-color: grey; color: white;">Kijelentkezés</button>
</main>
