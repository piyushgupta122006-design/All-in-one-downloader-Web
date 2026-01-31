// ⚠️ STEP 1: API Key maine screenshot se le kar daal di hai
const API_KEY = '967c36ab2dmshc4c3bf8bddd53f6p1002dejsn88b15cc6076d'; 

// ✅ HOST: Nayi wali API ka Host
const API_HOST = 'youtube-video-fast-downloader-24-7.p.rapidapi.com'; 

async function downloadVideo() {
    const urlInput = document.getElementById('urlInput');
    const url = urlInput.value.trim();
    const loader = document.getElementById('loader');
    const result = document.getElementById('result');
    const statusText = document.getElementById('videoTitle'); // Title element
    const dlButton = document.getElementById('dlButton');
    
    if (!url) { alert("Link paste kar bhai!"); return; }

    // 🧠 LOGIC: Link se ID nikalna (e.g. youtube.com/watch?v=ABC -> ABC)
    const videoId = extractVideoID(url);

    if (!videoId) {
        alert("Ye YouTube link sahi nahi lag raha. Check karo.");
        return;
    }

    loader.classList.remove('hidden');
    result.classList.add('hidden');

    try {
        console.log("Fetching ID:", videoId);

        // ✅ API Call: Endpoint '/get-video-info/' use kar rahe hain
        const response = await fetch(`https://${API_HOST}/get-video-info/${videoId}`, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': API_KEY,
                'x-rapidapi-host': API_HOST
            }
        });

        const data = await response.json();
        console.log("API Data:", data); 

        // 🎯 Data Extraction Logic
        let downloadLink = null;
        let title = data.title || "YouTube Video";
        
        // Is API me links aksar 'streams' ya 'formats' me hote hain
        if (data.streams && data.streams.length > 0) {
            // Sabse pehla wala format utha lo (usually best quality)
            downloadLink = data.streams[0].url;
        } 
        else if (data.link) {
            downloadLink = data.link;
        }
        else if (data.downloadUrl) {
            downloadLink = data.downloadUrl;
        }

        if (downloadLink) {
            // UI Update
            statusText.innerText = title;
            dlButton.href = downloadLink;
            
            // Result Show
            result.classList.remove('hidden');
        } else {
            console.error("Data:", data);
            alert("Download link nahi mila. Console check karo.");
        }

    } catch (error) {
        console.error(error);
        alert("Error! Console check karo.");
    } finally {
        loader.classList.add('hidden');
    }
}

// 🛠️ Helper Function: YouTube Link se ID nikalne ke liye
function extractVideoID(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}