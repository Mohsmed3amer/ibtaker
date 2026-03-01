// ========== MOBILE MENU ==========
const menuToggle = document.getElementById('menuToggle');
const mobileSidebar = document.getElementById('mobileSidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

menuToggle.addEventListener('click', function() {
    mobileSidebar.classList.add('active');
    sidebarOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
});

sidebarOverlay.addEventListener('click', function() {
    mobileSidebar.classList.remove('active');
    this.classList.remove('active');
    document.body.style.overflow = 'auto';
});

// Close sidebar when clicking links
document.querySelectorAll('.mobile-nav-links a').forEach(link => {
    link.addEventListener('click', function() {
        mobileSidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
});

// ========== DROPDOWN MENU ==========
const dropdownMenu = document.getElementById('dropdownMenu');
const learnLink = document.querySelector('.has-dropdown');

// Show dropdown on hover
learnLink.addEventListener('mouseenter', function() {
    dropdownMenu.classList.add('show');
});

// Hide dropdown when mouse leaves
learnLink.addEventListener('mouseleave', function() {
    setTimeout(() => {
        if (!dropdownMenu.matches(':hover')) {
            dropdownMenu.classList.remove('show');
        }
    }, 200);
});

dropdownMenu.addEventListener('mouseleave', function() {
    dropdownMenu.classList.remove('show');
});

// ========== SHOPPING CART ==========
const cartButton = document.getElementById('cartButton');
const cartModal = document.getElementById('cartModal');
const closeCart = document.getElementById('closeCart');
const cartItemsContainer = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotalContainer = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const continueBtn = document.getElementById('continueBtn');

// Load cart from localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Update cart count
function updateCartCount() {
    cartCount.textContent = cart.length;
}

// Update cart modal
function updateCartModal() {
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-cart"></i>
                <p>عربة التسوق فارغة</p>
            </div>
        `;
        cartTotalContainer.innerHTML = `
            <div class="total-row">
                <span>المجموع:</span>
                <span>0 جنيه</span>
            </div>
            <div class="total-row final">
                <span>الإجمالي:</span>
                <span>0 جنيه</span>
            </div>
        `;
        return;
    }
    
    let total = 0;
    
    cart.forEach((item, index) => {
        const priceNum = parseInt(item.price);
        total += priceNum;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.title}">
            <div class="cart-item-details">
                <div class="cart-item-title">${item.title}</div>
                <div class="cart-item-price">${item.price} جنيه</div>
            </div>
            <button class="remove-from-cart" data-index="${index}">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        cartItemsContainer.appendChild(cartItem);
    });
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-from-cart').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            cart.splice(index, 1);
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartModal();
            updateCartCount();
        });
    });
    
    cartTotalContainer.innerHTML = `
        <div class="total-row">
            <span>المجموع:</span>
            <span>${total} جنيه</span>
        </div>
        <div class="total-row final">
            <span>الإجمالي:</span>
            <span>${total} جنيه</span>
        </div>
    `;
}

// Open cart modal
cartButton.addEventListener('click', function() {
    cartModal.classList.add('show');
    updateCartModal();
    document.body.style.overflow = 'hidden';
});

// Close cart modal
closeCart.addEventListener('click', function() {
    cartModal.classList.remove('show');
    document.body.style.overflow = 'auto';
});

continueBtn.addEventListener('click', function() {
    cartModal.classList.remove('show');
    document.body.style.overflow = 'auto';
});

// Checkout button
checkoutBtn.addEventListener('click', function() {
    if (cart.length === 0) {
        return;
    }
    
    // Open checkout modal
    document.getElementById('checkoutModal').classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Update order summary
    updateOrderSummary();
});

// Close cart when clicking outside
cartModal.addEventListener('click', function(e) {
    if (e.target === cartModal) {
        cartModal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
});

// ========== SEARCH FUNCTIONALITY ==========
const allCourses = [
    // Group 1 courses
    { title: "محاسبه تكاليف", description: "شرح شامل", university: "جامعة الباحة", price: "80", group: 1, image: "./IMG/WhatsApp Image 2026-01-17 at 3.52.41 AM (1).jpeg" },
    { title: "المحاسبه المتقدمه", description: "تبسيط كامل", university: "جامعة الباحة", price: "100", group: 1, image: "./IMG/WhatsApp Image 2026-01-17 at 3.52.41 AM (2).jpeg" },
    { title: "2المحاسبه المتوسطه", description: "", university: "جامعة الباحة", price: "100", group: 1, image: "./IMG/WhatsApp Image 2026-01-17 at 3.52.41 AM.jpeg" },
    { title: "1 مقرر محاسبه ماليه متوسطه", description: "", university: "جامعة طيبة", price: "90", group: 1, image: "./IMG/WhatsApp Image 2026-01-17 at 3.53.22 AM (1).jpeg" },
    { title: "2 مقرر محاسبه ماليه متوسطه", description: "شرح مبسط", university: "جامعة طيبة", price: "90", group: 1, image: "./IMG/WhatsApp Image 2026-01-17 at 3.53.22 AM.jpeg" },
    { title: "التكاليف والمحاسبه الاداريه", description: "", university: "جامعة طيبة", price: "80", group: 1, image: "./IMG/WhatsApp Image 2026-01-17 at 3.53.23 AM (1).jpeg" },
    { title: "المحاسبه الماليه المتقدمه", description: "", university: "جامعة طيبة", price: "100", group: 1, image: "./IMG/WhatsApp Image 2026-01-17 at 3.53.23 AM.jpeg" },
    { title: "محاسبه متوسطه 2", description: "", university: "جامعة القصيم", price: "90", group: 1, image: "./IMG/WhatsApp Image 2026-01-17 at 3.53.52 AM.jpeg" },
    { title: "مبادئ الاقتصاد الجزئي", description: "", university: "جامعة الملك خالد", price: "80", group: 1, image: "./IMG/WhatsApp Image 2026-01-17 at 4.12.51 AM (2).jpeg" },
    { title: "الاحصاء التطبيقي", description: "", university: "جامعة الملك خالد", price: "70", group: 1, image: "./IMG/WhatsApp Image 2026-01-17 at 4.12.51 AM.jpeg" },
    { title: "محاسبه متوسطه 1", description: "", university: "جامعة الملك خالد", price: "80", group: 1, image: "./IMG/WhatsApp Image 2026-01-17 at 4.12.52 AM (1).jpeg" },
    { title: "رياضيات التمويل والاستثمار", description: "", university: "جامعة الملك خالد", price: "70", group: 1, image: "./IMG/WhatsApp Image 2026-01-17 at 4.12.52 AM (2).jpeg" },
    { title: "مبادئ الاحصاء للعلوم الانسانيه مع تطبيقات حاسوبيه", description: "", university: "جامعة الملك خالد", price: "70", group: 1, image: "./IMG/WhatsApp Image 2026-01-17 at 4.12.52 AM (3).jpeg" },
    { title: "الرياضيات للاقتصاد والعلوم الاداريه والماليه", description: "", university: "جامعة الملك خالد", price: "100", group: 1, image: "./IMG/WhatsApp Image 2026-01-17 at 4.12.52 AM.jpeg" },
    { title: "محاسبة المنشات الماليه", description: "", university: "جامعة الملك خالد", price: "80", group: 1, image: "./IMG/WhatsApp Image 2026-01-17 at 4.12.53 AM (1).jpeg" },
    { title: "محاسبه متوسطة 2 الفصل الحادي عشر الاتزامات المتداولة والمحتملة", description: "", university: "جامعة الملك خالد", price: "80", group: 1, image: "./IMG/WhatsApp Image 2026-01-17 at 4.12.53 AM (2).jpeg" },
    { title: "ادارة مالية 2", description: "", university: "جامعة الملك خالد", price: "80", group: 1, image: "./IMG/WhatsApp Image 2026-01-17 at 4.12.55 AM (1).jpeg" },
    { title: "مفاهيم واهداف محاسبة التكاليف", description: "", university: "جامعة الملك خالد", price: "80", group: 1, image: "./IMG/WhatsApp Image 2026-01-17 at 4.12.55 AM.jpeg" },
    
    // Group 2 courses
    { title: "محاسبه متوسطه 1", description: "محاسبه علي اساس الاستحقاق", university: "جامعة أم القرى", price: "80", group: 2, image: "./IMG/WhatsApp Image 2026-01-17 at 3.54.07 AM.jpeg" },
    { title: "محاسبة", description: "", university: "جامعة الطائف", price: "80", group: 2, image: "./IMG/WhatsApp Image 2026-01-17 at 3.54.22 AM (1).jpeg" },
    { title: "محاسبه التكاليف", description: "", university: "جامعة الطائف", price: "20", group: 2, image: "./IMG/WhatsApp Image 2026-01-17 at 3.54.22 AM (2).jpeg" },
    { title: "المحاسبه المتوسطه الجزء الثاني", description: "أمثلة", university: "جامعة الطائف", price: "80", group: 2, image: "./IMG/WhatsApp Image 2026-01-17 at 3.54.22 AM.jpeg" },
    { title: "المحاسبه المتوسطه الجزء الاول", description: "", university: "جامعة الطائف", price: "80", group: 2, image: "./IMG/WhatsApp Image 2026-01-17 at 3.54.23 AM (1).jpeg" },
    { title: "مبادئ الخطر والتامين", description: "", university: "جامعة الطائف", price: "20", group: 2, image: "./IMG/WhatsApp Image 2026-01-17 at 3.54.23 AM (2).jpeg" },
    { title: "الاحصاء التطبيقي", description: "", university: "جامعة الطائف", price: "70", group: 2, image: "./IMG/WhatsApp Image 2026-01-17 at 3.54.23 AM.jpeg" },
    { title: "مبادئ الادارة الماليه", description: "تطبيقات", university: "جامعة الملك فيصل", price: "90", group: 2, image: "./IMG/WhatsApp Image 2026-01-17 at 3.55.02 AM (1).jpeg" },
    { title: "المحاسبه الماليه دبلوم", description: "", university: "جامعة الملك خالد", price: "80", group: 2, image: "./IMG/WhatsApp Image 2026-01-17 at 4.01.51 AM (2).jpeg" },
    { title: "مبادئ المحاسبه", description: "", university: "جامعة الملك خالد", price: "70", group: 2, image: "./IMG/WhatsApp Image 2026-01-17 at 4.01.51 AM.jpeg" },
    { title: "Business Combinations", description: "", university: "جامعة الملك خالد", price: "80", group: 2, image: "./IMG/WhatsApp Image 2026-01-17 at 4.12.50 AM.jpeg" },
    { title: "محاسبه تكاليف وادارية", description: "", university: "جامعة الملك خالد", price: "80", group: 2, image: "./IMG/WhatsApp Image 2026-01-17 at 4.12.51 AM (1).jpeg" },
    { title: "ادارة ماليه 1", description: "", university: "جامعة الملك خالد", price: "80", group: 2, image: "./IMG/WhatsApp Image 2026-01-17 at 4.12.53 AM.jpeg" },
    { title: "محاسبة الزكاة والضريبة", description: "", university: "جامعة الملك خالد", price: "70", group: 2, image: "./IMG/WhatsApp Image 2026-01-17 at 4.12.54 AM (1).jpeg" },
    { title: "المحاسبة عن عمليات البضاعة", description: "", university: "جامعة الملك خالد", price: "80", group: 2, image: "./IMG/WhatsApp Image 2026-01-17 at 4.12.54 AM (2).jpeg" },
    { title: "تحليل قائمه المركز المالي", description: "", university: "جامعة الملك خالد", price: "80", group: 2, image: "./IMG/WhatsApp Image 2026-01-17 at 4.12.54 AM.jpeg" }
];

const searchInput = document.getElementById('searchInput');
const searchForm = document.getElementById('searchForm');
const searchResults = document.getElementById('searchResults');
const mobileSearchInput = document.getElementById('mobileSearchInput');
const mobileSearchButton = document.getElementById('mobileSearchButton');

// Display search results
function displaySearchResults(query) {
    searchResults.innerHTML = '';
    
    if (!query.trim()) {
        searchResults.style.display = 'none';
        return;
    }
    
    const filtered = allCourses.filter(course => 
        course.title.toLowerCase().includes(query.toLowerCase()) ||
        course.description.toLowerCase().includes(query.toLowerCase()) ||
        course.university.toLowerCase().includes(query.toLowerCase())
    );
    
    if (filtered.length === 0) {
        searchResults.innerHTML = '<div class="no-results">لا توجد نتائج</div>';
        searchResults.style.display = 'block';
    } else {
        filtered.forEach(course => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            resultItem.innerHTML = `
                <img src="${course.image}" alt="${course.title}">
                <div>
                    <h4>${course.title}</h4>
                    <p>${course.description} - ${course.university}</p>
                </div>
                <div class="price">${course.price} جنيه</div>
            `;
            
            resultItem.addEventListener('click', function() {
                // Navigate to the correct group and highlight the course
                navigateToCourse(course.title);
                
                searchInput.value = '';
                searchResults.style.display = 'none';
            });
            
            searchResults.appendChild(resultItem);
        });
        
        searchResults.style.display = 'block';
    }
}

// Navigate to specific course
function navigateToCourse(courseTitle) {
    // Find the card with the matching title
    const cards = document.querySelectorAll('.card');
    let foundCard = null;
    let foundGroup = null;
    
    cards.forEach(card => {
        const cardTitle = card.querySelector('h3').textContent;
        if (cardTitle === courseTitle) {
            foundCard = card;
            foundGroup = card.closest('.cards-group');
        }
    });
    
    if (foundCard && foundGroup) {
        // Show the correct group
        document.querySelectorAll('.cards-group').forEach(g => {
            g.classList.remove('active');
        });
        foundGroup.classList.add('active');
        
        // Highlight the card
        cards.forEach(card => {
            card.classList.remove('highlight');
        });
        foundCard.classList.add('highlight');
        
        // Scroll to the section
        document.querySelector('.slider-section').scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
        });
        
        // Remove highlight after 3 seconds
        setTimeout(() => {
            foundCard.classList.remove('highlight');
        }, 3000);
    }
}

// Desktop search
searchInput.addEventListener('input', function() {
    displaySearchResults(this.value);
});

searchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    displaySearchResults(searchInput.value);
});

// Mobile search
mobileSearchButton.addEventListener('click', function() {
    const query = mobileSearchInput.value.trim();
    if (query) {
        const filtered = allCourses.filter(course => 
            course.title.toLowerCase().includes(query.toLowerCase()) ||
            course.description.toLowerCase().includes(query.toLowerCase()) ||
            course.university.toLowerCase().includes(query.toLowerCase())
        );
        
        if (filtered.length > 0) {
            const course = filtered[0];
            navigateToCourse(course.title);
            
            // Close mobile sidebar
            mobileSidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
            document.body.style.overflow = 'auto';
            mobileSearchInput.value = '';
        }
    }
});

mobileSearchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        mobileSearchButton.click();
    }
});

// Close search results when clicking outside
document.addEventListener('click', function(e) {
    if (!searchForm.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.style.display = 'none';
    }
});

// ========== ADD TO CART FUNCTIONALITY ==========
document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', function() {
        const card = this.closest('.card');
        const title = card.querySelector('h3').textContent;
        const price = card.querySelector('.card-price span').textContent.replace('جنيه', '').trim();
        const image = card.querySelector('img').src;
        
        // Check if item already in cart
        const existingItem = cart.find(item => item.title === title);
        if (existingItem) {
            return;
        }
        
        // Add to cart
        cart.push({
            title: title,
            price: price,
            image: image
        });
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        
        // Button animation
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-check"></i> تم الإضافة';
        this.style.background = '#4CAF50';
        
        setTimeout(() => {
            this.innerHTML = originalText;
            this.style.background = '';
        }, 2000);
    });
});

// ========== CHECKOUT MODAL ==========
const closeModal = document.getElementById('closeModal');
const cancelOrder = document.getElementById('cancelOrder');
const confirmOrder = document.getElementById('confirmOrder');
const checkoutForm = document.getElementById('checkoutForm');
const orderSummary = document.getElementById('orderSummary');

// Update order summary
function updateOrderSummary() {
    orderSummary.innerHTML = '';
    
    if (cart.length === 0) {
        orderSummary.innerHTML = '<div style="text-align: center; padding: 20px; color: #999;">لا توجد منتجات في السلة</div>';
        return;
    }
    
    let total = 0;
    
    cart.forEach(item => {
        const priceNum = parseInt(item.price);
        total += priceNum;
        
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        orderItem.innerHTML = `
            <span>${item.title}</span>
            <span>${item.price} جنيه</span>
        `;
        orderSummary.appendChild(orderItem);
    });
    
    const orderTotal = document.createElement('div');
    orderTotal.className = 'order-total';
    orderTotal.innerHTML = `
        <span>المجموع الكلي:</span>
        <span class="total">${total} جنيه</span>
    `;
    orderSummary.appendChild(orderTotal);
}

// Close modal
closeModal.addEventListener('click', function() {
    document.getElementById('checkoutModal').classList.remove('active');
    document.body.style.overflow = 'auto';
});

cancelOrder.addEventListener('click', function() {
    document.getElementById('checkoutModal').classList.remove('active');
    document.body.style.overflow = 'auto';
});

// Close modal when clicking outside
document.getElementById('checkoutModal').addEventListener('click', function(e) {
    if (e.target === this) {
        this.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// Confirm order
confirmOrder.addEventListener('click', function() {
    if (!checkoutForm.checkValidity()) {
        return;
    }
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const payment = document.getElementById('payment').value;
    
    // Simulate order processing
    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري المعالجة...';
    this.disabled = true;
    
    setTimeout(() => {
        // Clear cart
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        
        // Reset form
        checkoutForm.reset();
        
        // Close modal
        document.getElementById('checkoutModal').classList.remove('active');
        document.body.style.overflow = 'auto';
        
        // Reset button
        this.innerHTML = 'تأكيد الطلب';
        this.disabled = false;
    }, 2000);
});

// ========== SLIDER FUNCTIONALITY ==========
const groups = document.querySelectorAll('.cards-group');
let currentGroup = 0;

document.getElementById('next').onclick = () => {
    groups[currentGroup].classList.remove('active');
    currentGroup = (currentGroup + 1) % groups.length;
    groups[currentGroup].classList.add('active');
};

document.getElementById('prev').onclick = () => {
    groups[currentGroup].classList.remove('active');
    currentGroup = (currentGroup - 1 + groups.length) % groups.length;
    groups[currentGroup].classList.add('active');
};

// ========== UNIVERSITIES FILTER ==========
const universitiesBtn = document.getElementById('universitiesBtn');
const universitiesDropdown = document.getElementById('universitiesDropdown');
const universitySearch = document.getElementById('universitySearch');
const universityItems = document.querySelectorAll('.university-item');
const filterIndicator = document.getElementById('filterIndicator');
const activeFilterText = document.getElementById('activeFilterText');
const clearFilter = document.getElementById('clearFilter');

let currentFilter = 'all';

// University name mapping
const universityNames = {
    'all': 'جميع الجامعات',
    'king-khalid': 'جامعة الملك خالد',
    'king-faisal': 'جامعة الملك فيصل',
    'taibah': 'جامعة طيبة',
    'taif': 'جامعة الطائف',
    'jeddah': 'جامعة جدة',
    'umm-alqura': 'جامعة أم القرى',
    'al-baha': 'جامعة الباحة',
    'qassim': 'جامعة القصيم'
};

// Toggle universities dropdown
universitiesBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    universitiesDropdown.classList.toggle('show');
});

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    if (!universitiesBtn.contains(e.target) && !universitiesDropdown.contains(e.target)) {
        universitiesDropdown.classList.remove('show');
    }
});

// Filter universities list
universitySearch.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    
    universityItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
});

// Handle university selection
universityItems.forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        const university = this.getAttribute('data-university');
        currentFilter = university;
        
        // Update filter indicator
        activeFilterText.textContent = universityNames[university];
        filterIndicator.style.display = 'inline-block';
        
        // Update button text
        universitiesBtn.textContent = universityNames[university];
        
        // Filter courses
        filterCoursesByUniversity(university);
        
        // Close dropdown
        universitiesDropdown.classList.remove('show');
        universitySearch.value = '';
    });
});

// Clear filter
clearFilter.addEventListener('click', function() {
    currentFilter = 'all';
    filterIndicator.style.display = 'none';
    universitiesBtn.textContent = 'جميع الجامعات';
    showAllCourses();
});

// Function to filter courses by university
function filterCoursesByUniversity(universityName) {
    let coursesShown = 0;
    
    document.querySelectorAll('.card').forEach(card => {
        const cardUniversity = card.getAttribute('data-university');
        const universityMap = {
            'king-khalid': ['جامعة الملك خالد'],
            'king-faisal': ['جامعة الملك فيصل'],
            'taibah': ['جامعة طيبة'],
            'taif': ['جامعة الطائف'],
            'jeddah': ['جامعة جدة'],
            'umm-alqura': ['جامعة أم القرى'],
            'al-baha': ['جامعة الباحة'],
            'qassim': ['جامعة القصيم']
        };
        
        let shouldShow = false;
        
        if (universityName === 'all') {
            shouldShow = true;
        } else {
            const targetUniversity = universityMap[universityName];
            if (targetUniversity && targetUniversity.includes(cardUniversity)) {
                shouldShow = true;
            }
        }
        
        if (shouldShow) {
            card.style.display = 'block';
            coursesShown++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Ensure at least one group is active
    let hasVisibleCards = false;
    groups.forEach(group => {
        const visibleCards = group.querySelectorAll('.card[style*="block"]');
        if (visibleCards.length > 0) {
            group.classList.add('active');
            hasVisibleCards = true;
        } else {
            group.classList.remove('active');
        }
    });
    
    // If no cards visible, show all groups
    if (!hasVisibleCards) {
        groups[0].classList.add('active');
        groups[1].classList.remove('active');
        currentGroup = 0;
    }
}

// Show all courses
function showAllCourses() {
    document.querySelectorAll('.card').forEach(card => {
        card.style.display = 'block';
    });
    
    // Show first group by default
    groups[0].classList.add('active');
    groups[1].classList.remove('active');
    currentGroup = 0;
}

// ========== INITIALIZE ==========
document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart
    updateCartCount();
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId.startsWith('#')) {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // Close sidebar on resize for large screens
    window.addEventListener('resize', function() {
        if (window.innerWidth > 992) {
            mobileSidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
    
    // Initialize university filter
    filterCoursesByUniversity('all');
});

// ========== MOBILE UNIVERSITIES MENU ==========
// Add mobile universities menu to mobile sidebar
const mobileNavLinks = document.querySelector('.mobile-nav-links');
const mobileUniversitiesHTML = `
    <div class="mobile-universities">
        <button class="mobile-universities-btn" id="mobileUniversitiesBtn">
            جميع الجامعات
            <i class="fas fa-chevron-down"></i>
        </button>
        <div class="mobile-universities-dropdown" id="mobileUniversitiesDropdown">
            <div class="mobile-universities-search">
                <input type="text" placeholder="ابحث عن جامعة..." id="mobileUniversitySearch">
            </div>
            <div class="mobile-universities-list">
                <a href="#" class="university-item" data-university="all">جميع الجامعات</a>
                <a href="#" class="university-item" data-university="king-khalid">جامعة الملك خالد</a>
                <a href="#" class="university-item" data-university="king-faisal">جامعة الملك فيصل</a>
                <a href="#" class="university-item" data-university="taibah">جامعة طيبة</a>
                <a href="#" class="university-item" data-university="taif">جامعة الطائف</a>
                <a href="#" class="university-item" data-university="jeddah">جامعة جدة</a>
                <a href="#" class="university-item" data-university="umm-alqura">جامعة أم القرى</a>
                <a href="#" class="university-item" data-university="al-baha">جامعة الباحة</a>
                <a href="#" class="university-item" data-university="qassim">جامعة القصيم</a>
            </div>
        </div>
    </div>
`;

// Insert mobile universities menu at the beginning of mobile-nav-links
if (mobileNavLinks) {
    mobileNavLinks.insertAdjacentHTML('afterbegin', mobileUniversitiesHTML);
    
    // Initialize mobile universities functionality
    const mobileUniversitiesBtn = document.getElementById('mobileUniversitiesBtn');
    const mobileUniversitiesDropdown = document.getElementById('mobileUniversitiesDropdown');
    const mobileUniversitySearch = document.getElementById('mobileUniversitySearch');
    
    if (mobileUniversitiesBtn) {
        mobileUniversitiesBtn.addEventListener('click', function() {
            mobileUniversitiesDropdown.classList.toggle('show');
            this.querySelector('i').classList.toggle('fa-chevron-down');
            this.querySelector('i').classList.toggle('fa-chevron-up');
        });
        
        // Filter mobile universities list
        if (mobileUniversitySearch) {
            mobileUniversitySearch.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                const mobileItems = mobileUniversitiesDropdown.querySelectorAll('.university-item');
                
                mobileItems.forEach(item => {
                    const text = item.textContent.toLowerCase();
                    if (text.includes(searchTerm)) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        }
        
        // Handle university selection in mobile
        const mobileUniversityItems = mobileUniversitiesDropdown.querySelectorAll('.university-item');
        mobileUniversityItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const university = this.getAttribute('data-university');
                currentFilter = university;
                
                // Update filter indicator
                activeFilterText.textContent = universityNames[university];
                filterIndicator.style.display = 'inline-block';
                
                // Update button text
                universitiesBtn.textContent = universityNames[university];
                mobileUniversitiesBtn.textContent = universityNames[university];
                
                // Filter courses
                filterCoursesByUniversity(university);
                
                // Close mobile sidebar and universities dropdown
                mobileSidebar.classList.remove('active');
                sidebarOverlay.classList.remove('active');
                mobileUniversitiesDropdown.classList.remove('show');
                mobileUniversitiesBtn.querySelector('i').classList.remove('fa-chevron-up');
                mobileUniversitiesBtn.querySelector('i').classList.add('fa-chevron-down');
                document.body.style.overflow = 'auto';
            });
        });
    }
}

// ========== RESPONSIVE ADJUSTMENTS ==========
// Adjust navbar layout for responsiveness
function adjustNavbarForScreenSize() {
    const navLinks = document.querySelector('.nav-links');
    const navLeft = document.querySelector('.nav-left');
    const universitiesBtn = document.querySelector('.universities-btn');
    
    if (window.innerWidth <= 992) {
        // Hide universities button on desktop nav for small screens
        if (universitiesBtn) {
            universitiesBtn.style.display = 'none';
        }
    } else {
        // Show universities button on desktop nav for larger screens
        if (universitiesBtn) {
            universitiesBtn.style.display = 'inline-block';
        }
    }
}

// Run on load and resize
window.addEventListener('load', adjustNavbarForScreenSize);
window.addEventListener('resize', adjustNavbarForScreenSize);


















document.addEventListener("DOMContentLoaded", () => {
    // جلب قيمة الجامعة من الرابط
    const urlParams = new URLSearchParams(window.location.search);
    const selectedUni = urlParams.get("uni"); // مثال: "kku", "bu"

    if (selectedUni) {
        const uniMap = {
            "kku": "جامعة الملك خالد",
            "kfu": "جامعة الملك فيصل",
            "tu": "جامعة طيبة",
            "bu": "جامعة الباحة",
            "uq": "جامعة أم القرى",
            "uj": " جامعه الطائف",
            "ksu": "جامعة الملك سعود",
            "kau": "جامعة الملك عبدالعزيز"
        };

        const uniName = uniMap[selectedUni];
        if (uniName) {
            // إظهار اسم الجامعة في الفلتر (اختياري)
            const filterIndicator = document.getElementById("filterIndicator");
            const activeFilterText = document.getElementById("activeFilterText");
            filterIndicator.style.display = "block";
            activeFilterText.textContent = uniName;

            // فلترة الكورسات حسب الجامعة
            const allCards = document.querySelectorAll(".card");
            allCards.forEach(card => {
                if (card.dataset.university === uniName) {
                    card.style.display = "block";
                } else {
                    card.style.display = "none";
                }
            });
        }
    }
});



