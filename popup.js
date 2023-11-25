document.addEventListener('DOMContentLoaded', function () {
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

                // Send video ID and user query to the FastAPI backend
                sendRequestToBackend(videoId, query);
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
    console.log(match);
    return match ? match[1] : null;
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
            // Display the answer from the backend
            document.getElementById('answer-container').textContent = `Answer: ${data.answer}`;
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('answer-container').textContent = 'Error communicating with the backend.';
        });
}
