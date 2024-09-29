const express = require('express');
const { getAllForAnEntity,getUserById, getAlbumById, getPhotoById } = require('./dynamoClient');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());


// Endpoint to get all users
app.get('/users', async (req, res) => {
    
    try {
        const data = await getAllForAnEntity('user');
        let users=[]
        data.forEach(item=>{
            let user = {
                id: item.PK,
                name: item.name,
                username: item.username,
                email: item.email,
                address: item.address
            }
            users.push(user)
        })
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user from DynamoDB' });
    }
});

// Endpoint to get users by a numeric Id
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


// Endpoint to get all photos
app.get('/photos', async (req, res) => {
    
    try {
        const data = await getAllForAnEntity('photo');
        let photos=[]
        data.forEach(item=>{
            let photo = {
                id: item.PK,
                title: item.title,
                url: item.url,
                thumbnailUrl: item.thumbnailUrl,
            }
            photos.push(photo)
        })
        res.status(200).json(photos);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch photos from DynamoDB' });
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



// Endpoint to get all albums
app.get('/albums', async (req, res) => {
    
    try {
        const data = await getAllForAnEntity('album');
        let albums=[]
        data.forEach(item=>{
            let album = {
                id: item.PK,
                title: item.title,
                phone: item.phone,
                website: item.website,
                company:item.company
            }
            albums.push(album)
        })
        res.status(200).json(albums);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch albums from DynamoDB' });
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