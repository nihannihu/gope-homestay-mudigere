// Initialize AOS
AOS.init({
    duration: 1000,
    once: true,
    offset: 100
});

// Initialize Swiper
const swiper = new Swiper('.roomSwiper', {
    slidesPerView: 1,
    spaceBetween: 30,
    loop: true,
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    breakpoints: {
        640: {
            slidesPerView: 2,
        },
        1024: {
            slidesPerView: 3,
        },
    },
});

// State
let selectedRoomPrice = 0;
let selectedRoomName = "";
let currentBookingId = "";
let totalAmount = 0;

// Set default dates
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

document.getElementById('checkin').valueAsDate = today;
document.getElementById('checkout').valueAsDate = tomorrow;

// Functions
function selectRoom(name, price) {
    selectedRoomName = name;
    selectedRoomPrice = price;

    // Scroll to booking
    document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });

    // Update UI or notify user (optional)
    // alert(`Selected ${name}. Price per night: ₹${price}`);

    calculateTotal();
}

function calculateTotal() {
    const checkin = new Date(document.getElementById('checkin').value);
    const checkout = new Date(document.getElementById('checkout').value);
    const rooms = parseInt(document.getElementById('rooms-count').value) || 1;

    // Calculate nights
    const diffTime = Math.abs(checkout - checkin);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const nights = diffDays > 0 ? diffDays : 1; // Minimum 1 night

    // Default price if no room selected yet (use average or base)
    const pricePerNight = selectedRoomPrice || 1550;

    totalAmount = pricePerNight * nights * rooms;

    document.getElementById('totalPrice').innerText = `₹${totalAmount.toLocaleString()}`;

    if (!selectedRoomName) {
        // Hint to select a room if they haven't
        // document.getElementById('totalPrice').innerText += " (Select a room)";
    }
}

function getFormData() {
    return {
        checkin: document.getElementById('checkin').value,
        checkout: document.getElementById('checkout').value,
        adults: document.getElementById('adults').value,
        children: document.getElementById('children').value,
        rooms: document.getElementById('rooms-count').value,
        roomName: selectedRoomName || "Any Room"
    };
}

function bookViaWhatsApp() {
    const data = getFormData();
    calculateTotal(); // Ensure total is fresh

    const phoneNumber = "919448187061"; // Updated to user's number

    const message = `Hello! I want to book ${data.rooms} Rooms (${data.roomName}) for ${data.adults} Adults and ${data.children} Children from ${data.checkin} to ${data.checkout}. Total Est: ₹${totalAmount}. Is it available?`;

    // Using api.whatsapp.com is often more reliable for pre-filled text across devices
    const url = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

    window.open(url, '_blank');
}

function showPaymentModal() {
    calculateTotal();
    const data = getFormData();

    // Generate Booking ID
    currentBookingId = "#BOOK-" + Math.floor(1000 + Math.random() * 9000);

    // Show Modal
    const modal = document.getElementById('paymentModal');
    modal.style.display = "flex";

    // Update Modal Text
    document.getElementById('modalAmount').innerText = `₹${totalAmount.toLocaleString()}`;
    document.getElementById('bookingId').innerText = currentBookingId;

    // Generate QR Code
    const upiId = "9448187061@ybl"; // Updated to user's UPI ID
    const payeeName = "Serene Haven"; // Default name, can be changed
    const upiString = `upi://pay?pa=${upiId}&pn=${payeeName}&am=${totalAmount}&tn=${currentBookingId}`;

    const qrContainer = document.getElementById('qrcode');
    qrContainer.innerHTML = ""; // Clear previous
    new QRCode(qrContainer, {
        text: upiString,
        width: 200,
        height: 200
    });
}

function closePaymentModal() {
    document.getElementById('paymentModal').style.display = "none";
}

function sendPaymentProof() {
    const phoneNumber = "919448187061"; // Updated to user's number
    const message = `Hi! I have paid ₹${totalAmount} for Booking ID ${currentBookingId}. Here is the screenshot.`;

    const url = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

    window.open(url, '_blank');
}

// Close modal if clicked outside
window.onclick = function (event) {
    const modal = document.getElementById('paymentModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// Initial calculation
calculateTotal();
