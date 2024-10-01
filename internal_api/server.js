const express = require('express');
const { 
    getAllForAnEntity,
    getUserById,
    getAlbumById,
    getPhotoById,
    getAlbumByPhotoId,
    getUserByAlbumId} = require('./dynamoClient');

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
                address: JSON.parse(item.address)
            }
            users.push(user)
        })
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: `Failed to fetch user from DynamoDB :${error}` });
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
            address: JSON.parse(data.Item.address)
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: `Failed to fetch user from DynamoDB :${error}` });
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


// Endpoint to get a photo's album by a numeric ID
app.get('/photos/:id/albums', async (req, res) => {
    const id = parseInt(req.params.id, 10);  // Ensure the ID is numeric
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format, it should be a number.' });
    }

    try {
        const data = await getAlbumByPhotoId(id);
        if (!data || data.Item) {
            return res.status(404).json({ error: 'photo\'s album not found' });
        }
         
         const albums = await Promise.all(data.map(async albumRelation => {
            const albumId = albumRelation.PK.replace('album_', '');
            const result = await getAlbumById(albumId);  // Await the result
            if(result.Item){
                return {
                    id: result.Item.PK,
                    title: result.Item.title,
                    phone: result.Item.phone,
                    website: result.Item.website,
                    company: JSON.parse(result.Item.company)
                };
            }
            return null
            
        }));

        res.status(200).json(albums.filter(item => item !== null));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch photo\'s albums from DynamoDB' });
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
                company:JSON.parse(item.company)
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
            company: JSON.parse(data.Item.company)
        }

        res.status(200).json(album);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch album from DynamoDB' });
    }
});



// Endpoint to get a album's users by a numeric ID
app.get('/albums/:id/users', async (req, res) => {
    const id = parseInt(req.params.id, 10);  // Ensure the ID is numeric
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format, it should be a number.' });
    }

    try {
        const data = await getUserByAlbumId(id);
        if (!data || data.Item || data.length==0) {
            return res.status(404).json({ error: 'album\'s users not found' });
        }

        
         const users = await Promise.all(data.map(async userRelation => {
            const userId = userRelation.related_to.replace('user_', '');
            const result = await getUserById(userId);  // Await the result
            if(result.Item){
                return {
                    id: result.Item.PK,
                    name: result.Item.name,
                    username: result.Item.username,
                    email: result.Item.email,
                    address: JSON.parse(result.Item.address)
                };
            }
            return {}
            
        }));
        
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch album\'s users from DynamoDB' });
    }
});



app.listen(port, () => {
    console.log(`metaphoto_internal_api listening at http://localhost:${port}`);
});