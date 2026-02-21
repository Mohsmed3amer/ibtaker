class VideoProtection {
    constructor(videoElement, userId) {
        this.video = videoElement;
        this.userId = userId;
        this.sessionId = this.generateSessionId();
        this.initProtection();
        this.startMonitoring();
    }
    
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    initProtection() {
        // منع النقر الأيمن
        this.video.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showWarning('غير مسموح بحفظ الفيديو');
            return false;
        });
        
        // منع السحب والإفلات
        this.video.addEventListener('dragstart', (e) => {
            e.preventDefault();
            return false;
        });
        
        // منع التقاط الصور
        this.video.addEventListener('loadedmetadata', () => {
            this.applyCanvasProtection();
        });
        
        // تتبع الوقت
        this.setupTimeTracking();
    }
    
    applyCanvasProtection() {
        // حماية Canvas لمنع التقاط الفيديو
        const originalGetContext = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function(...args) {
            const context = originalGetContext.apply(this, args);
            
            if (context && context.drawImage) {
                const originalDrawImage = context.drawImage;
                context.drawImage = function(...drawArgs) {
                    // التحقق مما إذا كان يتم رسم الفيديو
                    if (drawArgs[0] instanceof HTMLVideoElement) {
                        console.warn('تم منع محاولة التقاط الفيديو');
                        return;
                    }
                    return originalDrawImage.apply(this, drawArgs);
                };
            }
            return context;
        };
    }
    
    setupTimeTracking() {
        let lastReportedTime = 0;
        const reportInterval = 30000; // كل 30 ثانية
        
        this.video.addEventListener('timeupdate', () => {
            const currentTime = Math.floor(this.video.currentTime);
            
            if (currentTime - lastReportedTime >= 30) {
                this.reportViewingTime(currentTime);
                lastReportedTime = currentTime;
            }
        });
    }
    
    reportViewingTime(time) {
        // إرسال وقت المشاهدة إلى السيرفر
        const data = {
            userId: this.userId,
            sessionId: this.sessionId,
            videoId: this.getVideoId(),
            currentTime: time,
            timestamp: new Date().toISOString()
        };
        
        fetch('/api/video/tracking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getToken()}`
            },
            body: JSON.stringify(data)
        }).catch(error => {
            console.error('فشل في إرسال بيانات التتبع:', error);
        });
    }
    
    startMonitoring() {
        // اكتشاف محاولات التسجيل
        this.detectScreenRecording();
        
        // اكتشاف تبويبات أخرى
        this.detectTabSwitching();
        
        // حماية من النسخ
        this.preventCopying();
    }
    
    detectScreenRecording() {
        // مراقبة معدل الإطارات
        let lastTime = performance.now();
        let frameCount = 0;
        const checkInterval = 1000; // كل ثانية
        
        const checkFrameRate = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= checkInterval) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                
                if (fps < 10 || fps > 60) {
                    this.reportSuspiciousActivity('معدل إطارات غير طبيعي: ' + fps);
                }
                
                frameCount = 0;
                lastTime = currentTime;
            }
            requestAnimationFrame(checkFrameRate);
        };
        
        checkFrameRate();
    }
    
    detectTabSwitching() {
        let hiddenTime = 0;
        let tabHidden = false;
        
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                tabHidden = true;
                hiddenTime = Date.now();
            } else if (tabHidden) {
                const timeAway = Date.now() - hiddenTime;
                if (timeAway > 10000) { // أكثر من 10 ثواني
                    this.reportSuspiciousActivity('تبديل تبويب لمدة طويلة: ' + timeAway + 'ms');
                }
                tabHidden = false;
            }
        });
    }
    
    preventCopying() {
        // منع نسخ الصفحة
        document.addEventListener('copy', (e) => {
            e.preventDefault();
            this.showWarning('غير مسموح بنسخ المحتوى');
            return false;
        });
        
        // منع حفظ الصفحة
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.keyCode === 83) {
                e.preventDefault();
                this.showWarning('غير مسموح بحفظ المحتوى');
                return false;
            }
        });
    }
    
    showWarning(message) {
        const warning = document.createElement('div');
        warning.className = 'video-warning';
        warning.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
        `;
        warning.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--danger-color);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(warning);
        
        setTimeout(() => {
            warning.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => warning.remove(), 300);
        }, 3000);
    }
    
    reportSuspiciousActivity(reason) {
        const data = {
            userId: this.userId,
            sessionId: this.sessionId,
            videoId: this.getVideoId(),
            reason: reason,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };
        
        fetch('/api/video/suspicious-activity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getToken()}`
            },
            body: JSON.stringify(data)
        });
    }
    
    getVideoId() {
        return new URLSearchParams(window.location.search).get('videoId');
    }
    
    getToken() {
        return localStorage.getItem('authToken');
    }
}

// استخدام الحماية
document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('educationalVideo');
    const userId = localStorage.getItem('userId');
    
    if (video && userId) {
        new VideoProtection(video, userId);
    }
});