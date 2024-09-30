const express = require('express');
const axios = require('axios');
const path = require('path');
const openai = require('./openapiClient');

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
        const photosData = photosResponse.data;

        // Now let's assume the photo can have multiple albums, and each album can have multiple users
        const enrichedPhotos = await Promise.all(photosData.map(async (photo) => {
            // Check if the photo has multiple albums
            if (photo.albums && Array.isArray(photo.albums)) {
                // Iterate over each album in the photo
                const albumsWithRecommendations = await Promise.all(photo.albums.map(async (album) => {
                    // Check if the album has multiple users
                    if (album.users && Array.isArray(album.users)) {
                        // Iterate over each user in the album
                        const usersWithRecommendations = await Promise.all(album.users.map(async (user) => {
                            if (user.address && album.title) {
                                try {
                                    // Fetch activity recommendations based on the album title and user address
                                    const activityRecommendations = await getActivityRecommendations(album.title, user.address);

                                    // Return the user with the recommendations
                                    return {
                                        ...user,
                                        activityRecommendations,  // Include recommendations in the user metadata
                                    };
                                } catch (error) {
                                    console.warn(`Failed to fetch recommendations for user ${user.name}:`, error);
                                    return user;  // If fetching recommendations fails, return the user without recommendations
                                }
                            }
                            return user;  // If no address or title, return the user as is
                        }));

                        // Return the album with users that now include activity recommendations
                        return {
                            ...album,
                            users: usersWithRecommendations  // Attach users with recommendations to the album
                        };
                    }

                    return album;  // If no users, return the album as is
                }));

                // Return the photo with albums that now include users with recommendations
                return {
                    ...photo,
                    albums: albumsWithRecommendations  // Attach albums with users to the photo
                };
            }

            return photo;  // If no albums, return the photo as is
        }));

        // Respond with enriched photo data, including activity recommendations
        res.json(enrichedPhotos);

    } catch (error) {
        console.error('Error fetching photos or recommendations:', error);
        res.status(500).json({ error: 'Failed to fetch photos or recommendations' });
    }
});

// Serve the frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`App running at http://localhost:${port}`);
});

// Function to fetch activity recommendations from OpenAI
const getActivityRecommendations = async (albumTitle, userAddress) => {
    if (!albumTitle || !userAddress) {
        throw new Error('Missing album title or user address for activity recommendations.');
    }

    // Prepare the prompt
    const prompt = `
      Recommend 5 activities based on the album title "${albumTitle}"
      `;

    try {
        // Query OpenAI API for activity recommendations
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'You are a helpful assistant recommending activities based on user location and album title.' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 100,
        });

        // Return the generated activity recommendations
        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error fetching activity recommendations:', error);
        throw new Error('Failed to fetch activity recommendations');
    }
};
