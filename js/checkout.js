// [file name]: checkout.js
// [file content begin]
class CheckoutManager {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.paymentMethod = 'mada';
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.calculateTotals();
        this.updateOrderSummary();
    }
    
    setupEventListeners() {
        // طرق الدفع
        document.querySelectorAll('.method-option')?.forEach(option => {
            option.addEventListener('click', () => this.selectPaymentMethod(option.dataset.method));
        });
        
        // تطبيق كود الخصم
        document.getElementById('applyCoupon')?.addEventListener('click', () => this.applyCoupon());
        document.getElementById('couponCode')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.applyCoupon();
            }
        });
        
        // تنسيق رقم البطاقة
        document.getElementById('cardNumber')?.addEventListener('input', (e) => {
            this.formatCardNumber(e.target);
        });
        
        // تنسيق تاريخ الانتهاء
        document.getElementById('expiryDate')?.addEventListener('input', (e) => {
            this.formatExpiryDate(e.target);
        });
        
        // إرسال نموذج الدفع
        const paymentForm = document.getElementById('paymentForm');
        if (paymentForm) {
            paymentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.processPayment();
            });
        }
        
        // طباعة الإيصال
        document.getElementById('printReceipt')?.addEventListener('click', () => this.printReceipt());
    }
    
    selectPaymentMethod(method) {
        this.paymentMethod = method;
        
        document.querySelectorAll('.method-option')?.forEach(option => {
            option.classList.remove('active');
        });
        
        const selectedOption = document.querySelector(`[data-method="${method}"]`);
        if (selectedOption) {
            selectedOption.classList.add('active');
        }
        
        // إظهار/إخفاء حقول مدى
        const madaFields = document.getElementById('madaFields');
        if (madaFields) {
            if (method === 'mada') {
                madaFields.style.display = 'block';
            } else {
                madaFields.style.display = 'none';
            }
        }
    }
    
    formatCardNumber(input) {
        let value = input.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        let formatted = '';
        
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) {
                formatted += ' ';
            }
            formatted += value[i];
        }
        
        input.value = formatted.substring(0, 19);
    }
    
    formatExpiryDate(input) {
        let value = input.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        
        if (value.length >= 2) {
            input.value = value.substring(0, 2) + '/' + value.substring(2, 4);
        } else {
            input.value = value;
        }
    }
    
    async applyCoupon() {
        const couponCodeInput = document.getElementById('couponCode');
        const couponMessage = document.getElementById('couponMessage');
        
        if (!couponCodeInput || !couponMessage) return;
        
        const couponCode = couponCodeInput.value.trim();
        
        if (!couponCode) {
            couponMessage.textContent = 'الرجاء إدخال كود الخصم';
            couponMessage.className = 'coupon-message error';
            return;
        }
        
        try {
            // في حالة اتصال حقيقي بالسيرفر:
            // const response = await api.validateCoupon(couponCode);
            
            // محاكاة الاستجابة
            const validCoupons = {
                'WELCOME10': 10,
                'STUDENT20': 20,
                'SPECIAL30': 30
            };
            
            if (validCoupons[couponCode.toUpperCase()]) {
                this.couponDiscount = validCoupons[couponCode.toUpperCase()];
                couponMessage.textContent = `تم تطبيق الخصم بنجاح! خصم ${this.couponDiscount}%`;
                couponMessage.className = 'coupon-message success';
                
                this.calculateTotals();
            } else {
                couponMessage.textContent = 'كود الخصم غير صالح أو منتهي الصلاحية';
                couponMessage.className = 'coupon-message error';
            }
            
        } catch (error) {
            console.error('Error validating coupon:', error);
            couponMessage.textContent = 'حدث خطأ في التحقق من كود الخصم';
            couponMessage.className = 'coupon-message error';
        }
    }
    
    calculateTotals() {
        let subtotal = this.cart.reduce((sum, item) => sum + (parseInt(item.price) || 0), 0);
        
        // تطبيق الخصم إذا كان موجوداً
        let discount = 0;
        if (this.couponDiscount) {
            discount = (subtotal * this.couponDiscount) / 100;
            subtotal -= discount;
        }
        
        // حساب الضريبة (15%)
        const tax = subtotal * 0.15;
        const total = subtotal + tax;
        
        // تحديث الواجهة
        this.updateInvoiceDisplay(subtotal, discount, tax, total);
    }
    
    updateInvoiceDisplay(subtotal, discount, tax, total) {
        const priceElement = document.getElementById('invoicePrice');
        const discountElement = document.getElementById('invoiceDiscount');
        const taxElement = document.getElementById('invoiceTax');
        const totalElement = document.getElementById('invoiceTotal');
        
        if (priceElement) priceElement.textContent = `${subtotal.toFixed(2)} ر.س`;
        if (discountElement) discountElement.textContent = discount > 0 ? `-${discount.toFixed(2)} ر.س` : '0 ر.س';
        if (taxElement) taxElement.textContent = `${tax.toFixed(2)} ر.س`;
        if (totalElement) totalElement.textContent = `${total.toFixed(2)} ر.س`;
    }
    
    updateOrderSummary() {
        const orderSummary = document.getElementById('orderSummary');
        if (!orderSummary) return;
        
        orderSummary.innerHTML = '';
        
        if (this.cart.length === 0) {
            orderSummary.innerHTML = '<div class="cart-empty">لا توجد منتجات في السلة</div>';
            return;
        }
        
        this.cart.forEach((item, index) => {
            const orderItem = document.createElement('div');
            orderItem.className = 'order-item';
            orderItem.innerHTML = `
                <span>${item.title}</span>
                <span>${item.price} جنيه</span>
            `;
            orderSummary.appendChild(orderItem);
        });
    }
    
    async processPayment() {
        const paymentForm = document.getElementById('paymentForm');
        const payButton = document.querySelector('#paymentForm button[type="submit"]');
        
        if (!payButton) return;
        
        // التحقق من الموافقة على الشروط
        const agreeTerms = document.getElementById('agreeTerms');
        if (agreeTerms && !agreeTerms.checked) {
            ApiHelper.showNotification('الرجاء الموافقة على الشروط والأحكام', 'error');
            return;
        }
        
        // التحقق من صحة البيانات
        if (!this.validatePaymentForm()) {
            return;
        }
        
        try {
            // إظهار مؤشر التحميل
            const originalText = payButton.innerHTML;
            payButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري المعالجة...';
            payButton.disabled = true;
            
            // تجميع بيانات الدفع
            const paymentData = this.collectPaymentData();
            
            // محاكاة عملية الدفع
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // شراء كل كورس في السلة
            const purchasePromises = this.cart.map(item => api.buyCourse(item.id));
            await Promise.all(purchasePromises);
            
            // إخفاء مؤشر التحميل
            payButton.innerHTML = originalText;
            payButton.disabled = false;
            
            // عرض نافذة التأكيد
            this.showPaymentSuccess();
            
        } catch (error) {
            console.error('Payment processing error:', error);
            ApiHelper.showNotification('حدث خطأ أثناء معالجة الدفع', 'error');
            
            // إعادة تعيين الزر
            const payButton = document.querySelector('#paymentForm button[type="submit"]');
            if (payButton) {
                payButton.disabled = false;
                payButton.innerHTML = 'إتمام الدفع';
            }
        }
    }
    
    validatePaymentForm() {
        const cardName = document.getElementById('cardName')?.value.trim();
        const cardNumber = document.getElementById('cardNumber')?.value.replace(/\s+/g, '');
        const expiryDate = document.getElementById('expiryDate')?.value;
        const cvv = document.getElementById('cvv')?.value;
        
        if (this.paymentMethod === 'mada') {
            if (!cardName) {
                ApiHelper.showNotification('الرجاء إدخال اسم حامل البطاقة', 'error');
                return false;
            }
            
            if (!cardNumber || cardNumber.length < 16) {
                ApiHelper.showNotification('رقم البطاقة غير صالح', 'error');
                return false;
            }
            
            if (!this.validateExpiryDate(expiryDate)) {
                ApiHelper.showNotification('تاريخ الانتهاء غير صالح', 'error');
                return false;
            }
            
            if (!cvv || cvv.length < 3) {
                ApiHelper.showNotification('رمز التحقق غير صالح', 'error');
                return false;
            }
        }
        
        return true;
    }
    
    validateExpiryDate(expiryDate) {
        if (!expiryDate) return false;
        
        const [month, year] = expiryDate.split('/');
        
        if (!month || !year || month.length !== 2 || year.length !== 2) {
            return false;
        }
        
        const monthNum = parseInt(month);
        const yearNum = parseInt('20' + year);
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        
        if (monthNum < 1 || monthNum > 12) {
            return false;
        }
        
        if (yearNum < currentYear) {
            return false;
        }
        
        if (yearNum === currentYear && monthNum < currentMonth) {
            return false;
        }
        
        return true;
    }
    
    collectPaymentData() {
        const cardNumber = document.getElementById('cardNumber')?.value.replace(/\s+/g, '') || '';
        
        return {
            paymentMethod: this.paymentMethod,
            cardNumber: cardNumber.substring(cardNumber.length - 4),
            expiryDate: document.getElementById('expiryDate')?.value,
            cvv: document.getElementById('cvv')?.value,
            cardName: document.getElementById('cardName')?.value,
            courses: this.cart.map(item => item.id),
            totalAmount: document.getElementById('invoiceTotal')?.textContent
        };
    }
    
    showPaymentSuccess() {
        // تفريغ السلة
        localStorage.removeItem('cart');
        this.cart = [];
        updateCartCount();
        
        // عرض رسالة النجاح
        const modal = document.getElementById('paymentModal');
        if (modal) {
            modal.style.display = 'block';
            
            // تحديث معلومات الطلب
            document.getElementById('orderNumber').textContent = 'ORD-' + Date.now();
            document.getElementById('orderDate').textContent = new Date().toLocaleDateString('ar-SA');
            
            // إغلاق النافذة عند النقر خارجها
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                    window.location.href = 'index.html';
                }
            });
            
            // الزر للإغلاق
            const closeBtn = modal.querySelector('.modal-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    modal.style.display = 'none';
                    window.location.href = 'index.html';
                });
            }
        } else {
            // إذا لم تكن هناك نافذة، توجيه للصفحة الرئيسية
            ApiHelper.showNotification('تمت عملية الدفع بنجاح!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
    }
    
    printReceipt() {
        const receiptContent = `
            <html>
            <head>
                <title>إيصال الدفع</title>
                <style>
                    body { font-family: 'Tajawal', sans-serif; direction: rtl; padding: 20px; }
                    .receipt { max-width: 500px; margin: 0 auto; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .details { margin: 20px 0; }
                    .row { display: flex; justify-content: space-between; margin: 10px 0; }
                    .total { font-weight: bold; font-size: 1.2em; border-top: 2px solid #000; padding-top: 10px; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 0.9em; }
                </style>
            </head>
            <body>
                <div class="receipt">
                    <div class="header">
                        <h2>منصتي التعليمية</h2>
                        <p>إيصال دفع</p>
                    </div>
                    <div class="details">
                        <div class="row">
                            <span>رقم الطلب:</span>
                            <span>ORD-${Date.now()}</span>
                        </div>
                        <div class="row">
                            <span>التاريخ:</span>
                            <span>${new Date().toLocaleDateString('ar-SA')}</span>
                        </div>
                        <div class="row">
                            <span>الدورات:</span>
                            <span>${this.cart.length} دورة</span>
                        </div>
                        <div class="row">
                            <span>المبلغ:</span>
                            <span>${document.getElementById('invoiceTotal')?.textContent || '0 ر.س'}</span>
                        </div>
                        <div class="row total">
                            <span>الإجمالي:</span>
                            <span>${document.getElementById('invoiceTotal')?.textContent || '0 ر.س'}</span>
                        </div>
                    </div>
                    <div class="footer">
                        <p>شكراً لك على استخدام منصتنا التعليمية</p>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(receiptContent);
        printWindow.document.close();
        printWindow.print();
    }
}

// تهيئة مدير الدفع عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // التحقق من تسجيل الدخول
    if (!ApiHelper.isLoggedIn()) {
        ApiHelper.showNotification('يجب تسجيل الدخول لإتمام الشراء', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }
    
    // التحقق من وجود منتجات في السلة
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        ApiHelper.showNotification('عربة التسوق فارغة', 'info');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }
    
    window.checkoutManager = new CheckoutManager();
});

// جعل الوظائف متاحة عالمياً
window.printReceipt = function() {
    if (window.checkoutManager) {
        window.checkoutManager.printReceipt();
    }
};
// [file content end]