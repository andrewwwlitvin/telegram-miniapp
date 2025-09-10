// Initialize Telegram Web App
let tg = window.Telegram.WebApp;
tg.expand();

// Global variables
let btcPriceData = [];
let priceChart;
let userBalance = 1000; // Starting balance for demo

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadBTCPrice();
    setInterval(loadBTCPrice, 30000); // Update every 30 seconds
});

function initializeApp() {
    // Set up Telegram theme
    document.body.style.backgroundColor = tg.backgroundColor;
    
    // Load user data
    loadUserData();
    
    // Set up main button
    tg.MainButton.text = "Start Trading (Demo)";
    tg.MainButton.show();
    tg.MainButton.onClick(() => {
        tg.showAlert("Trading feature coming soon! This is a learning demo.");
    });
}

function loadUserData() {
    const user = tg.initDataUnsafe?.user;
    
    if (user) {
        // Display user info
        document.getElementById('userName').textContent = user.first_name + (user.last_name ? ' ' + user.last_name : '');
        document.getElementById('userId').textContent = `ID: ${user.id}`;
        
        // Set user avatar
        const avatar = document.getElementById('userAvatar');
        if (user.photo_url) {
            avatar.innerHTML = `<img src="${user.photo_url}" style="width:100%;height:100%;border-radius:50%;">`;
        } else {
            avatar.textContent = user.first_name.charAt(0).toUpperCase();
        }
        
        // Send user data to your bot (optional)
        console.log('User data loaded:', user);
    } else {
        // Fallback for testing outside Telegram
        document.getElementById('userName').textContent = 'Demo User';
        document.getElementById('userId').textContent = 'ID: demo123';
        document.getElementById('userAvatar').textContent = 'D';
    }
    
    // Update balance display
    document.getElementById('userBalance').textContent = `${userBalance} USDT`;
}

async function loadBTCPrice() {
    try {
        // Using Jupiter API for BTC price
        const response = await fetch('https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=1000000000');
        const data = await response.json();
        
        // Note: This gets SOL price. For BTC, you'd need different mint addresses
        // For demo purposes, we'll simulate BTC price
        const btcPrice = Math.random() * (65000 - 60000) + 60000; // Simulate BTC price between 60k-65k
        const priceChange = (Math.random() - 0.5) * 1000; // Random change
        
        updatePriceDisplay(btcPrice, priceChange);
        updateChart(btcPrice);
        
    } catch (error) {
        console.error('Error fetching BTC price:', error);
        // Fallback: show simulated data
        const btcPrice = Math.random() * (65000 - 60000) + 60000;
        const priceChange = (Math.random() - 0.5) * 1000;
        updatePriceDisplay(btcPrice, priceChange);
    }
}

function updatePriceDisplay(price, change) {
    const priceElement = document.getElementById('btcPrice');
    const changeElement = document.getElementById('priceChange');
    
    priceElement.textContent = `$${price.toLocaleString('en-US', {maximumFractionDigits: 2})}`;
    
    const changePercent = (change / price * 100).toFixed(2);
    changeElement.textContent = `${change > 0 ? '+' : ''}${changePercent}%`;
    changeElement.className = `price-change ${change > 0 ? 'positive' : 'negative'}`;
}

function updateChart(price) {
    btcPriceData.push(price);
    if (btcPriceData.length > 20) {
        btcPriceData.shift(); // Keep only last 20 data points
    }
    
    drawChart();
}

function drawChart() {
    const canvas = document.getElementById('priceChart');
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (btcPriceData.length < 2) return;
    
    // Find min and max for scaling
    const minPrice = Math.min(...btcPriceData);
    const maxPrice = Math.max(...btcPriceData);
    const priceRange = maxPrice - minPrice || 1;
    
    // Draw chart line
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    btcPriceData.forEach((price, index) => {
        const x = (index / (btcPriceData.length - 1)) * canvas.width;
        const y = canvas.height - ((price - minPrice) / priceRange) * canvas.height;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // Add grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
        const y = (canvas.height / 4) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function setupEventListeners() {
    // Telegram Stars deposit
    document.getElementById('depositStars').addEventListener('click', () => {
        tg.showPopup({
            title: "Deposit Stars",
            message: "This feature will integrate with Telegram Stars payment system.",
            buttons: [
                {id: 'cancel', type: 'cancel'},
                {id: 'deposit', type: 'default', text: 'Continue'}
            ]
        }, (buttonId) => {
            if (buttonId === 'deposit') {
                // Here you would integrate with Telegram Stars API
                tg.showAlert("Stars deposit integration coming soon!");
            }
        });
    });
    
    // TON Wallet deposit
    document.getElementById('depositTon').addEventListener('click', () => {
        tg.showPopup({
            title: "Connect TON Wallet",
            message: "This will connect to your TON wallet for deposits.",
            buttons: [
                {id: 'cancel', type: 'cancel'},
                {id: 'connect', type: 'default', text: 'Connect Wallet'}
            ]
        }, (buttonId) => {
            if (buttonId === 'connect') {
                // Here you would integrate with TON Connect
                connectTonWallet();
            }
        });
    });
}

function connectTonWallet() {
    // TON Connect integration would go here
    // For demo purposes, we'll simulate a connection
    tg.showAlert("TON Wallet connection coming in next tutorial!");
    
    // Simulate adding funds
    setTimeout(() => {
        userBalance += 100;
        document.getElementById('userBalance').textContent = `${userBalance} USDT`;
        tg.showAlert("Demo: Added 100 USDT to your balance!");
    }, 2000);
}

// Handle back button
tg.BackButton.onClick(() => {
    tg.close();
});

// Send data to bot when needed
function sendDataToBot(data) {
    tg.sendData(JSON.stringify(data));
}

// Haptic feedback for better UX
function triggerHaptic() {
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
}

// Add haptic feedback to buttons
document.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        triggerHaptic();
    }
});
