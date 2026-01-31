// ⚠️ API KEY (Wahi purani wali)
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

    // UI Reset
    loader.classList.remove('hidden');
    result.classList.add('hidden');
    qualityDiv.innerHTML = ''; 

    try {
        console.log("Fetching Link for ID:", videoId);

        // ✅ BACK TO BASICS: Wahi endpoint jo chala tha
        const response = await fetch(`https://${API_HOST}/download_video/${videoId}`, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': API_KEY,
                'x-rapidapi-host': API_HOST
            }
        });

        const data = await response.json();
        console.log("API Data:", data); 

        // Title handling
        if (data.title) titleText.innerText = data.title;
        else titleText.innerText = "Video Ready";

        // Link Finder (Simple & Strong)
        // Screenshot me humne dekha tha ki link 'data.file' me aata hai
        let finalLink = data.file || data.url || data.downloadUrl || data.link;

        if (finalLink) {
            // Thumbnail handling
            if (data.picture || data.thumbnail) {
                thumbImg.src = data.picture || data.thumbnail;
                thumbImg.classList.remove('hidden');
            }

            // Button Create Karo
            const btn = document.createElement('a');
            btn.className = 'btn-quality';
            btn.href = finalLink;
            btn.target = '_blank';
            
            // Text thoda professional likhenge
            btn.innerHTML = `Download Video <i class="fa-solid fa-download"></i>`;
            btn.style.width = "100%"; // Button ko bada dikhao
            btn.style.textAlign = "center";
            btn.style.justifyContent = "center";
            btn.style.background = "#22c55e"; // Green color
            btn.style.borderColor = "#22c55e";

            qualityDiv.appendChild(btn);

            // Warning agar API time le rahi ho
            if(data.comment) {
                const msg = document.createElement('p');
                msg.style.fontSize = "11px";
                msg.style.color = "#fbbf24";
                msg.style.marginTop = "8px";
                msg.innerText = "Note: Agar error aaye toh 10 second ruk kar try karna.";
                qualityDiv.appendChild(msg);
            }

            result.classList.remove('hidden');

        } else {
            console.error("Link missing:", data);
            alert("Sorry, is video ka link API nahi de pa rahi. Koi aur video try karo.");
        }

    } catch (error) {
        console.error(error);
        alert("Error! Console check karo.");
    } finally {
        loader.classList.add('hidden');
    }
}

function extractVideoID(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}
