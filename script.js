// ⚠️ STEP 1: API Key wahi rahegi (967c...)
const API_KEY = '967c36ab2dmshc4c3bf8bddd53f6p1002dejsn88b15cc6076d'; 

// ✅ HOST: Same host
const API_HOST = 'youtube-video-fast-downloader-24-7.p.rapidapi.com'; 

async function downloadVideo() {
    const urlInput = document.getElementById('urlInput');
    const url = urlInput.value.trim();
    const loader = document.getElementById('loader');
    const result = document.getElementById('result');
    const statusText = document.getElementById('videoTitle');
    const dlButton = document.getElementById('dlButton');
    
    if (!url) { alert("Link paste kar bhai!"); return; }

    const videoId = extractVideoID(url);
    if (!videoId) {
        alert("Link sahi nahi hai. Check karo.");
        return;
    }

    loader.classList.remove('hidden');
    result.classList.add('hidden');

    try {
        console.log("Fetching Download Link for ID:", videoId);

        // 🔄 MAJOR CHANGE: URL Structure screenshot ke hisab se badal diya hai
        // Format: /download_video/{ID}
        const response = await fetch(`https://${API_HOST}/download_video/${videoId}`, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': API_KEY,
                'x-rapidapi-host': API_HOST
            }
        });

        const data = await response.json();
        console.log("Download Data:", data); 

        // 🎯 Link Finder
        // Is endpoint se usually direct 'url' ya 'downloadUrl' milta hai
        let downloadLink = null;
        let title = "Video Ready to Save";

        if (data.url) downloadLink = data.url;
        else if (data.downloadUrl) downloadLink = data.downloadUrl;
        else if (data.link) downloadLink = data.link;

        if (data.title) title = data.title;

        if (downloadLink) {
            statusText.innerText = title;
            dlButton.href = downloadLink;
            // Button text update
            dlButton.innerHTML = `Save Video <i class="fa-solid fa-download"></i>`;
            
            result.classList.remove('hidden');
        } else {
            console.error("Link issue:", data);
            alert("API ne link nahi diya. Console check karo 'Download Data' ke liye.");
        }

    } catch (error) {
        console.error(error);
        alert("Error! Console check karo.");
    } finally {
        loader.classList.add('hidden');
    }
}

// 🛠️ Helper: ID Extractor
function extractVideoID(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}
