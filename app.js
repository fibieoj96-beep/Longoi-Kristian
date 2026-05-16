const DECRYPTION_KEY = 'KunciRahsiaBorneoSabda1234567890';

let viewState = 'list';
let isHandlingBack = false;
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js', { scope: './' }).then(reg => {
        reg.onupdatefound = () => {
            const installingWorker = reg.installing;
            if (installingWorker) {
                installingWorker.onstatechange = () => {
                    if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        location.reload(); 
                    }
                };
            }
        };
    }).catch(err => {
        console.error('Pendaftaran Service Worker gagal:', err);
    });
}

let builderData = { title: '', id: null, sections: {} }; 
let currentPickerIdx = null; 
let builderStorage = {}; 
let currentActiveTemplate = []; 
let currentSelectedKey = ""; 
let globalScrollMap = {};
window.addEventListener('scroll', () => {
    if (viewState) {
        globalScrollMap[viewState] = window.scrollY;
    }
}, { passive: true });
let selectedLiturgies = []; 
let allItems = [];
let currentType = 'hymns';
let favorites = JSON.parse(localStorage.getItem('myFavorites')) || [];
window.currentPickerIdx = null; 
window.selectedVerses = [];   
if (window.history && window.history.pushState) {
    window.history.pushState({ view: 'list' }, "");
    viewState = 'list'; 
}
function autoTrace() {
    const originalFunctions = {};

    for (const key in window) {
        if (
            typeof window[key] === 'function' &&
            !key.startsWith('on') &&
            key !== 'autoTrace'
        ) {
            originalFunctions[key] = window[key];

            window[key] = function (...args) {
                console.log(`➡️ Masuk function: ${key}`);
                return originalFunctions[key].apply(this, args);
            };
        }
    }
}

window.addEventListener('load', () => {
    autoTrace();
});

function generateFavButton(id, title, text, footnoteId) {
    const isFav = favorites.some(f => f.id === id);
    const fillValue = isFav ? '#007bff' : 'none';

    return `
        <button id="fav-btn-${id}" 
                onclick="toggleFavorite('${id}', '${title.replace(/'/g, "\\'")}', '${text.replace(/'/g, "\\'")}', '${footnoteId}')" 
                style="background:none; border:none; cursor:pointer; padding:5px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="${fillValue}" stroke="#808080" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
        </button>
    `;
}

function toggleVerseHighlight(vKey) {
    if (window.currentPickerIdx !== null) {
        const popup = document.getElementById('highlight-popup');
        if (popup) popup.style.display = 'none';

        const el = document.getElementById(vKey);
        const p = vKey.split('_'); 
        const vNum = parseInt(p[3]);

        if (window.selectedVerses.includes(vNum)) {
            window.selectedVerses = window.selectedVerses.filter(n => n !== vNum);
            el.style.background = ""; 
            el.style.color = ""; 
        } else {
            window.selectedVerses.push(vNum);
            el.style.background = "var(--primary)"; 
            el.style.color = "white";
            el.style.borderRadius = "8px";
        }
        window.selectedVerses.sort((a, b) => a - b);
        updateFloatingPickerBtn(p[1], p[2]); 
        return;
    }
    
    currentSelectedKey = vKey; 
    const popup = document.getElementById('highlight-popup');
    popup.style.display = 'none';
    setTimeout(() => { popup.style.display = 'block'; }, 50);
}

function toggleDarkMode() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}
if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-mode');

function handleAutoShrink() {
    const container = document.getElementById('search-container');
    const input = document.getElementById('search-input');
    if (window.scrollY > 20 && container.classList.contains('expanded')) {
        container.classList.remove('expanded');
        input.blur();
    }
}

document.addEventListener('click', function(event) {
    const container = document.getElementById('search-container');
    const input = document.getElementById('search-input');
    if (container && container.classList.contains('expanded')) {
        if (!container.contains(event.target)) {
            container.classList.remove('expanded');
            input.blur();
        }
    }
});

const failMap = {
    "Kejadian": "b01", "Keluaran": "b02", "Imamat": "b03", "Bilangan": "b04", "Ulangan": "b05",
    "Yosua": "b06", "Hakim-Hakim": "b07", "Rut": "b08", "1 Samuel": "b09", "2 Samuel": "b10",
    "1 Raja-Raja": "b11", "2 Raja-Raja": "b12", "1 Tawarikh": "b13", "2 Tawarikh": "b14",
    "Ezra": "b15", "Nehemia": "b16", "Ester": "b17", "Ayub": "b18", "Mazmur": "b19",
    "Amsal": "b20", "Pengkhutbah": "b21", "Kidung Agung": "b22", "Yesaya": "b23",
    "Yeremia": "b24", "Ratapan": "b25", "Yehezkiel": "b26", "Daniel": "b27",
    "Hosea": "b28", "Yo'el": "b29", "Amos": "b30", "Obaja": "b31", "Yunus": "b32",
    "Mikha": "b33", "Nahum": "b34", "Habakuk": "b35", "Zefanya": "b36", "Hagai": "b37",
    "Zakharia": "b38", "Maleakhi": "b39", "Matius": "b40", "Markus": "b41",
    "Lukas": "b42", "Yohanes": "b43", "Kisah Para Rasul": "b44", "Roma": "b45",
    "1 Korintus": "b46", "2 Korintus": "b47", "Galatia": "b48", "Efesus": "b49",
    "Filipi": "b50", "Kolose": "b51", "1 Tesalonika": "b52", "2 Tesalonika": "b53",
    "1 Timotius": "b54", "2 Timotius": "b55", "Titus": "b56", "Filemon": "b57",
    "Ibrani": "b58", "Yakobus": "b59", "1 Petrus": "b60", "2 Petrus": "b61",
    "1 Yohanes": "b62", "2 Yohanes": "b63", "3 Yohanes": "b64", "Yudas": "b65",
    "Wahyu": "b66",
    "hymns": "sys_h", "psalms": "sys_p", "prayers": "sys_pr", 
    "liturgies": "sys_l", "others": "sys_o", "bible": "sys_b", "template": "template"
};

async function fastFetch(keyNama) {
    const namaFailSistem = failMap[keyNama] || keyNama;
    let url = '';

    // Logik asal kau yang sangat genius untuk asingkan folder Bible dan Sistem
    if (/^b\d+$/.test(namaFailSistem)) {
        url = `./sys/core/${namaFailSistem}.dat`; // Contoh: ./sys/core/b01.dat
    } else {
        url = `./sys/${namaFailSistem}.dat`;      // Contoh: ./sys/sys_h.dat
    }

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Fail tidak dijumpai: ${url}`);
        
        const encrypted = await res.text();

        // DECRYPT ASAL: Menggunakan Fixed IV 16-byte kosong (hex)
        const bytes = CryptoJS.AES.decrypt(
            encrypted,
            CryptoJS.enc.Utf8.parse(DECRYPTION_KEY),
            { 
                iv: CryptoJS.enc.Hex.parse('00000000000000000000000000000000'), 
                mode: CryptoJS.mode.CBC, 
                padding: CryptoJS.pad.Pkcs7 
            }
        );

        const decrypted = bytes.toString(CryptoJS.enc.Utf8);

        if (!decrypted) {
            throw new Error("Decrypt gagal / key salah / data rosak");
        }

        return JSON.parse(decrypted);

    } catch (err) {
        console.error("Gagal membaca atau decrypt fail:", url, err);
        return null;
    }
}

async function loadData() {
    const categories = ["hymns", "bible", "psalms", "prayers", "liturgies", "others"];
    const fetchPromises = categories.map(async (cat) => {
        try {
            // 💡 KEKALKAN: Panggil 'cat' sahaja (e.g. "hymns")
            // Biar fungsi fastFetch di atas menterjemah "hymns" -> "sys_h" -> "./sys/sys_h.dat"
            const data = await fastFetch(cat);
            if (!data) return [];
            
            return data.map((item, index) => {
                const finalTitle = item.title || item.name || item.judul || "No Title";
                let searchTag = finalTitle.toLowerCase() + " ";
                let displayContent = "";

                if (cat === 'liturgies' && item.content_json) {
                    item.content_json.section.forEach(sec => {
                        searchTag += (sec.section_title || "").toLowerCase() + " ";
                        sec.content.forEach(c => {
                            searchTag += (c.header || "").toLowerCase() + " " + (c.paragraph || "").toLowerCase() + " ";
                        });
                    });
                    displayContent = "LITURGI_CONTENT"; 
                } else {
                    const raw = item.content || item.text || item.lyric || "";
                    searchTag += raw.toLowerCase();
                    displayContent = raw;
                }

                return { ...item, type: cat, id: item.id || (index + 1), title: finalTitle, content: displayContent, searchTag: searchTag };
            });
        } catch(e) { return []; }
    });
    const results = await Promise.all(fetchPromises);
    allItems = results.flat();
    renderList(currentType);
}

function expandSearch() {
    const container = document.getElementById('search-container');
    const input = document.getElementById('search-input');
    if (container) {
        container.classList.add('expanded');
        setTimeout(() => { if (input) input.focus(); }, 150);
    }
}

async function handleSearch() {
    const query = document.getElementById('search-input').value.toLowerCase().trim();
    const titleHeader = document.getElementById('header-title');
    
    if (query === "") {
        const titles = { 'hymns': 'Longoi','bible': 'Alkitab', 'psalms': 'Zabur', 'prayers': 'Doa', 'liturgies': 'Hoturan', 'others': 'Vokon' };
        titleHeader.innerText = titles[currentType] || "More";
        renderList(currentType);
        return;
    }

    if (currentType === 'bible') {
        const bibleJumpMatch = query.match(/^([1-3]?\s*[a-z]+)?\s*(\d+):(\d+)$/);
        if (bibleJumpMatch) {
            const bookSearch = (bibleJumpMatch[1] || "").trim();
            const chapterNum = parseInt(bibleJumpMatch[2]);
            const verseNum = bibleJumpMatch[3]; 
            
            const book = allItems.find(i => 
                i.type === 'bible' && 
                (i.title.toLowerCase().includes(bookSearch) || bookSearch.includes(i.title.toLowerCase()))
            );

            if (book) {
                titleHeader.innerText = "Results";
                renderBibleSearchList(book.id, chapterNum, verseNum);
                return;
            }
        }

        const bibleListMatch = query.match(/^([1-3]?\s*[a-z]+)?\s*(\d+)$/);
        if (bibleListMatch) {
            const bookSearch = (bibleListMatch[1] || "").trim();
            const chapterNum = parseInt(bibleListMatch[2]);
            const book = allItems.find(i => 
                i.type === 'bible' && 
                (i.title.toLowerCase().includes(bookSearch) || bookSearch.includes(i.title.toLowerCase()))
            );

            if (book) {
                titleHeader.innerText = "Results";
                renderBibleSearchList(book.id, chapterNum);
                return;
            }
        }
    }

    const filtered = allItems.filter(item => {
        if (item.type !== currentType) return false;
        if (/^\d+$/.test(query)) {
            return item.title.toLowerCase().startsWith(query + ".") || 
                   item.title.toLowerCase().startsWith(query + " ") ||
                   item.searchTag.includes(" " + query + " ");
        }
        return item.searchTag.includes(query);
    });

    titleHeader.innerText = "Results";
    renderList(null, filtered);
}

async function openDetail(id, type, isBacking = false) {
    if (!isBacking) {
        pushAppState('detail');
    } else {
        viewState = 'detail';
    }
    window.currentDetailId = id;  
    window.currentDetailType = type; 

    if (viewState === 'list' || viewState === 'bible-chapters') {
        lastScrollPos = window.scrollY;
    }
    if (type === 'bible') { 
        openBibleChapters(id, isBacking); 
        return; 
    }
    if (viewState === 'footnote') {
        window.previousPage = 'footnote';
    } else {
        window.previousPage = ''; 
    }
    const item = allItems.find(i => String(i.id) === String(id) && i.type === type);
    if (!item) return;
    
    const titles = { 'hymns': 'Longoi', 'psalms': 'Zabur', 'prayers': 'Doa', 'liturgies': 'Hoturan', 'others': 'Vokon' };
    document.getElementById('header-title').innerText = titles[type] || "Detail";
    
    const watermark = document.querySelector('.tabbar-watermark');
    if (watermark) watermark.style.setProperty('background', 'var(--bg)', 'important');
    
    updateHeaderUI(true);
    document.getElementById('main-menu-btn').classList.add('hidden');
    document.getElementById('search-area').style.display = 'none';
    document.getElementById('tabbar').classList.add('hidden');
    const hamburger = document.getElementById('main-menu-btn');
    if (hamburger) {
        hamburger.style.setProperty('display', 'none', 'important');
    }

    let contentHtml = "";

    if (type === 'liturgies') {
        const data = await fastFetch('liturgies');
        const entry = data.find(e => String(e.id) === String(id));
        let finalHtml = "";
        if (entry && entry.content_json) {
            entry.content_json.section.forEach(sec => {
                if (sec.section_title) finalHtml += `<h3 style="margin-top:15px; color:var(--text-main); text-transform:uppercase; text-align:left !important;">${sec.section_title}</h3>`;
                sec.content.forEach(c => {
                    if (c.header) finalHtml += `<div style="font-weight:900; margin-top:10px; color:var(--text-main); font-size:1.2rem; text-align:left !important;">${c.header}</div>`;
                    if (c.paragraph) finalHtml += `<div style="margin-bottom:10px; line-height:1.7;font-size:1.2rem;  text-align:left !important; color:var(--text-main); white-space:pre-wrap;">${c.paragraph}</div>`;
                });
            });
        }
        contentHtml = `<div id="liturgy-render">${finalHtml}</div>`;
    } else {
        let rawText = (item.lyric || item.content || "").trim();
        let finalHtml = "";

        if (type === 'psalms') {
            const lines = rawText.split('\n');
            const indentedText = lines.map(line => {
                if (line.trim() === "") return ""; 
                return `&nbsp;&nbsp;&nbsp;&nbsp;${line}`; 
            }).join('\n');

            finalHtml = `
                <div style="margin-top: -25px !important; text-align: left !important; width: 100%;">
                    <span style="display: block !important; text-align: left !important; line-height: 1.7; font-size: 1.2rem; color: var(--text-main); white-space: pre-wrap;">${indentedText}</span>
                </div>`;
            contentHtml = finalHtml;
        } else if (type === 'hymns') { 
            const sections = rawText.split(/\n(?=\d+\.)/);
            sections.forEach(section => {
                let text = section.trim();
                if (!text) return;
                const match = text.match(/^(\d+)\.\s*([\s\S]*)/);
                if (match) {
                    finalHtml += `
                    <div style="display: flex !important; flex-direction: row !important; align-items: flex-start !important; margin-bottom: -120px !important; width: 100% !important; text-align: left !important;">
                        <div style="width: 28px !important; min-width: 28px !important; height: 28px !important; flex-shrink: 0 !important; padding-left: 25px; margin-right: 20px !important; margin-top: 5px !important;">
                            <svg viewBox="0 0 400 400" style="width: 100%; height: 100%;">
                                <rect width="400" height="400" rx="60" fill="black"/>
                                <g fill="white">
                                    <ellipse cx="80" cy="310" rx="38" ry="28" transform="rotate(-20, 80, 310)" />
                                    <ellipse cx="290" cy="270" rx="38" ry="28" transform="rotate(-20, 290, 270)" />
                                    <rect x="108" y="70" width="15" height="240" />
                                    <rect x="318" y="30" width="15" height="240" />
                                    <path d="M108,70 L333,30 L333,85 L108,125 Z" />
                                    <text x="205" y="245" font-family="sans-serif" font-size="170" font-weight="900" text-anchor="middle">${match[1]}</text>
                                </g>
                            </svg>
                        </div>
                        <div style="flex: 1 !important; text-align: left !important;">
                            <span style="display: block !important;padding-left:8px; padding-right:30px; text-align: left !important; line-height: 1.7 !important; font-size: 1.2rem; color: var(--text-main); white-space: pre-wrap;">${match[2].trim()}</span>
                        </div>
                    </div>`;
                } else {
                    finalHtml += `<div style="padding-left: 40px; margin-bottom: 1px; text-align: left !important;"><span style="display: block !important; line-height: 1.5 !important; font-size: 1.5rem;">${text}</span></div>`;
                }
            });
            contentHtml = `<div style="margin-top: -80px !important;">${finalHtml}</div>`;
        } else { 
            contentHtml = `<div style="text-align: left; line-height: 1.7; font-size: 1.2rem; white-space: pre-wrap;">${rawText}</div>`;
        }
    }

    const cleanTitle = item.title.replace(/^\d+\.\s*/, "").replace(/\.\.\./g, '');
    document.getElementById("app-list").innerHTML = `
        <div class="lyrics-view" style="padding: 10px 20px 200px 20px; text-align: left !important; width: 100%; box-sizing: border-box;">
            <h2 style="text-align: center !important; margin-bottom: 25px; font-weight: 900; font-size: 1.7rem; line-height: 1.2; color: var(--text-main);">${cleanTitle}</h2>
            ${contentHtml}
        </div>`;
    window.scrollTo(0,0);

if (window.currentPickerIdx !== null) {
    const lirikAsli = item.lyric || item.content || ""; 
    showLongoiFloatingBtn(cleanTitle, lirikAsli);
}
}

function showLongoiFloatingBtn(cleanTitle, lirikIsi) {
    let btn = document.getElementById('floating-bible-picker'); 
    if (btn) btn.remove();

    if (window.currentPickerIdx !== null) {
        const btnNew = document.createElement('button');
        btnNew.id = 'floating-bible-picker';
        btnNew.style.position = "fixed";
        btnNew.style.bottom = "25px"; 
        btnNew.style.left = "50%";
        btnNew.style.transform = "translateX(-50%)";
        btnNew.style.padding = "10px 20px"; 
        btnNew.style.background = "var(--primary)";
        btnNew.style.color = "white";
        btnNew.style.border = "none";
        btnNew.style.borderRadius = "30px"; 
        btnNew.style.fontWeight = "800";    
        btnNew.style.fontSize = "13px";     
        btnNew.style.zIndex = "99999";
        btnNew.style.boxShadow = "0 6px 15px rgba(0,0,0,0.3)";
        btnNew.style.cursor = "pointer";
        
        const idLagu = window.currentHymnId || "";
        btnNew.innerText = `PILIH ${idLagu ? idLagu + '. ' : ''}${cleanTitle}`;

        btnNew.onclick = () => {
            let rawContent = lirikIsi || document.querySelector('.lyrics-view')?.innerText || "";
            
            if (rawContent) {
                const formattedLyrics = rawContent.trim().replace(/\n/g, '<br>');
                const finalHtml = `<div class="hymn-verse" style="font-size:1rem; line-height:1.4;">${formattedLyrics}</div>`; 
                sendToEditor(cleanTitle, finalHtml);
                btnNew.remove();
            }
        };
        document.body.appendChild(btnNew);
    }
}

async function renderBibleSearchList(bookId, chapterNum, verseNum = null) {
    try {
        const data = await fastFetch(bookId);
        const ch = data.find(c => String(c.chapter).includes(String(chapterNum)));
        if (ch) {
            const listContainer = document.getElementById("app-list");
            
            let filteredVerses = ch.content;
            if (verseNum) {
                filteredVerses = ch.content.filter(v => String(v.verse) === String(verseNum));
            }

            if (filteredVerses.length === 0) {
                listContainer.innerHTML = '<div style="text-align:center;padding:50px;opacity:0.5;">Ayat tidak dijumpai</div>';
                return;
            }

            listContainer.innerHTML = filteredVerses.map(v => `
                <div class="card" onclick="renderBibleSpecificAuto('${bookId}', ${data.indexOf(ch)}, '${v.verse}')">
                    <div class="title" style="text-align:left;">
                        <span style="opacity:0.5; font-size:0.8rem;">${bookId} ${chapterNum}:${v.verse}</span><br>
                        ${v.text}
                    </div>
                </div>
            `).join("");
        } else {
            document.getElementById("app-list").innerHTML = '<div style="text-align:center;padding:50px;opacity:0.5;">Bab tidak dijumpai</div>';
        }
    } catch (e) { console.error(e); }
}

async function renderBibleVersesAuto(bookId, chapterIndex, isBacking = false) {
    if (!isBacking) {
        pushAppState('bible-content');
    } else {
        viewState = 'bible-content';
    }
    globalScrollMap['chapters'] = window.scrollY; 
    window.currentBookId = bookId;
    window.currentChapterIndex = chapterIndex;
    window.selectedVerses = []; 
    document.getElementById('search-area').style.display = 'none';
    document.getElementById('tabbar').classList.add('hidden');
    
    try {
        const data = await fastFetch(bookId);
        const ch = data[chapterIndex];
        if (!ch) return;

        const cleanNum = String(ch.chapter).replace(/Bab/gi, "").trim();
        const currentHighs = JSON.parse(localStorage.getItem('myHighlights')) || {};

        let html = `
            <div class="bible-reader-view" style="padding: 20px 15px 200px 15px; text-align: left;">
                <div style="text-align:center; margin-bottom: 25px;">
                    <div style="font-weight:900; font-size:1.8rem; text-transform:uppercase; color:var(--text-main);">${bookId}</div>
                    <div style="color:var(--text-main); opacity:0.6; font-weight:700; margin-top:5px;">Bab ${cleanNum}</div>
                    ${(window.currentPickerIdx !== null) ? `<div style="margin-top:10px; color:var(--primary); font-weight:800; background:rgba(var(--primary-rgb),0.1); padding:8px; border-radius:8px;">MOD PEMILIHAN: KLIK AYAT</div>` : ''}
                </div>

                <div class="verses-container">
                    ${ch.content.map(v => {
                        const vKey = `high_${bookId}_${cleanNum}_${v.verse}`;
                        const savedColor = currentHighs[vKey]?.color || currentHighs[vKey];
                        const bgStyle = savedColor ? `background:${savedColor}; border-radius:8px; color:#000; padding:5px;` : '';

                        return `
                        ${v.header ? `<div style="font-weight:800; font-size:1.35rem; color:var(--text-main); margin: 30px 0 10px 0;">${v.header}</div>` : ''}
                        <div id="${vKey}" onclick="toggleVerseHighlight('${vKey}')" style="margin-bottom:22px; cursor:pointer; padding:5px; transition:0.2s; ${bgStyle}">
                            <span style="font-weight:900; font-size:1rem; margin-right:8px; opacity:0.7;">${v.verse}</span>
                            <span style="line-height:1.8; font-size:1.2rem;">${v.text}</span>
                        </div>`;
                    }).join("")}
                </div>
            </div>
            
        <div class="avb-watermark" style="text-align: center; margin-top: 60px; padding: 20px 10px; border-top: 1px solid rgba(var(--text-main-rgb, 0), 0.1); opacity: 0.65; font-size: 0.95rem; line-height: 1.6;">
                    <div style="font-weight: 700; color: var(--text-main);">Alkitab Versi Borneo</div>
                    <div style="font-size: 0.85rem; margin-top: 2px; color: var(--text-main);">Hak cipta © 2015 Borneo Sabda Limited</div>
                    <div style="margin-top: 8px;">
                        <a href="https://www.alkitabversiborneo.org" target="_blank" rel="noopener" style="color: #007bff; text-decoration: none; font-weight: 700; font-size: 0.85rem;">Learn More About Alkitab Versi Borneo</a>
                    </div>
                </div>

            </div>`;
        
        document.getElementById("app-list").innerHTML = html;
        updateHeaderUI(true);
        window.scrollTo(0,0);
    } catch (e) { console.error(e); }
}

async function openBibleChapters(bookId, isBacking = false) {
    if (!isBacking) {
        pushAppState('chapters');
    } else {
        viewState = 'chapters';
    }
    const comingFromReader = (viewState === 'verses' || viewState === 'bible-content');
    window.currentBookId = bookId;
    currentBibleBook = bookId;

    updateHeaderUI(true);
    document.getElementById('header-title').innerText = "Alkitab";
    document.getElementById('search-area').style.display = 'flex';
    
    const tabbar = document.getElementById('tabbar');
    if (tabbar) tabbar.classList.remove('hidden');
    
    const watermark = document.querySelector('.tabbar-watermark');
    if (watermark) {
        watermark.style.setProperty('background', 'var(--surface)', 'important');
        watermark.style.setProperty('opacity', '1', 'important');
    }

    const hamburger = document.getElementById('main-menu-btn');
    if (hamburger) hamburger.style.setProperty('display', 'none', 'important');

    try {
        const data = await fastFetch(bookId);
        let html = `
            <div class="bible-view" style="padding:20px; padding-bottom:180px; min-height:100vh; box-sizing:border-box;">
                <h2 style="text-align:center; margin-bottom:30px; font-weight:900; text-transform:uppercase; color:var(--text-main);">${bookId}</h2>
                <div class="chapter-grid" style="display:grid; grid-template-columns:repeat(5,1fr); gap:10px;">`;

                data.forEach((ch, index) => {
            const cleanNum = String(ch.chapter).replace(/Bab/gi, "").trim();

            const isPicker = (currentPickerIdx !== null);
            const clickAction = isPicker 
                ? `sendToEditor('${bookId} ${cleanNum}')` 
                : `renderBibleVersesAuto('${bookId}', ${index})`;

            html += `
                <div class="chapter-card" onclick="${clickAction}" style="background:var(--surface); aspect-ratio:1/1; display:flex; align-items:center; justify-content:center; border-radius:12px; border:1px solid var(--border); cursor:pointer;">
                    <div style="font-weight:900; color:var(--text-main); font-size:1.1rem;">${cleanNum}</div>
                </div>`;
        });
        
        html += `</div></div>`;

               const appList = document.getElementById("app-list");
        appList.style.visibility = 'hidden'; 
        appList.innerHTML = html;

        setTimeout(() => {
            const targetY = comingFromReader ? 0 : 0; 
            window.scrollTo({ top: 0, behavior: 'instant' });
            
            requestAnimationFrame(() => {
                appList.style.visibility = 'visible';
            });
        }, 50); 
    } catch(e) { console.error(e); }
}

async function renderBibleSpecificAuto(bookId, chapterIndex, verseNumber) {
    document.querySelector('.tabbar-watermark').style.setProperty('background', 'var(--bg)', 'important');
    document.getElementById('search-area').style.display = 'none';
    document.getElementById('tabbar').classList.add('hidden');
    const searchInput = document.getElementById('search-input');
    const searchContainer = document.getElementById('search-container');
    if (searchInput) searchInput.value = "";
    if (searchContainer) searchContainer.classList.remove('expanded');
    viewState = 'verses';
    updateHeaderUI(true);
    document.getElementById('header-title').innerText = "Alkitab";

    try {
        const data = await fastFetch(bookId);
        const ch = data[chapterIndex];
        if (!ch) return;
        const cleanNum = String(ch.chapter).replace(/Bab/gi, "").trim();

        const currentHighs = JSON.parse(localStorage.getItem('myHighlights')) || {};

        let html = `
            <div class="bible-reader-view" style="padding:20px 15px; text-align:left;">
                <div style="text-align:center; margin-bottom: 25px;">
                    <div style="font-weight:900; font-size:1.8rem; text-transform:uppercase; color:var(--text-main);">${bookId}</div>
                    <div style="color:var(--text-main); opacity:0.6; font-weight:700; margin-top:5px;">Bab ${cleanNum}</div>
                </div>
                <div class="verses-container">`;
        
        html += ch.content.map(v => {
    const vKey = `high_${bookId}_${cleanNum}_${v.verse}`;
    const data = currentHighs[vKey];
    const savedColor = (data && typeof data === 'object') ? data.color : data;
    const isTarget = String(v.verse) === String(verseNumber);

    let extraStyle = `padding:12px 15px; border-radius:10px; margin-bottom:15px; transition: 0.3s;`;
    
    if (savedColor) {
        extraStyle += `background:${savedColor}; color:#000;`;
    }
    
    if (isTarget) {
        extraStyle += `border: 2px solid ${savedColor || 'var(--primary)'}; background: ${savedColor || 'rgba(255,255,255,0.1)'}; color: ${savedColor ? '#000' : 'var(--text-main)'};`;
    }

    const headerHtml = v.header ? `<div style="font-weight:800; font-size:1.2rem; color:var(--text-main); margin: 25px 0 10px 0;">${v.header}</div>` : '';
    
    return `
        ${headerHtml}
        <div id="${vKey}" onclick="toggleVerseHighlight('${vKey}')" style="cursor:pointer; display:block; ${extraStyle}">
            <span style="font-weight:900; font-size:1rem; margin-right:8px; opacity:0.7;">${v.verse}</span>
            <span style="line-height:1.8; font-size:1.35rem;">${v.text}</span>
        </div>`;
}).join("");

        html += `</div><div style="height:150px;"></div></div>`;
        document.getElementById("app-list").innerHTML = html;
        
        setTimeout(() => {
            const el = document.getElementById(`high_${bookId}_${cleanNum}_${verseNumber}`);
            
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 200);
    } catch(e) { console.error(e); }
}

function changeCategory(type, el) {
    currentType = type;
    viewState = 'list';
    appHistoryStack = [];
    
    history.replaceState({ view: 'list' }, ""); 
    
    const navItems = document.querySelectorAll('.nav-item');
    const index = Array.from(navItems).indexOf(el);
    document.documentElement.style.setProperty('--nav-index', index);
    navItems.forEach(item => item.classList.remove('active'));
    if (el) el.classList.add('active');
    
    document.getElementById('search-input').value = "";
    document.getElementById('search-container').classList.remove('expanded');
    
    const titles = { 'hymns': 'Longoi','bible': 'Alkitab', 'psalms': 'Zabur', 'prayers': 'Doa', 'liturgies': 'Hoturan', 'others': 'Vokon' };
    document.getElementById('header-title').innerText = titles[type] || "More";
    showListView();
}

function updateHeaderUI(isCenter) {
    const titleHeader = document.getElementById('header-title');
    const darkToggle = document.getElementById('dark-toggle');
    const header = document.getElementById('main-header');
    const backBtn = document.getElementById('back-button');
    if (header) header.style.minHeight = isCenter ? '90px' : '70px';
    if (titleHeader) {
        titleHeader.style.position = isCenter ? 'absolute' : 'static';
        titleHeader.style.left = isCenter ? '50%' : 'auto';
        titleHeader.style.transform = isCenter ? 'translateX(-50%)' : 'none';
    }
    if (darkToggle) darkToggle.style.display = isCenter ? 'none' : 'flex';
    if (backBtn) backBtn.style.display = isCenter ? 'flex' : 'none';
}

function renderList(type, filteredItems = null) {
  viewState = 'list';
    const listContainer = document.getElementById("app-list");
    updateHeaderUI(false);
    
    const items = filteredItems || allItems.filter(i => i.type === type);
    if (items.length === 0) { 
        listContainer.innerHTML = '<div style="text-align:center;padding:50px;opacity:0.5;">Tiada Data</div>'; 
        return; 
    }

    const currentFavs = JSON.parse(localStorage.getItem('myFavorites')) || [];

    listContainer.innerHTML = items.map((item) => {
    const uniqueId = item.type + "_" + item.id;
    const isFav = currentFavs.some(f => String(f.uniqueId) === String(uniqueId));
    const starFill = isFav ? '#007bff' : 'none';

    return `
        <div class="card" style="position: relative;">
            <div class="title" 
                 onclick="window.currentHymnId = '${item.id}'; openDetail('${item.id}', '${item.type}')" 
                 style="text-align:left; padding-right: 50px;">
                ${item.title}
            </div>

            <div id="fav-btn-${uniqueId}" 
                 onclick="event.stopPropagation(); toggleFavorite('${item.id}', '${item.type}')" 
                 style="position: absolute; right: 15px; top: 50%; transform: translateY(-50%); cursor: pointer; z-index: 10;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="${starFill}" stroke="#808080" stroke-width="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
            </div>
        </div>
    `;
}).join("");
}

function updateStarUI(el) {
    const svg = el.querySelector('svg');
    const current = svg.getAttribute('fill');
    svg.setAttribute('fill', current === 'none' ? '#007bff' : 'none');
}

function showListView() {
    const hp = document.getElementById('highlight-popup');
    if (hp) hp.style.display = 'none';

    const oldBtn = document.getElementById('floating-bible-picker');
    if (oldBtn) oldBtn.remove();
    window.selectedVerses = [];

    const builderStyle = document.getElementById('hide-tabbar-style');
    if (builderStyle) builderStyle.remove();

    const header = document.getElementById('main-header');
    const backBtn = document.getElementById('back-button');
    const ht = document.getElementById('header-title');
    const hamburger = document.getElementById('main-menu-btn');
    const watermark = document.querySelector('.tabbar-watermark');
    const tabbar = document.getElementById('tabbar');

    if (watermark) {
        watermark.style.setProperty('background', 'var(--surface)', 'important');
        watermark.style.setProperty('backdrop-filter', 'none', 'important');
        watermark.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
        watermark.style.setProperty('opacity', '1', 'important');
    }

    if (tabbar) {
        tabbar.style.setProperty('background', 'var(--surface)', 'important');
        tabbar.style.setProperty('backdrop-filter', 'none', 'important');
        tabbar.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
    }
    
    if (window.currentPickerIdx !== null) {
        if (header) {
            header.style.setProperty('display', 'flex', 'important');
            header.style.setProperty('justify-content', 'center', 'important');
        }
        if (ht) {
            ht.style.setProperty('position', 'absolute', 'important');
            ht.style.setProperty('left', '50%', 'important');
            ht.style.setProperty('transform', 'translateX(-50%)', 'important');
            ht.style.setProperty('margin', '0', 'important');
            
            const titles = { 'hymns': 'Longoi','bible': 'Alkitab', 'psalms': 'Zabur' };
            ht.innerText = titles[currentType] || "";
        }
        if (backBtn) {
            backBtn.style.setProperty('display', 'flex', 'important');
            backBtn.onclick = function() {
                const b = document.getElementById('floating-bible-picker');
                if (b) b.remove();
                const p = document.getElementById('highlight-popup');
                if (p) p.style.display = 'none';
                
                window.currentPickerIdx = null; 
                showListView(); 
                setupLiturgiEditor(window.builderData.title, window.builderData.id);
            };
        }
        if (hamburger) hamburger.style.setProperty('display', 'none', 'important');

    } else {
        if (header) { header.style.display = ''; header.style.justifyContent = ''; }
        if (ht) {
            ht.style.position = '';
            ht.style.left = '';
            ht.style.transform = '';
            ht.style.margin = '';
        }
        if (backBtn) {
            backBtn.style.setProperty('display', 'none', 'important');
            backBtn.onclick = function() { showListView(); }; 
        }
        if (hamburger) hamburger.style.setProperty('display', 'block', 'important');
    }

    if ((viewState === 'verses' || viewState === 'bible-content') && window.currentBookId) {
        openBibleChapters(window.currentBookId);
        return; 
    }

    viewState = 'list';
    updateHeaderUI(false);
    
    const searchArea = document.getElementById('search-area');
    if (searchArea) searchArea.style.display = 'flex';
    
    if (tabbar) {
        tabbar.classList.remove('hidden');
        tabbar.style.setProperty('display', 'flex', 'important');
    }
    
    if (window.currentPickerIdx === null) {
        const titles = { 'hymns': 'Longoi','bible': 'Alkitab', 'psalms': 'Zabur', 'prayers': 'Doa', 'liturgies': 'Hoturan', 'others': 'Vokon' };
        if (ht) ht.innerText = titles[currentType] || "";
    }

    renderList(currentType);

    setTimeout(() => {
        const savedY = globalScrollMap['list'] || 0;
        window.scrollTo({ top: savedY, behavior: 'instant' });
    }, 60); 
}

document.addEventListener('DOMContentLoaded', () => { 
    loadData(); 
    const watermark = document.querySelector('.tabbar-watermark');
    if (watermark) watermark.style.setProperty('background', 'var(--surface)', 'important');
});

function toggleAppMenu(event) {
    event.stopPropagation();
    const dd = document.getElementById('app-dropdown');
    dd.style.display = (dd.style.display === 'none' || dd.style.display === '') ? 'block' : 'none';
}

window.onclick = function() {
    const dd = document.getElementById('app-dropdown');
    if (dd) dd.style.display = 'none';
}

async function initLiturgiBuilder(isBacking = false) {
    if (!isBacking) {
        pushAppState('builder');
    } else {
        viewState = 'builder';
    }

    const clearCore = document.getElementById('editor-core-style');
    if (clearCore) clearCore.remove();

    const clearBuilder = document.getElementById('hide-tabbar-style');
    if (clearBuilder) clearBuilder.remove();

    let styleTagBuilderAlternative = document.createElement('style');
    styleTagBuilderAlternative.id = 'hide-tabbar-style';
    document.head.appendChild(styleTagBuilderAlternative);
    
    styleTagBuilderAlternative.innerHTML = `
        #main-menu-btn, .menu-button, #tabbar, .tabbar, #search-area { 
            display: none !important; 
            visibility: hidden !important; 
        }
        #back-button { display: flex !important; }
        
        .liturgi-item { display: flex; align-items: flex-start; gap: 12px; transition: all 0.2s; }
        .liturgi-item:active { transform: scale(0.98); opacity: 0.8; }
    `;

    updateHeaderUI(true); 
    
    const headerTitle = document.getElementById('header-title') || document.getElementById('Liturgi');
    if (headerTitle) headerTitle.innerText = "Liturgi";
    
    const backBtn = document.getElementById('back-button');
    if (backBtn) {
        backBtn.onclick = function() { 
            const builderStyle = document.getElementById('hide-tabbar-style');
            if (builderStyle) builderStyle.remove(); 
            showListView(); 
        }; 
    }

    const data = await fastFetch('liturgies');
    const savedData = JSON.parse(localStorage.getItem('saved_liturgies') || '[]');
    const appList = document.getElementById("app-list");
    if (!appList) return;
    appList.innerHTML = "";

    let html = `<div style="padding:20px; padding-bottom:150px; background:var(--background); min-height:100vh;">`;

    if (savedData.length > 0) {
        html += `<h3 style="color:var(--text-main); font-size:0.85rem; font-weight:900; margin-bottom:15px; border-left:4px solid #27ae60; padding-left:10px; letter-spacing:1px;">Saved</h3>`;
        savedData.forEach((item) => {
            const safeTitle = item.title.replace(/'/g, "\\'");
            html += `
                <div onclick="setupLiturgiEditor('${safeTitle}', ${item.id})" 
                     style="background:var(--surface); padding:18px; border-radius:15px; border:1px solid #27ae60; margin-bottom:12px; position:relative; cursor:pointer; box-shadow:0 4px 12px rgba(0,0,0,0.05); display:block; clear:both;">
                    
                    <div style="padding-right:45px;">
                        <div style="font-weight:900; color:var(--text-main); font-size:0.95rem;">${item.title}</div>
                        <div style="font-size:0.75rem; opacity:0.8; margin-top:4px; color:#27ae60; font-weight:700;"> ${item.date || 'Baru'}</div>
                    </div>

                    <div onclick="event.stopPropagation(); deleteSavedLiturgi(${item.id})" 
                         style="position:absolute; top:50%; right:15px; transform:translateY(-50%); border:none; display:flex; align-items:center; justify-content:center; color:#e74c3c; cursor:pointer; padding:8px; border-radius:10px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </div>
                </div>`;
        });
        html += `<hr style="border:none; border-top:1px dashed var(--border); margin:25px 0;">`;
    }

    html += `<h3 style="opacity:0.7; color:var(--text-main); font-weight:900; font-size:1.2rem; margin-bottom:15px; border-left:4px solid var(--primary); padding-left:10px; letter-spacing:1px;">Liturgi</h3>
            <div style="display:flex; flex-direction:column; gap:12px;">`;

    data.forEach((item) => {
        const safeTitle = item.title.replace(/'/g, "\\'");
        html += `
            <div onclick="setupLiturgiEditor('${safeTitle}')" 
                 class="liturgi-item"
                 style="background:var(--surface); padding:18px; border-radius:15px; border:1px solid var(--border); cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.02);">
                 
                <div style="flex:1;">
                    <div style="font-weight:600; color:var(--text-main); line-height:1.2; font-size:1.1rem;">${item.title}</div>
                    <div style="font-size:0.75rem; opacity:0.6; margin-top:4px;">Liturgi</div>
                </div>
                <svg style="width:18px; height:18px; fill:var(--primary); opacity:0.5;" viewBox="0 0 24 24">
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                </svg>
            </div>`;
    });

    html += `</div></div>`;
    
    appList.innerHTML = html;
    window.scrollTo(0,0);
}

const esc = (str) => String(str || "").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m]));

async function setupLiturgiEditor(title, savedId = null, isBacking = false) {
    if (!isBacking) {
        pushAppState('editor');
    } else {
        viewState = 'editor';
    }
    if (!title && window.builderData) title = window.builderData.title;
    if (!title) return;

    const appList = document.getElementById("app-list");
    if (!appList) return;
    appList.innerHTML = ""; 

   let styleTag = document.getElementById('editor-core-style') || document.createElement('style');
    styleTag.id = 'editor-core-style';
    styleTag.innerHTML = `
        #main-menu-btn, .menu-button, #tabbar, .header-slot-right { display: none !important; visibility: hidden !important; }
        #back-button { display: flex !important; }

    .chevron-icon { transition: transform 0.3s ease; }
    .rotate-180 { transform: rotate(180deg); }
    .builder-card { display: block !important; clear: both !important; position: relative !important; 
    }`;
    
if (!document.getElementById('editor-core-style')) document.head.appendChild(styleTag);

    const backBtn = document.getElementById('back-button');
    if (backBtn) {
        backBtn.onclick = function() { 
            if (styleTag) styleTag.remove(); 
            initLiturgiBuilder(); 
        };
    }

    const [templateRules, liturgiData] = await Promise.all([
    fastFetch('template'), 
    fastFetch('liturgies'),
]);


    const selected = liturgiData.find(l => l.title === title);
    if (!selected) return;

        if (!window.builderData || window.builderData.title !== title) {
        let savedContent = {};
        let savedDate = ""; 
        if (savedId) {
            const savedList = JSON.parse(localStorage.getItem('saved_liturgies') || '[]');
            const entry = savedList.find(i => i.id === savedId);
            if (entry) {
                savedContent = entry.content || entry.sections;
                savedDate = entry.date || ""; 
            }
        }

        window.builderData = { 
            title, 
            id: savedId || Date.now(), 
            sections: savedContent,
            date: savedDate 
        };
    }

    let items = [];
    if (selected.content_json && selected.content_json.section) {
        selected.content_json.section.forEach(s => {
            if (s.content && Array.isArray(s.content)) {
                s.content.forEach(c => {
                    items.push({ header: c.header || s.header || "Bahagian", paragraph: c.paragraph || c.text || "" });
                });
            } else {
                items.push({ header: s.header || "Bahagian", paragraph: s.paragraph || s.text || "" });
            }
        });
    }

    let finalHtmlArr = [];
    finalHtmlArr.push(`<div style="padding:10px 20px 150px 20px; background:var(--background); min-height:100vh;">`);
    finalHtmlArr.push(`
        <div style="font-size:1.3rem; color:var(--text-main); text-align:center; margin-bottom:20px; opacity:0.7; font-weight:700; letter-spacing:0.5px; line-height:1.4;">
            ${title}
        </div>
    `);

            items.forEach((sec, idx) => {
        const h = sec.header || "";
        let p = (sec.paragraph || "").replace(/<div/g, '<span').replace(/<\/div>/g, '</span>');
        
        const combined = (h + " " + p).toUpperCase();
        const rule = templateRules.rules.find(r => r.keyword !== "DEFAULT_TEXT" && combined.includes(r.keyword.toUpperCase()));
        const sectionData = window.builderData.sections[idx] || {};
        const userValue = sectionData.text || "";
        const pickerValue = sectionData.picker || "";
        const pickerContent = sectionData.fullContent || ""; 
        const isExp = sectionData.refExpanded;

        let card = `
        <div class="builder-card" style="margin-bottom:20px; padding:15px; background:var(--surface); border-radius:12px; border:1px solid var(--border); border-left:4px solid var(--primary);">
            <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:10px;">
                <div style="font-weight:900; font-size:1rem; color:var(--text-main);">${h}</div>
                ${p ? `
                <button onclick="toggleRef(${idx}, this)" style="background:none; border:none; padding:5px; cursor:pointer;">
                    <svg class="chevron-icon ${isExp ? 'rotate-180' : ''}" viewBox="0 0 24 24" style="width:20px; height:20px; fill:var(--primary);"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>
                </button>` : ''}
            </div>

            ${p ? `
    <div id="ref-${idx}" 
         class="ref-text ${isExp ? 'expanded' : 'collapsed'}" 
         style="text-align: left !important; word-spacing: normal !important; letter-spacing: normal !important;">
        ${p.replace(/style="[^"]*word-spacing[^"]*"/g, 'style="word-spacing:normal !important"')
           .replace(/style="[^"]*letter-spacing[^"]*"/g, 'style="letter-spacing:normal !important"')}
    </div>` 
: ''}

<textarea class="auto-textarea" placeholder="+ teks" 
    oninput="handleLiveEdit(${idx}, 'text', this.value); showSaveButton(); this.style.height='auto'; this.style.height=this.scrollHeight+'px';"
    style="width:90%; display:block; margin-top:5px; border-radius:12px; padding:5px 12px; border:1.5px solid var(--border); background:var(--background); color:var(--text-main); font-size:1rem; resize:none; overflow:hidden; line-height: 1.1; letter-spacing: -0.8px; word-spacing: -3px; outline: none;">${userValue}</textarea>


            ${rule ? `
                <div style="display:flex; justify-content:flex-start;">
                    <button onclick="triggerPicker('${rule.action}', ${idx})" 
                        style="width:auto; min-width:120px; padding:8px 15px; border:1px dashed var(--primary); border-radius:30px; background:rgba(var(--primary-rgb), 0.1); color:var(--primary); font-weight:900; font-size:0.75rem; margin-top:12px; display:inline-flex; align-items:center; justify-content:center; gap:6px;">
                        <span>+ ${pickerValue ? 'Ganti ' + rule.placeholder : rule.placeholder}</span>
                    </button>
                </div>
                
                ${pickerValue ? `
    <div id="extra-content-${idx}" class="picker-container" style="margin-top:10px; padding:15px; background:rgba(var(--primary-rgb), 0.1); border-radius:10px; border:1px solid var(--primary); text-align: left !important;">
        
        <div style="font-weight:900 !important; font-size:1.1rem !important; color:var(--primary); margin-bottom: 8px !important; text-align: left !important;">
            ${pickerValue}
        </div>
        
        <div class="lirik-paksa" style="color:var(--text-main); white-space: pre-wrap; line-height: 1.4; text-align: left !important; display: block !important;">
            ${pickerContent.replace(/style="[^"]*"/g, '')} 
        </div>

        <style>
            .lirik-paksa, 
            .lirik-paksa * { 
                font-size: 1.1rem !important;
                line-height: 1.5 !important;
                display: block !important; /* Tukar dari inline ke block supaya tidak lari ke kanan */
                text-align: left !important;
                margin: 0 !important;
                padding: 0 !important;
            }
        </style>
    </div>
` : ''}
            ` : ''}
        </div>`;
        
        finalHtmlArr.push(card);
    });

finalHtmlArr.push(`
    <button id="floating-save-btn" onclick="saveCurrentLiturgi()" 
        style="display:none; position:fixed; bottom:30px; right:25px; 
               padding:12px 25px; background:#28a745; color:white; 
               border:none; border-radius:30px; font-weight:900; 
               font-size:0.85rem; letter-spacing:1px;
               box-shadow: 0 8px 20px rgba(39, 174, 96, 0.3); 
               z-index:9999; transition: all 0.2s ease;">
        SAVE
    </button>
`);

    finalHtmlArr.push(`</div>`);
    appList.innerHTML = finalHtmlArr.join('');
    const titleHeader = document.getElementById('header-title');
    if (titleHeader) {
        titleHeader.innerText = "Liturgi"; 
    }
    
    const tabbar = document.getElementById('tabbar');
    if (tabbar) {
        tabbar.style.setProperty('background', 'var(--surface)', 'important');
        tabbar.style.setProperty('backdrop-filter', 'none', 'important');
        tabbar.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
        tabbar.style.setProperty('display', 'none', 'important'); 
    }

    const searchArea = document.getElementById('search-area');
    if (searchArea) searchArea.style.display = 'none'; 
    updateHeaderUI(true); 
        setTimeout(() => {
        document.querySelectorAll('.auto-textarea').forEach(tx => {
            tx.style.height = 'auto';
            tx.style.height = tx.scrollHeight + 'px';
        });

const backBtn = document.getElementById('back-button');
if (backBtn) {
    backBtn.style.display = 'flex';
    backBtn.onclick = function(e) {
        e.preventDefault();
        
        const sections = (window.builderData && window.builderData.sections) ? window.builderData.sections : {};
        const adaIsi = Object.values(sections).some(s => 
            (s.text && s.text.trim().length > 0) || (s.picker && s.picker.trim().length > 0)
        );

        if (adaIsi) {
          
            const overlay = document.createElement('div');
            overlay.className = 'custom-alert-overlay';
            overlay.innerHTML = `
                <div class="custom-alert-box">
                    <div class="alert-title">Belum disimpan</div>
                    <div class="alert-buttons">
                        <button class="btn-alert btn-padam" id="alert-padam">PADAM</button>
                        <button class="btn-alert btn-simpan" id="alert-simpan">SIMPAN</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            document.getElementById('alert-simpan').onclick = () => {
                overlay.remove();
                saveCurrentLiturgi(); 
            };

            document.getElementById('alert-padam').onclick = () => {
                overlay.remove();
                keluarEditor(); 
            };
            
            return;
        }

        keluarEditor();
    };
}

function keluarEditor() {
    window.builderData = null;
    window.originalDataString = null;
    
    const saveBtn = document.getElementById('floating-save-btn');
    if (saveBtn) saveBtn.style.display = 'none';

    const styleTag = document.getElementById('editor-core-style');
    if (styleTag) styleTag.remove(); 
    
    const styleTagBuilder = document.getElementById('hide-tabbar-style');
    if (styleTagBuilder) styleTagBuilder.remove();

    if (typeof initLiturgiBuilder === "function") {
        initLiturgiBuilder(true);
    }
}

const saveBtn = document.getElementById('floating-save-btn');
        if (saveBtn) {
            const sections = (window.builderData && window.builderData.sections) ? window.builderData.sections : {};
            
            const adaIsiTeks = Object.values(sections).some(s => s.text && s.text.trim().length > 0);
            const adaLagu = Object.values(sections).some(s => s.picker && s.picker.trim().length > 0);

            if (adaIsiTeks || adaLagu) {
                saveBtn.style.setProperty('display', 'flex', 'important');
                saveBtn.style.setProperty('opacity', '1', 'important');
                saveBtn.style.setProperty('visibility', 'visible', 'important');
            } else {
                saveBtn.style.setProperty('display', 'none', 'important');
            }
        }
    }, 200); 
}

function toggleRef(idx, btn) {
    const ref = document.getElementById(`ref-${idx}`);
    const icon = btn.querySelector('.chevron-icon');
    
    if (ref.classList.contains('collapsed')) {
        ref.classList.remove('collapsed');
        ref.classList.add('expanded');
        icon.classList.add('rotate-180');
    } else {
        ref.classList.remove('expanded');
        ref.classList.add('collapsed');
        icon.classList.remove('rotate-180');
    }
}

window.handleLiveEdit = function(idx, field, value, fullContent = null) {
    if (!window.builderData) window.builderData = { sections: {} };
    if (!window.builderData.sections) window.builderData.sections = {};
    
    if (!window.builderData.sections[idx]) {
        window.builderData.sections[idx] = { text: '', picker: '', refExpanded: false, fullContent: '' };
    }
    
    window.builderData.sections[idx][field] = value;
    if (field === 'picker' && fullContent !== null) {
        window.builderData.sections[idx].fullContent = fullContent;
    }

    checkSaveButton();

    if (field === 'picker' && window.builderData.title) {
        setupLiturgiEditor(window.builderData.title, window.builderData.id);
        setTimeout(checkSaveButton, 300);
    }
};

window.togglePermanentSection = function(idx) {
    const content = document.getElementById(`permanent-content-${idx}`);
    const icon = document.getElementById(`icon-expand-${idx}`);
    if (content) {
        const isHidden = content.style.display === "none" || content.style.display === "";
        content.style.display = isHidden ? "block" : "none";
        if (icon) icon.style.transform = isHidden ? "rotate(180deg)" : "rotate(0deg)";
    }
};

function updateFloatingPickerBtn(book, chapter) {
    let btn = document.getElementById('floating-bible-picker');
    if (btn) btn.remove();

    if (window.selectedVerses && window.selectedVerses.length > 0) {
        btn = document.createElement('button');
        btn.id = 'floating-bible-picker';
        btn.style = "position:fixed; bottom:30px; left:50%; transform:translateX(-50%); padding:16px 32px; background:var(--primary); color:white; border:none; border-radius:50px; font-weight:900; z-index:99999; box-shadow:0 10px 25px rgba(0,0,0,0.4); cursor:pointer;";
        
        const sortedVerses = [...window.selectedVerses].sort((a, b) => a - b);
        const finalRef = `${book} ${chapter}:${sortedVerses.join(',')}`;
        btn.innerText = `PILIH ${finalRef}`;

        btn.onclick = () => {
            let htmlEntries = [];
            const bibleArray = (window.currentBibleData && window.currentBibleData.content) ? window.currentBibleData.content : (Array.isArray(window.currentBibleData) ? window.currentBibleData : []);

            sortedVerses.forEach(vNum => {
                let foundH = "";
                let foundT = "";
                const d = bibleArray.find(x => String(x.verse) === String(vNum));
                if (d) {
                    foundH = d.header || "";
                    foundT = d.text || "";
                } 
                else {
                    const allElements = document.querySelectorAll('div, span, p, .verse-row, .verse-item');
                    allElements.forEach(el => {
                        const txt = el.innerText.trim();
                        if (txt.startsWith(vNum + " ") || txt.startsWith(vNum + ".")) {
                            foundT = txt;
                            let prev = el.previousElementSibling;
                            if (prev && (prev.classList.contains('header') || prev.innerText.length < 60)) {
                                foundH = prev.innerText;
                            }
                        }
                    });
                }
                
                if (foundT) {
                    if (foundH) {
                        let cleanH = foundH.replace(/[\[\]]/g, "").trim().toUpperCase();
                        if (cleanH) htmlEntries.push(`<div class="bible-header">${cleanH}</div>`);
                    }
                    let cleanT = foundT.replace(/[\[\]]/g, "").trim();
                    htmlEntries.push(`<div class="bible-verse">${cleanT}</div>`);
                }
            });

            if (htmlEntries.length > 0) {
                const finalHtml = htmlEntries.join('\n');
    
                sendToEditor(finalRef, finalHtml);
                
                btn.remove();
                window.selectedVerses = []; 
            } else {
                console.log("Check window.currentBibleData:", window.currentBibleData);
            }
        };

        document.body.appendChild(btn);
    }
}

function pickPsalms(index) {
    window.currentPickerIdx = index; 
    currentType = 'psalms'; 

    const tabbar = document.getElementById('tabbar');
    if (tabbar) {
        tabbar.style.setProperty('display', 'none', 'important');
    }

    let hideStyle = document.getElementById('hide-tabbar-picker');
    if (!hideStyle) {
        hideStyle = document.createElement('style');
        hideStyle.id = 'hide-tabbar-picker';
        hideStyle.innerHTML = `#tabbar { display: none !important; }`;
        document.head.appendChild(hideStyle);
    }

    showListView(); 
}

function toggleVerse(element, verseNum) {

    element.classList.toggle('selected'); 

    if (!window.selectedVerses) window.selectedVerses = [];

    updateFloatingPickerBtn(window.currentBook, window.currentChapter);
}

function checkSaveButton() {
    const saveBtn = document.getElementById('floating-save-btn');
    if (!saveBtn) return;

    const sections = (window.builderData && window.builderData.sections) ? window.builderData.sections : {};
    
    const adaIsiTeks = Object.values(sections).some(s => s.text && s.text.trim().length > 0);
    const adaLagu = Object.values(sections).some(s => s.picker && s.picker.trim().length > 0);

    if (adaIsiTeks || adaLagu) {
        saveBtn.style.setProperty('display', 'flex', 'important');
        saveBtn.style.setProperty('visibility', 'visible', 'important');
        saveBtn.style.setProperty('opacity', '1', 'important');
        saveBtn.style.zIndex = "99999";
    } else {
        saveBtn.style.setProperty('display', 'none', 'important');
    }
}

function updateBuilderData(idx, type, value) {
    if (!builderData.sections) builderData.sections = {};
    if (!builderData.sections[idx]) builderData.sections[idx] = {};
    builderData.sections[idx][type] = value;
}

function saveCurrentLiturgi() {
    if (!window.builderData || !window.builderData.title) return;
    
    const sekarang = new Date();
    const tgl = sekarang.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }); 
    const jam = sekarang.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const tarikhMasa = `${tgl}, ${jam}`;

    const savedList = JSON.parse(localStorage.getItem('saved_liturgies') || '[]');
    const dataToSave = {
        id: window.builderData.id,
        title: window.builderData.title,
        date: tarikhMasa, 
        content: window.builderData.sections,
        timestamp: sekarang.getTime()
    };

    const index = savedList.findIndex(item => item.id === dataToSave.id);
    if (index !== -1) {
        savedList[index] = dataToSave;
    } else {
        savedList.push(dataToSave);
    }

    localStorage.setItem('saved_liturgies', JSON.stringify(savedList));
    const saveBtn = document.getElementById('floating-save-btn');
    if (saveBtn) {
        saveBtn.style.display = 'none';
    }

    const styleTag = document.getElementById('editor-core-style');
    if (styleTag) styleTag.remove();
    
    viewState = 'Home'; 
    if (typeof updateHeaderUI === "function") updateHeaderUI(false); 
    if (typeof initLiturgiBuilder === "function") initLiturgiBuilder();
    
    console.log(`"${dataToSave.title}" Berjaya Disimpan!`);
}

function deleteSavedLiturgi(id) {
    const oldOverlay = document.querySelector('.custom-alert-overlay');
    if (oldOverlay) oldOverlay.remove();

    const overlay = document.createElement('div');
    overlay.className = 'custom-alert-overlay';

    overlay.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:99999; display:flex; align-items:center; justify-content:center;";

    overlay.innerHTML = `
        <div class="custom-alert-box" style="background:var(--bg); padding:25px; border-radius:15px; text-align:center; min-width:280px; box-shadow:0 10px 30px rgba(0,0,0,0.5);">
            <div class="alert-title" style="margin-bottom: 20px; font-weight: bold; color:var(--text-main);">Padam liturgi ini?</div>
            <div class="alert-buttons" style="display:flex; justify-content:space-around; gap:10px;">
                <button class="btn-alert btn-batal" onclick="this.closest('.custom-alert-overlay').remove()" style="flex:1; padding:12px; border:none; border-radius:10px; background:#888; color:white;">BATAL</button>
                <button class="btn-alert btn-padam-confirm" id="confirm-del-liturgi" style="flex:1; background:#ff4444; color:white; padding:12px; border:none; border-radius:10px;">PADAM</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    setTimeout(() => {
        const btnPadam = document.getElementById('confirm-del-liturgi');
        if (btnPadam) {
            btnPadam.onclick = () => {
                let savedList = JSON.parse(localStorage.getItem('saved_liturgies') || '[]');
                savedList = savedList.filter(i => i.id !== id);
                localStorage.setItem('saved_liturgies', JSON.stringify(savedList));
                
                overlay.remove(); 
                if (typeof initLiturgiBuilder === "function") {
                    initLiturgiBuilder();
                }
            };
        }
    }, 50);
}

async function triggerPicker(type, sectionIdx, isBacking = false) {
    if (!isBacking) {
        pushAppState('picker');
    } else {
        viewState = 'picker';
    }
    window.currentPickerIdx = sectionIdx;
    window.selectedVerses = []; 
    let targetType = type.toLowerCase();
    if (targetType === 'psalms' || targetType === 'zabur' || targetType === 'psalm') {
        targetType = 'psalms';
    }
    
    window.currentType = targetType;
    if (typeof allItems === 'undefined' || allItems.length === 0) {
        if (typeof loadData === 'function') await loadData();
    }
    const searchArea = document.getElementById('search-area');
    if (searchArea) searchArea.style.display = 'flex';
    const tabbar = document.getElementById('tabbar');
    if (tabbar) {
        tabbar.classList.remove('hidden');
        tabbar.style.display = 'flex';
    }

    const navItems = document.querySelectorAll('.nav-item');

    if (window.currentType === 'bible') {
        changeCategory('bible', navItems[2]);
    } else {
        renderList(window.currentType);
        const ht = document.getElementById('header-title');
        if (ht) {
            const titles = { 'hymns': 'Longoi', 'psalms': 'Zabur' };
            ht.innerText = titles[window.currentType] || "Zabur";
        }
        updateHeaderUI(false);
        if (window.currentType === 'psalms') {
            changeCategory('psalms', navItems[1]);
        } else {
            changeCategory('hymns', navItems[0]);
        }
    }
    
    const backBtn = document.getElementById('back-button');
    if (backBtn) {
        backBtn.style.setProperty('display', 'flex', 'important'); 
        backBtn.onclick = function() { 

            const floatingBtn = document.getElementById('floating-bible-picker');
            if (floatingBtn) floatingBtn.remove();

            window.currentPickerIdx = null;

            if (searchArea) searchArea.style.display = 'none';
            if (tabbar) tabbar.style.display = 'none';

            window.currentType = 'liturgies';
            if (typeof currentType !== 'undefined') currentType = 'liturgies';

            if (window.builderData && window.builderData.title) {
                setupLiturgiEditor(window.builderData.title, window.builderData.id, true); 
            } else {
                if (typeof goBack === 'function') goBack();
                else history.back();
            }
        };
    }
}

function sendToEditor(title, content) {
    if (window.currentPickerIdx !== null) {
        let idLagu = (window.currentHymnId || "").trim(); 
        let cleanTitle = (title || "").trim();
        let displayTitle = "";
        const isNumber = /^\d+$/.test(idLagu); 

        if (isNumber) {
            displayTitle = `${idLagu}. ${cleanTitle}`;
        } else {
            if (idLagu && cleanTitle.toLowerCase().includes(idLagu.toLowerCase().replace('.', ''))) {
                displayTitle = cleanTitle; 
            } else {
                displayTitle = idLagu ? `${idLagu} ${cleanTitle}` : cleanTitle;
            }
        }
        if (!window.builderData.sections[window.currentPickerIdx]) {
            window.builderData.sections[window.currentPickerIdx] = { 
                text: '', picker: '', refExpanded: false, fullContent: '' 
            };
        }

        window.builderData.sections[window.currentPickerIdx].picker = displayTitle;
        window.builderData.sections[window.currentPickerIdx].fullContent = content;
        
        let savedIdx = window.currentPickerIdx;
        window.currentPickerIdx = null; 

        const header = document.getElementById('Liturgi');
        const ht = document.getElementById('Liturgi');
        if (header) { header.style.display = ''; header.style.justifyContent = ''; }
        if (ht) { ht.style.position = ''; ht.style.left = ''; ht.style.transform = ''; ht.innerText = "Liturgi"; }

        const oldBtn = document.getElementById('floating-bible-picker');
        if (oldBtn) oldBtn.remove();

        const searchArea = document.getElementById('search-area');
        if (searchArea) searchArea.style.display = 'none';
        const tabbar = document.getElementById('tabbar');
        if (tabbar) tabbar.style.display = 'none';

        window.isSelectingHymn = true; 
        viewState = 'editor';

        if (window.history && window.history.length > 1) {
            window.history.back();
        }
        
        setTimeout(() => {
            window.isSelectingHymn = false; 
            
            if (typeof setupLiturgiEditor === "function") {
                setupLiturgiEditor(window.builderData.title, window.builderData.id, true);
            } else if (typeof setupLiturgi === "function") {
                setupLiturgi(window.builderData.title, window.builderData.id, true);
            }

            const cards = document.querySelectorAll('.builder-card');
            if (cards[savedIdx]) cards[savedIdx].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
        
        return true;
    }
    return false;
}

function generateFinalAturcara() {
    let finalOutput = "ATURCARA IBADAH\n====================\n\n";
    const cards = document.querySelectorAll('.builder-card');
    
    cards.forEach((card, idx) => {
        const originalTextEl = card.querySelector('.original-liturgi-text') || card.querySelector('div[style*="font-weight:900"]');
        const originalText = originalTextEl ? originalTextEl.innerText : "Bahagian " + (idx + 1);
        
        finalOutput += `${originalText}\n`;

        if (builderData && builderData.sections && builderData.sections[idx]) {
            const sec = builderData.sections[idx];
            if (sec.text) {
                finalOutput += `[TAMBAHAN: ${sec.text}]\n`;
            }
            if (sec.picker) {
                finalOutput += `[PILIHAN: ${sec.picker}]\n`;
            }
        }
        finalOutput += "--------------------\n";
    });

    navigator.clipboard.writeText(finalOutput).then(() => {
        alert("Aturcara lengkap berjaya disalin ke Clipboard!");
    }).catch(err => {
        console.error("Gagal menyalin:", err);
        alert("Gagal menyalin teks ke clipboard.");
    });
}

function initFootnote(isBacking = false) {
    if (!isBacking) {
        pushAppState('footnote');
    } else {
        viewState = 'footnote';
    }
    const listContainer = document.getElementById("app-list");
    if (!listContainer) return;

    viewState = 'footnote';
    updateHeaderUI(true);
    if (document.getElementById('header-title')) document.getElementById('header-title').innerText = "Faves";
    if (document.getElementById('search-area')) document.getElementById('search-area').style.display = 'none';
    if (document.getElementById('tabbar')) document.getElementById('tabbar').classList.add('hidden');
    
    const hamburger = document.getElementById('main-menu-btn');
    if (hamburger) hamburger.style.setProperty('display', 'none', 'important');

    const backBtn = document.getElementById('back-button');
    if (backBtn) {
        backBtn.style.setProperty('display', 'flex', 'important');
        backBtn.onclick = function() { goBack(); };
    }

    const favs = JSON.parse(localStorage.getItem('myFavorites')) || [];
    const highs = JSON.parse(localStorage.getItem('myHighlights')) || {};
    const highKeys = Object.keys(highs).filter(key => {
        const item = highs[key];
        return item && (typeof item === 'object' ? item.color : item) !== 'transparent';
    });

    let html = `<div style="padding: 20px; min-height: 100vh; color: var(--text-main);">
                    <div style="font-weight:900; font-size:1.8rem; margin-bottom:30px;"></div>`;


      if (favs.length > 0) {
        html += `<div style="color:var(--primary); font-weight:800; font-size:1.1rem; text-transform:uppercase; margin-bottom:15px; opacity:1.1;">Faves</div><div style="margin-bottom:40px;">`;
        
        favs.forEach(item => {
            let labelKecil = "";
            if (item.type) {
                labelKecil = item.type;
            } else if (item.id && item.id.startsWith('p')) {
                labelKecil = "prayer";
            } else if (item.id && item.id.startsWith('z')) {
                labelKecil = "psalm";
            } else {
                labelKecil = "hymn";
            }

            html += `
    <div style="display:flex; align-items:center; border-bottom:1px solid rgba(255,255,255,0.05); padding:5px 0;">
        <div onclick="openDetail('${item.id}', '${labelKecil}')" style="flex:1; cursor:pointer; padding:10px 0;">
            <div style="font-weight:600; font-size:1.1rem;">${item.title}</div>
            <div style="font-size:0.8rem; color:var(--primary); opacity:1; text-transform:uppercase;">${labelKecil}</div>
        </div>
        <div onclick="removeFavFromFootnote('${item.id}', '${labelKecil}')" style="padding:15px; cursor:pointer; opacity:1; color:#ff4444;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
        </div>
    </div>`;

        });
        html += `</div>`;
    }

    if (highKeys.length > 0) {
        html += `<div style="color:var(--primary); font-weight:800; font-size:1.1rem; text-transform:uppercase; margin-bottom:15px; opacity:0.8;">Highlights</div>`;
        highKeys.forEach(vKey => {
            const parts = vKey.split('_'); 
            const data = highs[vKey];
            const color = (typeof data === 'object') ? data.color : data;
            const text = (typeof data === 'object') ? data.text : "...";
            
            html += `
    <div style="display:flex; align-items:flex-start; margin-bottom:25px; gap:10px;">
        <div onclick="renderBibleSpecificAuto('${parts[1]}', ${parseInt(parts[2]) - 1}, '${parts[3]}')" style="flex:1; cursor:pointer;">
            <span style="background:${color}; color:#000; padding:3px 6px; border-radius:4px; font-size:1.15rem; line-height:1.8;">${text}</span>
            <div style="font-weight:800; font-size:0.9rem; margin-top:10px; opacity:0.5;">${parts[1]} ${parts[2]}:${parts[3]}</div>
        </div>
        <div onclick="removeHighlightFromFootnote('${vKey}')" style="padding:10px; cursor:pointer; opacity:1; color:#ff4444;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
        </div>
    </div>`;

        });
    }

    if (favs.length === 0 && highKeys.length === 0) {
        html += `<div style="text-align:center; padding:100px 20px; opacity:0.2; font-size:0.8rem; text-transform:uppercase;">Tiada rekod disimpan</div>`;
    }

    html += `<div style="height:120px;"></div></div>`;
    listContainer.innerHTML = html;
    window.scrollTo(0,0);
}

 function removeFavFromFootnote(id, type) {
    const oldOverlay = document.querySelector('.custom-alert-overlay');
    if (oldOverlay) oldOverlay.remove();

    const overlay = document.createElement('div');
    overlay.className = 'custom-alert-overlay';
    overlay.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:99999; display:flex; align-items:center; justify-content:center;";

    overlay.innerHTML = `
        <div class="custom-alert-box" style="background:var(--bg); padding:25px; border-radius:15px; text-align:center; min-width:280px; box-shadow:0 10px 30px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1);">
            <div class="alert-title" style="margin-bottom: 20px; font-weight: bold; color:var(--text-main); font-size:1.1rem;">Padam dari Kegemaran?</div>
            <div class="alert-buttons" style="display:flex; justify-content:space-around; gap: 10px;">
                <button class="btn-alert btn-batal" onclick="this.closest('.custom-alert-overlay').remove()" style="flex:1; padding:12px; border:none; border-radius:10px; background:#888; color:white; font-weight:bold;">BATAL</button>
                <button class="btn-alert btn-padam-confirm" id="fav-confirm-btn" style="flex:1; background:#ff4444; color:white; padding:12px; border:none; border-radius:10px; font-weight:bold;">PADAM</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    setTimeout(() => {
        const btnConfirm = document.getElementById('fav-confirm-btn');
        if (btnConfirm) {
            btnConfirm.onclick = () => {
                let favs = JSON.parse(localStorage.getItem('myFavorites')) || [];
                favs = favs.filter(item => !(item.id == id && item.type == type));
                localStorage.setItem('myFavorites', JSON.stringify(favs));
                
                overlay.remove(); 
                
                if (typeof initFootnote === "function") {
                    initFootnote();
                }
            };
        }
    }, 50);
}

function removeHighlightFromFootnote(vKey) {
    const oldOverlay = document.querySelector('.custom-alert-overlay');
    if (oldOverlay) oldOverlay.remove();

    const overlay = document.createElement('div');
    overlay.className = 'custom-alert-overlay';
    
    overlay.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:99999; display:flex; align-items:center; justify-content:center;";

    overlay.innerHTML = `
        <div class="custom-alert-box" style="background:var(--bg); padding:20px; border-radius:15px; text-align:center; min-width:250px; box-shadow:0 10px 25px rgba(0,0,0,0.5);">
            <div class="alert-title" style="margin-bottom: 20px; font-weight: bold; color:var(--text-main);">Padam Highlight ini?</div>
            <div class="alert-buttons" style="display:flex; justify-content:space-around;">
                <button class="btn-alert btn-batal" onclick="this.closest('.custom-alert-overlay').remove()" style="padding:10px 20px; border:none; border-radius:8px; cursor:pointer;">BATAL</button>
                <button class="btn-alert btn-padam-confirm" id="confirm-padam-final" style="background:#ff4444; color:white; padding:10px 20px; border:none; border-radius:8px; cursor:pointer;">PADAM</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    setTimeout(() => {
        const btnPadam = document.getElementById('confirm-padam-final');
        if (btnPadam) {
            btnPadam.onclick = () => {
                let highs = JSON.parse(localStorage.getItem('myHighlights')) || {};
                delete highs[vKey]; 
                localStorage.setItem('myHighlights', JSON.stringify(highs));

                const el = document.getElementById(vKey);
                if (el) {
                    el.style.backgroundColor = "transparent";
                    el.style.color = "inherit";
                    el.style.backgroundImage = "none";
                }

                overlay.remove(); 
                
                if (typeof initFootnote === "function") {
                    initFootnote(); 
                }
            };
        }
    }, 50);
}

function toggleFavorite(id, type) {
    const uniqueId = type + "_" + id;
    let favorites = JSON.parse(localStorage.getItem('myFavorites')) || [];
    
    const index = favorites.findIndex(f => String(f.uniqueId) === String(uniqueId));
    const btn = document.getElementById('fav-btn-' + uniqueId);

    if (index > -1) {
        favorites.splice(index, 1);
        if (btn) btn.querySelector('svg').setAttribute('fill', 'none');
    } else {

        const itemData = allItems.find(i => String(i.id) === String(id) && i.type === type);
        
        if (itemData) {
            favorites.push({ 
                uniqueId: uniqueId, 
                id: itemData.id,
                type: itemData.type,
                title: itemData.title, 
                text: itemData.content || "", 
                footnote: itemData.footnote || "" 
            });
            if (btn) btn.querySelector('svg').setAttribute('fill', '#007bff');
        }
    }

    localStorage.setItem('myFavorites', JSON.stringify(favorites));
}

function applyHighlight(color) {
    const el = document.getElementById(currentSelectedKey); 
    if (!el) return;
    const highs = JSON.parse(localStorage.getItem('myHighlights')) || {};
    if (color === 'transparent') {
        delete highs[currentSelectedKey];
        el.style.background = "transparent";
        el.style.color = "inherit"; 
    } else {
        const verseText = el.innerText.replace(/^[0-9]+\s*/, "").trim();
        highs[currentSelectedKey] = {
            color: color,
            text: verseText
        };
        el.style.background = color;
        el.style.color = "#000"; 
        el.style.borderRadius = "4px";
    }

    localStorage.setItem('myHighlights', JSON.stringify(highs));

    const popup = document.getElementById('highlight-popup');
    if (popup) popup.style.display = 'none';
}

function resetAppKeras() {
    const overlay = document.createElement('div');
    overlay.className = 'custom-alert-overlay';
    overlay.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:99999; display:flex; align-items:center; justify-content:center;";

    overlay.innerHTML = `
        <div class="custom-alert-box" style="background:var(--bg); padding:25px; border-radius:15px; text-align:center; min-width:280px; box-shadow:0 10px 30px rgba(0,0,0,0.5);">
            <div class="alert-title" style="margin-bottom: 10px; font-weight: bold; color:#ff4444;">AMARAN KERAS!</div>
            <div style="margin-bottom: 20px; color:var(--text-main); font-size:0.9rem;">Ini akan memadam SEMUA rekod Highlight, Faves, dan Cache. Anda pasti?</div>
            <div class="alert-buttons" style="display:flex; justify-content:space-around; gap:10px;">
                <button onclick="this.closest('.custom-alert-overlay').remove()" style="flex:1; padding:12px; border:none; border-radius:10px; background:#888; color:white;">BATAL</button>
                <button id="confirm-reset-btn" style="flex:1; background:#ff4444; color:white; padding:12px; border:none; border-radius:10px; font-weight:bold;">YA, RESET</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('confirm-reset-btn').onclick = () => {
        localStorage.clear();
        sessionStorage.clear();
        caches.keys().then(names => {
            for (let name of names) caches.delete(name);
        });

        overlay.remove();
        location.reload();
    };
}

let appHistoryStack = [];
let lastBackTime = 0; 

function pushAppState(view) {
    if (viewState !== view) {
        appHistoryStack.push(viewState);
    }
    viewState = view;
    history.pushState({ view: view }, "");
}

function goBack() {
    history.back();
}

window.onpopstate = function(event) {

    const currentTime = Date.now();
    if (currentTime - lastBackTime < 400) {
        history.pushState({ view: viewState }, "");
        return;
    }
    lastBackTime = currentTime;

    if (window.isSelectingHymn === true || window.isExitingEditor === true) {
        window.isSelectingHymn = false;
        window.isExitingEditor = false;
        return; 
    }

    const dropdown = document.getElementById('app-dropdown');
    if (dropdown && dropdown.style.display === 'block') {
        dropdown.style.display = 'none';
        history.replaceState({ view: viewState }, ""); 
        return;
    }

    const popup = document.getElementById('highlight-popup');
    if (popup && popup.style.display === 'block') {
        popup.style.display = 'none';
        history.replaceState({ view: viewState }, "");
        return;
    }

    if (viewState === 'list' && window.currentPickerIdx === null && window.isSelectingHymn !== true) {
        history.pushState({ view: 'list' }, "");

        if (document.querySelector('.custom-alert-overlay')) return;

        const overlay = document.createElement('div');
        overlay.className = 'custom-alert-overlay';
        overlay.innerHTML = `
            <div class="custom-alert-box">
                <div class="alert-title">Keluar dari aplikasi?</div>
                <div class="alert-buttons">
                    <button class="btn-alert btn-padam" id="alert-batal-keluar">BATAL</button>
                    <button class="btn-alert" style="background-color: #dc3545 !important; color: white !important;" id="alert-sah-keluar">KELUAR</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        document.getElementById('alert-batal-keluar').onclick = () => {
            overlay.remove();
            viewState = 'list';
        };

        document.getElementById('alert-sah-keluar').onclick = () => {
        overlay.remove();

    if (typeof navigator !== 'undefined' &&   navigator.app && navigator.app.exitApp) {
        navigator.app.exitApp();
    } 
    else if (window.navigator && window.navigator.device && window.navigator.device.exitApp) {
        window.navigator.device.exitApp();
    } 

    else {
        window.close(); 
        window.open('', '_self', '');
        window.close();

        setTimeout(() => {
            window.location.replace("about:blank");
                }, 150);
            }
        };
        return; 
    }

    if (viewState === 'editor') {
        const sections = (window.builderData && window.builderData.sections) ? window.builderData.sections : {};
        const adaIsi = Object.values(sections).some(s => 
            (s.text && s.text.trim().length > 0) || (s.picker && s.picker.trim().length > 0)
        );

        if (adaIsi) {
            history.pushState({ view: 'editor' }, "");

            if (document.querySelector('.custom-alert-overlay')) return;

            const overlay = document.createElement('div');
            overlay.className = 'custom-alert-overlay';
            overlay.innerHTML = `
                <div class="custom-alert-box">
                    <div class="alert-title">Belum disimpan</div>
                    <div class="alert-buttons">
                        <button class="btn-alert btn-padam" id="alert-padam">PADAM</button>
                        <button class="btn-alert btn-simpan" id="alert-simpan">SIMPAN</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            document.getElementById('alert-simpan').onclick = () => {
                overlay.remove();
                if (typeof saveCurrentLiturgi === 'function') {
                    saveCurrentLiturgi();
                }
            };

            document.getElementById('alert-padam').onclick = () => {
                overlay.remove();
                
                window.isExitingEditor = true; 
                viewState = 'builder'; 

                if (window.builderData) {
                    window.builderData.sections = {}; 
                    window.builderData.title = "";
                    window.builderData.id = null;
                }

                if (window.history && window.history.replaceState) {
                    window.history.replaceState({ view: 'builder' }, '', '');
                }

                if (typeof prosesBersihDanKeluar === 'function') {
                    prosesBersihDanKeluar();
                } else if (typeof keluarEditor === 'function') {
                    keluarEditor();
                } else if (typeof initLiturgiBuilder === 'function') {
                    initLiturgiBuilder(true);
                }
            };
            
            return; 
        }
    }

    const targetState = (event.state && event.state.view) ? event.state.view : 'list';

    if (window.currentPickerIdx !== null) {
        if (targetState === 'chapters' || targetState === 'bible-content' || targetState === 'verses') {

        } else {
            const floatingBtn = document.getElementById('floating-bible-picker');
            if (floatingBtn) floatingBtn.remove();
            window.currentPickerIdx = null;
            
            if (document.getElementById('search-area')) document.getElementById('search-area').style.display = 'none';
            if (document.getElementById('tabbar')) document.getElementById('tabbar').style.display = 'none';

            if (window.builderData) {
                if (typeof setupLiturgiEditor === "function") {
                    setupLiturgiEditor(window.builderData.title, window.builderData.id, true);
                } else if (typeof setupLiturgi === "function") {
                    setupLiturgi(window.builderData.title, window.builderData.id, true);
                }
            }

            if (typeof initLiturgiBuilder === "function") {
                initLiturgiBuilder(true);
            }

            viewState = 'editor';
            history.replaceState({ view: 'editor' }, "");
            return; 
        }
    }

    viewState = targetState;

    if (targetState === 'chapters') {
        if (typeof openBibleChapters === "function" && window.currentBookId) {
            openBibleChapters(window.currentBookId, true);
        }
    } 
    else if (targetState === 'bible-content' || targetState === 'verses') {
        if (typeof renderBibleVersesAuto === "function" && window.currentBookId) {
            renderBibleVersesAuto(window.currentBookId, window.currentChapterIndex || 0, true); 
        }
    } 
    else if (targetState === 'detail') {
        if (window.currentDetailId && window.currentDetailType) {
            openDetail(window.currentDetailId, window.currentDetailType, true);
        } else {
            viewState = 'list';
            showListView(true);
        }
    }
    else if (targetState === 'footnote') {
        if (typeof initFootnote === "function") {
            initFootnote(true);
        }
    } 
    else if (targetState === 'builder') {
        if (typeof initLiturgiBuilder === "function") {
            initLiturgiBuilder(true); 
        }
    }
    else if (targetState === 'picker') {
        if (typeof triggerPicker === "function") {
            triggerPicker(window.currentType, window.currentPickerIdx, true);
        }
    }
    else if (targetState === 'editor') {
        if (window.builderData) {
            if (typeof setupLiturgiEditor === "function") {
                setupLiturgiEditor(window.builderData.title, window.builderData.id, true);
            } else if (typeof setupLiturgi === "function") {
                setupLiturgi(window.builderData.title, window.builderData.id, true);
            }
        }
    }
    else if (targetState === 'list') {
        const styleTag = document.getElementById('hide-tabbar-style');
        if (styleTag) {
            styleTag.remove();
        }

        if (typeof showListView === "function") {
            showListView(true);
        }
        if (typeof updateHeaderUI === "function") {
            updateHeaderUI(false); 
        }

        if (document.getElementById('search-area')) {
            document.getElementById('search-area').style.display = 'flex';
        }
        if (document.getElementById('tabbar')) {
            document.getElementById('tabbar').classList.remove('hidden');
            document.getElementById('tabbar').style.setProperty('display', 'flex', 'important');
        }
        
        const hamburger = document.getElementById('main-menu-btn');
        if (hamburger) {
            hamburger.style.setProperty('display', 'flex', 'important');
        }
        
        const backBtn = document.getElementById('back-button');
        if (backBtn) {
            backBtn.style.setProperty('display', 'none', 'important');
        }

        const titles = { 'hymns': 'Longoi', 'bible': 'Alkitab', 'psalms': 'Zabur', 'prayers': 'Doa', 'liturgies': 'Hoturan', 'others': 'Vokon' };
        if (document.getElementById('header-title')) {
            document.getElementById('header-title').innerText = titles[currentType] || "";
        }
        window.scrollTo(0, 0);
    }
};

window.addEventListener('load', () => {
    history.replaceState({ view: 'list' }, "");
    loadData();
});

function paksaTutupWindow() {
    window.close();
    window.open('', '_self', '');
    window.close();
    setTimeout(() => {
        window.location.replace("about:blank");
    }, 100);
}

