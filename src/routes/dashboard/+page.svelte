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

    onMount(async () => {
        if (typeof window === "undefined") return;
        authStore.subscribe(({ userId: storedUserId, nev: storedNev, token: authToken }) => {
            userId = storedUserId ? parseInt(storedUserId) : null; // Átalakítás számmá
            nev = storedNev;
            token = authToken;
            console.log("🔹 Beállított userId:", userId);
        });

        if (!userId) {
            console.error("❌ Hiba: userId nem található az authStore-ban!");
            message = "Hiba: Nem sikerült azonosítani a dolgozót!";
            return;
        }

        try {
            attendance = (await getAttendance(userId, token)) || [];
            monthlyAttendance = (await getMonthlyAttendance(userId, token)) || { days: [], totalDaysWorked: 0 };
            
        } catch (error) {
            console.error("❌ Hiba az adatok lekérésekor:", error.message);
            message = "Hiba történt az adatok betöltésekor!";
        }
    });

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
            attendance = (await getAttendance(userId, token)) || [];
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

        console.log("🔍 Jelenlegi attendance tömb:", attendance);

        if (attendance.length === 0) {
            console.log("🔄 Attendance üres, újratöltés...");
            attendance = (await getAttendance(userId, token)) || [];
            console.log("✅ Újratöltött attendance:", attendance);
        }

        const activeShift = attendance.find(entry => entry && !entry.KilepesIdo);
        
        if (!activeShift) {
            message = "Hiba: Nincs aktív műszak!";
            console.warn("⚠️ Nincs aktív műszak az attendance tömbben!");
            return;
        }

        try {
            console.log("🔹 Check-out próbálkozás:", userId);
            const response = await checkOut(userId, token);
            console.log("✅ Check-out API válasz:", response);

            message = response?.Message || "Sikeres kijelentkezés!";
            isWorking = false;
            clearInterval(interval);

            attendance = (await getAttendance(userId, token)) || [];
            monthlyAttendance = (await getMonthlyAttendance(userId, token)) || [];
            console.log("🔄 Frissített jelenlét adatok:", attendance);

        } catch (error) {
            console.error("❌ Hiba a check-out során:", error);
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
        {#each monthlyAttendance as entry}
            <li>{entry.Datum}: {entry.ledolgozottIdoPerc} perc</li>
        {/each}
    </ul>

    <button on:click={logout} style="margin-top: 20px; background-color: grey; color: white;">Kijelentkezés</button>
</main>
