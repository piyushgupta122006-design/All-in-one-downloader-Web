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
        console.log("Fetching Qualities for ID:", videoId);

        // 🔄 NEW ENDPOINT: /get_available_quality
        const response = await fetch(`https://${API_HOST}/get_available_quality/${videoId}`, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': API_KEY,
                'x-rapidapi-host': API_HOST
            }
        });

        const data = await response.json();
        console.log("Quality Data:", data); // Isko Console mein dekhna zaroori hai

        // 1. Basic Info Set (Agar API title deti hai)
        // Kuch APIs quality endpoint pe title nahi deti, toh hum generic title rakhenge
        if (data.title) titleText.innerText = data.title;
        else titleText.innerText = "Video Options Ready";
        
        if (data.thumbnail) {
            thumbImg.src = data.thumbnail;
            thumbImg.classList.remove('hidden');
        }

        // 2. Data Finder (Kyunki humein structure nahi pata)
        // Hum alag-alag keys check karenge jahan list ho sakti hai
        let list = [];
        
        // RapidAPI ki common keys check karte hain
        if (Array.isArray(data)) list = data; // Kabhi kabhi seedha array aata hai
        else if (data.data) list = data.data;
        else if (data.formats) list = data.formats;
        else if (data.streams) list = data.streams;
        else if (data.qualities) list = data.qualities;

        // 3. Button Generation
        if (list.length > 0) {
            
            // Filter Function call
            const uniqueOptions = processOptions(list);

            uniqueOptions.forEach(opt => {
                const btn = document.createElement('a');
                btn.className = 'btn-quality';
                
                // Link Logic: Kabhi 'url' hota hai, kabhi 'link'
                btn.href = opt.url || opt.link || opt.downloadUrl || '#';
                
                // Agar link nahi hai (sirf info hai), toh click event lagao (Future upgrade)
                if(btn.href === '#' || btn.href.endsWith('#')) {
                    btn.onclick = () => alert("Direct link nahi mila, sorry!");
                } else {
                    btn.target = '_blank';
                }

                // Label Logic
                let label = opt.quality || opt.qualityLabel || opt.note || 'Video';
                
                // Audio Check (Rough Logic)
                // Agar label mein "no audio" likha ho ya mute flag ho
                const isMute = (label.toLowerCase().includes('mute') || opt.no_audio);

                if (isMute) {
                    btn.innerHTML = `<span>${label}</span> <span class="tag-mute">No Sound</span>`;
                } else {
                    btn.innerHTML = `<span>${label}</span> 🔊`;
                    btn.style.borderColor = "#4ade80"; // Green for good audio
                }

                qualityDiv.appendChild(btn);
            });

            result.classList.remove('hidden');

        } else {
            console.error("List empty or unknown structure:", data);
            alert("Qualities list nahi mili. Console ka screenshot bhejo!");
        }

    } catch (error) {
        console.error(error);
        alert("Error! Console check karo.");
    } finally {
        loader.classList.add('hidden');
    }
}

// 🧠 Helper: List ko saaf karne ke liye
function processOptions(rawList) {
    // Agar list simple strings hai (e.g., ["720p", "360p"]) toh object banao
    if (typeof rawList[0] === 'string') {
        return rawList.map(item => ({ quality: item, url: '#' }));
    }
    return rawList;
}

function extractVideoID(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}
