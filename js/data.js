// بيانات افتراضية للعرض
const sampleData = {
    // المستخدمون
    users: [
        {
            id: 1,
            fullName: "محمد أحمد",
            email: "mohamed@example.com",
            phone: "0501234567",
            location: "الرياض، السعودية",
            joinDate: "يناير 2024",
            title: "طالب - مطور ويب",
            bio: "مطور ويب بخبرة 5 سنوات في تطوير التطبيقات والمواقع الإلكترونية.",
            skills: ["HTML/CSS", "JavaScript", "React", "Node.js", "Python", "SQL", "Git", "Docker"],
            languages: [
                { name: "العربية", level: 100, label: "اللغة الأم" },
                { name: "الإنجليزية", level: 80, label: "متقدم" }
            ],
            stats: {
                courses: 5,
                studyHours: 120,
                certificates: 3,
                avgRating: 4.8
            }
        }
    ],
    
    // الدورات
    courses: [
        {
            id: 1,
            title: "دورة تطوير الويب المتكاملة",
            description: "تعلم تطوير مواقع الويب من الصفر إلى الاحتراف باستخدام أحدث التقنيات",
            category: "برمجة",
            instructor: "أحمد محمد",
            instructorAvatar: "assets/images/instructor-1.jpg",
            price: 299,
            originalPrice: 499,
            rating: 4.8,
            students: 1250,
            duration: "30 ساعة",
            lessons: 50,
            level: "مبتدئ إلى متقدم",
            hasCertificate: true,
            image: "assets/images/course-placeholder.jpg",
            tags: ["HTML", "CSS", "JavaScript", "React", "Node.js"],
            whatYouLearn: [
                "بناء مواقع ويب متكاملة",
                "تطوير تطبيقات ويب ديناميكية",
                "استخدام قواعد البيانات",
                "نشر التطبيقات على السحابة"
            ]
        },
        {
            id: 2,
            title: "دورة تصميم UI/UX",
            description: "أساسيات تصميم واجهات المستخدم وتجربة المستخدم للمبتدئين",
            category: "تصميم",
            instructor: "سارة عبدالله",
            instructorAvatar: "assets/images/instructor-2.jpg",
            price: 199,
            originalPrice: 299,
            rating: 4.6,
            students: 890,
            duration: "20 ساعة",
            lessons: 30,
            level: "مبتدئ",
            hasCertificate: true,
            image: "assets/images/course-placeholder.jpg",
            tags: ["تصميم", "UI", "UX", "Figma", "Adobe XD"],
            whatYouLearn: [
                "مبادئ التصميم الأساسية",
                "تصميم واجهات المستخدم",
                "تحسين تجربة المستخدم",
                "استخدام أدوات التصميم الحديثة"
            ]
        },
        {
            id: 3,
            title: "دورة تحليل البيانات",
            description: "تعلم تحليل البيانات باستخدام Python وتقنيات الذكاء الاصطناعي",
            category: "علوم البيانات",
            instructor: "خالد سعيد",
            instructorAvatar: "assets/images/instructor-1.jpg",
            price: 399,
            originalPrice: 599,
            rating: 4.9,
            students: 650,
            duration: "40 ساعة",
            lessons: 60,
            level: "متوسط إلى متقدم",
            hasCertificate: true,
            image: "assets/images/course-placeholder.jpg",
            tags: ["Python", "Data Analysis", "AI", "Machine Learning"],
            whatYouLearn: [
                "معالجة وتحليل البيانات",
                "التعلم الآلي",
                "تصور البيانات",
                "بناء نماذج تنبؤية"
            ]
        }
    ],
    
    // الفيديوهات
    videos: [
        {
            id: 1,
            courseId: 1,
            title: "مقدمة في HTML",
            description: "تعلم أساسيات لغة HTML لبناء هيكل صفحات الويب",
            duration: 1800, // بالثواني
            orderIndex: 1,
            url: "https://example.com/videos/html-intro.mp4",
            isPreview: true,
            uploadDate: "2024-01-15"
        },
        {
            id: 2,
            courseId: 1,
            title: "أساسيات CSS",
            description: "تعلم كيفية تنسيق صفحات الويب باستخدام CSS",
            duration: 2400,
            orderIndex: 2,
            url: "https://example.com/videos/css-basics.mp4",
            isPreview: false,
            uploadDate: "2024-01-16"
        }
    ],
    
    // الإنجازات
    achievements: [
        {
            id: 1,
            userId: 1,
            title: "متعلم نشط",
            description: "أكمل 100 ساعة دراسة",
            icon: "fas fa-graduation-cap",
            date: "يناير 2024",
            image: "assets/images/achievement-1.png"
        },
        {
            id: 2,
            userId: 1,
            title: "طالب متفوق",
            description: "حصل على 5 شهادات مكتملة",
            icon: "fas fa-trophy",
            date: "ديسمبر 2023",
            image: "assets/images/achievement-2.png"
        },
        {
            id: 3,
            userId: 1,
            title: "مشارك نشط",
            description: "ساهم في 50 مناقشة",
            icon: "fas fa-comments",
            date: "نوفمبر 2023",
            image: "assets/images/achievement-3.png"
        }
    ],
    
    // الشهادات
    certificates: [
        {
            id: 1,
            userId: 1,
            courseId: 1,
            title: "شهادة إتمام دورة تطوير الويب",
            description: "تم منح هذه الشهادة تقديراً لإكمال دورة تطوير الويب بنجاح",
            issueDate: "2024-01-15",
            expiryDate: null,
            certificateId: "CERT-2024-00123",
            downloadUrl: "#",
            image: "assets/images/certificate-bg.png"
        },
        {
            id: 2,
            userId: 1,
            courseId: 2,
            title: "شهادة إتمام دورة تصميم UI/UX",
            description: "تم منح هذه الشهادة تقديراً لإكمال دورة تصميم UI/UX بنجاح",
            issueDate: "2023-12-20",
            expiryDate: null,
            certificateId: "CERT-2023-00987",
            downloadUrl: "#",
            image: "assets/images/certificate-bg.png"
        }
    ],
    
    // الإحصائيات
    statistics: {
        totalUsers: 10500,
        totalCourses: 250,
        totalVideos: 1500,
        totalRevenue: 1250000,
        monthlyGrowth: 12,
        activeUsers: 3200,
        completionRate: 78
    }
};

// وظائف مساعدة للبيانات
class DataHelper {
    static getCourses() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(sampleData.courses);
            }, 500);
        });
    }
    
    static getCourse(id) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const course = sampleData.courses.find(c => c.id === parseInt(id));
                if (course) {
                    resolve(course);
                } else {
                    reject(new Error('Course not found'));
                }
            }, 300);
        });
    }
    
    static getUserCourses(userId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // محاكاة دورات المستخدم
                const userCourses = sampleData.courses.map(course => ({
                    ...course,
                    progress: Math.floor(Math.random() * 100),
                    completed: Math.random() > 0.5,
                    enrollmentDate: "2024-01-15"
                }));
                resolve(userCourses);
            }, 500);
        });
    }
    
    static getUserAchievements(userId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(sampleData.achievements);
            }, 300);
        });
    }
    
    static getCertificates(userId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(sampleData.certificates);
            }, 300);
        });
    }
    
    static getStatistics() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(sampleData.statistics);
            }, 500);
        });
    }
    
    static validateCoupon(couponCode, courseId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // محاكاة التحقق من كود الخصم
                const validCoupons = {
                    'WELCOME10': 10,
                    'STUDENT20': 20,
                    'SPECIAL30': 30
                };
                
                if (validCoupons[couponCode.toUpperCase()]) {
                    resolve({
                        valid: true,
                        discount: validCoupons[couponCode.toUpperCase()],
                        message: 'تم تطبيق الخصم بنجاح'
                    });
                } else {
                    resolve({
                        valid: false,
                        message: 'كود الخصم غير صالح'
                    });
                }
            }, 800);
        });
    }
    
    static processPayment(paymentData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // محاكاة عملية الدفع
                const success = Math.random() > 0.1; // 90% نجاح
                
                if (success) {
                    resolve({
                        success: true,
                        orderNumber: 'ORD-' + Date.now(),
                        transactionId: 'TXN-' + Math.random().toString(36).substr(2, 9),
                        message: 'تمت عملية الدفع بنجاح'
                    });
                } else {
                    resolve({
                        success: false,
                        message: 'فشل في عملية الدفع. الرجاء المحاولة مرة أخرى.'
                    });
                }
            }, 1500);
        });
    }
}

// جعل البيانات متاحة عالمياً
window.sampleData = sampleData;
window.DataHelper = DataHelper;