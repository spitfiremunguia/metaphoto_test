const express = require('express');
const { getUserById, getAlbumById, getPhotoById } = require('./dynamoClient');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());



// Endpoint to get a user by numeric ID
app.get('/users/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);  // Ensure the ID is numeric
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format, it should be a number.' });
    }

    try {
        const data = await getUserById(id);
        if (!data.Item) {
            return res.status(404).json({ error: 'User not found' });
        }
        let user = {
            id: id,
            name: data.Item.name,
            username: data.Item.username,
            email: data.Item.email,
            address: data.Item.address
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user from DynamoDB' });
    }
});

// Endpoint to get a photo by numeric ID
app.get('/photos/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);  // Ensure the ID is numeric
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format, it should be a number.' });
    }

    try {
        const data = await getPhotoById(id);
        if (!data.Item) {
            return res.status(404).json({ error: 'photo not found' });
        }

        let photo = {
            id: id,
            title: data.Item.title,
            url: data.Item.url,
            thumbnailUrl: data.Item.thumbnailUrl,
        }

        res.status(200).json(photo);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch photo from DynamoDB' });
    }
});


// Endpoint to get a photo by numeric ID
app.get('/albums/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);  // Ensure the ID is numeric
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format, it should be a number.' });
    }

    try {
        const data = await getAlbumById(id);
        if (!data.Item) {
            return res.status(404).json({ error: 'album not found' });
        }
        let album = {
            id: id,
            title: data.Item.title,
            phone: data.Item.phone,
            website: data.Item.website,
            company: data.Item.company
        }

        res.status(200).json(album);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch album from DynamoDB' });
    }
});









app.listen(port, () => {
    console.log(`metaphoto_internal_api listening at http://localhost:${port}`);
});