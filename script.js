// ⚠️ API SETUP
const API_KEY = '967c36ab2dmshc4c3bf8bddd53f6p1002dejsn88b15cc6076d'; 
const API_HOST = 'youtube-video-fast-downloader-24-7.p.rapidapi.com'; 

async function fetchVideoOptions() {
    const urlInput = document.getElementById('urlInput');
    const url = urlInput.value.trim();
    const loader = document.getElementById('loader');
    const result = document.getElementById('result');
    const qualityDiv = document.getElementById('qualityOptions');
    const titleText = document.getElementById('videoTitle');
    const thumbImg = document.getElementById('thumb');
    
    if (!url) { alert("Link paste kar bhai!"); return; }

    const videoId = extractVideoID(url);
    if (!videoId) { alert("Invalid YouTube Link!"); return; }

    // Reset UI
    loader.classList.remove('hidden');
    result.classList.add('hidden');
    qualityDiv.innerHTML = ''; // Purane buttons saaf

    try {
        console.log("Fetching Info for ID:", videoId);

        // 🔄 Use Info Endpoint for List of Qualities
        const response = await fetch(`https://${API_HOST}/get-video-info/${videoId}`, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': API_KEY,
                'x-rapidapi-host': API_HOST
            }
        });

        const data = await response.json();
        console.log("API Data:", data); 

        // 1. Set Title & Image
        if (data.title) titleText.innerText = data.title;
        if (data.thumbnail || (data.thumbnails && data.thumbnails[0])) {
            thumbImg.src = data.thumbnail || data.thumbnails[0].url;
        }

        // 2. Format Finder Logic
        let allFormats = [];
        if (data.streams) allFormats = allFormats.concat(data.streams);
        if (data.formats) allFormats = allFormats.concat(data.formats);
        if (data.adaptiveFormats) allFormats = allFormats.concat(data.adaptiveFormats);

        if (allFormats.length > 0) {
            // Process and Filter
            const uniqueFormats = processFormats(allFormats);

            uniqueFormats.forEach(fmt => {
                const btn = document.createElement('a');
                btn.className = 'btn-quality';
                btn.href = fmt.url;
                btn.target = '_blank';
                btn.rel = 'noopener noreferrer'; // Security

                // Labeling
                let label = fmt.qualityLabel || fmt.quality || 'MP4';
                
                // Audio Detection
                // Check 'audioQuality' or MIME type for audio info
                const hasAudio = fmt.audioQuality || (fmt.mimeType && fmt.mimeType.includes('audio'));
                
                if (hasAudio) {
                    btn.innerHTML = `<span>${label}</span> <i class="fa-solid fa-volume-high"></i>`;
                    btn.style.borderColor = "#4ade80"; // Green border for good files
                } else {
                    // High quality aksar bina audio ke hoti hai
                    btn.innerHTML = `<span>${label}</span> <span class="tag-mute">No Audio</span>`;
                }

                qualityDiv.appendChild(btn);
            });

            result.classList.remove('hidden');

        } else if (data.downloadUrl || data.url) {
            // Fallback: Agar list nahi mili bas ek link mila
            const btn = document.createElement('a');
            btn.className = 'btn-quality';
            btn.href = data.downloadUrl || data.url;
            btn.innerHTML = `Download Video <i class="fa-solid fa-download"></i>`;
            qualityDiv.appendChild(btn);
            result.classList.remove('hidden');
        } else {
            alert("No download links found for this video.");
        }

    } catch (error) {
        console.error(error);
        alert("Error! Console check karo.");
    } finally {
        loader.classList.add('hidden');
    }
}

// 🧠 Smart Filter: Duplicates hatao aur Sort karo
function processFormats(rawFormats) {
    const cleanMap = new Map();

    rawFormats.forEach(fmt => {
        // Label nikalo (e.g., '720p', '1080p')
        let label = fmt.qualityLabel || fmt.quality;
        if (!label) return;

        // Sirf MP4/Video formats chahiye
        const isVideo = fmt.mimeType ? fmt.mimeType.includes('video') : true;
        if (!isVideo) return;

        const hasAudio = fmt.audioQuality ? true : false;
        
        // Key logic: 720p-true (audio hai), 720p-false (audio nahi hai)
        const key = `${label}-${hasAudio}`;

        // Map me add karo (Avoid duplicates)
        if (!cleanMap.has(key)) {
            cleanMap.set(key, fmt);
        }
    });

    // Array banao aur Sort karo (Highest Quality First)
    return Array.from(cleanMap.values()).sort((a, b) => {
        const qA = parseInt(a.qualityLabel) || 0;
        const qB = parseInt(b.qualityLabel) || 0;
        return qB - qA;
    });
}

function extractVideoID(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}
