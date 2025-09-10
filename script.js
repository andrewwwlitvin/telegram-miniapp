// Initialize Telegram Web App
let tg = window.Telegram.WebApp;
tg.expand();
tg.disableVerticalSwipes();

// Global variables
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
    'BTC': '3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh',
    'ETH': '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs',
    'SOL': 'So11111111111111111111111111111111111111112',
    'USDT': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    initializeApp();
    loadAllPrices();
    setInterval(loadAllPrices, 5000);
});

function initializeApp() {
    console.log('Initializing app...');
    
    const user = tg.initDataUnsafe?.user;
    if (user) {
        document.getElementById('userName').textContent = user.first_name;
        console.log('User loaded:', user.first_name);
    } else {
        document.getElementById('userName').textContent = 'Demo User';
        console.log('Demo mode - no Telegram user data');
    }
}

async function loadAllPrices() {
    console.log('Loading prices...');
    
    try {
        // Use simulated data for reliable testing
        priceData['BTC-USDT'] = {
            price: 63000 + (Math.random() - 0.5) * 2000,
            change: (Math.random() - 0.5) * 10
        };
        priceData['ETH-USDT'] = {
            price: 3200 + (Math.random() - 0.5) * 200,
            change: (Math.random() - 0.5) * 8
        };
        priceData['SOL-USDT'] = {
            price: 140 + (Math.random() - 0.5) * 20,
            change: (Math.random() - 0.5) * 6
        };

        // Update home screen prices
        const btcElement = document.getElementById('btcPrice');
        const ethElement = document.getElementById('ethPrice');
        const solElement = document.getElementById('solPrice');
        
        if (btcElement) btcElement.textContent = `$${priceData['BTC-USDT'].price.toFixed(2)}`;
        if (ethElement) ethElement.textContent = `$${priceData['ETH-USDT'].price.toFixed(2)}`;
        if (solElement) solElement.textContent = `$${priceData['SOL-USDT'].price.toFixed(2)}`;

        console.log('Prices updated successfully');

        // Update trading screen if open
        if (currentTradingPair) {
            updateTradingScreen();
        }

    } catch (error) {
        console.error('Error loading prices:', error);
    }
}

function openTradingScreen(pair) {
    console.log('Opening trading screen for:', pair);
    
    try {
        currentTradingPair = pair;
        
        // Hide home screen
        const homeScreen = document.getElementById('homeScreen');
        if (homeScreen) {
            homeScreen.classList.add('hidden');
        }
        
        // Show trading screen
        const tradingScreen = document.getElementById('tradingScreen');
        if (tradingScreen) {
            tradingScreen.classList.add('active');
        }
        
        // Update pair title
        const currentPairElement = document.getElementById('currentPair');
        if (currentPairElement) {
            currentPairElement.textContent = pair;
        }
        
        // Reset chart data for new pair
        chartData = [];
        
        // Update trading screen data
        updateTradingScreen();
        
        // Haptic feedback
        if (tg.HapticFeedback) {
            tg.HapticFeedback.impactOccurred('medium');
        }
        
        console.log('Trading screen opened successfully');
        
    } catch (error) {
        console.error('Error opening trading screen:', error);
    }
}

function goHome() {
    console.log('Going home...');
    
    try {
        // Show home screen
        const homeScreen = document.getElementById('homeScreen');
        if (homeScreen) {
            homeScreen.classList.remove('hidden');
        }
        
        // Hide trading screen
        const tradingScreen = document.getElementById('tradingScreen');
        if (tradingScreen) {
            tradingScreen.classList.remove('active');
        }
        
        // Reset current pair
        currentTradingPair = '';
        
        // Haptic feedback
        if (tg.HapticFeedback) {
            tg.HapticFeedback.impactOccurred('light');
        }
        
        console.log('Returned to home screen');
        
    } catch (error) {
        console.error('Error going home:', error);
    }
}

function updateTradingScreen() {
    if (!currentTradingPair || !priceData[currentTradingPair]) {
        console.log('No trading pair data available');
        return;
    }

    try {
        const data = priceData[currentTradingPair];
        
        // Update price display
        const priceElement = document.getElementById('tradingPrice');
        if (priceElement) {
            priceElement.textContent = `$${data.price.toFixed(2)}`;
        }
        
        // Update price change
        const changeElement = document.getElementById('tradingChange');
        if (changeElement) {
            changeElement.textContent = `${data.change > 0 ? '+' : ''}${data.change.toFixed(2)}%`;
            changeElement.className = `price-change ${data.change > 0 ? 'positive' : 'negative'}`;
        }

        // Add to chart data
        chartData.push(data.price);
        if (chartData.length > 60) { // Keep last 60 points (5 minutes)
            chartData.shift();
        }

        // Draw chart
        drawChart();
        
        console.log('Trading screen updated');
        
    } catch (error) {
        console.error('Error updating trading screen:', error);
    }
}

function drawChart() {
    try {
        const canvas = document.getElementById('priceChart');
        if (!canvas) {
            console.log('Chart canvas not found');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        // Set canvas size for high DPI
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * 2;
        canvas.height = rect.height * 2;
        ctx.scale(2, 2);
        
        const width = rect.width;
        const height = rect.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        if (chartData.length < 2) {
            // Show "Collecting data..." message
            ctx.fillStyle = '#666';
            ctx.font = '14px system-ui';
            ctx.textAlign = 'center';
            ctx.fillText('Collecting data...', width / 2, height / 2);
            return;
        }

        // Calculate price range
        const minPrice = Math.min(...chartData);
        const maxPrice = Math.max(...chartData);
        const priceRange = maxPrice - minPrice || 1;
        const padding = 10;

        // Draw chart line
        ctx.strokeStyle = chartColors[currentTradingPair] || '#ffd700';
        ctx.lineWidth = 2;
        ctx.beginPath();

        chartData.forEach((price, index) => {
            const x = padding + (index / (chartData.length - 1)) * (width - 2 * padding);
            const y = padding + (1 - (price - minPrice) / priceRange) * (height - 2 * padding);

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();
        
        // Draw current price dot
        if (chartData.length > 0) {
            const lastPrice = chartData[chartData.length - 1];
            const x = width - padding;
            const y = padding + (1 - (lastPrice - minPrice) / priceRange) * (height - 2 * padding);
            
            ctx.fillStyle = chartColors[currentTradingPair] || '#ffd700';
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();
        }
        
    } catch (error) {
        console.error('Error drawing chart:', error);
    }
}

function depositStars() {
    console.log('Stars deposit clicked');
    
    if (tg.showAlert) {
        tg.showAlert('Stars deposit feature coming soon!');
    } else {
        alert('Stars deposit feature coming soon!');
    }
    
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
    }
}

function depositTon() {
    console.log('TON deposit clicked');
    
    if (tg.showAlert) {
        tg.showAlert('TON deposit feature coming soon!');
    } else {
        alert('TON deposit feature coming soon!');
    }
    
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
    }
}

// Global error handler
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
});

// Make functions globally available
window.openTradingScreen = openTradingScreen;
window.goHome = goHome;
window.depositStars = depositStars;
window.depositTon = depositTon;

console.log('Script loaded successfully');
