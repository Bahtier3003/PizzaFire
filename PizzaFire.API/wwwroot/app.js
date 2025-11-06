let mockPizzas = [];
let mockIngredients = [];

// Размеры пицц с множителями цены
const pizzaSizes = [
    { id: 'small', name: 'Маленькая (25см)', multiplier: 0.7 },
    { id: 'medium', name: 'Средняя (30см)', multiplier: 1.0 },
    { id: 'large', name: 'Большая (35см)', multiplier: 1.3 },
    { id: 'xl', name: 'XL (40см)', multiplier: 1.6 }
];

// Глобальные переменные
let currentPizzaIngredients = [];
let currentPizzaSize = 'medium';
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let editingIndex = -1;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM loaded, initializing app...');
    initializeApp();
});

async function initializeApp() {
    console.log('Initializing application...');

    try {
        await loadDataFromServer();
        setupNavigation();
        setupEventListeners();
        updateCartCount();
        updateAuthUI(!!window.pizzaApi?.token);

        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Failed to initialize app:', error);
        loadMockData();
        showAlert('Ошибка загрузки данных. Используются демо-данные.', 'warning');
    }
}

// Загрузка данных с сервера
async function loadDataFromServer() {
    try {
        if (!window.pizzaApi) {
            throw new Error('API not initialized');
        }

        mockPizzas = await window.pizzaApi.getPizzas();
        mockIngredients = await window.pizzaApi.getIngredients();

        mockPizzas = mockPizzas.map(pizza => {
            let imagePath;

            if (pizza.name.includes('Бекон') || pizza.name.includes('bacon')) {
                imagePath = 'images/beconMushroom.png';
            } else if (pizza.name.includes('Маргарит') || pizza.name.includes('margarita')) {
                imagePath = 'images/margarita.png';
            } else if (pizza.name.includes('Пепперони') || pizza.name.includes('pepperoni')) {
                imagePath = 'images/pepperoni.png';
            } else if (pizza.name.includes('Гавайск') || pizza.name.includes('hawaiian')) {
                imagePath = 'images/hawaiian.png';
            } else if (pizza.name.includes('Вегетариан') || pizza.name.includes('vegetarian')) {
                imagePath = 'images/vegetarian.png';
            } else if (pizza.name.includes('Четыре сыр') || pizza.name.includes('four cheese')) {
                imagePath = 'images/fourcheeses.png';
            } else {
                imagePath = `https://via.placeholder.com/400x250/1a1a1a/dc2626?text=${encodeURIComponent(pizza.name)}`;
            }

            return {
                ...pizza,
                baseIngredients: [],
                image: imagePath
            };
        });

        loadCatalog();
        console.log('Data loaded from server:', mockPizzas.length, 'pizzas', mockIngredients.length, 'ingredients');
    } catch (error) {
        console.error('Failed to load data from server:', error);
        throw error;
    }
}

// Fallback на mock-данные
function loadMockData() {
    mockIngredients = [
        { id: 1, name: "Сыр Моцарелла", price: 50 },
        { id: 2, name: "Томатный соус", price: 30 },
        { id: 3, name: "Пепперони", price: 70 },
        { id: 4, name: "Бекон", price: 80 },
        { id: 5, name: "Шампиньоны", price: 40 },
        { id: 6, name: "Оливки", price: 60 },
        { id: 7, name: "Красный лук", price: 25 },
        { id: 8, name: "Сладкий перец", price: 35 },
        { id: 9, name: "Курица", price: 90 },
        { id: 10, name: "Ананас", price: 45 },
        { id: 11, name: "Пармезан", price: 65 },
        { id: 12, name: "Томаты", price: 40 },
        { id: 13, name: "Салями", price: 75 },
        { id: 14, name: "Ветчина", price: 70 },
        { id: 15, name: "Маслины", price: 55 }
    ];

    mockPizzas = [
        {
            id: 1,
            name: "Маргарита",
            description: "Классическая итальянская пицца с сыром и томатным соусом",
            basePrice: 450,
            image: "images/margarita.png",
            baseIngredients: [1, 2]
        },
        {
            id: 2,
            name: "Пепперони",
            description: "Острая пицца с пепперони и расплавленным сыром",
            basePrice: 550,
            image: "images/pepperoni.png",
            baseIngredients: [1, 2, 3]
        },
        {
            id: 3,
            name: "Бекон Грибная",
            description: "С беконом, шампиньонами и ароматными травами",
            basePrice: 600,
            image: "images/beconMushroom.png",
            baseIngredients: [1, 2, 4, 5]
        }
    ];

    loadCatalog();
}

// Навигация
function setupNavigation() {
    console.log('Setting up navigation...');

    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            const target = this.id.replace('nav-', '');

            // Скрываем все секции
            document.querySelectorAll('.section').forEach(sec => {
                sec.classList.remove('active');
                // Очищаем динамически созданные секции кроме основных
                if (sec.id !== 'home-section' && sec.id !== 'cart-section' && sec.id !== 'auth-section') {
                    sec.innerHTML = '';
                }
            });

            // Убираем активность со всех кнопок
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

            // Активируем текущую кнопку
            this.classList.add('active');

            // Обработка разных разделов
            switch (target) {
                case 'home':
                    document.getElementById('home-section').classList.add('active');
                    break;
                case 'cart':
                    document.getElementById('cart-section').classList.add('active');
                    updateCartDisplay();
                    break;
                case 'auth':
                    document.getElementById('auth-section').classList.add('active');
                    // Перепривязываем обработчики при переходе на вкладку авторизации
                    setTimeout(reattachAuthHandlers, 50);
                    break;
                case 'history':
                    showOrderHistory();
                    break;
            }
        });
    });

    // Скрываем кнопку истории при загрузке, если пользователь не авторизован
    const historyBtn = document.getElementById('nav-history');
    if (historyBtn && !window.pizzaApi?.token) {
        historyBtn.style.display = 'none';
    }
}

// Загрузка каталога
function loadCatalog() {
    console.log('Loading catalog...');

    const container = document.getElementById('catalog-items');
    if (!container) {
        console.error('Catalog container not found!');
        return;
    }

    container.innerHTML = '';

    mockPizzas.forEach(pizza => {
        const div = document.createElement('div');
        div.className = 'catalog-item';
        div.innerHTML = `
            <img src="${pizza.image}" alt="${pizza.name}" onerror="this.src='https://via.placeholder.com/400x250/1a1a1a/dc2626?text=${encodeURIComponent(pizza.name)}'">
            <h3>${pizza.name}</h3>
            <p>${pizza.description}</p>
            <div class="price">от ${pizza.basePrice} руб</div>
            <button class="btn-primary" onclick="editAndAddPizza(${pizza.id})">
                <i class="fas fa-cart-plus"></i> Выбрать
            </button>
        `;
        container.appendChild(div);
    });
}

// Настройка обработчиков событий
function setupEventListeners() {
    console.log('Setting up event listeners...');

    // Кастомная пицца
    const customPizzaBtn = document.getElementById('custom-pizza-btn');
    if (customPizzaBtn) {
        customPizzaBtn.addEventListener('click', openCustomPizzaModal);
    }

    // Авторизация - используем перепривязку
    reattachAuthHandlers();

    // Заказ
    const orderBtn = document.getElementById('order-btn');
    if (orderBtn) orderBtn.addEventListener('click', placeOrder);

    // Модальное окно
    const saveEditBtn = document.getElementById('save-edit');
    const closeBtn = document.querySelector('.close');
    if (saveEditBtn) saveEditBtn.addEventListener('click', savePizzaEdit);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    // Закрытие модального окна по клику вне его
    window.addEventListener('click', function (event) {
        const modal = document.getElementById('edit-modal');
        if (event.target === modal) {
            closeModal();
        }
    });
}

// Функция для перепривязки обработчиков авторизации
function reattachAuthHandlers() {
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');

    if (loginBtn) {
        // Удаляем старые обработчики и добавляем новые
        loginBtn.onclick = login;
    }

    if (registerBtn) {
        registerBtn.onclick = register;
    }
}

// Функции для модальных окон
function openCustomPizzaModal() {
    document.getElementById('modal-title').textContent = 'Создать кастомную пиццу';
    const modalContainer = document.getElementById('modal-ingredients');
    modalContainer.innerHTML = '';

    currentPizzaIngredients = [];

    const sizeSelector = document.createElement('div');
    sizeSelector.className = 'size-selector';
    sizeSelector.innerHTML = `
        <h3>Выберите размер:</h3>
        <div class="sizes-grid">
            ${pizzaSizes.map(size => `
                <div class="size-option ${size.id === currentPizzaSize ? 'selected' : ''}" 
                     data-size="${size.id}" 
                     onclick="selectSize('${size.id}', 300)">
                    <div class="size-name">${size.name}</div>
                    <div class="size-price">${Math.round(300 * size.multiplier)} руб</div>
                </div>
            `).join('')}
        </div>
    `;
    modalContainer.appendChild(sizeSelector);

    const separator = document.createElement('div');
    separator.className = 'modal-separator';
    modalContainer.appendChild(separator);

    const ingredientsTitle = document.createElement('h3');
    ingredientsTitle.textContent = 'Выберите ингредиенты:';
    modalContainer.appendChild(ingredientsTitle);

    const ingredientsGrid = document.createElement('div');
    ingredientsGrid.className = 'ingredients-grid modal-ingredients';

    mockIngredients.forEach(ing => {
        const div = document.createElement('div');
        div.className = 'ingredient';
        div.innerHTML = `
            <i class="fas fa-plus"></i>
            ${ing.name} (${ing.price} руб)
        `;

        div.addEventListener('click', function () {
            toggleIngredient(ing, div);
        });

        ingredientsGrid.appendChild(div);
    });

    modalContainer.appendChild(ingredientsGrid);

    document.getElementById('edit-modal').style.display = 'block';
    window.currentCatalogPizza = {
        name: "Кастомная пицца",
        baseIngredients: [],
        basePrice: 300
    };

    editingIndex = -1;
    updateModalPrice(300);
}

function editAndAddPizza(pizzaId) {
    const pizzaData = mockPizzas.find(p => p.id === pizzaId);
    if (!pizzaData) return;

    const baseIngredients = pizzaData.baseIngredients.map(id =>
        mockIngredients.find(ing => ing.id === id)
    ).filter(ing => ing);

    document.getElementById('modal-title').textContent = `Настройка: ${pizzaData.name}`;
    const modalContainer = document.getElementById('modal-ingredients');
    modalContainer.innerHTML = '';

    const sizeSelector = document.createElement('div');
    sizeSelector.className = 'size-selector';
    sizeSelector.innerHTML = `
        <h3>Выберите размер:</h3>
        <div class="sizes-grid">
            ${pizzaSizes.map(size => `
                <div class="size-option ${size.id === currentPizzaSize ? 'selected' : ''}" 
                     data-size="${size.id}" 
                     onclick="selectSize('${size.id}', ${pizzaData.basePrice})">
                    <div class="size-name">${size.name}</div>
                    <div class="size-price">${Math.round(pizzaData.basePrice * size.multiplier)} руб</div>
                </div>
            `).join('')}
        </div>
    `;
    modalContainer.appendChild(sizeSelector);

    const separator = document.createElement('div');
    separator.className = 'modal-separator';
    modalContainer.appendChild(separator);

    const ingredientsTitle = document.createElement('h3');
    ingredientsTitle.textContent = 'Дополнительные ингредиенты:';
    modalContainer.appendChild(ingredientsTitle);

    const ingredientsGrid = document.createElement('div');
    ingredientsGrid.className = 'ingredients-grid modal-ingredients';

    mockIngredients.forEach(ing => {
        const div = document.createElement('div');
        div.className = 'ingredient';
        const isSelected = baseIngredients.some(i => i && i.id === ing.id);
        if (isSelected) div.classList.add('selected');

        div.innerHTML = isSelected ?
            `<i class="fas fa-check"></i> ${ing.name} (${ing.price} руб)` :
            `<i class="fas fa-plus"></i> ${ing.name} (${ing.price} руб)`;

        div.addEventListener('click', function () {
            this.classList.toggle('selected');
            this.innerHTML = this.classList.contains('selected') ?
                `<i class="fas fa-check"></i> ${ing.name} (${ing.price} руб)` :
                `<i class="fas fa-plus"></i> ${ing.name} (${ing.price} руб)`;
            updateModalPrice(pizzaData.basePrice);
        });

        ingredientsGrid.appendChild(div);
    });

    modalContainer.appendChild(ingredientsGrid);

    document.getElementById('edit-modal').style.display = 'block';
    window.currentCatalogPizza = {
        name: pizzaData.name,
        baseIngredients,
        basePrice: pizzaData.basePrice
    };

    editingIndex = -1;
    updateModalPrice(pizzaData.basePrice);
}

function toggleIngredient(ingredient, element) {
    const isSelected = currentPizzaIngredients.some(i => i.id === ingredient.id);

    if (!isSelected) {
        currentPizzaIngredients.push(ingredient);
        element.classList.add('selected');
        element.innerHTML = `
            <i class="fas fa-check"></i>
            ${ingredient.name} (${ingredient.price} руб)
        `;
    } else {
        currentPizzaIngredients = currentPizzaIngredients.filter(i => i.id !== ingredient.id);
        element.classList.remove('selected');
        element.innerHTML = `
            <i class="fas fa-plus"></i>
            ${ingredient.name} (${ingredient.price} руб)
        `;
    }

    updateModalPrice(window.currentCatalogPizza.basePrice);
}

function selectSize(sizeId, basePrice) {
    currentPizzaSize = sizeId;

    document.querySelectorAll('.size-option').forEach(option => {
        option.classList.remove('selected');
    });
    document.querySelector(`.size-option[data-size="${sizeId}"]`).classList.add('selected');

    document.querySelectorAll('.size-option').forEach(option => {
        const sizeId = option.getAttribute('data-size');
        const size = pizzaSizes.find(s => s.id === sizeId);
        const priceElement = option.querySelector('.size-price');
        priceElement.textContent = Math.round(basePrice * size.multiplier) + ' руб';
    });

    updateModalPrice(basePrice);
}

function updateModalPrice(basePrice) {
    const selectedElements = document.querySelectorAll('#modal-ingredients .ingredient.selected');
    const selectedIngredients = Array.from(selectedElements).map(div => {
        const name = div.textContent.split(' (')[0].trim();
        return mockIngredients.find(ing => ing.name === name);
    }).filter(ing => ing);

    const sizeMultiplier = pizzaSizes.find(size => size.id === currentPizzaSize)?.multiplier || 1;
    const isCustomPizza = window.currentCatalogPizza.name === "Кастомная пицца";
    const baseIngredientsPrice = isCustomPizza ? 0 : (window.currentCatalogPizza.baseIngredients?.reduce((sum, ing) => sum + ing.price, 0) || 0);

    const additionalIngredients = selectedIngredients.filter(ing =>
        !window.currentCatalogPizza.baseIngredients?.some(baseIng => baseIng.id === ing.id)
    );

    const ingredientsPrice = additionalIngredients.reduce((sum, ing) => sum + ing.price, 0);
    const pizzaPrice = Math.round(basePrice * sizeMultiplier);
    const totalPrice = pizzaPrice + ingredientsPrice;

    const modalPriceElement = document.getElementById('modal-price');
    if (modalPriceElement) {
        modalPriceElement.textContent = `Итоговая цена: ${totalPrice} руб`;
        if (!isCustomPizza) {
            modalPriceElement.innerHTML += `<br><small>Пицца: ${pizzaPrice} руб + Доп. ингредиенты: ${ingredientsPrice} руб</small>`;
        } else {
            modalPriceElement.innerHTML += `<br><small>Основа: ${pizzaPrice} руб + Ингредиенты: ${ingredientsPrice} руб</small>`;
        }
    }
}

function savePizzaEdit() {
    const selectedElements = document.querySelectorAll('#modal-ingredients .ingredient.selected');
    const selectedIngredients = Array.from(selectedElements).map(div => {
        const name = div.textContent.split(' (')[0].trim();
        return mockIngredients.find(ing => ing.name === name);
    }).filter(ing => ing);

    const sizeMultiplier = pizzaSizes.find(size => size.id === currentPizzaSize)?.multiplier || 1;
    const sizeName = pizzaSizes.find(s => s.id === currentPizzaSize)?.name || 'Средняя';

    if (editingIndex >= 0) {
        const pizza = cart[editingIndex];
        const isCustomPizza = pizza.name.includes('Кастомная');
        const basePrice = isCustomPizza ? 300 : (mockPizzas.find(p => p.name === window.currentCatalogPizza.name)?.basePrice || 0);

        const pizzaPrice = Math.round(basePrice * sizeMultiplier);
        const additionalIngredients = isCustomPizza ?
            selectedIngredients :
            selectedIngredients.filter(ing => !window.currentCatalogPizza.baseIngredients?.some(baseIng => baseIng.id === ing.id));

        const ingredientsPrice = additionalIngredients.reduce((sum, ing) => sum + ing.price, 0);

        pizza.customIngredients = additionalIngredients;
        pizza.totalPrice = pizzaPrice + ingredientsPrice;
        pizza.name = `${window.currentCatalogPizza.name} (${sizeName})`;
        pizza.size = currentPizzaSize;

        showAlert(`${pizza.name} обновлена в корзине!`, 'success');
        editingIndex = -1;
    } else {
        const isCustomPizza = window.currentCatalogPizza.name === "Кастомная пицца";
        const basePrice = isCustomPizza ? 300 : (window.currentCatalogPizza.basePrice || 0);

        const pizzaPrice = Math.round(basePrice * sizeMultiplier);
        const additionalIngredients = isCustomPizza ?
            selectedIngredients :
            selectedIngredients.filter(ing => !window.currentCatalogPizza.baseIngredients?.some(baseIng => baseIng.id === ing.id));

        const ingredientsPrice = additionalIngredients.reduce((sum, ing) => sum + ing.price, 0);
        const totalPrice = pizzaPrice + ingredientsPrice;

        const pizza = {
            id: Date.now(),
            name: `${window.currentCatalogPizza.name} (${sizeName})`,
            baseIngredients: isCustomPizza ? [] : (window.currentCatalogPizza.baseIngredients || []),
            customIngredients: additionalIngredients,
            size: currentPizzaSize,
            totalPrice: totalPrice,
            pizzaPrice: pizzaPrice,
            ingredientsPrice: ingredientsPrice,
            originalPizzaId: isCustomPizza ? null : mockPizzas.find(p => p.name === window.currentCatalogPizza.name)?.id
        };

        cart.push(pizza);
        showAlert(`${pizza.name} добавлена в корзину!`, 'success');
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    closeModal();
    updateCartDisplay();
    updateCartCount();
}

function closeModal() {
    document.getElementById('edit-modal').style.display = 'none';
    editingIndex = -1;
    currentPizzaSize = 'medium';
}

// Функции для работы с корзиной
function updateCartDisplay() {
    const cartList = document.getElementById('cart-items');
    const totalPriceElement = document.getElementById('total-price');

    if (!cartList || !totalPriceElement) {
        console.error('Cart elements not found!');
        return;
    }

    cartList.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartList.innerHTML = `
            <div class="cart-item" style="text-align: center; color: var(--text-gray);">
                <i class="fas fa-shopping-cart" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <h3>Корзина пуста</h3>
                <p>Добавьте пиццы из каталога или создайте свою</p>
            </div>
        `;
    } else {
        cart.forEach((pizza, index) => {
            const li = document.createElement('li');
            li.className = 'cart-item';
            const allIngredients = [...(pizza.baseIngredients || []), ...(pizza.customIngredients || [])];
            const sizeInfo = pizzaSizes.find(s => s.id === pizza.size) || pizzaSizes[1];

            li.innerHTML = `
                <h3>${pizza.name}</h3>
                <div class="pizza-size">Размер: ${sizeInfo.name}</div>
                <div class="ingredients-list">
                    ${allIngredients.map(ing =>
                `<div class="ingredient-item">
                            <i class="fas fa-circle"></i>
                            ${ing.name} ${pizza.customIngredients?.includes(ing) ? `(${ing.price} руб)` : ''}
                        </div>`
            ).join('')}
                </div>
                <div class="cart-item-footer">
                    <div class="item-price">
                        ${pizza.totalPrice} руб
                        ${pizza.ingredientsPrice > 0 ? `<br><small>Пицца: ${pizza.pizzaPrice} руб + Доп. ингредиенты: ${pizza.ingredientsPrice} руб</small>` : ''}
                    </div>
                    <div class="cart-actions">
                        <button class="btn-secondary" onclick="editPizza(${index})">
                            <i class="fas fa-edit"></i> Изменить
                        </button>
                        <button class="btn-danger" onclick="removePizza(${index})">
                            <i class="fas fa-trash"></i> Удалить
                        </button>
                    </div>
                </div>
            `;

            cartList.appendChild(li);
            total += pizza.totalPrice;
        });
    }

    totalPriceElement.textContent = `Общая цена: ${total} руб`;
}

function editPizza(index) {
    editingIndex = index;
    const pizza = cart[index];
    const allIngredients = [...(pizza.baseIngredients || []), ...(pizza.customIngredients || [])];
    currentPizzaSize = pizza.size || 'medium';

    document.getElementById('modal-title').textContent = `Редактирование: ${pizza.name}`;
    const modalContainer = document.getElementById('modal-ingredients');
    modalContainer.innerHTML = '';

    const isCustomPizza = pizza.name.includes('Кастомная');
    const basePrice = isCustomPizza ? 300 : (mockPizzas.find(p => p.name === pizza.name.replace(/\(.*\)/, '').trim())?.basePrice || 0);

    window.currentCatalogPizza = {
        name: pizza.name.replace(/\(.*\)/, '').trim(),
        baseIngredients: pizza.baseIngredients || [],
        basePrice: basePrice
    };

    const sizeSelector = document.createElement('div');
    sizeSelector.className = 'size-selector';
    sizeSelector.innerHTML = `
        <h3>Выберите размер:</h3>
        <div class="sizes-grid">
            ${pizzaSizes.map(size => `
                <div class="size-option ${size.id === currentPizzaSize ? 'selected' : ''}" 
                     data-size="${size.id}" 
                     onclick="selectSize('${size.id}', ${basePrice})">
                    <div class="size-name">${size.name}</div>
                    <div class="size-price">${Math.round(basePrice * size.multiplier)} руб</div>
                </div>
            `).join('')}
        </div>
    `;
    modalContainer.appendChild(sizeSelector);

    const separator = document.createElement('div');
    separator.className = 'modal-separator';
    modalContainer.appendChild(separator);

    const ingredientsTitle = document.createElement('h3');
    ingredientsTitle.textContent = isCustomPizza ? 'Ингредиенты:' : 'Дополнительные ингредиенты:';
    modalContainer.appendChild(ingredientsTitle);

    const ingredientsGrid = document.createElement('div');
    ingredientsGrid.className = 'ingredients-grid modal-ingredients';

    mockIngredients.forEach(ing => {
        const div = document.createElement('div');
        div.className = 'ingredient';
        const isSelected = allIngredients.some(i => i && i.id === ing.id);
        if (isSelected) div.classList.add('selected');

        div.innerHTML = isSelected ?
            `<i class="fas fa-check"></i> ${ing.name} (${ing.price} руб)` :
            `<i class="fas fa-plus"></i> ${ing.name} (${ing.price} руб)`;

        div.addEventListener('click', function () {
            this.classList.toggle('selected');
            this.innerHTML = this.classList.contains('selected') ?
                `<i class="fas fa-check"></i> ${ing.name} (${ing.price} руб)` :
                `<i class="fas fa-plus"></i> ${ing.name} (${ing.price} руб)`;
            updateModalPrice(basePrice);
        });

        ingredientsGrid.appendChild(div);
    });

    modalContainer.appendChild(ingredientsGrid);

    document.getElementById('edit-modal').style.display = 'block';
    updateModalPrice(basePrice);
}

function removePizza(index) {
    if (confirm('Удалить эту пиццу из корзины?')) {
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
        updateCartCount();
        showAlert('Пицца удалена из корзины', 'info');
    }
}

function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = cart.length;
        cartCount.style.display = cart.length > 0 ? 'inline-block' : 'none';
    }
}

// Функции авторизации
async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        showAlert('Введите логин и пароль', 'warning');
        return;
    }

    try {
        const result = await window.pizzaApi.login(username, password);
        updateAuthUI(true);
        showAlert('Вход выполнен успешно!', 'success');
        document.getElementById('nav-home').click();
    } catch (error) {
        showAlert('Неверный логин или пароль', 'error');
    }
}

async function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const email = document.getElementById('email').value;
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;

    // Базовая валидация
    if (!username || !password || !email) {
        showAlert('Заполните обязательные поля: логин, пароль и email', 'warning');
        return;
    }

    // Простая валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showAlert('Введите корректный email адрес', 'error');
        return;
    }

    try {
        const result = await window.pizzaApi.register(username, password, email, firstName, lastName);
        showAlert('Регистрация выполнена успешно! Теперь вы можете войти.', 'success');

        // Очищаем поля
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        document.getElementById('email').value = '';
        document.getElementById('first-name').value = '';
        document.getElementById('last-name').value = '';

    } catch (error) {
        showAlert('Пользователь с таким логином уже существует', 'error');
    }
}

function updateAuthUI(isLoggedIn) {
    const authSection = document.getElementById('auth-section');
    const historyBtn = document.getElementById('nav-history');

    if (isLoggedIn) {
        // Показываем историю для авторизованного пользователя
        if (historyBtn) historyBtn.style.display = 'flex';

        authSection.innerHTML = `
            <div class="auth-form">
                <h2><i class="fas fa-user-check"></i> Вы вошли в систему</h2>
                <p style="color: var(--text-gray); margin-bottom: 2rem;">
                    Добро пожаловать! Теперь вы можете оформлять заказы и просматривать историю.
                </p>
                <div class="auth-buttons">
                    <button class="btn-primary" onclick="showOrderHistory()">
                        <i class="fas fa-history"></i> История заказов
                    </button>
                    <button class="btn-danger" onclick="logout()">
                        <i class="fas fa-sign-out-alt"></i> Выйти
                    </button>
                </div>
            </div>
        `;

        addHistoryToNavigation();
    } else {
        // Скрываем историю для неавторизованного пользователя
        if (historyBtn) historyBtn.style.display = 'none';

        // Показываем форму входа/регистрации
        authSection.innerHTML = `
            <div class="auth-form">
                <h2><i class="fas fa-sign-in-alt"></i> Вход / Регистрация</h2>
                
                <input type="text" id="username" placeholder="Логин *" class="input-field">
                <input type="password" id="password" placeholder="Пароль *" class="input-field">
                <input type="email" id="email" placeholder="Email *" class="input-field">
                <input type="text" id="first-name" placeholder="Имя" class="input-field">
                <input type="text" id="last-name" placeholder="Фамилия" class="input-field">
                
                <div class="auth-buttons">
                    <button id="login-btn" class="btn-primary">
                        <i class="fas fa-sign-in-alt"></i> Войти
                    </button>
                    <button id="register-btn" class="btn-secondary">
                        <i class="fas fa-user-plus"></i> Регистрация
                    </button>
                </div>
            </div>
        `;

        // Перепривязываем обработчики
        reattachAuthHandlers();
    }
}

function logout() {
    if (window.pizzaApi) {
        window.pizzaApi.removeToken();
    }

    // Очищаем корзину при выходе (опционально)
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));

    // Принудительно обновляем UI
    updateAuthUI(false);
    updateCartCount();
    updateCartDisplay();

    // Скрываем кнопку истории
    const historyBtn = document.getElementById('nav-history');
    if (historyBtn) {
        historyBtn.style.display = 'none';
        historyBtn.classList.remove('active');
    }

    showAlert('Выход выполнен успешно', 'info');

    // Переходим на главную страницу
    setTimeout(() => {
        document.getElementById('nav-home').click();
    }, 100);
}

// Функция оформления заказа
async function placeOrder() {
    if (cart.length === 0) {
        showAlert('Корзина пуста. Добавьте пиццы перед оформлением заказа.', 'warning');
        return;
    }

    if (!window.pizzaApi?.token) {
        showAlert('Для оформления заказа необходимо войти в систему', 'warning');
        document.getElementById('nav-auth').click();
        return;
    }

    // Показываем форму заказа
    showOrderForm();
}

// Показать форму оформления заказа
function showOrderForm() {
    const total = cart.reduce((sum, pizza) => sum + pizza.totalPrice, 0);

    const formHTML = `
        <div class="order-form-overlay">
            <div class="order-form-container">
                <div class="order-form-header">
                    <h2><i class="fas fa-truck"></i> Оформление заказа</h2>
                    <button class="close-order-form" onclick="closeOrderForm()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="order-summary">
                    <h3>Ваш заказ:</h3>
                    ${cart.map(pizza => `
                        <div class="order-pizza-item">
                            <strong>${pizza.name}</strong> - ${pizza.totalPrice} руб
                            ${pizza.customIngredients && pizza.customIngredients.length > 0 ?
            `<br><small>Доп. ингредиенты: ${pizza.customIngredients.map(ing => ing.name).join(', ')}</small>` : ''}
                        </div>
                    `).join('')}
                    <div class="order-total">Итого: ${total} руб</div>
                </div>
                
                <form id="delivery-form" class="delivery-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="first-name"><i class="fas fa-user"></i> Имя *</label>
                            <input type="text" id="first-name" required placeholder="Ваше имя">
                        </div>
                        <div class="form-group">
                            <label for="last-name"><i class="fas fa-user"></i> Фамилия</label>
                            <input type="text" id="last-name" placeholder="Ваша фамилия">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="email"><i class="fas fa-envelope"></i> Email *</label>
                        <input type="email" id="email" required placeholder="your@email.com">
                    </div>
                    
                    <div class="form-group">
                        <label for="phone"><i class="fas fa-phone"></i> Телефон *</label>
                        <input type="tel" id="phone" required placeholder="+7 (XXX) XXX-XX-XX">
                    </div>
                    
                    <div class="form-group">
                        <label for="address"><i class="fas fa-map-marker-alt"></i> Адрес доставки *</label>
                        <textarea id="address" required placeholder="Улица, дом, квартира, этаж, подъезд" rows="2"></textarea>
                    </div>

                    <div class="form-group">
                        <label for="door-code"><i class="fas fa-key"></i> Код домофона</label>
                        <input type="text" id="door-code" placeholder="Код домофона или номер квартиры">
                    </div>
                    
                    <div class="form-group">
                        <label for="instructions"><i class="fas fa-sticky-note"></i> Комментарий курьеру</label>
                        <textarea id="instructions" placeholder="Например: позвонить за 10 минут, не звонить в домофон и т.д." rows="3"></textarea>
                    </div>
                    
                    <div class="form-buttons">
                        <button type="button" class="btn-secondary" onclick="closeOrderForm()">
                            <i class="fas fa-times"></i> Отмена
                        </button>
                        <button type="submit" class="btn-primary">
                            <i class="fas fa-check"></i> Подтвердить заказ
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    const formContainer = document.createElement('div');
    formContainer.innerHTML = formHTML;
    document.body.appendChild(formContainer);

    document.getElementById('delivery-form').addEventListener('submit', handleOrderSubmit);
}

// Закрыть форму заказа
function closeOrderForm() {
    const overlay = document.querySelector('.order-form-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// Обработчик отправки заказа
async function handleOrderSubmit(event) {
    event.preventDefault();

    const formData = {
        firstName: document.getElementById('first-name').value.trim(),
        lastName: document.getElementById('last-name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        address: document.getElementById('address').value.trim(),
        doorCode: document.getElementById('door-code').value.trim(),
        instructions: document.getElementById('instructions').value.trim()
    };

    // Валидация
    if (!formData.firstName || !formData.email || !formData.phone || !formData.address) {
        showAlert('Пожалуйста, заполните все обязательные поля (отмечены *)', 'error');
        return;
    }

    // Простая валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        showAlert('Введите корректный email адрес', 'error');
        return;
    }

    // Простая валидация телефона
    const phoneRegex = /^(\+7|8)[\d\s\-\(\)]{10,}$/;
    const cleanPhone = formData.phone.replace(/\s/g, '');
    if (!phoneRegex.test(cleanPhone)) {
        showAlert('Введите корректный номер телефона', 'error');
        return;
    }

    try {
        const orderData = {
            items: cart.map(pizza => ({
                pizzaId: pizza.originalPizzaId || (pizza.name.includes('Кастомная') ? 0 : 1),
                size: pizza.size || 'medium',
                additionalIngredientIds: pizza.customIngredients ?
                    pizza.customIngredients.map(ing => ing.id).filter(id => id) : [],
                removedIngredientIds: []
            })),
            details: {
                address: formData.address,
                phone: formData.phone,
                email: formData.email,
                doorCode: formData.doorCode,
                courierInstructions: formData.instructions
            }
        };

        console.log('Sending order data:', orderData);

        // Показываем индикатор загрузки
        const submitBtn = document.querySelector('#delivery-form button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Оформление...';
        submitBtn.disabled = true;

        const result = await window.pizzaApi.createOrder(orderData);

        showOrderConfirmation(result);

        // Очищаем корзину
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
        updateCartCount();

        // Закрываем форму
        closeOrderForm();

    } catch (error) {
        console.error('Order error:', error);

        // Восстанавливаем кнопку
        const submitBtn = document.querySelector('#delivery-form button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Подтвердить заказ';
        submitBtn.disabled = false;

        let errorMessage = 'Неизвестная ошибка при оформлении заказа';
        if (error.message) {
            try {
                // Пытаемся распарсить JSON ошибку
                const errorObj = JSON.parse(error.message);
                errorMessage = errorObj.message || errorObj;
            } catch (e) {
                // Если не JSON, используем как есть
                errorMessage = error.message;
            }
        }
        showAlert('Ошибка при оформлении заказа: ' + errorMessage, 'error');
    }
}

// Показать подтверждение заказа
function showOrderConfirmation(orderResult) {
    closeOrderForm();

    const deliveryTime = new Date(orderResult.estimatedDelivery);
    const timeString = deliveryTime.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
    });

    const minutesToDelivery = Math.round((deliveryTime - new Date()) / (1000 * 60));

    const confirmationHTML = `
        <div class="order-confirmation-overlay">
            <div class="order-confirmation">
                <div class="confirmation-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h2>Заказ оформлен!</h2>
                <div class="order-info">
                    <p><strong>Номер заказа:</strong> #${orderResult.orderId}</p>
                    <p><strong>Сумма:</strong> ${orderResult.totalPrice} руб</p>
                    <p><strong>Примерное время доставки:</strong> ${timeString}</p>
                    <p><strong>Курьер будет через:</strong> ~${minutesToDelivery} минут</p>
                    <p class="delivery-note">Доставка осуществляется в течение 50-70 минут</p>
                    <p class="delivery-note">Курьер позвонит вам за 15 минут до доставки</p>
                </div>
                <button class="btn-primary large" onclick="closeConfirmation()">
                    <i class="fas fa-home"></i> Вернуться на главную
                </button>
            </div>
        </div>
    `;

    const confirmationContainer = document.createElement('div');
    confirmationContainer.innerHTML = confirmationHTML;
    document.body.appendChild(confirmationContainer);
}

// Закрыть подтверждение заказа
function closeConfirmation() {
    const overlay = document.querySelector('.order-confirmation-overlay');
    if (overlay) {
        overlay.remove();
    }
    document.getElementById('nav-home').click();
}

// Функция для отображения истории заказов
async function showOrderHistory() {
    try {
        if (!window.pizzaApi?.token) {
            showAlert('Для просмотра истории заказов необходимо войти в систему', 'warning');
            return;
        }

        const orders = await window.pizzaApi.getUserOrders();
        console.log('Received orders:', orders);

        let historySection = document.getElementById('history-section');
        if (!historySection) {
            historySection = document.createElement('section');
            historySection.id = 'history-section';
            historySection.className = 'section';
            document.querySelector('.main').appendChild(historySection);
        }

        historySection.innerHTML = `
            <div class="order-history-section">
                <h2><i class="fas fa-history"></i> История заказов</h2>
                ${orders.length === 0 ?
                '<div class="no-orders"><i class="fas fa-shopping-cart"></i><p>У вас еще нет заказов</p></div>' :
                orders.map(order => `
                        <div class="order-history-item">
                            <div class="order-header">
                                <div class="order-info">
                                    <h3>Заказ #${order.id}</h3>
                                    <span class="order-date">${new Date(order.orderDate).toLocaleDateString('ru-RU')}</span>
                                    <span class="order-status ${order.status}">${getStatusText(order.status)}</span>
                                </div>
                                <div class="order-total">${order.totalPrice} руб</div>
                            </div>
                            <div class="order-details">
                                <div class="order-address">
                                    <i class="fas fa-map-marker-alt"></i> ${order.address || 'Адрес не указан'}
                                </div>
                                ${order.estimatedDelivery ? `
                                    <div class="order-delivery">
                                        <i class="fas fa-clock"></i> 
                                        Доставка: ${new Date(order.estimatedDelivery).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                ` : ''}
                            </div>
                            <div class="order-items">
                                ${order.items && order.items.map(item => `
                                    <div class="order-item">
                                        <span class="item-name">${item.pizzaName || 'Кастомная пицца'} (${getSizeText(item.size)})</span>
                                        <span class="item-price">${item.itemPrice} руб</span>
                                    </div>
                                `).join('') || '<div class="order-item">Информация о пиццах недоступна</div>'}
                            </div>
                        </div>
                    `).join('')
            }
            </div>
        `;

        document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        historySection.classList.add('active');

        // Активируем кнопку истории
        const historyBtn = document.getElementById('nav-history');
        if (historyBtn) historyBtn.classList.add('active');

    } catch (error) {
        console.error('Error loading order history:', error);
        showAlert('Ошибка при загрузке истории заказов: ' + error.message, 'error');
    }
}

function getSizeText(size) {
    const sizes = {
        'small': 'Маленькая',
        'medium': 'Средняя',
        'large': 'Большая',
        'xl': 'XL'
    };
    return sizes[size] || size;
}

// Добавить кнопку истории в навигацию
function addHistoryToNavigation() {
    if (!document.getElementById('nav-history')) {
        const nav = document.querySelector('.nav');
        const historyBtn = document.createElement('button');
        historyBtn.id = 'nav-history';
        historyBtn.className = 'nav-btn';
        historyBtn.innerHTML = '<i class="fas fa-history"></i> История';
        historyBtn.style.display = 'flex'; // Явно показываем кнопку

        historyBtn.addEventListener('click', function () {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
            this.classList.add('active');
            showOrderHistory();
        });

        const authBtn = document.getElementById('nav-auth');
        nav.insertBefore(historyBtn, authBtn);
    } else {
        // Если кнопка уже существует, показываем её
        const historyBtn = document.getElementById('nav-history');
        if (historyBtn) historyBtn.style.display = 'flex';
    }
}

// Получить текст статуса
function getStatusText(status) {
    const statusMap = {
        'pending': 'Ожидание',
        'confirmed': 'Подтвержден',
        'cooking': 'Готовится',
        'delivery': 'В доставке',
        'completed': 'Завершен'
    };
    return statusMap[status] || status;
}

// Вспомогательные функции
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 10000;
        min-width: 300px;
        background: ${getAlertColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        animation: slideInRight 0.3s ease;
        border: 1px solid rgba(255, 255, 255, 0.2);
    `;

    alertDiv.innerHTML = `
        <div class="alert-content">
            <i class="fas fa-${getAlertIcon(type)}"></i>
            <span>${message}</span>
            <button class="alert-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    document.body.appendChild(alertDiv);

    setTimeout(() => {
        if (alertDiv.parentElement) {
            alertDiv.remove();
        }
    }, 5000);
}

function getAlertIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function getAlertColor(type) {
    const colors = {
        'success': 'var(--success)',
        'error': 'var(--error)',
        'warning': 'var(--warning)',
        'info': 'var(--primary)'
    };
    return colors[type] || 'var(--primary)';
}

// Глобальные функции
window.editAndAddPizza = editAndAddPizza;
window.editPizza = editPizza;
window.removePizza = removePizza;
window.logout = logout;
window.selectSize = selectSize;
window.openCustomPizzaModal = openCustomPizzaModal;
window.placeOrder = placeOrder;
window.closeOrderForm = closeOrderForm;
window.closeConfirmation = closeConfirmation;
window.showOrderHistory = showOrderHistory;


console.log('JavaScript loaded successfully!');
