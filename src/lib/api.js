import { authStore } from "./authStore.js";
//console.log("authStore betöltve:", authStore);


export async function login(username, password) {
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

    return { token, isAdmin };
}


/*
export async function login(username, password) {
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
    const isAdmin = Boolean(data.isAdmin);
    //const isAdmin = data.isAdmin || false;

    if (!token) {
        throw new Error("Nem kaptunk JWT tokent!");
    }

    localStorage.setItem('token', token);  // Token mentése


    localStorage.setItem('isAdmin', JSON.stringify(isAdmin))
    //localStorage.setItem('isAdmin', isAdmin); 



    //Ha null vagy undefined, akkor a login válasz nem adja vissza az admin státuszt!
    console.log(localStorage.getItem('isAdmin'));
    return {token, isAdmin};
}
    */
/*Ez nem menti a tokent!
export async function login(username, password) {
    const response = await fetch('https://localhost:7032/api/Auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ FelhasznaloNev: username, Jelszo: password })
    });

    if (response.ok) {
        const data = await response.json();
        const tokenPayload = JSON.parse(atob(data.token.split('.')[1]));
        const isAdmin = tokenPayload.role === 'Admin';
        return { user: username, token: data.token, isAdmin };
    }
    return null;
}
    */
/*
export async function checkIn(userId, token) {
    return fetch(`http://localhost:5000/api/Attendance/check-in?dolgozoId=${userId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
    });
}


*/

/*
export async function checkOut(userId, token) {
    return fetch(`http://localhost:5000/api/Attendance/check-out?dolgozoId=${userId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

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



export async function deleteEmployee(employeeId, token) {
    return fetch(`http://localhost:5000/api/Dolgozo/${employeeId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
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

/*

export async function getAttendance(userId, token) {
    const response = await fetch(`http://localhost:5000/api/Attendance/user/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
}

*/

/*

export async function getMonthlyAttendance(userId, token) {
    const response = await fetch(`http://localhost:5000/api/HaviMunka/user/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
}

*/