export async function registration(url, value){
    try {
        const data = await fetch(url, {
            method:'POST',
            headers: {'Content-type':'application/json'},
            body: JSON.stringify(value)
        })
        if(!data.ok){
            const res = await data.json();
            const err = new Error(res.message);
            switch(res.id){
                case 1:
                    err.obj = null;
                    break;
                case 2: 
                    err.obj = res.error[0];
                    break;
                case 3: 
                    err.obj = res.error[0];
                    break;
            }
            err.id = res.id;
            throw err;
        }
        return await data.json();
    } catch (error) {
        throw error;
    }
}

export async function login(url, value) {
    try {
        const data = await fetch(url, {
            method:'POST',
            headers: {'Content-type':'application/json'},
            body: JSON.stringify(value)
        })
        if(!data.ok){
            const res = await data.json();
            const err = new Error(res.message)
            switch(res.id){
                case 1: 
                    err.error = null;
                    break;
                case 2:
                    err.error = res.error[0];
                    break;
                case 3:
                    err.error = null;
                    break;
            }
            err.id = res.id;
            throw err;
        }
        return await data.json();
    } catch (error) {
        throw error;
    }
}

export async function userAns(url, value) {
    try {
        const data = await fetch(url, {
            method: 'POST',
            headers: {'Content-type':'application/json'},
            body: JSON.stringify(value)
        })
        if(!data.ok){
            const res = await data.json();
            const err = new Error(res.message);
            throw err;
        }
        return await data.json();
    } catch (error) {
        throw error;
    }
}