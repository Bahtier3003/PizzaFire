// api.js - Функции для работы с бэкендом C#
const API_BASE = '/api';

class PizzaApi {
    constructor() {
        this.token = localStorage.getItem('token');
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    removeToken() {
        this.token = null;
        localStorage.removeItem('token');
    }

    async request(endpoint, options = {}) {
        const url = `${API_BASE}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }

        try {
            console.log(`Making request to: ${url}`, config);
            const response = await fetch(url, config);

            // Клонируем response для чтения тела
            const responseClone = response.clone();

            if (response.status === 401) {
                this.removeToken();
                window.location.reload();
                throw new Error('Требуется авторизация');
            }

            if (!response.ok) {
                let errorText = 'Network error';
                try {
                    // Используем клонированный response для чтения ошибки
                    const errorData = await responseClone.json();
                    errorText = errorData.message || JSON.stringify(errorData);
                } catch (e) {
                    try {
                        // Если не JSON, читаем как текст
                        const text = await responseClone.text();
                        errorText = text || `HTTP error! status: ${response.status}`;
                    } catch (textError) {
                        errorText = `HTTP error! status: ${response.status}`;
                    }
                }
                throw new Error(errorText);
            }

            // Для успешных ответов используем оригинальный response
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Auth methods
    async login(username, password) {
        const data = await this.request('/Auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        this.setToken(data.token);
        return data;
    }

    async register(username, password, email = '', firstName = '', lastName = '') {
        const data = await this.request('/Auth/register', {
            method: 'POST',
            body: JSON.stringify({
                username,
                password,
                email,
                firstName,
                lastName
            })
        });
        this.setToken(data.token);
        return data;
    }

    // Pizza methods
    async getPizzas() {
        return await this.request('/Pizza');
    }

    async getIngredients() {
        return await this.request('/Pizza/ingredients');
    }

    // Order methods
    async createOrder(orderData) {
        return await this.request('/Orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }

    async getUserOrders() {
        return await this.request('/Orders/history');
    }
    // Payment methods
    async getPaymentMethods() {
        return await this.request('/Payments/methods');
    }

    async processPayment(paymentData) {
        return await this.request('/Payments/process', {
            method: 'POST',
            body: JSON.stringify(paymentData)
        });
    }

    async confirmCashPayment(orderId) {
        return await this.request('/Payments/cash-confirm', {
            method: 'POST',
            body: JSON.stringify({ orderId })
        });
    }
}

// Создаем глобальный экземпляр API
window.pizzaApi = new PizzaApi();