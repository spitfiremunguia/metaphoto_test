const form = document.getElementById('filterForm');
const photosContainer = document.getElementById('photosContainer');
const spinnerOverlay = document.getElementById('spinnerOverlay'); // Get the spinner element

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = document.getElementById('title').value;
  const albumTitle = document.getElementById('albumTitle').value;
  const userEmail = document.getElementById('userEmail').value;

  // Show the spinner
  spinnerOverlay.style.display = 'flex';

  // Build query parameters
  const queryParams = new URLSearchParams({
    title,
    albumTitle,
    userEmail,
  });

  try {
    // Fetch photos from the backend API (which proxies the external API)
    const response = await fetch(`/api/photos?${queryParams.toString()}`);
    const photos = await response.json();

    displayPhotos(photos);
  } catch (error) {
    console.error('Error fetching photos:', error);
  } finally {
    // Hide the spinner after the response is received
    spinnerOverlay.style.display = 'none';
  }
});

function displayPhotos(photos) {
  photosContainer.innerHTML = '';  // Clear existing photos

  if (!photos || photos.length === 0) {
    // Show a message if no photos are returned
    photosContainer.innerHTML = '<p>No photos found</p>';
    return;
  }

  photos.forEach(photo => {
    // Create a container for each photo and its albums
    const photoContainer = document.createElement('div');
    photoContainer.className = 'photoContainer'; // Main container for each record

    // Create a flexbox container to hold the image, album info, and activity recommendations side by side
    const flexContainer = document.createElement('div');
    flexContainer.className = 'flexContainer';  // Use CSS to make this a flexbox

    // First Column: Create a container for the image and title
    const imageTitleContainer = document.createElement('div');
    imageTitleContainer.className = 'imageTitleContainer';

    // Create an element for the photo title
    const photoTitle = document.createElement('h2');
    photoTitle.textContent = photo.title;
    photoTitle.className = 'photoTitle'; // Add a class for title styling

    // Create a square container for the photo image
    const imageSquareContainer = document.createElement('div');
    imageSquareContainer.className = 'imageSquareContainer';

    // Create an element for the photo image
    const photoImage = document.createElement('img');
    photoImage.src = photo.thumbnailUrl;
    photoImage.alt = photo.title;
    photoImage.className = 'photoImage';

    // Append the image inside the square container
    imageSquareContainer.appendChild(photoImage);
    imageTitleContainer.appendChild(photoTitle); // Title above the image
    imageTitleContainer.appendChild(imageSquareContainer);

    // Second Column: Create an album container
    const albumContainer = document.createElement('div');
    albumContainer.className = 'albumContainer';

    // Display the albums related to the photo
    if (photo.albums && photo.albums.length > 0) {
      photo.albums.forEach(album => {
        const albumInfo = document.createElement('div');
        albumInfo.className = 'albumInfo';

        // Extract and format the company details
        const company = album.company;
        const companyInfo = `
          <p><strong>Company Name:</strong> ${company.name}</p>
          <p><strong>Catchphrase:</strong> ${company.catchPhrase}</p>
          <p><strong>Business:</strong> ${company.bs}</p>
        `;

        // Add album details along with company information
        albumInfo.innerHTML = `
          <h3>Album ID: ${album.id}</h3>
          <p><strong>Title:</strong> ${album.title}</p>
          <p><strong>Phone:</strong> ${album.phone}</p>
          <p><strong>Website:</strong> <a href="${album.website}" target="_blank">${album.website}</a></p>
          ${companyInfo}  <!-- Insert the formatted company details -->
        `;

        // Display users associated with the album
        if (album.users && album.users.length > 0) {
          const userList = document.createElement('div');
          userList.className = 'userList';

          album.users.forEach(user => {
            const userInfo = document.createElement('div');
            userInfo.className = 'userInfo';

            // Extract the user's address and geo-location
            const address = user.address;
            const geo = address.geo;

            // Display the user details
            userInfo.innerHTML = `
              <h4>User ID: ${user.id}</h4>
              <p><strong>Name:</strong> ${user.name}</p>
              <p><strong>Username:</strong> ${user.username}</p>
              <p><strong>Address:</strong></p>
              <ul>
                <li><strong>Street:</strong> ${address.street}</li>
                <li><strong>Suite:</strong> ${address.suite}</li>
                <li><strong>City:</strong> ${address.city}</li>
                <li><strong>Zipcode:</strong> ${address.zipcode}</li>
                <li><strong>Geo:</strong> Lat: ${geo.lat}, Lng: ${geo.lng}</li>
              </ul>
            `;
  
            userList.appendChild(userInfo);
          });

          albumInfo.appendChild(userList);
        } else {
          albumInfo.innerHTML += '<p>No users found for this album.</p>';
        }

        albumContainer.appendChild(albumInfo);
      });
    } else {
      albumContainer.innerHTML = '<p>No albums found for this photo.</p>';
    }

    // Third Column: Create a recommendations container
    const recommendationsContainer = document.createElement('div');
    recommendationsContainer.className = 'recommendationsContainer';

    // Check for activity recommendations and display them
    const allRecommendations = [];
    photo.albums.forEach(album => {
      album.users.forEach(user => {
        if (user.activityRecommendations) {
          allRecommendations.push(user.activityRecommendations);
        }
      });
    });

    // Display recommendations if available
    if (allRecommendations.length > 0) {
      const recommendationsTitle = document.createElement('h4');
      recommendationsTitle.textContent = 'Activity Recommendations:';
      recommendationsContainer.appendChild(recommendationsTitle);

      allRecommendations.forEach(recommendation => {
        const recommendationParagraph = document.createElement('p');
        recommendationParagraph.innerHTML = recommendation.replace(/\n/g, '<br>');
        recommendationsContainer.appendChild(recommendationParagraph);
      });
    } else {
      recommendationsContainer.innerHTML = '<p>No activity recommendations available.</p>';
    }

    // Append the three columns to the flexContainer
    flexContainer.appendChild(imageTitleContainer);      // First column (image + title)
    flexContainer.appendChild(albumContainer);           // Second column (album info)
    flexContainer.appendChild(recommendationsContainer); // Third column (recommendations)

    // Append the flexContainer to the photoContainer
    photoContainer.appendChild(flexContainer);

    // Append the photoContainer to the photosContainer in the HTML
    photosContainer.appendChild(photoContainer);
  });
}
