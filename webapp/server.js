const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const port = 5000;
const externalApiHost = 'http://localhost:4000/externalapi';  // External API endpoint

// Middleware to serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Proxy endpoint to query photos with filters
app.get('/api/photos', async (req, res) => {
    try {
        // Add headers to disable caching
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',  // HTTP 1.1
            'Pragma': 'no-cache',  // HTTP 1.0
            'Expires': '0',  // Proxies
        });

        // Read the query parameters for title, albumTitle, and userEmail
        const { title, albumTitle, userEmail } = req.query;

        // Build the query string by including only non-empty parameters
        const queryParams = new URLSearchParams();

        if (title && title.trim()) {
            queryParams.append('title', title);
        }

        if (albumTitle && albumTitle.trim()) {
            queryParams.append('album.title', albumTitle);
        }

        if (userEmail && userEmail.trim()) {
            queryParams.append('album.user.email', userEmail);
        }

        // Make a request to the external API only with non-empty query params
        const photosResponse = await axios.get(`${externalApiHost}/photos?${queryParams.toString()}`);
        res.json(photosResponse.data);
    } catch (error) {
        console.error('Error fetching photos:', error);
        res.status(500).json({ error: 'Failed to fetch photos from external API' });
    }
});

// Serve the frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`App running at http://localhost:${port}`);
});