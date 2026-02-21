class Utils {
    // تنسيق التاريخ
    static formatDate(dateString) {
        const date = new Date(dateString);
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'Asia/Riyadh'
        };
        return new Intl.DateTimeFormat('ar-SA', options).format(date);
    }
    
    // تنسيق الوقت
    static formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
    
    // تنسيق الأرقام
    static formatNumber(number) {
        return new Intl.NumberFormat('ar-SA').format(number);
    }
    
    // تنسيق المبلغ المالي
    static formatCurrency(amount, currency = 'SAR') {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }
    
    // تقصير النص
    static truncateText(text, maxLength = 100) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
    
    // التحقق من صحة البريد الإلكتروني
    static isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // التحقق من قوة كلمة المرور
    static checkPasswordStrength(password) {
        let strength = 0;
        
        // طول كلمة المرور
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        
        // وجود أحرف كبيرة وصغيرة
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        
        // وجود أرقام
        if (/[0-9]/.test(password)) strength++;
        
        // وجود رموز خاصة
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        return strength;
    }
    
    // توليد معرف فريد
    static generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // تخزين البيانات محلياً
    static setLocalData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }
    
    // جلب البيانات محلياً
    static getLocalData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    }
    
    // حذف البيانات محلياً
    static removeLocalData(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    }
    
    // نسخ إلى الحافظة
    static copyToClipboard(text) {
        return new Promise((resolve, reject) => {
            if (navigator.clipboard) {
                navigator.clipboard.writeText(text)
                    .then(() => resolve(true))
                    .catch(() => {
                        // طريقة احتياطية
                        this.fallbackCopyToClipboard(text, resolve, reject);
                    });
            } else {
                this.fallbackCopyToClipboard(text, resolve, reject);
            }
        });
    }
    
    static fallbackCopyToClipboard(text, resolve, reject) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            resolve(true);
        } catch (error) {
            reject(false);
        } finally {
            textArea.remove();
        }
    }
    
    // تحميل الصور بكسل
    static lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
    
    // منع الإرسال المزدوج للنموذج
    static preventDoubleSubmit(formId) {
        const form = document.getElementById(formId);
        if (form) {
            let isSubmitting = false;
            
            form.addEventListener('submit', (e) => {
                if (isSubmitting) {
                    e.preventDefault();
                    return false;
                }
                
                isSubmitting = true;
                
                // إعادة تعيين بعد 5 ثواني في حالة فشل الإرسال
                setTimeout(() => {
                    isSubmitting = false;
                }, 5000);
                
                return true;
            });
        }
    }
    
    // التحكم في الصوت
    static audioManager() {
        let currentAudio = null;
        
        return {
            play(src) {
                if (currentAudio) {
                    currentAudio.pause();
                    currentAudio.currentTime = 0;
                }
                
                currentAudio = new Audio(src);
                currentAudio.play();
                
                return currentAudio;
            },
            
            pause() {
                if (currentAudio) {
                    currentAudio.pause();
                }
            },
            
            stop() {
                if (currentAudio) {
                    currentAudio.pause();
                    currentAudio.currentTime = 0;
                    currentAudio = null;
                }
            },
            
            setVolume(volume) {
                if (currentAudio) {
                    currentAudio.volume = Math.max(0, Math.min(1, volume));
                }
            }
        };
    }
    
    // إنشاء عنصر تنبيه
    static createAlert(message, type = 'info') {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <div class="alert-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 
                                  type === 'error' ? 'exclamation-circle' : 
                                  type === 'warning' ? 'exclamation-triangle' : 
                                  'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="alert-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            background: ${type === 'success' ? '#d1fae5' :
                        type === 'error' ? '#fee2e2' :
                        type === 'warning' ? '#fef3c7' :
                        '#e0e7ff'};
            color: ${type === 'success' ? '#065f46' :
                    type === 'error' ? '#991b1b' :
                    type === 'warning' ? '#92400e' :
                    '#3730a3'};
            border: 1px solid ${type === 'success' ? '#a7f3d0' :
                              type === 'error' ? '#fecaca' :
                              type === 'warning' ? '#fde68a' :
                              '#c7d2fe'};
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            max-width: 400px;
            transform: translateX(150%);
            transition: transform 0.3s ease;
        `;
        
        const closeBtn = alert.querySelector('.alert-close');
        closeBtn.addEventListener('click', () => {
            alert.style.transform = 'translateX(150%)';
            setTimeout(() => alert.remove(), 300);
        });
        
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            if (alert.parentNode) {
                alert.style.transform = 'translateX(150%)';
                setTimeout(() => alert.remove(), 300);
            }
        }, 5000);
        
        return alert;
    }
    
    // إنشاء قائمة منسدلة
    static createDropdown(button, menuItems) {
        const dropdown = document.createElement('div');
        dropdown.className = 'custom-dropdown';
        
        let html = '<div class="dropdown-menu">';
        menuItems.forEach(item => {
            html += `
                <a href="${item.href || '#'}" class="dropdown-item" ${item.onclick ? `onclick="${item.onclick}"` : ''}>
                    ${item.icon ? `<i class="${item.icon}"></i>` : ''}
                    <span>${item.text}</span>
                </a>
            `;
        });
        html += '</div>';
        
        dropdown.innerHTML = html;
        dropdown.style.cssText = `
            position: relative;
            display: inline-block;
        `;
        
        button.parentNode.insertBefore(dropdown, button.nextSibling);
        dropdown.insertBefore(button, dropdown.firstChild);
        
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const menu = dropdown.querySelector('.dropdown-menu');
            menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
        });
        
        document.addEventListener('click', () => {
            const menu = dropdown.querySelector('.dropdown-menu');
            menu.style.display = 'none';
        });
        
        return dropdown;
    }
    
    // تحميل المزيد من البيانات (Infinite Scroll)
    static infiniteScroll(container, loadMoreCallback) {
        let isLoading = false;
        
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !isLoading) {
                isLoading = true;
                loadMoreCallback().finally(() => {
                    isLoading = false;
                });
            }
        }, {
            threshold: 0.1
        });
        
        const sentinel = document.createElement('div');
        sentinel.id = 'scroll-sentinel';
        sentinel.style.cssText = 'height: 20px; margin: 20px 0;';
        container.appendChild(sentinel);
        
        observer.observe(sentinel);
        
        return {
            disconnect() {
                observer.disconnect();
                sentinel.remove();
            }
        };
    }
}

// جعل الأدوات المساعدة متاحة عالمياً
window.Utils = Utils;

// تهيئة بعض الوظائف عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // تحميل الصور بكسل
    Utils.lazyLoadImages();
    
    // إعداد القوائم المنسدلة
    document.querySelectorAll('.user-dropdown-toggle').forEach(button => {
        Utils.createDropdown(button, [
            { href: 'profile.html', icon: 'fas fa-user', text: 'الملف الشخصي' },
            { href: 'settings.html', icon: 'fas fa-cog', text: 'الإعدادات' },
            { href: 'my-courses.html', icon: 'fas fa-book-open', text: 'دوراتي' },
            { onclick: 'logout()', icon: 'fas fa-sign-out-alt', text: 'تسجيل الخروج' }
        ]);
    });
    
    // إخفاء الرسائل بعد فترة
    setTimeout(() => {
        document.querySelectorAll('.notification').forEach(notification => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });
    }, 5000);
});