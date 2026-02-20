export async function registration(url, value){
    try {
        const data = await fetch(url, {
            method:'POST',
            headers: {'Content-type':'application/json'},
            body: JSON.stringify(value)
        })
        if(!data.ok){
            const res = await data.json();
            throw new Error(res.message + " " + res.error);
        }
        return await data.json();
    } catch (error) {
        throw new Error(error.message);
    }
}