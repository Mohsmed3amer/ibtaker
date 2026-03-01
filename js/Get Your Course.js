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

if (learnLink && dropdownMenu) {
    learnLink.addEventListener('mouseenter', function() {
        dropdownMenu.classList.add('show');
    });

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
}

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
            showNotification('تم إزالة الكورس من السلة', 'warning');
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
        showNotification('عربة التسوق فارغة', 'info');
        return;
    }
    
    showNotification('سيتم تفعيل عملية الدفع قريباً', 'info');
});

// Close cart when clicking outside
cartModal.addEventListener('click', function(e) {
    if (e.target === cartModal) {
        cartModal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
});

// ========== FORM SUBMISSION ==========
const requestForm = document.querySelector('.request-form');
if (requestForm) {
    requestForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            name: this.querySelector('input[placeholder*="اسمك"]').value,
            phone: this.querySelector('input[placeholder*="10 0123"]').value,
            university: this.querySelector('input[placeholder*="جامعة"]').value,
            course: this.querySelector('input[placeholder*="المقرر"]').value,
            specialization: this.querySelector('select').value,
            details: this.querySelector('textarea').value
        };
        
        // Form validation
        if (!formData.name || !formData.phone || !formData.university || !formData.course || !formData.specialization) {
            showNotification('يرجى ملء جميع الحقول المطلوبة', 'warning');
            return;
        }
        
        if (formData.phone.length < 10) {
            showNotification('رقم الهاتف غير صحيح', 'warning');
            return;
        }
        
        // Show loading state
        const submitBtn = this.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
        submitBtn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            // Show success message
            showNotification('تم إرسال طلبك بنجاح! سنتصل بك خلال 24 ساعة', 'success');
            
            // Reset form
            this.reset();
            
            // Optional: Redirect to home page after 3 seconds
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 3000);
            
        }, 2000);
    });
}

// ========== NOTIFICATION SYSTEM ==========
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'info' ? 'info-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'info' ? '#2196F3' : '#ff9800'};
            color: white;
            padding: 18px 25px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.2);
            z-index: 9999;
            animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
            min-width: 300px;
            max-width: 400px;
            font-weight: 600;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes fadeOut {
            to {
                opacity: 0;
                transform: translateX(100%);
            }
        }
        
        .notification i {
            font-size: 22px;
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
        style.remove();
    }, 3000);
}

// ========== INITIALIZE ==========
document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart
    updateCartCount();
    
    // Add ripple effect to buttons
    document.querySelectorAll('.submit-btn, .btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const x = e.clientX - e.target.getBoundingClientRect().left;
            const y = e.clientY - e.target.getBoundingClientRect().top;
            
            const ripple = document.createElement('span');
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
});