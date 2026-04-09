# Longoi Kristian Web App

A minimalist, high-performance web application designed for viewing and searching hymns, psalms, and prayers. Optimized for a seamless mobile experience with a focus on clean UI/UX and rapid navigation.


Access the web-app here:

**[https://fibieoj96-beep.github.io/Longoi-Kristian/]**

---

## Features
* **Dynamic Categories:** Seamlessly switch between **Longoi** (Hymns), **Zabur** (Psalms), **Doa** (Prayers), and **Hoturan** (Liturgies).
* **Smart Search Bar:** * **Icon-Only State:** Pinned to the right to keep the header clean.
    * **Adaptive Expansion:** Expands to 40% width on tap with auto-focus.
    * **Scroll-to-Hide:** Automatically collapses back to a circle when scrolling to maximize screen real estate.
* **Theme Persistence:** Integrated Dark Mode that saves your preference to `localStorage`.
* **Contextual Header:** Dynamic alignment that shifts the title from left-aligned (browsing) to center-aligned (reading lyrics).
* **Mobile-First Design:** Optimized for iOS and iPadOS devices.

---

## How to Add to Home Screen (Safari/Chrome)
For the best experience (removing the browser address bar and footer), follow these steps:

1.  Open the **web-app** link in **Safari/Chrome**.
2.  Tap the **Share** button (square with an upward arrow).
3.  Scroll down and select **"Add to Home Screen"**.
4.  Name the app (e.g., "Longoi Kristian") and tap **Add**.
5.  The app will now appear on your Home Screen as a native-style icon.

## Interface Preview

| Main Interface (Light) | Dark Mode |
| :---: | :---: |
| <img src="screenshots/main_ui.png" width="250"> | <img src="screenshots/dark_mode.png" width="250"> |

---

## 📁 Struktur Projek (Project Structure)
```text
├── assert/             # Icon sources
│   └── icon/           # PWA Icons 
├── data/               # Modular JSON data sources
│   ├── bible/          # Bible Modular
│   ├── hymns.json      
│   ├── psalms.json     
│   ├── bible.json      # Bible
│   ├── prayers.json    
│   ├── liturgies.json  
│   ├── manifest.json   # Configuration PWA
│   └── others.json     # 
├── index.html          # Entry point (Main Layout)
├── style.css           # UI Styling & Adjustments
└── script.js           # Core Logic


##Technical Overview
Core: Vanilla JavaScript (ES6+), HTML5, CSS3.

Layout: Flexbox with absolute-positioning for UI transitions.

Data Handling: Asynchronous fetch API for modular loading of religious texts.

Optimization: cubic-bezier transitions for smooth hardware-accelerated animations.
