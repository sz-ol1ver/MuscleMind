export async function registration(url, value){
    try {
        const data = await fetch(url, {
            method:'POST',
            headers: {'Content-type':'application/json'},
            body: JSON.stringify(value)
        })
        if(!data.ok){
            throw new Error(data.status + " "+ data.statusText);
        }
        return await data.json();
    } catch (error) {
        throw new Error(error.message);
    }
}