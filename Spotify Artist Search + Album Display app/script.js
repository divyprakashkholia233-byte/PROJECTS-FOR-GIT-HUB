const clientId = "YOUR_CLIENT_ID";
const clientSecret = "YOUR_CLIENT_SECRET";


// ========================================
// GET SPOTIFY ACCESS TOKEN
// ========================================

async function getToken() {

    const result = await fetch(
        "https://accounts.spotify.com/api/token",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization":
                    "Basic " + btoa(clientId + ":" + clientSecret)
            },

            body: "grant_type=client_credentials"
        }
    );

    if (!result.ok) {
        throw new Error("Unable to get Spotify access token.");
    }

    const data = await result.json();

    return data.access_token;
}


// ========================================
// SEARCH FOR ARTIST
// ========================================

async function searchArtist() {

    const artistInput =
        document.getElementById("artist");

    const artist = artistInput.value.trim();

    const status =
        document.getElementById("status");

    const albumsContainer =
        document.getElementById("albums");


    // Check empty input
    if (!artist) {

        status.textContent =
            "Please enter an artist name.";

        albumsContainer.innerHTML = "";

        return;
    }


    try {

        status.textContent =
            "Searching for artist...";

        albumsContainer.innerHTML = "";


        // Get Spotify token
        const token = await getToken();


        // Search artist
        const searchResponse = await fetch(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(artist)}&type=artist&limit=1`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        if (!searchResponse.ok) {
            throw new Error("Artist search failed.");
        }


        const artistData =
            await searchResponse.json();


        // Check if artist exists
        if (
            !artistData.artists ||
            artistData.artists.items.length === 0
        ) {

            status.textContent =
                "Artist not found.";

            return;
        }


        // Get artist ID
        const artistId =
            artistData.artists.items[0].id;

        const artistName =
            artistData.artists.items[0].name;


        status.textContent =
            `Loading albums by ${artistName}...`;


        // ========================================
        // GET ARTIST ALBUMS
        // ========================================

        const albumsResponse = await fetch(
            `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single&limit=50`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        if (!albumsResponse.ok) {
            throw new Error("Unable to load albums.");
        }


        const albumData =
            await albumsResponse.json();


        // Check albums
        if (
            !albumData.items ||
            albumData.items.length === 0
        ) {

            status.textContent =
                "No albums found for this artist.";

            return;
        }


        // Remove duplicate albums
        const uniqueAlbums = [];

        const albumNames = new Set();


        albumData.items.forEach(album => {

            if (!albumNames.has(album.name)) {

                albumNames.add(album.name);

                uniqueAlbums.push(album);
            }

        });


        status.textContent =
            `${uniqueAlbums.length} albums found.`;


        displayAlbums(uniqueAlbums);

    }

    catch (error) {

        console.error(error);

        status.textContent =
            "Something went wrong. Please check your Spotify credentials and try again.";

        albumsContainer.innerHTML = "";
    }
}


// ========================================
// DISPLAY ALBUMS
// ========================================

function displayAlbums(albums) {

    const albumsContainer =
        document.getElementById("albums");


    let output = "";


    albums.forEach(album => {

        const imageUrl =
            album.images && album.images.length > 0
                ? album.images[0].url
                : "https://via.placeholder.com/300x300?text=No+Image";


        const albumUrl =
            album.external_urls &&
            album.external_urls.spotify
                ? album.external_urls.spotify
                : "#";


        output += `

            <div class="album">

                <img
                    src="${imageUrl}"
                    alt="${escapeHTML(album.name)}"
                >

                <div class="album-info">

                    <h3>
                        ${escapeHTML(album.name)}
                    </h3>

                    <p>
                        Release date:
                        ${album.release_date}
                    </p>

                    <p>
                        Type:
                        ${album.album_type}
                    </p>

                    <a
                        href="${albumUrl}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Open in Spotify
                    </a>

                </div>

            </div>

        `;
    });


    albumsContainer.innerHTML = output;
}


// ========================================
// BASIC HTML ESCAPING
// ========================================

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// ========================================
// SEARCH BUTTON
// ========================================

document
    .getElementById("searchButton")
    .addEventListener("click", searchArtist);


// ========================================
// ENTER KEY SEARCH
// ========================================

document
    .getElementById("artist")
    .addEventListener("keydown", function(event) {

        if (event.key === "Enter") {

            searchArtist();

        }

    });
