// api.js

// ==============================
// CONFIG
// ==============================
const API_BASE_URL = 'https://ibtakr-academy.com';
const DEV_MODE = true; // تغيير إلى false للإنتاج

// ==============================
// API CLASS
// ==============================
class EduPlatformAPI {
    constructor() {
        this.token = localStorage.getItem('authToken');
    }

    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        // إرسال التوكن لو موجود
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        if (DEV_MODE) {
            console.log(`📡 API Request: ${options.method || 'GET'} ${url}`);
            console.log('Headers:', headers);
            if (options.body) console.log('Body:', options.body);
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
                credentials: 'include' // مهم للـ CORS
            });

            if (DEV_MODE) {
                console.log(`📥 API Response: ${response.status} ${response.statusText}`);
            }

            if (!response.ok) {
                let errorMessage = `HTTP Error ${response.status}`;
                let errorData = null;

                try {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        errorData = await response.json();
                        errorMessage = errorData.message || errorData.title || errorMessage;
                        
                        if (errorData.errors) {
                            const validationErrors = Object.values(errorData.errors).flat();
                            errorMessage = validationErrors.join(', ');
                        }
                    } else {
                        errorMessage = await response.text();
                    }
                } catch (parseError) {
                    console.warn('Failed to parse error response:', parseError);
                }

                if (response.status === 401) {
                    console.log('🔐 Authentication failed, logging out...');
                    this.logout();
                    
                    // Redirect to login if not already there
                    if (!window.location.href.includes('login.html')) {
                        window.location.href = 'login.html?expired=true';
                    }
                }

                throw new Error(errorMessage);
            }

            // في حالة NoContent
            if (response.status === 204) return null;

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                if (DEV_MODE) console.log('Response Data:', data);
                return data;
            }

            return await response.text();
        } catch (err) {
            console.error('🚨 API Error:', {
                endpoint,
                error: err.message,
                stack: err.stack
            });
            
            // إظهار رسالة للمستخدم
            if (DEV_MODE && typeof window !== 'undefined' && window.showNotification) {
                window.showNotification(`API Error: ${err.message}`, 'error');
            }
            
            throw err;
        }
    }

    // ==============================
    // AUTH
    // ==============================
    register(data) {
        return this.request('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async login(email, password) {
        const res = await this.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (res?.token) {
            this.token = res.token;
            localStorage.setItem('authToken', res.token);
            localStorage.setItem('userRole', res.role || 'User');
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userId', res.userId);
            
            if (DEV_MODE) {
                console.log('🔑 Login successful, token saved');
            }
        }

        return res;
    }

    logout() {
        this.token = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userId');
        
        if (DEV_MODE) {
            console.log('👋 User logged out');
        }
    }

    // ==============================
    // COURSES
    // ==============================
    getCourses() {
        return this.request('/api/course');
    }

    getCourse(id) {
        return this.request(`/api/course/${id}`);
    }

    buyCourse(id) {
        return this.request(`/api/course/buy/${id}`, {
            method: 'POST'
        });
    }

    // ==============================
    // USER
    // ==============================
    getUserProfile() {
        return this.request('/api/users/profile');
    }

    updateUserProfile(data) {
        return this.request('/api/users/profile', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    getUserCourses() {
        return this.request('/api/users/courses');
    }

    // ==============================
    // ADMIN COURSES API (FormData for images)
    // ==============================
    createCourse(courseData) {
        const formData = new FormData();
        
        // Add all fields to FormData
        Object.keys(courseData).forEach(key => {
            if (key === 'imageFile' && courseData[key]) {
                formData.append('ImageFile', courseData[key]);
            } else if (key === 'imageUrl' && courseData[key]) {
                formData.append('ImageUrl', courseData[key]);
            } else if (courseData[key] !== undefined && courseData[key] !== null) {
                formData.append(key.charAt(0).toUpperCase() + key.slice(1), courseData[key]);
            }
        });

        return this.request('/api/course', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`
            },
            body: formData
        });
    }

    updateCourse(courseId, courseData) {
        const formData = new FormData();
        
        Object.keys(courseData).forEach(key => {
            if (key === 'imageFile' && courseData[key]) {
                formData.append('ImageFile', courseData[key]);
            } else if (key === 'imageUrl' && courseData[key]) {
                formData.append('ImageUrl', courseData[key]);
            } else if (courseData[key] !== undefined && courseData[key] !== null) {
                formData.append(key.charAt(0).toUpperCase() + key.slice(1), courseData[key]);
            }
        });

        return this.request(`/api/course/${courseId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${this.token}`
            },
            body: formData
        });
    }

    deleteCourse(id) {
        return this.request(`/api/course/${id}`, {
            method: 'DELETE'
        });
    }

    getAllCoursesAdmin() {
        return this.request('/api/course');
    }

    getCoursesByPage(page) {
        return this.request(`/api/course/page/${page}`);
    }

    searchCourses(query) {
        return this.request(`/api/course/search?query=${encodeURIComponent(query)}`);
    }

    getCoursesByUniversity(university) {
        return this.request(`/api/course/university/${encodeURIComponent(university)}`);
    }
}

// ==============================
// SINGLETON
// ==============================
const api = new EduPlatformAPI();
window.api = api;

// ==============================
// HELPERS
// ==============================
class ApiHelper {
    static isLoggedIn() {
        const token = localStorage.getItem('authToken');
        return !!token && token.length > 10;
    }

    static getUserRole() {
        return localStorage.getItem('userRole') || 'User';
    }

    static isAdmin() {
        return this.getUserRole() === 'Admin';
    }

    static async handleLogin(email, password) {
        try {
            const res = await api.login(email, password);

            if (res.token) {
                return { 
                    success: true, 
                    role: res.role || 'User',
                    userId: res.userId
                };
            } else {
                return { 
                    success: false, 
                    message: 'No token received from server' 
                };
            }
        } catch (e) {
            return { 
                success: false, 
                message: e.message || 'Login failed. Check your credentials.'
            };
        }
    }

    static logout() {
        api.logout();
        window.location.href = 'index.html';
    }

    static async testConnection() {
        try {
            const response = await fetch(`${API_BASE_URL}/health`, {
                method: 'GET'
            });
            return response.ok;
        } catch {
            return false;
        }
    }

    // ==============================
    // ADMIN COURSES HELPER
    // ==============================
    static async addCourse(data) {
        if (!ApiHelper.isAdmin()) {
            throw new Error('غير مصرح. تحتاج صلاحيات مدير');
        }

        try {
            const result = await api.createCourse(data);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    static async updateCourse(id, data) {
        if (!ApiHelper.isAdmin()) {
            throw new Error('غير مصرح. تحتاج صلاحيات مدير');
        }

        try {
            const result = await api.updateCourse(id, data);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    static async deleteCourse(id) {
        if (!ApiHelper.isAdmin()) {
            throw new Error('غير مصرح. تحتاج صلاحيات مدير');
        }

        try {
            const result = await api.deleteCourse(id);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    static async loadCourses() {
        try {
            const courses = await api.getCourses();
            return { success: true, data: courses };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    static async filterCoursesByUniversity(university) {
        try {
            const courses = await api.getCoursesByUniversity(university);
            return { success: true, data: courses };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    static async searchCourses(query) {
        try {
            const results = await api.searchCourses(query);
            return { success: true, data: results };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
}

// Add health endpoint in your backend
// [HttpGet("health")]
// public IActionResult Health() => Ok("API is running");

window.ApiHelper = ApiHelper;

// ==============================/
// AUTO LOGOUT ON UNAUTHORIZED
// ==============================
window.addEventListener('storage', (e) => {
    if (e.key === 'authToken' && !e.newValue) {
        ApiHelper.logout();
    }
});