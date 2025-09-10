let tg = window.Telegram.WebApp;
tg.expand();
tg.disableVerticalSwipes();

let currentTradingPair = '';
let priceData = {};
let chartData = [];
let chartColors = {
    'BTC-USDT': '#ffd700',
    'ETH-USDT': '#5b21b6',
    'SOL-USDT': '#06b6d4'
};

// Jupiter API token addresses
const tokenMints = {
    'BTC': 'So11111111111111111111111111111111111111112', // Using SOL as BTC placeholder
    'ETH': 'So11111111111111111111111111111111111111112', // Using SOL as ETH placeholder  
    'SOL': 'So11111111111111111111111111111111111111112',
    'USDT': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
};

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadAllPrices();
    setInterval(loadAllPrices, 5000); // Update every 5 seconds
});

function initializeApp() {
    const user = tg.initDataUnsafe?.user;
    if (user) {
        document.getElementById('userName').textContent = user.first_name;
    } else {
        document.getElementById('userName').textContent = 'Demo User';
    }
}

async function loadAllPrices() {
    try {
        const pairs = ['BTC-USDT', 'ETH-USDT', 'SOL-USDT'];
        
        for (const pair of pairs) {
            const [base] = pair.split('-');
            const inputMint = tokenMints[base];
            const outputMint = tokenMints['USDT'];
            
            // Get quote from Jupiter API
            const response = await fetch(
                `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=1000000&slippageBps=50`
            );
            
            if (response.ok) {
                const data = await response.json();
                const price = parseFloat(data.outAmount) / 1000000; // Convert from micro units
                
                // Calculate simulated change for demo (in real app, you'd compare with previous price)
                const change = (Math.random() - 0.5) * 5;
                
                priceData[pair] = { price, change };
            } else {
                // Fallback to simulated data if API fails
                priceData[pair] = {
                    price: pair === 'BTC-USDT' ? 63000 : pair === 'ETH-USDT' ? 3200 : 140,
                    change: (Math.random() - 0.5) * 5
                };
            }
        }

        // Update home screen prices
        document.getElementById('btcPrice').textContent = `${priceData['BTC-USDT'].price.toFixed(2)}`;
        document.getElementById('ethPrice').textContent = `${priceData['ETH-USDT'].price.toFixed(2)}`;
        document.getElementById('solPrice').textContent = `${priceData['SOL-USDT'].price.toFixed(2)}`;

        // Update trading screen if open
        if (currentTradingPair) {
            updateTradingScreen();
        }

    } catch (error) {
        console.error('Error loading prices:', error);
        // Use fallback simulated data
        priceData['BTC-USDT'] = { price: 63000, change: 0 };
        priceData['ETH-USDT'] = { price: 3200, change: 0 };
        priceData['SOL-USDT'] = { price: 140, change: 0 };
    }
}

function openTradingScreen(pair) {
    currentTradingPair = pair;
    document.getElementById('homeScreen').classList.add('hidden');
    document.getElementById('tradingScreen').classList.add('active');
    document.getElementById('currentPair').textContent = pair;
    
    chartData = [];
    updateTradingScreen();
    
    tg.HapticFeedback?.impactOccurred('medium');
}

function goHome() {
    document.getElementById('homeScreen').classList.remove('hidden');
    document.getElementById('tradingScreen').classList.remove('active');
    currentTradingPair = '';
    
    tg.HapticFeedback?.impactOccurred('light');
}

function updateTradingScreen() {
    if (!currentTradingPair || !priceData[currentTradingPair]) return;

    const data = priceData[currentTradingPair];
    
    document.getElementById('tradingPrice').textContent = `$${data.price.toFixed(2)}`;
    
    const changeElement = document.getElementById('tradingChange');
    changeElement.textContent = `${data.change > 0 ? '+' : ''}${data.change.toFixed(2)}%`;
    changeElement.className = `price-change ${data.change > 0 ? 'positive' : 'negative'}`;

    // Add to chart data
    chartData.push(data.price);
    if (chartData.length > 60) { // Keep last hour (assuming 1 point per minute)
        chartData.shift();
    }

    drawChart();
}

function drawChart() {
    const canvas = document.getElementById('priceChart');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    
    ctx.clearRect(0, 0, width, height);

    if (chartData.length < 2) return;

    const minPrice = Math.min(...chartData);
    const maxPrice = Math.max(...chartData);
    const priceRange = maxPrice - minPrice || 1;

    ctx.strokeStyle = chartColors[currentTradingPair];
    ctx.lineWidth = 2;
    ctx.beginPath();

    chartData.forEach((price, index) => {
        const x = (index / (chartData.length - 1)) * width;
        const y = height - ((price - minPrice) / priceRange) * height;

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.stroke();
}

function depositStars() {
    tg.showAlert('Stars deposit feature coming soon!');
    tg.HapticFeedback?.impactOccurred('medium');
}

function depositTon() {
    tg.showAlert('TON deposit feature coming soon!');
    tg.HapticFeedback?.impactOccurred('medium');
}
