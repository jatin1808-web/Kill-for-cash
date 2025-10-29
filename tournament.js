// Tournament Configuration
const tournamentTiers = {
    bronze: { 
        name: "Bronze", 
        entryFee: 50, 
        entryCoins: 50, 
        perKill: 20,
        color: "yellow",
        time: "7:00 PM - 9:00 PM"
    },
    silver: { 
        name: "Silver", 
        entryFee: 100, 
        entryCoins: 100, 
        perKill: 40,
        color: "gray", 
        time: "7:00 PM - 9:00 PM"
    },
    gold: { 
        name: "Gold", 
        entryFee: 250, 
        entryCoins: 250, 
        perKill: 100,
        color: "yellow",
        time: "7:00 PM - 9:00 PM"
    },
    diamond: { 
        name: "Diamond", 
        entryFee: 500, 
        entryCoins: 500, 
        perKill: 200,
        color: "blue",
        time: "7:00 PM - 9:00 PM"
    },
    elite: { 
        name: "Elite", 
        entryFee: 1000, 
        entryCoins: 1000, 
        perKill: 400,
        color: "purple",
        time: "7:00 PM - 9:00 PM"
    }
};

// Coin Packages
const coinPackages = {
    basic: { price: 80, coins: 80, bonus: 0 },
    popular: { price: 200, coins: 200, bonus: 0 },
    pro: { price: 500, coins: 500, bonus: 0 },
    elite: { price: 1000, coins: 1000, bonus: 0 },
    whale: { price: 2000, coins: 2000, bonus: 0 }
};

// Load Tournaments on Page
function loadTournaments() {
    const container = document.getElementById('tournament-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    Object.keys(tournamentTiers).forEach(tier => {
        const tournament = tournamentTiers[tier];
        const tournamentCard = createTournamentCard(tier, tournament);
        container.innerHTML += tournamentCard;
    });
    
    // Add event listeners to register buttons
    setTimeout(() => {
        document.querySelectorAll('.register-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const tier = this.getAttribute('data-tier');
                registerForTournament(tier);
            });
        });
    }, 100);
}

// Create Tournament Card HTML
function createTournamentCard(tier, tournament) {
    return `
        <div class="bg-gray-800 rounded-lg p-6 border-2 border-${tournament.color}-500 transform hover:scale-105 transition duration-300">
            <div class="text-center">
                <h3 class="text-2xl font-bold text-${tournament.color}-300">${tournament.name}</h3>
                <div class="my-4">
                    <p class="text-3xl font-bold">₹${tournament.entryFee}</p>
                    <p class="text-green-400 text-lg">₹${tournament.perKill} Per Kill</p>
                </div>
                <div class="text-sm text-gray-400 mb-4">
                    <p>Break-even: 3 Kills</p>
                    <p>${tournament.time}</p>
                </div>
                <button class="register-btn bg-${tournament.color}-500 hover:bg-${tournament.color}-600 text-white w-full py-3 rounded-lg font-bold transition duration-200" data-tier="${tier}">
                    JOIN BATTLE
                </button>
            </div>
        </div>
    `;
}

// Register for Tournament
async function registerForTournament(tier) {
    const user = auth.currentUser;
    if (!user) {
        alert('Please login first!');
        showLoginModal();
        return;
    }
    
    const tournament = tournamentTiers[tier];
    
    // Check if user has enough coins
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.data();
    
    if (!userData || userData.coinBalance < tournament.entryCoins) {
        alert(`You need ${tournament.entryCoins} coins to join this tournament!`);
        showCoinPurchaseModal();
        return;
    }
    
    // Proceed with registration
    const registrationData = {
        userId: user.uid,
        tournamentTier: tier,
        entryFee: tournament.entryFee,
        entryCoins: tournament.entryCoins,
        registeredAt: new Date(),
        status: 'registered'
    };
    
    try {
        // Deduct coins from user
        await db.collection('users').doc(user.uid).update({
            coinBalance: firebase.firestore.FieldValue.increment(-tournament.entryCoins)
        });
        
        // Create registration
        await db.collection('registrations').add(registrationData);
        
        alert(`Successfully registered for ${tournament.name} tournament! 🎮`);
        loadUserDashboard();
        
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed. Please try again.');
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadTournaments();
});