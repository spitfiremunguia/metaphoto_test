const express = require('express');
const axios = require('axios');

const app = express();
const port = 4000;
const internalApihost = "http://localhost:3000/"

// Middleware to parse JSON
app.use(express.json());

//get photos enriched data by filters
app.get('/externalapi/photos', async (req, res) => {
  try {

    const title = req.query.title;
    const albumTitle = req.query['album.title'];
    const userEmail = req.query['album.user.email'];
    const offset = req.query['offset'] || 0;
    const limit = req.query['offset'] || 25;

    // Get all photos details
    const photosResponse = await axios.get(`${internalApihost}photos`);
    let photos = photosResponse.data;

    // Filter photos by title if the title query parameter is provided
    if (title) {
      photos = photos.filter(photo => photo.title.toLowerCase().includes(title.toLowerCase()));
    }

    let photoAlbums = await Promise.all(photos.map(async photo => {
      const id = photo.id.replace('photo_', '');
      // Get photos albums
      const photoAlbumsResponse = await axios.get(`${internalApihost}photos/${id}/albums`);
      let albums = photoAlbumsResponse.data;

      // Filter albums by title if the album.title query parameter is provided
      if (albumTitle) {
        albums = albums.filter(album => album.title.toLowerCase().includes(albumTitle.toLowerCase()));
      }

      let albumUsers = await Promise.all(
        albums.map(async album => {
          const albumId = album.id.replace('album_', '');
          const usersResponse = await axios.get(`${internalApihost}albums/${albumId}/users`);
          let users = usersResponse.data;

          // Filter albums by title if the album.title query parameter is provided
          if (userEmail) {
            users = users.filter(user => user.email===userEmail);
          }

          if (users && users.length > 0) {
            return {
              id: album.id.replace('album_', ''),
              title: album.title,
              users: users,  // Assuming users is an array
              phone: album.phone,
              website: album.website,
              company: album.company,
            };
          }
          return {};
        })
      );

      return {
        id: photo.id,
        title: photo.title,
        url: photo.url,
        thumbnailUrl: photo.thumbnailUrl,
        albums: albumUsers
      }

    }));
    photoAlbums = photoAlbums.filter(item=>item.albums.length>0)
    // Return the combined photo and album users
    res.status(200).json(photoAlbums);
  } catch (error) {
    console.error('Error making request to external API:', error.message);
    res.status(500).json({ error: 'Error making request to external API' });
  }
});



// return a photo's enriched data using the photo id
app.get('/externalapi/photos/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);  // Ensure the ID is numeric
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID format, it should be a number.' });
    }

    // Get photo details
    const photoResponse = await axios.get(`${internalApihost}photos/${id}`);
    const photo = photoResponse.data;

    // Get photo's albums
    const photoAlbumsResponse = await axios.get(`${internalApihost}photos/${id}/albums`);
    const albums = photoAlbumsResponse.data;

    // Use .map() to return an array of promises for each album
    const albumUsers = await Promise.all(
      albums.map(async album => {
        const albumId = album.id.replace('album_', '');
        const usersResponse = await axios.get(`${internalApihost}albums/${albumId}/users`);
        const users = usersResponse.data;

        if (users && users.length > 0) {
          return {
            id: album.id.replace('album_', ''),
            title: album.title,
            users: users,  // Assuming users is an array
            phone: album.phone,
            website: album.website,
            company: album.company,
          };
        }

        return {};
      })
    );

    const result = {
      id: photo.id,
      title: photo.title,
      url: photo.url,
      thumbnailUrl: photo.thumbnailUrl,
      albums: albumUsers
    }

    // Return the combined photo and album users
    res.status(200).json(result);
  } catch (error) {
    console.error('Error making request to external API:', error.message);
    res.status(500).json({ error: 'Error making request to external API' });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`API is running on http://localhost:${port}`);
});