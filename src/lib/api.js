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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Bejelentkezési hiba');
    }

    const data = await response.json();
    const token = data.token || data.Token;
    const dolgozoId = data.dolgozoId;
    const nev = data.nev;
    const isAdmin = Boolean(data.isAdmin);  //Boolean formátumba konvertálás

    if (!token) {
        throw new Error("Nem kaptunk JWT tokent!");
    }

    if (typeof window !== "undefined") {
        localStorage.setItem('dolgozoId', dolgozoId.toString()); //a toString lehet hogy nem kell majd!
        localStorage.setItem('user', JSON.stringify(username));
        localStorage.setItem('nev', nev);
        localStorage.setItem('token', token);
        localStorage.setItem('isAdmin', JSON.stringify(isAdmin));
    }
   
    authStore.set({ user: username, token, isAdmin });
    console.log("✅ Bejelentkezés sikeres! User:", username, dolgozoId, nev, isAdmin);



    // Adminok az admin felületre mennek, dolgozók a dashboardra
    if (isAdmin) {
        window.location.href = "/admin";
    } else {
        window.location.href = "/dashboard";
    
    }
    return { token, isAdmin };
}

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





// Check-in függvény (belépés rögzítése)
export async function checkIn(dolgozoId, token) {
    console.log("🔹 Check-in próbálkozás:", dolgozoId);

    const response = await fetch(`https://localhost:7032/api/Attendance/check-in?dolgozoId=${dolgozoId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();
    console.log("✅ Check-in válasz:", data);

    if (!response.ok) {
        throw new Error(`❌ Hiba a check-in során: ${data.Message}`);
    }

    return data;
}

export async function checkOut(dolgozoId, token) {
    console.log("🔹 Check-out próbálkozás:", dolgozoId);

    const response = await fetch(`https://localhost:7032/api/Attendance/check-out?dolgozoId=${dolgozoId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();
    console.log("✅ Check-out válasz:", data);

    if (!response.ok) {
        throw new Error(`❌ Hiba a check-out során: ${data.Message}`);
    }

    return data;
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
