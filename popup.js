document.addEventListener('DOMContentLoaded', function () {
    // Set placeholder text for the answer-container
    document.getElementById('answer-container').classList.add('placeholder');

    // Add an event listener to the submit button
    document.getElementById('submit-button').addEventListener('click', function () {
        // Get the user's query from the input field
        var query = document.getElementById('query-input').value.trim();

        if (query === '') {
            alert('Please enter a query.');
            return;
        }

        // Use the Chrome API to get the current active tab
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            var currentUrl = tabs[0].url;

            // Check if the current page is a YouTube page
            if (isYouTubeUrl(currentUrl)) {
                // Extract video ID from the YouTube URL
                var videoId = extractVideoId(currentUrl);

                // Fetch video title from YouTube page
                getVideoTitle(videoId, function (title) {
                    // Update the UI with video title
                    document.getElementById('video-title').textContent = `Video Title: ${title}`;

                    // Disable the submit button while processing
                    document.getElementById('submit-button').disabled = true;
                    document.getElementById('submit-button').innerHTML = 'Processing...';

                    // Send video ID and user query to the FastAPI backend
                    sendRequestToBackend(videoId, query);
                });
            } else {
                document.getElementById('answer-container').textContent = 'This is not a YouTube page.';
            }
        });
    });
});

function isYouTubeUrl(url) {
    return url.includes('youtube.com');
}

function extractVideoId(url) {
    var match = url.match(/[?&]v=([^&]+)/);
    return match ? match[1] : null;
}

function getVideoTitle(videoId, callback) {
    // Fetch video title from YouTube API or extract it from the page
    // You may need to use a YouTube API key for more accurate results
    // For simplicity, let's assume the title can be extracted from the page
    chrome.tabs.executeScript({
        code: 'document.title',
    }, function (result) {
        var pageTitle = result && result[0] ? result[0] : 'Unknown Title';

        // Extract the part before " - YouTube"
        var cleanTitle = pageTitle.split(' - YouTube')[0];

        callback(cleanTitle.trim());
    });
}

function sendRequestToBackend(videoId, query) {
    // Replace 'YOUR_BACKEND_URL' with the actual URL of your FastAPI backend
    fetch(`http://127.0.0.1:8000/get_answer`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ video_id: videoId, query: query }),
    })
        .then(response => response.json())
        .then(data => {
            // Fetch video title
            getVideoTitle(videoId, function (title) {
                // Display the video title and answer
                document.getElementById('answer-container').innerHTML = `<strong>Answer:</strong> ${data.answer}`;
                document.getElementById('answer-container').classList.remove('placeholder');
            });
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('answer-container').textContent = 'Error communicating with the backend.';
        })
        .finally(() => {
            // Reset button state regardless of success or failure
            document.getElementById('submit-button').disabled = false;
            document.getElementById('submit-button').innerHTML = 'Ask??';
        });
}
