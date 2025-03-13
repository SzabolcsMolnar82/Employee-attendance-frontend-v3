import { authStore } from "./authStore.js";
//console.log("authStore betöltve:", authStore);


export async function login(username, password) {
    
    //console.log("Bejelentkezési próbálkozás:", username, password);

    const response = await fetch('https://localhost:7032/api/Auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ FelhasznaloNev: username, Jelszo: password })
    });

    if (!response.ok) {
        throw new Error('Bejelentkezési hiba');
    }

    const data = await response.json();
    const token = data.token || data.Token;
    const isAdmin = Boolean(data.isAdmin);  //Boolean formátumba konvertálás

    if (!token) {
        throw new Error("Nem kaptunk JWT tokent!");
    }

    //Token és isAdmin mentése a localStorage-be
    localStorage.setItem('token', token);
    localStorage.setItem('isAdmin', JSON.stringify(isAdmin)); 

    //Az authStore frissítése
    authStore.set({ user: username, token, isAdmin });

    //console.log("Bejelentkezési adatok:", { token, isAdmin });

    // Adminok az admin felületre mennek, dolgozók a dashboardra
    if (isAdmin) {
        window.location.href = "/admin";
    } else {
        window.location.href = "/dashboard";
    
    }
    return { token, isAdmin };
}

/*
    //Ha null vagy undefined, akkor a login válasz nem adja vissza az admin státuszt!
    console.log(localStorage.getItem('isAdmin'));
    return {token, isAdmin};
*/

export async function getEmployees(token, id = null) {

    //console.log(localStorage.getItem('token'));
    // Ha null vagy undefined az értéke, akkor a bejelentkezés után nincs elmentve a token!


    let url = 'https://localhost:7032/api/Admin/get-employees';
    if (id !== null) {
        url += `?id=${id}`;
    }


    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`, 
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error("Nem sikerült lekérni a dolgozókat!");
    }

    return await response.json();
}


//Felhasználók törlése admin oldalon, adminokat is, lehet törölni!
export async function deleteEmployee(employeeId, token) {
    try {
        const response = await fetch(`https://localhost:7032/api/Admin/delete-employee/${employeeId}`, {
            method: 'DELETE',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' // Biztosítsd, hogy a tartalomtípus meg van adva
            }
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`Hiba: ${errorMessage}`);
        }

        return response; // Visszaadjuk a választ, hogy a frontend tudja, hogy sikerült a törlés
    } catch (error) {
        console.error("Hiba a dolgozó törlésekor:", error.message);
        throw error;
    }
}


//Dolgozók hozzáadása ADMIN által.
export async function addEmployee(employeeData, token) {
    console.log("Küldött adatok:", employeeData); //Ellenőrzés
    const response = await fetch('https://localhost:7032/api/Admin/add-employee', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(employeeData)
    });

    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Hiba történt a dolgozó hozzáadása közben: ${errorMessage}`);
    }

    return await response.json();
}





export async function checkIn(params) {
    
}

export async function checkOut(params) {
    
}

export async function getAttendance(params) {
    
}

export async function getMonthlyAttendance(params) {
    
}


//Ez a függvény törli a localStorage-ból a JWT tokent és az admin státuszt, majd visszairányítja a főoldalra.
export function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    authStore.set({ user: null, token: null, isAdmin: false });
    window.location.href = "/";
}
