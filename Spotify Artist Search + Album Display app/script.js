const clientId = "YOUR_CLIENT_ID";
const clientSecret = "YOUR_CLIENT_SECRET";
async function getToken() {
    const result = await fetch(
        'https://accounts.spotify.com/api/token', {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic' + btoa(clientId + ':' + clientSecret)
            },
            body: 'grant_type=client_credentials'
        });
    const data = await result.json();
    return data.access_token;
}
async function SearchArtist() {
    const Artist = document.getElementById("artist").value;
    const token = await getToken();
    const Search = await fetch(
        `https://api.spotify.com/v1/search?q${artist}&type=artist`, {
            headers: {
                Authorization: `Bearer${token}`
            }
        });
    const ArtistData = await search.json();
    const id = ArtistData.Artists.items[0].id;
    const Albums = await fetch(
        `https://api.spotify.com/v1/${id}/albums`, {
            headers: {
                Authorization: `Bearer${token}`
            }
        });
    const AlbumData = await Albums.json();
    displayAlbums(AlbumData.items);
}

function displayAlbums(Albums) {
    let output = "";
    Albums.forEach(album => {
        output += `
        <div class="album">
        <img src=${Albums.images[0].url}">
        <h3>${album.name}</h3>
        <p>${album.release_date}</p>
        </div>
        `
    });
    document.getElementById("albums").innerHTML = output;
}