// Initialize Razorpay
function initializeRazorpay() {
    // This will be called when Razorpay script loads
    console.log('Razorpay ready');
}

// Purchase Coins
function purchaseCoins(packageType) {
    const package = coinPackages[packageType];
    const user = auth.currentUser;
    
    if (!user) {
        alert('Please login first!');
        showLoginModal();
        return;
    }
    
    const options = {
        key: "your_razorpay_key_here", // Replace with actual key
        amount: package.price * 100, // Convert to paise
        currency: "INR",
        name: "EliteFire Arena",
        description: `Purchase ${package.coins} Coins`,
        handler: async function(response) {
            // Payment successful
            await handleSuccessfulPayment(response, package);
        },
        prefill: {
            name: user.displayName || "",
            email: user.email || ""
        },
        theme: {
            color: "#F59E0B"
        }
    };
    
    const rzp = new Razorpay(options);
    rzp.open();
}

// Handle Successful Payment
async function handleSuccessfulPayment(response, package) {
    const user = auth.currentUser;
    
    try {
        // Add coins to user's balance
        await db.collection('users').doc(user.uid).update({
            coinBalance: firebase.firestore.FieldValue.increment(package.coins),
            totalCoinsPurchased: firebase.firestore.FieldValue.increment(package.coins)
        });
        
        // Record transaction
        await db.collection('transactions').add({
            userId: user.uid,
            type: 'coin_purchase',
            amount: package.price,
            coins: package.coins,
            razorpayPaymentId: response.razorpay_payment_id,
            timestamp: new Date()
        });
        
        alert(`Successfully purchased ${package.coins} coins! 🎉`);
        loadUserDashboard();
        
    } catch (error) {
        console.error('Payment processing error:', error);
        alert('Payment processed but there was an error adding coins. Please contact support.');
    }
}

// Show Coin Purchase Modal
function showCoinPurchaseModal() {
    const modal = document.getElementById('coin-purchase-modal');
    if (modal) {
        modal.classList.remove('hidden');
        
        // Populate coin packages
        const container = document.getElementById('coin-packages');
        container.innerHTML = '';
        
        Object.keys(coinPackages).forEach(pkg => {
            const package = coinPackages[pkg];
            container.innerHTML += `
                <div class="bg-gray-700 p-4 rounded-lg text-center">
                    <h4 class="text-xl font-bold text-orange-400">${package.coins} Coins</h4>
                    <p class="text-2xl font-bold my-2">₹${package.price}</p>
                    <button onclick="purchaseCoins('${pkg}')" class="bg-orange-500 hover:bg-orange-600 text-white w-full py-2 rounded">
                        BUY NOW
                    </button>
                </div>
            `;
        });
    }
}