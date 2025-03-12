<script>
    import { onMount } from 'svelte';
    import { getEmployees, deleteEmployee, addEmployee } from '../../lib/api.js';
    import { authStore } from '../../lib/authStore.js';

    let employees = [];
    let newEmployee = { Nev: '', FelhasznaloNev: '', Jelszo: '' };
    let token;  //Először a localStorage-ból olvassuk ki

    let name = "";
    let username = "";
    let password = "";
    let message = "";
    
    onMount(async () => {
        token = localStorage.getItem('token');

         
        authStore.subscribe(({ token: authToken }) => {
            if (authToken) {
                token = authToken;
        }
        });

        if (!token) {
            console.error("Token hiányzik! Visszairányítása        bejelentkezési oldalra.");
            window.location.href = "/";
            return;
        }
    
        console.log("Token az admin oldalon:", token); //Ellenőrzés        konzolon
        employees = await getEmployees(token);

        });


    /*
    onMount(async () => {
        authStore.subscribe(({ token: authToken }) => token = authToken);
        employees = await getEmployees(token);
    });
    */



    //Dolgozók hozzáadása ADMIN által.
    async function handleAddEmployee() {
        try {
            console.log("Hozzáadás előtt:", newEmployee); // Ellenőrzés

            await addEmployee(newEmployee, token);
            message = "Dolgozó sikeresen hozzáadva!";
            
            // Lista frissítése
            employees = await getEmployees(token);
        } catch (error) {
            message = `Hiba: ${error.message}`;
        }
    }

    /*
    //Elvileg ezzel frissül a Dolgozók lista, de nekem nem működik...
    async function handleAddEmployee() {
    try {
        // 🔥 API hívás - új dolgozó hozzáadása
        await addEmployee(newEmployee, token);
        message = "Dolgozó sikeresen hozzáadva!";

        // 🔥 Frissítjük az employees tömböt az API-ból, hogy Svelte érzékelje a változást
        employees = await getEmployees(token);

        // 🔥 Kényszerített reaktivitás
        employees = [...employees];  

        // 🔥 Input mezők ürítése
        newEmployee = { Nev: '', FelhasznaloNev: '', Jelszo: '' };
    } catch (error) {
        message = `Hiba: ${error.message}`;
    }
    */

    /*
    async function handleAddEmployee() {
        try {
            const token = localStorage.getItem('token'); // Az admin bejelentkezésnél elmentett token
            const employeeData = {
                Nev: name,
                FelhasznaloNev: username,
                Jelszo: password
            };

            const result = await addEmployee(employeeData, token);
            message = "Dolgozó sikeresen hozzáadva!";
        } catch (error) {
            message = `Hiba: ${error.message}`;
        }
    }
    */

    async function handleDeleteEmployee(id) {
        await deleteEmployee(id, token);
        employees = await getEmployees(token);
    }
</script>





<main>
    <h1>Admin Felület</h1>
    <h2>Dolgozók Listája</h2>
    <ul>
        {#each employees as emp}
            <li>{emp.nev} ({emp.felhasznaloNev}) <button on:click={() => handleDeleteEmployee(emp.id)}>Törlés</button></li>
        {/each}
    </ul>

    <h2>Új Dolgozó Hozzáadása</h2>
    <input type="text" placeholder="Név" bind:value={newEmployee.Nev} required />
    <input type="text" placeholder="Felhasználónév" bind:value={newEmployee.FelhasznaloNev} required />
    <input type="password" placeholder="Jelszó" bind:value={newEmployee.Jelszo} required />
    <button on:click={handleAddEmployee}>Hozzáadás</button>
</main>