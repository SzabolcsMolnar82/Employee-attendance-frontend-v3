<script>
    import { onMount } from 'svelte';
    import { getEmployees, deleteEmployee, addEmployee, logout } from '../../lib/api.js';
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
            console.error("Token hiányzik! Visszairányítás a bejelentkezési oldalra.");
            window.location.href = "/";
            return;
        }

        console.log("Token az admin oldalon:", token); //Ellenőrzés konzolon
        await loadEmployees();

        });


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
        await loadEmployees();
    }

    //Dolgozók törlése, ADMIN
    async function handleDeleteEmployee(id) {
    try {
        await deleteEmployee(id, token);
        employees = await getEmployees(token); // Frissítjük a dolgozók listáját
    } catch (error) {
        console.error("Törlési hiba:", error);
    }
    await loadEmployees();
}



async function loadEmployees() {
    const response = await getEmployees(token);
    employees = response.sort((a, b) =>
        a.nev.localeCompare(b.nev, 'hu', { sensitivity: 'base' })
    );
}

function handleLogout() {
        logout();
    }

</script>



<main>
    <h1>Admin Felület</h1>

    <h2>Új Dolgozó Hozzáadása</h2>
    <input type="text" placeholder="Név" bind:value={newEmployee.Nev} required />
    <input type="text" placeholder="Felhasználónév" bind:value={newEmployee.FelhasznaloNev} required />
    <input type="password" placeholder="Jelszó" bind:value={newEmployee.Jelszo} required />
    <button on:click={handleAddEmployee}>Hozzáadás</button>

    <button on:click={handleLogout}>Kijelentkezés</button>
    

    <h2>Dolgozók Listája</h2>
    <ul>
        {#each employees as emp}
            <li>{emp.nev} ({emp.felhasznaloNev}) <button on:click={() => handleDeleteEmployee(emp.id)}>Törlés</button></li>
        {/each}
    </ul>


</main>