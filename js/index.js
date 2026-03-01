document.addEventListener("DOMContentLoaded", function () {
    // ========== ADMIN CONFIGURATION ==========
    const ADMIN_EMAIL = "admin@gmail.com";
    const ADMIN_API_BASE = 'https://ibtakr-academy.com';
    
    // ========== ADMIN STATE MANAGEMENT ==========
    let isAdmin = false;
    let adminToken = null;
    
    // ========== DYNAMIC COURSES STATE ==========
    let allCourses = [];
    let currentPage = 1;
    const CARDS_PER_PAGE = 12;
    const cardsContainerId = 'coursesContainer';
    
    // ========== CONFIGURATION ==========
    // const ADMIN_API_BASE = 'https://ibtakr-academy.com';
    
    // ========== GLOBAL STATE ==========
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let totalPages = 2;
    
    // ========== HELPER FUNCTIONS (يجب تعريفها أولاً) ==========
    
    // دالة لبناء URL الصورة الصحيح من wwwroot
    function buildImageUrl(imagePath) {
        if (!imagePath) {
            // صورة افتراضية من الإنترنت إذا لم توجد صورة في الخادم
            return 'https://img.freepik.com/free-vector/online-tutorials-concept_52683-37481.jpg?w=740';
        }
        
        // إذا كان المسار يحتوي على URL كامل
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        
        // إذا كان المسار يبدأ بـ / فهو مسار نسبي في الخادم (مثل: /uploads/courses/filename.jpg)
        if (imagePath.startsWith('/')) {
            return `${ADMIN_API_BASE}${imagePath}`;
        }
        
        // إذا كان مجرد اسم ملف، افترض أنه في مجلد courses في uploads
        return `${ADMIN_API_BASE}/uploads/courses/${imagePath}`;
    }
    
    function getUniversityArabicName(englishName) {
        const names = {
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
        return names[englishName] || 'الجامعة';
    }
    
    function showUniversityNotification(message) {
        const oldNotification = document.querySelector('.university-notification');
        if (oldNotification) oldNotification.remove();
        
        const notification = document.createElement('div');
        notification.className = 'university-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            z-index: 9999;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    // دالة لعرض مؤشر تحميل
    function showLoadingModal(message) {
        const modal = document.createElement('div');
        modal.className = 'loading-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 30000;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: white;
            border-radius: 15px;
            padding: 30px;
            text-align: center;
            border: 3px solid #D4AF37;
        `;
        
        content.innerHTML = `
            <div class="loading-spinner" style="
                width: 50px;
                height: 50px;
                border: 5px solid #f3f3f3;
                border-top: 5px solid #D4AF37;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px;
            "></div>
            <p style="margin: 0; color: #333; font-size: 16px;">${message || 'جاري التحميل...'}</p>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        return modal;
    }
    
    // دالة لإغلاق المودال
    function closeModal(modal) {
        if (modal && modal.parentNode) {
            document.body.removeChild(modal);
        }
    }
    
    // ========== ADMIN NOTIFICATIONS ==========
    function showAdminNotification(message, type = 'info') {
        // إزالة أي إشعارات سابقة
        const oldNotification = document.querySelector('.admin-notification');
        if (oldNotification) oldNotification.remove();
        
        const notification = document.createElement('div');
        notification.className = 'admin-notification';
        
        const icon = type === 'success' ? 'fa-check-circle' : 
                    type === 'error' ? 'fa-exclamation-circle' : 
                    'fa-info-circle';
        
        const color = type === 'success' ? '#4CAF50' : 
                     type === 'error' ? '#f44336' : 
                     '#2196F3';
        
        notification.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${color};
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            font-weight: bold;
            max-width: 400px;
        `;
        
        document.body.appendChild(notification);
        
        // إضافة CSS animation
        if (!document.getElementById('admin-notification-style')) {
            const style = document.createElement('style');
            style.id = 'admin-notification-style';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    // ========== ADMIN DIALOG HELPER ==========
    async function showAdminDialog(title, content) {
        return new Promise((resolve) => {
            const dialog = document.createElement('div');
            dialog.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            `;
            
            const dialogContent = document.createElement('div');
            dialogContent.style.cssText = `
                background: white;
                border-radius: 15px;
                padding: 30px;
                max-width: 600px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                border: 3px solid #D4AF37;
            `;
            
            dialogContent.innerHTML = `
                <div style="margin-bottom: 20px;">
                    <h3 style="color: #D4AF37; margin: 0; font-size: 24px; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-exclamation-circle"></i> ${title}
                    </h3>
                </div>
                ${content}
                <div style="display: flex; gap: 15px; margin-top: 30px; justify-content: center;">
                    <button id="dialogConfirm" style="background: #4CAF50; color: white; border: none; padding: 12px 30px; border-radius: 8px; cursor: pointer; font-weight: bold;">
                        تأكيد
                    </button>
                    <button id="dialogCancel" style="background: #f44336; color: white; border: none; padding: 12px 30px; border-radius: 8px; cursor: pointer; font-weight: bold;">
                        إلغاء
                    </button>
                </div>
            `;
            
            dialog.appendChild(dialogContent);
            document.body.appendChild(dialog);
            
            document.getElementById('dialogConfirm').addEventListener('click', () => {
                document.body.removeChild(dialog);
                resolve(true);
            });
            
            document.getElementById('dialogCancel').addEventListener('click', () => {
                document.body.removeChild(dialog);
                resolve(false);
            });
            
            // إغلاق بالنقر خارج الصندوق
            dialog.addEventListener('click', (e) => {
                if (e.target === dialog) {
                    document.body.removeChild(dialog);
                    resolve(false);
                }
            });
        });
    }
    
    // ========== ADMIN API FUNCTIONS ==========
    // // تم تعطيل دالة إضافة الكورس - سيتم استخدامها من صفحة admin.html
    // async function addCourseAPI(courseData) {
    //     try {
    //         const token = localStorage.getItem('authToken');
    //         if (!token) {
    //             alert('يجب تسجيل الدخول كمسؤول');
    //             return { success: false, message: 'غير مصرح' };
    //         }
    //
    //         const formData = new FormData();
    //         formData.append('Title', courseData.title);
    //         formData.append('Description', courseData.description);
    //         formData.append('Price', courseData.price);
    //         formData.append('University', courseData.university);
    //         
    //         if (courseData.image) {
    //             formData.append('ImageFile', courseData.image);
    //         }
    //
    //         const response = await fetch(`${ADMIN_API_BASE}/api/course`, {
    //             method: 'POST',
    //             headers: {
    //                 'Authorization': `Bearer ${token}`
    //             },
    //             body: formData
    //         });
    //
    //         if (response.ok) {
    //             const data = await response.json();
    //             return { success: true, data };
    //         } else {
    //             const error = await response.text();
    //             return { success: false, message: error || 'فشل إضافة الكورس' };
    //         }
    //     } catch (error) {
    //         console.error('Error adding course:', error);
    //         return { success: false, message: 'حدث خطأ في الاتصال' };
    //     }
    // }

    // // تم تعطيل دالة تحديث الكورس - سيتم استخدامها من صفحة admin.html
    // async function updateCourseAPI(courseId, courseData) {
    //     try {
    //         const token = localStorage.getItem('authToken');
    //         if (!token) {
    //             alert('يجب تسجيل الدخول كمسؤول');
    //             return { success: false, message: 'غير مصرح' };
    //         }
    //
    //         const response = await fetch(`${ADMIN_API_BASE}/api/course/${courseId}`, {
    //             method: 'PUT',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization': `Bearer ${token}`
    //             },
    //             body: JSON.stringify({
    //                 Title: courseData.title,
    //                 Description: courseData.description,
    //                 Price: courseData.price,
    //                 University: courseData.university
    //             })
    //         });
    //
    //         if (response.ok) {
    //             const data = await response.json();
    //             return { success: true, data };
    //         } else {
    //             const error = await response.text();
    //             return { success: false, message: error || 'فشل تحديث الكورس' };
    //         }
    //     } catch (error) {
    //         console.error('Error updating course:', error);
    //         return { success: false, message: 'حدث خطأ في الاتصال' };
    //     }
    // }

    async function deleteCourseAPI(courseId) {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                alert('يجب تسجيل الدخول كمسؤول');
                return { success: false, message: 'غير مصرح' };
            }

            const response = await fetch(`${ADMIN_API_BASE}/api/course/${courseId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                return { success: true, message: 'تم حذف الكورس بنجاح' };
            } else {
                const error = await response.text();
                return { success: false, message: error || 'فشل حذف الكورس' };
            }
        } catch (error) {
            console.error('Error deleting course:', error);
            return { success: false, message: 'حدث خطأ في الاتصال' };
        }
    }
    
    // ========== GENERAL API FUNCTIONS ==========
    async function loadCoursesFromAPI() {
    try {
        const token = localStorage.getItem('authToken');
        const headers = {
            'Content-Type': 'application/json'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${ADMIN_API_BASE}/api/course`, {
            method: 'GET',
            headers: headers
        });

        if (response.ok) {
            const data = await response.json();

            console.log("Courses Data:", data);

            return {
                success: true,
                data: data
            };

        } else {
            const errorText = await response.text();
            console.log("Server Error:", errorText);

            return {
                success: false,
                message: errorText || "حدث خطأ أثناء تحميل الكورسات"
            };
        }

    } catch (error) {
        console.error('Load courses error:', error);

        return {
            success: false,
            message: 'حدث خطأ في الاتصال بالسيرفر'
        };
    }
}



async function buyCourse(courseId) {
    try {
        const token = localStorage.getItem('authToken');

        if (!token) {
            alert('يجب تسجيل الدخول لشراء الكورس');
            window.location.href = 'login.html';
            return false;
        }

        const response = await fetch(`${ADMIN_API_BASE}/api/course/buy/${courseId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            alert(data.message || "تم شراء الكورس بنجاح!");
            return true;
        } else {
            const errorText = await response.text();
            console.log("Buy Error:", errorText);
            alert(errorText || "فشل شراء الكورس");
            return false;
        }

    } catch (error) {
        console.error('Buy course error:', error);
        alert('حدث خطأ في الاتصال بالسيرفر');
        return false;
    }
}
    
    async function loginUser(email, password) {
        try {
            const response = await fetch(`${ADMIN_API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });
            
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userEmail', email);
                localStorage.setItem('userRole', data.roles?.[0] || 'User');
                localStorage.setItem('userName', data.userName || 'مستخدم');
                return { success: true, data };
            } else {
                return { success: false, message: 'فشل تسجيل الدخول' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'حدث خطأ في الاتصال' };
        }
    }
    
    async function registerUser(fullName, email, password) {
        try {
            const response = await fetch(`${ADMIN_API_BASE}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ fullName, email, password })
            });
            
            if (response.ok) {
                return { success: true, message: 'تم التسجيل بنجاح' };
            } else {
                return { success: false, message: 'فشل التسجيل' };
            }
        } catch (error) {
            console.error('Register error:', error);
            return { success: false, message: 'حدث خطأ في الاتصال' };
        }
    }
    
    // ========== NEW API FUNCTIONS ==========
    // دالة لتحميل كورسات صفحة معينة
    async function loadCoursesByPage(pageNumber) {
        try {
            const response = await fetch(`${ADMIN_API_BASE}/api/course/page/${pageNumber}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const courses = await response.json();
                return { success: true, data: courses };
            } else {
                return { success: false, message: 'فشل تحميل الدورات' };
            }
        } catch (error) {
            console.error('Load courses by page error:', error);
            return { success: false, message: 'حدث خطأ في الاتصال' };
        }
    }
    
    // دالة لتحميل كورسات جامعة معينة
    async function loadCoursesByUniversity(universityName) {
        try {
            const response = await fetch(`${ADMIN_API_BASE}/api/course/university/${encodeURIComponent(universityName)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const courses = await response.json();
                return { success: true, data: courses };
            } else {
                return { success: false, message: 'فشل تحميل دورات الجامعة' };
            }
        } catch (error) {
            console.error('Load courses by university error:', error);
            return { success: false, message: 'حدث خطأ في الاتصال' };
        }
    }
    
    // دالة للبحث عن كورسات
    async function searchCourses(searchQuery) {
        try {
            const response = await fetch(`${ADMIN_API_BASE}/api/course/search?query=${encodeURIComponent(searchQuery)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const courses = await response.json();
                return { success: true, data: courses };
            } else {
                return { success: false, message: 'فشل البحث عن الدورات' };
            }
        } catch (error) {
            console.error('Search courses error:', error);
            return { success: false, message: 'حدث خطأ في الاتصال' };
        }
    }
    
    // دالة لتحميل درس معين
    async function loadLesson(lessonId) {
        try {
            const token = localStorage.getItem('authToken');
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            // استخدام الـ endpoint: GET /api/lessons/{lessonId}
            const response = await fetch(`${ADMIN_API_BASE}/api/lessons/${lessonId}`, {
                method: 'GET',
                headers: headers
            });
            
            if (response.ok) {
                const lesson = await response.json();
                return { success: true, data: lesson };
            } else {
                return { success: false, message: 'فشل تحميل الدرس' };
            }
        } catch (error) {
            console.error('Load lesson error:', error);
            return { success: false, message: 'حدث خطأ في الاتصال' };
        }
    }
    
    // دالة للحصول على كورس معين بالـ ID
    async function getCourseById(courseId) {
        try {
            const response = await fetch(`${ADMIN_API_BASE}/api/course/${courseId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const course = await response.json();
                return { success: true, data: course };
            } else {
                return { success: false, message: 'فشل تحميل الكورس' };
            }
        } catch (error) {
            console.error('Get course by ID error:', error);
            return { success: false, message: 'حدث خطأ في الاتصال' };
        }
    }
    
    // ========== LESSONS FUNCTIONS ==========
    
    // دالة لتحميل الدروس بواسطة معرف الكورس
    async function loadLessonsByCourseId(courseId) {
        try {
            const token = localStorage.getItem('authToken');
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            // استخدام الـ endpoint: GET /api/lessons/course/{courseId}
            const response = await fetch(`${ADMIN_API_BASE}/api/lessons/course/${courseId}`, {
                method: 'GET',
                headers: headers
            });
            
            if (response.ok) {
                const lessons = await response.json();
                return { success: true, data: lessons };
            } else {
                return { success: false, message: 'فشل تحميل الدروس' };
            }
        } catch (error) {
            console.error('Load lessons error:', error);
            return { success: false, message: 'حدث خطأ في الاتصال' };
        }
    }
    
    // دالة لعرض دروس الكورس
    async function showCourseLessons(courseId, courseTitle) {
        try {
            // عرض مؤشر تحميل
            const loadingModal = showLoadingModal('جاري تحميل الدروس...');
            
            // جلب الدروس الخاصة بالكورس
            const result = await loadLessonsByCourseId(courseId);
            
            // إغلاق مؤشر التحميل
            closeModal(loadingModal);
            
            if (result.success && result.data) {
                displayLessonsModal(result.data, courseTitle);
            } else {
                showAdminNotification(result.message || 'فشل تحميل الدروس', 'error');
            }
        } catch (error) {
            console.error('Error loading lessons:', error);
            showAdminNotification('حدث خطأ في تحميل الدروس', 'error');
        }
    }
    
    // دالة لعرض نافذة الدروس
    function displayLessonsModal(lessons, courseTitle) {
        // إنشاء عنصر المودال
        const modal = document.createElement('div');
        modal.className = 'lessons-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 20000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            border-radius: 20px;
            padding: 30px;
            max-width: 800px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            border: 3px solid #D4AF37;
            position: relative;
            transform: translateY(20px);
            transition: transform 0.3s ease;
        `;
        
        // بناء محتوى الدروس
        let lessonsHTML = '';
        
        if (!lessons || lessons.length === 0) {
            lessonsHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-book-open" style="font-size: 60px; color: #D4AF37; margin-bottom: 20px;"></i>
                    <p style="font-size: 18px;">لا توجد دروس متاحة لهذا الكورس حالياً</p>
                </div>
            `;
        } else {
            lessons.forEach((lesson, index) => {
                lessonsHTML += `
                    <div class="lesson-item" data-lesson-id="${lesson.id}" style="
                        background: #f8f9fa;
                        border-radius: 10px;
                        padding: 15px;
                        margin-bottom: 15px;
                        border-right: 4px solid #D4AF37;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        position: relative;
                    ">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div style="
                                width: 40px;
                                height: 40px;
                                background: #D4AF37;
                                border-radius: 50%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                color: white;
                                font-weight: bold;
                            ">${index + 1}</div>
                            <div style="flex: 1;">
                                <h4 style="margin: 0 0 5px 0; color: #333; font-size: 18px;">${lesson.title || 'عنوان الدرس'}</h4>
                                <p style="margin: 0; color: #666; font-size: 14px;">${lesson.description || 'وصف الدرس'}</p>
                                ${lesson.duration ? `<small style="color: #999;"><i class="fas fa-clock"></i> ${lesson.duration}</small>` : ''}
                            </div>
                            <i class="fas fa-chevron-left" style="color: #D4AF37;"></i>
                        </div>
                    </div>
                `;
            });
        }
        
        modalContent.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 2px solid #f0f0f0;">
                <h3 style="margin: 0; color: #D4AF37; font-size: 24px; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-graduation-cap"></i> 
                    دروس: ${courseTitle || 'الكورس'}
                </h3>
                <button class="close-lessons-modal" style="
                    background: none;
                    border: none;
                    font-size: 28px;
                    cursor: pointer;
                    color: #999;
                    transition: color 0.3s ease;
                ">&times;</button>
            </div>
            <div class="lessons-list">
                ${lessonsHTML}
            </div>
            ${lessons && lessons.length > 0 ? `
                <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #f0f0f0; text-align: center; color: #666;">
                    <i class="fas fa-info-circle"></i> 
                    اضغط على أي درس لعرض التفاصيل الكاملة
                </div>
            ` : ''}
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // إضافة تأثيرات hover للدروس
        setTimeout(() => {
            document.querySelectorAll('.lesson-item').forEach(item => {
                item.addEventListener('mouseenter', function() {
                    this.style.backgroundColor = '#fff';
                    this.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
                });
                item.addEventListener('mouseleave', function() {
                    this.style.backgroundColor = '#f8f9fa';
                    this.style.boxShadow = 'none';
                });
                
                // إضافة حدث النقر على الدرس
                item.addEventListener('click', async function() {
    const lessonId = this.getAttribute('data-lesson-id');
    const lessonTitle = this.querySelector('h4').textContent;

    // تحميل تفاصيل الدرس من API
    const result = await loadLesson(lessonId);

    if (result.success) {
        const lesson = result.data;

        // لو فيه فيديو URL شغّل الفيديو في نافذة جديدة
        if (lesson.videoUrl) {
            window.open(lesson.videoUrl, '_blank'); // يفتح الرابط في تاب جديد
        } else {
            // لو مفيش فيديو، نفتح تفاصيل الدرس
            loadAndShowLessonDetails(lessonId, lessonTitle);
        }
    } else {
        alert("فشل تحميل الدرس أو لا يوجد فيديو");
    }
});

            });
        }, 100);
        
        // تشغيل الأنيميشن
        setTimeout(() => {
            modal.style.opacity = '1';
            modalContent.style.transform = 'translateY(0)';
        }, 10);
        
        // إغلاق المودال
        const closeBtn = modalContent.querySelector('.close-lessons-modal');
        closeBtn.addEventListener('click', () => {
            modal.style.opacity = '0';
            modalContent.style.transform = 'translateY(20px)';
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.opacity = '0';
                modalContent.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    document.body.removeChild(modal);
                }, 300);
            }
        });
    }
    
    // دالة لتحميل وعرض تفاصيل درس معين
    async function loadAndShowLessonDetails(lessonId, lessonTitle) {
        try {
            // عرض مؤشر تحميل
            const loadingModal = showLoadingModal('جاري تحميل تفاصيل الدرس...');
            
            // جلب تفاصيل الدرس
            const result = await loadLesson(lessonId);
            
            // إغلاق مؤشر التحميل
            closeModal(loadingModal);
            
            if (result.success && result.data) {
                showLessonDetailsModal(result.data);
            } else {
                showAdminNotification(result.message || 'فشل تحميل تفاصيل الدرس', 'error');
            }
        } catch (error) {
            console.error('Error loading lesson details:', error);
            showAdminNotification('حدث خطأ في تحميل تفاصيل الدرس', 'error');
        }
    }
    
    // دالة لعرض تفاصيل الدرس
    function showLessonDetailsModal(lesson) {
        const modal = document.createElement('div');
        modal.className = 'lesson-details-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 21000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            border-radius: 20px;
            padding: 40px;
            max-width: 900px;
            width: 90%;
            max-height: 85vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            border: 3px solid #D4AF37;
            position: relative;
            transform: translateY(20px);
            transition: transform 0.3s ease;
        `;
        
        // معالجة محتوى الوسائط المتعددة إذا وجد
        let mediaContent = '';
        if (lesson.videoUrl) {
            mediaContent = `
                <div style="margin: 20px 0;">
                    <h4 style="color: #D4AF37; margin-bottom: 10px;"><i class="fas fa-video"></i> فيديو الدرس:</h4>
                    <video controls style="width: 100%; border-radius: 10px;" src="${lesson.videoUrl}"></video>
                </div>
            `;
        } else if (lesson.fileUrl) {
            mediaContent = `
                <div style="margin: 20px 0;">
                    <h4 style="color: #D4AF37; margin-bottom: 10px;"><i class="fas fa-file"></i> ملفات الدرس:</h4>
                    <a href="${lesson.fileUrl}" target="_blank" style="
                        display: inline-block;
                        background: #D4AF37;
                        color: white;
                        padding: 12px 25px;
                        border-radius: 25px;
                        text-decoration: none;
                        font-weight: bold;
                    "><i class="fas fa-download"></i> تحميل الملفات</a>
                </div>
            `;
        }
        
        modalContent.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="margin: 0; color: #D4AF37; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-book"></i> ${lesson.title || 'تفاصيل الدرس'}
                </h2>
                <button class="close-details-modal" style="
                    background: none;
                    border: none;
                    font-size: 32px;
                    cursor: pointer;
                    color: #999;
                    transition: color 0.3s ease;
                ">&times;</button>
            </div>
            
            <div style="background: #f8f9fa; border-radius: 15px; padding: 25px;">
                <h3 style="color: #333; margin-top: 0;">وصف الدرس</h3>
                <p style="line-height: 1.8; color: #555;">${lesson.description || 'لا يوجد وصف'}</p>
                
                ${lesson.content ? `
                    <h3 style="color: #333; margin-top: 25px;">محتوى الدرس</h3>
                    <div style="line-height: 1.8; color: #555;">${lesson.content}</div>
                ` : ''}
                
                ${mediaContent}
                
                ${lesson.resources && lesson.resources.length > 0 ? `
                    <h3 style="color: #333; margin-top: 25px;">الموارد الإضافية</h3>
                    <ul style="list-style: none; padding: 0;">
                        ${lesson.resources.map(resource => `
                            <li style="margin-bottom: 10px;">
                                <a href="${resource.url}" target="_blank" style="color: #D4AF37; text-decoration: none;">
                                    <i class="fas fa-link"></i> ${resource.name}
                                </a>
                            </li>
                        `).join('')}
                    </ul>
                ` : ''}
                
                ${lesson.duration ? `
                    <div style="margin-top: 20px; color: #666;">
                        <i class="fas fa-clock"></i> المدة: ${lesson.duration}
                    </div>
                ` : ''}
            </div>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // تشغيل الأنيميشن
        setTimeout(() => {
            modal.style.opacity = '1';
            modalContent.style.transform = 'translateY(0)';
        }, 10);
        
        // إغلاق المودال
        const closeBtn = modalContent.querySelector('.close-details-modal');
        closeBtn.addEventListener('click', () => {
            modal.style.opacity = '0';
            modalContent.style.transform = 'translateY(20px)';
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.opacity = '0';
                modalContent.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    document.body.removeChild(modal);
                }, 300);
            }
        });
    }
    
    // ========== ADMIN UI UPDATES ==========
    function updateAdminUI() {
        isAdmin = checkAdminStatus();
        
        console.log("🔄 Updating admin UI, isAdmin:", isAdmin);
        
        if (isAdmin) {
            showAdminFeatures();
        } else {
            hideAdminFeatures();
        }
    }
    
    function showAdminFeatures() {
        console.log("👑 Showing admin features");
        
        // 1. تحديث زر Join ليكون اسم الإدمن
        const joinBtn = document.getElementById("joinBtn");
        if (joinBtn) {
            const userName = localStorage.getItem('userName') || 'الإدارة';
            joinBtn.innerHTML = `<i class="fas fa-user-shield"></i> ${userName}`;
            joinBtn.style.background = 'linear-gradient(135deg, #FFD700, #D4AF37)';
            joinBtn.style.color = '#000';
            joinBtn.style.fontWeight = 'bold';
        }
        
        // 2. إضافة رابط لوحة التحكم إذا لم يكن موجوداً
        if (!document.getElementById('adminDashboardLink')) {
            const navLinks = document.querySelector('.nav-links');
            if (navLinks) {
                const adminLink = document.createElement('a');
                adminLink.id = 'adminDashboardLink';
                adminLink.href = 'admin.html';
                adminLink.innerHTML = '<i class="fas fa-tachometer-alt"></i> لوحة التحكم';
                adminLink.style.cssText = `
                    color: #D4AF37;
                    font-weight: bold;
                    border: 2px solid #D4AF37;
                    padding: 8px 15px;
                    border-radius: 20px;
                    margin-right: 10px;
                    background: rgba(212, 175, 55, 0.1);
                `;
                navLinks.insertBefore(adminLink, navLinks.firstChild);
            }
        }
        
        // 3. إضافة أدوات تحكم على الكورسات (فقط الحذف)
        addCourseAdminControls();
        
        // 4. تحديث واجهة عربة التسوق
        updateCartForAdmin();
    }
    
    function hideAdminFeatures() {
        console.log("👤 Hiding admin features");
        
        // إزالة رابط لوحة التحكم
        const adminLink = document.getElementById('adminDashboardLink');
        if (adminLink) adminLink.remove();
        
        // إزالة أدوات التحكم من الكورسات
        removeCourseAdminControls();
        
        // إعادة زر Join لحالته الأصلية
        const joinBtn = document.getElementById("joinBtn");
        if (joinBtn) {
            joinBtn.innerHTML = 'انضم الآن <i class="fas fa-chevron-down" style="font-size:12px; margin-right:5px;"></i>';
            joinBtn.style = '';
        }
    }
    
    // ========== ADMIN COURSE CONTROLS ==========
    function addCourseAdminControls() {
        const cards = document.querySelectorAll('.card');
        cards.forEach((card, index) => {
            // إذا كانت الأدوات موجودة بالفعل، تخطى
            if (card.querySelector('.admin-course-controls')) return;
            
            const priceDiv = card.querySelector('.price');
            if (priceDiv) {
                const controlsDiv = document.createElement('div');
                controlsDiv.className = 'admin-course-controls';
                controlsDiv.style.cssText = `
                    display: flex;
                    gap: 8px;
                    margin-top: 10px;
                    justify-content: center;
                `;
                
                // زر الحذف فقط (تم إزالة زر التحرير)
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'admin-delete-btn';
                deleteBtn.innerHTML = '<i class="fas fa-trash"></i> حذف';
                deleteBtn.style.cssText = `
                    background: #f44336;
                    color: white;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                    transition: all 0.3s;
                `;
                
                // تأثيرات hover
                deleteBtn.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-2px)';
                    this.style.boxShadow = '0 3px 10px rgba(0,0,0,0.2)';
                });
                deleteBtn.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0)';
                    this.style.boxShadow = 'none';
                });
                
                // أحداث النقر
                deleteBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    handleDeleteCourse(card, index);
                });
                
                controlsDiv.appendChild(deleteBtn);
                priceDiv.appendChild(controlsDiv);
            }
        });
    }
    
    function removeCourseAdminControls() {
        document.querySelectorAll('.admin-course-controls').forEach(controls => {
            controls.remove();
        });
    }
    
    function updateCartForAdmin() {
        const cartButton = document.getElementById('cartButton');
        if (cartButton && isAdmin) {
            cartButton.style.background = 'linear-gradient(135deg, #FFE8A3, #D4AF37)';
            cartButton.style.color = '#000';
            cartButton.style.border = '2px solid #000';
            
            // إضافة شارة الإدمن
            const badge = document.createElement('div');
            badge.className = 'admin-cart-badge';
            badge.innerHTML = '<i class="fas fa-crown"></i>';
            badge.style.cssText = `
                position: absolute;
                top: -5px;
                right: -5px;
                background: #000;
                color: #FFD700;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
            `;
            cartButton.appendChild(badge);
        }
    }
    
    // ========== ADMIN ACTION HANDLERS ==========
    async function handleDeleteCourse(card, index) {
        const courseId = card.getAttribute('data-course-id') || index + 1;
        const title = card.querySelector('h1').textContent;
        
        const confirmed = await showAdminDialog(
            'تأكيد الحذف',
            `<p style="color: #f44336; font-size: 16px; text-align: center;">
                هل أنت متأكد من حذف الكورس:<br>
                <strong>"${title}"</strong>؟
                <br><br>
                <small style="color: #666;">لا يمكن التراجع عن هذا الإجراء</small>
            </p>`
        );
        
        if (confirmed) {
            showAdminNotification('جاري حذف الكورس...', 'info');
            card.style.opacity = '0.5';
            
            const result = await deleteCourseAPI(courseId);
            
            if (result.success) {
                setTimeout(() => {
                    card.remove();
                    showAdminNotification('تم حذف الكورس بنجاح', 'success');
                    // تحديث الصفحات بعد الحذف
                    organizeCardsByPages();
                    showPage(currentPage);
                }, 500);
            } else {
                card.style.opacity = '1';
                showAdminNotification(result.message || 'فشل حذف الكورس', 'error');
            }
        }
    }
    
    // ========== ADMIN LOGIN HANDLER ==========
    // هذه الدالة ستتم استدعاؤها من صفحة login.html
    window.handleAdminLogin = async function(email, password) {
        try {
            // محاولة تسجيل الدخول كإدمن
            const response = await fetch(`${ADMIN_API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            if (response.ok) {
                const data = await response.json();
                
                // حفظ بيانات الإدمن
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userEmail', email);
                localStorage.setItem('userRole', 'Admin');
                localStorage.setItem('userName', data.user?.userName || 'Administrator');
                
                return { success: true, data };
            }
            
            // إذا فشل تسجيل دخول الإدمن، جرب كـ مستخدم عادي
            return null;
            
        } catch (error) {
            console.error('Admin login error:', error);
            return null;
        }
    };
    
    // ========== INITIALIZE ADMIN FEATURES ==========
    function initAdminFeatures() {
        // التحقق من حالة الإدمن عند تحميل الصفحة
        updateAdminUI();
        
        // تحديث واجهة الإدمن عند أي تغيير في localStorage
        window.addEventListener('storage', updateAdminUI);
        
        // تحديث عند تغيير حالة تسجيل الدخول
        const checkLoginInterval = setInterval(() => {
            const loggedIn = localStorage.getItem("isLoggedIn") === "true";
            if (loggedIn !== isAdmin) {
                updateAdminUI();
            }
        }, 1000);
        
        // تنظيف عند إغلاق الصفحة
        window.addEventListener('beforeunload', () => {
            clearInterval(checkLoginInterval);
        });
    }
    
    // ========== دالة للتحقق من حالة الإدمن ==========
    function checkAdminStatus() {
        const userEmail = localStorage.getItem("userEmail");
        const token = localStorage.getItem("authToken");
        const role = localStorage.getItem("userRole");
        
        isAdmin = (userEmail === ADMIN_EMAIL || role === "Admin");
        adminToken = token;
        
        console.log("🔍 Admin check:", {
            email: userEmail,
            role: role,
            isAdmin: isAdmin,
            hasToken: !!token
        });
        
        return isAdmin;
    }
    
    // ========== DYNAMIC COURSES FUNCTIONS ==========
    
    // دالة لتحميل وعرض الكورسات من API
    async function loadAndDisplayCourses() {
        try {
            const coursesContainer = document.getElementById(cardsContainerId);
            if (coursesContainer) {
                coursesContainer.innerHTML = `
                    <div class="loading-courses">
                        <div class="loading-spinner"></div>
                        <p>جاري تحميل الكورسات...</p>
                    </div>
                `;
            }
            
            const result = await loadCoursesFromAPI();
            
            if (result.success && result.data) {
                allCourses = result.data;
                displayDynamicCourses(allCourses);
                return { success: true };
            } else {
                if (coursesContainer) {
                    coursesContainer.innerHTML = `
                        <div class="error-loading">
                            <i class="fas fa-exclamation-circle"></i>
                            <p>${result.message || 'حدث خطأ في تحميل الكورسات'}</p>
                            <button onclick="window.loadAndDisplayCourses()" class="retry-btn">
                                <i class="fas fa-redo"></i> إعادة المحاولة
                            </button>
                        </div>
                    `;
                }
                return { success: false, message: result.message };
            }
        } catch (error) {
            console.error('Error loading courses:', error);
            const coursesContainer = document.getElementById(cardsContainerId);
            if (coursesContainer) {
                coursesContainer.innerHTML = `
                    <div class="error-loading">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>حدث خطأ في تحميل الكورسات</p>
                        <button onclick="window.loadAndDisplayCourses()" class="retry-btn">
                            <i class="fas fa-redo"></i> إعادة المحاولة
                        </button>
                    </div>
                `;
            }
            return { success: false, message: error.message };
        }
    }
    
    // دالة لعرض الكورسات ديناميكياً
    function displayDynamicCourses(courses) {
        const container = document.getElementById(cardsContainerId);
        if (!container) {
            console.error('Courses container not found');
            return;
        }
        
        container.innerHTML = '';
        
        if (!courses || courses.length === 0) {
            container.innerHTML = `
                <div class="no-courses">
                    <i class="fas fa-book-open"></i>
                    <p>لا توجد كورسات متاحة حالياً</p>
                    ${isAdmin ? '<button onclick="window.location.href=\'admin.html\'" class="retry-btn"><i class="fas fa-plus-circle"></i> إضافة كورس جديد</button>' : ''}
                </div>
            `;
            return;
        }
        
        // تنظيم الكورسات في صفحات
        courses.forEach((course, index) => {
            const pageNum = Math.floor(index / CARDS_PER_PAGE) + 1;
            const card = createDynamicCourseCard(course, pageNum, index);
            container.appendChild(card);
        });
        
        // تحديث إجمالي الصفحات
        totalPages = Math.ceil(courses.length / CARDS_PER_PAGE);
        
        // تنظيم الكروت وعرض الصفحة الأولى
        organizeCardsByPages();
        showPage(1);
        
        // إعادة إعداد الأحداث
        setupEventListeners();
        
        // إضافة عناصر التحكم الإدارية إذا كان المستخدم أدمن
        if (isAdmin) {
            addCourseAdminControls();
        }
    }
    
    // دالة لإنشاء كارت كورس ديناميكي
    function createDynamicCourseCard(course, pageNum, index) {
        const card = document.createElement('div');
        card.className = `card page-${pageNum}`;
        card.setAttribute('data-course-id', course.id || index + 1000);
        
        // بناء URL الصورة من الخادم
        const imageUrl = buildImageUrl(course.imageUrl || course.image);
        
        // صورة افتراضية إذا فشل تحميل الصورة
        const defaultImage = buildImageUrl(null);
        
        card.innerHTML = `
            <img src="${imageUrl}" 
                 alt="${course.title || course.Title}"
                 onerror="this.src='${defaultImage}'"
                 style="width: 100%; height: 180px; object-fit: cover; cursor: pointer;">
            <div class="card-content">
                <h1 style="cursor: pointer;">${course.title || course.Title}</h1>
                <p>${course.description || course.Description || 'وصف الكورس'}</p>
                <p>${course.university || course.University || 'جامعة'}</p>
                <div class="price">
                    <span>${course.price || course.Price || '0'} جنيه</span>
                    <button class="add-to-cart">اشترك</button>
                </div>
            </div>
        `;
        
        // إضافة حدث النقر على الكارد لعرض الدروس
        card.addEventListener('click', function(e) {
            // منع التنفيذ إذا تم الضغط على زر الاشتراك أو زر الحذف
            if (e.target.classList.contains('add-to-cart') || 
                e.target.closest('.admin-delete-btn') ||
                e.target.closest('.admin-course-controls')) {
                return;
            }
            
            const courseId = this.getAttribute('data-course-id');
            showCourseLessons(courseId, course.title || course.Title);
        });
        
        return card;
    }
    
    // دالة محسنة للتصفية حسب الجامعة
    async function filterCoursesByUniversity(university) {
        if (university === 'all') {
            // عرض جميع الكورسات
            const result = await loadCoursesFromAPI();
            if (result.success) {
                displayDynamicCourses(result.data);
                showUniversityNotification(`تم عرض جميع الكورسات`);
            }
            return;
        }
        
        // ترجمة اسم الجامعة الإنجليزي للعربي
        const universityArabicName = getUniversityArabicName(university);
        
        // استخدام API الجديدة للبحث حسب الجامعة
        const result = await loadCoursesByUniversity(universityArabicName);
        if (result.success) {
            displayDynamicCourses(result.data);
            showUniversityNotification(`تم عرض ${result.data.length} كورس لـ ${universityArabicName}`);
        } else {
            showUniversityNotification(result.message);
        }
    }
    
    // ========== USER MANAGEMENT ==========
    function logoutUser() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
        window.location.reload();
    }
    
    // ========== CART FUNCTIONS ==========
    async function checkoutCart() {
        if (cart.length === 0) {
            alert('عربة التسوق فارغة');
            return;
        }
        
        if (!localStorage.getItem('authToken')) {
            alert('يجب تسجيل الدخول لإتمام الشراء');
            window.location.href = 'login.html';
            return;
        }
        
        for (const item of cart) {
            const success = await buyCourse(item.id);
            if (!success) {
                return;
            }
        }
        
        localStorage.removeItem('cart');
        cart = [];
        updateCartCount();
        alert('تم شراء جميع الكورس بنجاح!');
        window.location.reload();
    }
    
    function updateCartCount() {
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            cartCount.textContent = cart.length;
        }
    }
    
    function updateCartModal() {
        const cartItemsContainer = document.getElementById('cartItems');
        const cartTotalContainer = document.getElementById('cartTotal');
        
        if (!cartItemsContainer) return;
        
        cartItemsContainer.innerHTML = '';
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="cart-empty">
                    <i class="fas fa-shopping-cart"></i>
                    <p>عربة التسوق فارغة</p>
                </div>
            `;
            if (cartTotalContainer) {
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
            }
            return;
        }
        
        let total = 0;
        
        cart.forEach((item, index) => {
            const priceNum = parseInt(item.price.replace(/\D/g, '')) || 0;
            total += priceNum;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.title}">
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-price">${item.price}</div>
                </div>
                <button class="remove-from-cart" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            
            cartItemsContainer.appendChild(cartItem);
        });
        
        document.querySelectorAll('.remove-from-cart').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                cart.splice(index, 1);
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartModal();
                updateCartCount();
            });
        });
        
        if (cartTotalContainer) {
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
    }
    
    // ========== COURSE PAGINATION ==========
    function organizeCardsByPages() {
        const allCards = document.querySelectorAll('.card');
        
        allCards.forEach(card => {
            card.classList.remove('page-1', 'page-2');
        });
        
        allCards.forEach((card, index) => {
            if (index < CARDS_PER_PAGE) {
                card.classList.add('page-1');
            } else if (index < CARDS_PER_PAGE * 2) {
                card.classList.add('page-2');
            } else if (index < CARDS_PER_PAGE * 3) {
                card.classList.add('page-3');
            }
        });
        
        // تحديث إجمالي الصفحات
        totalPages = Math.ceil(allCards.length / CARDS_PER_PAGE);
    }

    function showPage(page) {
        document.querySelectorAll('.card').forEach(card => {
            card.style.display = 'none';
        });
        
        document.querySelectorAll('.page-' + page).forEach(card => {
            card.style.display = 'block';
        });
        
        currentPage = page;
    }

    // ========== JOIN BUTTON FUNCTIONALITY ==========
    const joinBtn = document.getElementById("joinBtn");
    const joinDropdown = document.getElementById("joinDropdown");

    function updateJoinState() {
        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

        if (isLoggedIn) {
            const userName = localStorage.getItem("userName") || "مستخدم";
            const userRole = localStorage.getItem("userRole");
            
            if (userRole === "Admin") {
                // يتم التعامل معه في showAdminFeatures
            } else {
                joinBtn.innerHTML = `${userName} <i class="fas fa-chevron-down" style="font-size:12px; margin-right:5px;"></i>`;
            }
            joinDropdown.style.display = "none";
        } else {
            joinBtn.innerHTML = 'انضم الآن <i class="fas fa-chevron-down" style="font-size:12px; margin-right:5px;"></i>';
            joinDropdown.style.display = "none";
        }
    }

    // ========== UNIVERSITIES DROPDOWN ==========
    const universitiesBtn = document.getElementById('universitiesBtn');
    const universitiesDropdown = document.getElementById('universitiesDropdown');
    const universitySearch = document.getElementById('universitySearch');
    const universityItems = document.querySelectorAll('.university-item');

    // ========== MOBILE MENU ==========
    const menuToggle = document.getElementById('menuToggle');
    const mobileSidebar = document.getElementById('mobileSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    // ========== CART MODAL ELEMENTS ==========
    const cartButton = document.getElementById('cartButton');
    const cartModal = document.getElementById('cartModal');
    const closeCart = document.getElementById('closeCart');
    const continueBtn = document.getElementById('continueBtn');
    const checkoutBtn = document.getElementById('checkoutBtn');

    // ========== SEARCH ELEMENTS ==========
    const searchInput = document.getElementById('searchInput');
    const searchForm = document.getElementById('searchForm');
    const searchResults = document.getElementById('searchResults');

    // ========== BUTTON ELEMENTS ==========
    const heroCta = document.getElementById('heroCta');
    const trialButton = document.getElementById('trialButton');
    const nextBtn = document.getElementById("next");
    const prevBtn = document.getElementById("prev");

    // ========== INITIALIZATION ==========
    function initializeAll() {
        // تحديث حالة المستخدم
        updateJoinState();
        
        // تحديث حالة الإدمن
        updateAdminUI();
        
        // تحميل وعرض الكورسات من API
        const hasDynamicContainer = document.getElementById(cardsContainerId);
        if (hasDynamicContainer) {
            loadAndDisplayCourses();
        } else {
            // إذا كان هناك كروت ثابتة، ننظمها
            organizeCardsByPages();
            showPage(1);
        }
        
        // تحديث عربة التسوق
        updateCartCount();
        
        // إعداد جميع المكونات
        setupEventListeners();
        
        // إعداد السلايدرات
        initReviewsSlider();
        initUniversitySlider();
        
        // بدء تشغيل ميزات الإدمن
        setTimeout(() => {
            initAdminFeatures();
        }, 1000);
    }

    // ========== EVENT LISTENERS SETUP ==========
    function setupEventListeners() {
        // Join Button
        if (joinBtn) {
            joinBtn.addEventListener("click", function (e) {
                const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

                if (isLoggedIn) {
                    logoutUser();
                } else {
                    if (joinDropdown) {
                        joinDropdown.style.display =
                            joinDropdown.style.display === "block" ? "none" : "block";
                    }
                }
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener("click", function (e) {
            if (!e.target.closest(".nav-join-wrapper")) {
                if (joinDropdown) joinDropdown.style.display = "none";
            }
        });

        // Mobile Menu
        if (menuToggle) {
            menuToggle.addEventListener('click', function() {
                mobileSidebar.classList.add('active');
                sidebarOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        }

        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', function() {
                mobileSidebar.classList.remove('active');
                this.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        }

        // Close sidebar when clicking links
        document.querySelectorAll('.mobile-nav-links a').forEach(link => {
            link.addEventListener('click', function() {
                mobileSidebar.classList.remove('active');
                sidebarOverlay.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        });

        // Universities Dropdown
        if (universitiesBtn && universitiesDropdown) {
            universitiesBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                universitiesDropdown.classList.toggle('show');
            });
            
            if (universitySearch) {
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
            }
            
            universityItems.forEach(item => {
                item.addEventListener('click', function(e) {
                    e.preventDefault();
                    const university = this.getAttribute('data-university');
                    universitiesDropdown.classList.remove('show');
                    
                    filterCoursesByUniversity(university);
                    document.getElementById('courses').scrollIntoView({ behavior: 'smooth' });
                });
            });
            
            document.addEventListener('click', function(e) {
                if (!universitiesBtn.contains(e.target) && !universitiesDropdown.contains(e.target)) {
                    universitiesDropdown.classList.remove('show');
                }
            });
            
            universitiesDropdown.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }

        // Cart Modal
        if (cartButton && cartModal) {
            cartButton.addEventListener('click', function() {
                cartModal.classList.add('show');
                updateCartModal();
                document.body.style.overflow = 'hidden';
            });
        }

        if (closeCart && cartModal) {
            closeCart.addEventListener('click', function() {
                cartModal.classList.remove('show');
                document.body.style.overflow = 'auto';
            });
        }

        if (continueBtn && cartModal) {
            continueBtn.addEventListener('click', function() {
                cartModal.classList.remove('show');
                document.body.style.overflow = 'auto';
            });
        }

        if (cartModal) {
            cartModal.addEventListener('click', function(e) {
                if (e.target === cartModal) {
                    cartModal.classList.remove('show');
                    document.body.style.overflow = 'auto';
                }
            });
        }

        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', function() {
                if (cart.length === 0) {
                    alert('عربة التسوق فارغة');
                    return;
                }
                checkoutCart();
            });
        }

        // Add to Cart Buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', function() {
                const card = this.closest('.card');
                const title = card.querySelector('h1').textContent;
                const price = card.querySelector('.price span').textContent;
                const image = card.querySelector('img').src;
                const courseId = card.getAttribute('data-course-id') || Date.now();
                
                cart.push({
                    id: courseId,
                    title: title,
                    price: price,
                    image: image
                });
                
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartCount();
                if (isAdmin) {
                    showAdminNotification('تم إضافة الكورس إلى السلة', 'success');
                } else {
                    alert('تم إضافة الكورس إلى السلة');
                }
            });
        });

        // Join Button Dropdown Hover
        if (joinBtn && joinDropdown) {
            joinBtn.addEventListener('mouseenter', function() {
                joinDropdown.classList.add('show');
            });
            
            joinBtn.addEventListener('mouseleave', function() {
                setTimeout(() => {
                    if (!joinDropdown.matches(':hover')) {
                        joinDropdown.classList.remove('show');
                    }
                }, 200);
            });
            
            joinDropdown.addEventListener('mouseleave', function() {
                joinDropdown.classList.remove('show');
            });
            
            document.addEventListener('click', function(e) {
                if (!joinBtn.contains(e.target) && !joinDropdown.contains(e.target)) {
                    joinDropdown.classList.remove('show');
                }
            });
        }

        // Pagination Buttons
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                if (currentPage < totalPages) {
                    currentPage++;
                    showPage(currentPage);
                }
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                if (currentPage > 1) {
                    currentPage--;
                    showPage(currentPage);
                }
            });
        }

        // General Buttons
        if (heroCta) {
            heroCta.addEventListener('click', function() {
                window.location.href = 'register.html';
            });
        }

        if (trialButton) {
            trialButton.addEventListener('click', function() {
                // إزالة الرسالة المنبثقة
            });
        }

        // Login and Register Links
        document.querySelectorAll('a[href*="login.html"]').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = 'login.html';
            });
        });

        document.querySelectorAll('a[href*="register.html"]').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = 'register.html';
            });
        });

        // Search Functionality مع دعم API الجديدة
        async function displaySearchResults(query) {
            if (!searchResults) return;
            
            searchResults.innerHTML = '';
            
            if (!query.trim()) {
                searchResults.style.display = 'none';
                return;
            }
            
            // استخدام API الجديدة للبحث
            const result = await searchCourses(query);
            
            if (result.success && result.data && result.data.length > 0) {
                result.data.forEach(course => {
                    const resultItem = document.createElement('div');
                    resultItem.className = 'search-result-item';
                    resultItem.innerHTML = `
                        <img src="${buildImageUrl(course.imageUrl)}" alt="${course.title}">
                        <div>
                            <h4>${course.title}</h4>
                            <p>${course.description || ''} - ${course.university || ''}</p>
                        </div>
                        <div class="price">${course.price || '0'} جنيه</div>
                    `;
                    
                    resultItem.addEventListener('click', function() {
                        // عرض الكورس المحدد
                        if (searchInput) searchInput.value = '';
                        searchResults.style.display = 'none';
                        document.getElementById('courses').scrollIntoView({ behavior: 'smooth' });
                        
                        // عرض الدروس الخاصة بالكورس
                        showCourseLessons(course.id, course.title);
                    });
                    
                    searchResults.appendChild(resultItem);
                });
                
                searchResults.style.display = 'block';
            } else {
                searchResults.innerHTML = '<div class="no-results">لا توجد نتائج</div>';
                searchResults.style.display = 'block';
            }
        }

        if (searchInput) {
            searchInput.addEventListener('input', function() {
                displaySearchResults(this.value);
            });
        }

        if (searchForm) {
            searchForm.addEventListener('submit', function(e) {
                e.preventDefault();
                if (searchInput) {
                    displaySearchResults(searchInput.value);
                }
            });
        }

        // Close search results when clicking outside
        document.addEventListener('click', function(e) {
            if (searchForm && !searchForm.contains(e.target) && searchResults && !searchResults.contains(e.target)) {
                if (searchResults) searchResults.style.display = 'none';
            }
        });

        // Smooth Scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                if (href !== '#') {
                    e.preventDefault();
                    const targetElement = document.querySelector(href);
                    if (targetElement) {
                        window.scrollTo({
                            top: targetElement.offsetTop - 80,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });

        // Learn Link Dropdown
        const learnLink = document.querySelector('.has-dropdown');
        const dropdownMenu = document.getElementById('dropdownMenu');

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

        // Window Resize Handler
        window.addEventListener('resize', function() {
            if (window.innerWidth > 900) {
                if (mobileSidebar) mobileSidebar.classList.remove('active');
                if (sidebarOverlay) sidebarOverlay.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }

    // ========== SLIDER FUNCTIONS ==========
    function initReviewsSlider() {
        const container = document.getElementById("reviewsContainer");
        const nextBtn = document.getElementById("nextBtn");
        const prevBtn = document.getElementById("prevBtn");

        if (!container || !nextBtn || !prevBtn) return;

        nextBtn.addEventListener("click", () => {
            container.scrollBy({ left: 350, behavior: "smooth" });
        });

        prevBtn.addEventListener("click", () => {
            container.scrollBy({ left: -350, behavior: "smooth" });
        });

        let isDown = false;
        let startX;
        let scrollLeft;

        container.addEventListener('mousedown', (e) => {
            isDown = true;
            container.style.cursor = 'grabbing';
            startX = e.pageX - container.offsetLeft;
            scrollLeft = container.scrollLeft;
        });

        container.addEventListener('mouseleave', () => {
            isDown = false;
            container.style.cursor = 'grab';
        });

        container.addEventListener('mouseup', () => {
            isDown = false;
            container.style.cursor = 'grab';
        });

        container.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - container.offsetLeft;
            const walk = (x - startX) * 2;
            container.scrollLeft = scrollLeft - walk;
        });
    }

    function initUniversitySlider() {
        const slider = document.getElementById("slider");
        const arrowLeft = document.getElementById("arrowLeft");
        const arrowRight = document.getElementById("arrowRight");
        const cards = document.querySelectorAll('.uni-card');
        
        if (!slider || !arrowLeft || !arrowRight || cards.length === 0) return;
        
        let currentIndex = 0;
        let cardsToShow = 4;
        
        function calculateVisibleCards() {
            const containerWidth = slider.parentElement.offsetWidth;
            const cardWidth = cards[0].offsetWidth + 30;
            
            if (containerWidth < 600) {
                cardsToShow = 1;
            } else if (containerWidth < 900) {
                cardsToShow = 2;
            } else if (containerWidth < 1200) {
                cardsToShow = 3;
            } else {
                cardsToShow = 4;
            }
            
            return cardsToShow;
        }
        
        function updateArrows() {
            const visibleCards = calculateVisibleCards();
            const maxIndex = Math.max(0, cards.length - visibleCards);
            
            if (currentIndex >= maxIndex) {
                arrowLeft.disabled = true;
                arrowLeft.style.opacity = '0.5';
                arrowLeft.style.cursor = 'not-allowed';
            } else {
                arrowLeft.disabled = false;
                arrowLeft.style.opacity = '1';
                arrowLeft.style.cursor = 'pointer';
            }
            
            if (currentIndex <= 0) {
                arrowRight.disabled = true;
                arrowRight.style.opacity = '0.5';
                arrowRight.style.cursor = 'not-allowed';
            } else {
                arrowRight.disabled = false;
                arrowRight.style.opacity = '1';
                arrowRight.style.cursor = 'pointer';
            }
        }
        
        function slideTo(index) {
            const visibleCards = calculateVisibleCards();
            const maxIndex = Math.max(0, cards.length - visibleCards);
            
            if (index < 0) index = 0;
            if (index > maxIndex) index = maxIndex;
            
            currentIndex = index;
            const cardWidth = cards[0].offsetWidth + 30;
            const translateX = currentIndex * cardWidth;
            
            slider.style.transform = `translateX(${translateX}px)`;
            slider.style.transition = 'transform 0.5s ease';
            updateArrows();
        }
        
        arrowLeft.addEventListener('click', function() {
            if (!arrowLeft.disabled) {
                slideTo(currentIndex + 1);
            }
        });
        
        arrowRight.addEventListener('click', function() {
            if (!arrowRight.disabled) {
                slideTo(currentIndex - 1);
            }
        });
        
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                slideTo(currentIndex);
            }, 250);
        });
        
        let isDown = false;
        let startX;
        
        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            slider.style.cursor = 'grabbing';
            startX = e.pageX;
            slider.style.transition = 'none';
        });
        
        slider.addEventListener('mouseleave', () => {
            isDown = false;
            slider.style.cursor = 'grab';
        });
        
        slider.addEventListener('mouseup', () => {
            isDown = false;
            slider.style.cursor = 'grab';
            slider.style.transition = 'transform 0.5s ease';
            
            const cardWidth = cards[0].offsetWidth + 30;
            const currentTranslate = parseInt(slider.style.transform.replace('translateX(', '').replace('px)', '') || 0);
            const nearestIndex = Math.round(currentTranslate / cardWidth);
            slideTo(nearestIndex);
        });
        
        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            
            const cardWidth = cards[0].offsetWidth + 30;
            const movement = startX - e.pageX;
            const translateChange = movement / 2;
            
            const currentTranslate = currentIndex * cardWidth;
            const newTranslate = currentTranslate + translateChange;
            
            const visibleCards = calculateVisibleCards();
            const maxIndex = Math.max(0, cards.length - visibleCards);
            const minTranslate = 0;
            const maxTranslate = maxIndex * cardWidth;
            const limitedTranslate = Math.max(minTranslate, Math.min(newTranslate, maxTranslate));
            
            slider.style.transform = `translateX(${limitedTranslate}px)`;
        });
        
        calculateVisibleCards();
        slideTo(0);
        slider.style.cursor = 'grab';
    }

    // ========== GLOBAL EXPORTS ==========
    window.loginUser = loginUser;
    window.registerUser = registerUser;
    window.logoutUser = logoutUser;
    window.loadCoursesByPage = loadCoursesByPage;
    window.loadCoursesByUniversity = loadCoursesByUniversity;
    window.searchCourses = searchCourses;
    window.loadLesson = loadLesson;
    window.getCourseById = getCourseById;
    window.loadAndDisplayCourses = loadAndDisplayCourses;
    window.filterCoursesByUniversity = filterCoursesByUniversity;
    window.buildImageUrl = buildImageUrl;
    window.showCourseLessons = showCourseLessons; // إضافة الدالة الجديدة للكائن العام

    // ========== START APPLICATION ==========
    initializeAll();
});