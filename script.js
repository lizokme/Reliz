

// Функція для отримання значення кукі за ім'ям
function getCookieValue(cookieName) {
    // Розділяємо всі куки на окремі частини
    const cookies = document.cookie.split(';');


    // Шукаємо куки з вказаним ім'ям
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim(); // Видаляємо зайві пробіли


        // Перевіряємо, чи починається поточне кукі з шуканого імені
        if (cookie.startsWith(cookieName + '=')) {
            // Якщо так, повертаємо значення кукі
            return cookie.substring(cookieName.length + 1); // +1 для пропуску символу "="
        }
    }
    // Якщо кукі з вказаним іменем не знайдено, повертаємо порожній рядок або можна повернути null
    return '';
}


let themeBtn = document.querySelector("#themeToggle")


function setTheme(theme) {
    if (theme == 'light') {
        document.body.classList.add("light-theme");
        themeBtn.innerHTML = '<i class="bi bi-moon"></i>';
    } else {
        document.body.classList.remove("light-theme");
        themeBtn.innerHTML = '<i class="bi bi-brightness-high"></i>';
    }
}


let theme = getCookieValue('theme')
setTheme(theme)


themeBtn.addEventListener("click", () => {
    document.body.classList.toggle('light-theme'); // Перемикаємо клас теми
    if (theme == 'light') {
        theme = 'dark'
    } else {
        theme = 'light'
    }
    setTheme(theme)
    // Зберігаємо JSON рядок у кукі
    document.cookie = `theme=${theme}; max-age=${60 * 60 * 24 * 7}; path=/`;
})


// Очікуємо завантаження сторінки
document.addEventListener('DOMContentLoaded', function() {
    // Отримуємо всі написи для анімації
    const textElements = document.querySelectorAll('.fade-in-text');


    // Додаємо клас "show" для запуску анімації
    textElements.forEach(element => {
        element.classList.add('show');
    });
});




// Отримуємо дані про товари з JSON файлу
async function getProducts() {
    let response = await fetch("store_db.json");
    let products = await response.json();
    return products;
};




// Генеруємо HTML-код для карточки товару
function getCardHTML(product) {
    // Створюємо JSON-строку з даними про товар і зберігаємо її в data-атрибуті
    let productData = JSON.stringify(product)




    return `
        <div class="product-card">
                <img src="${product.image}" height="200px" >
                <div class="product-details">
                    <p class="product-title">${product.title}</p>
                    <p class="product-descr">${product.descr}</p>
                    <div class="product-actions">
                        <p class="product-price"> ${product.price}₴</p>
                        <button type="button" class="add-to-cart" data-product='${productData}'>Add to Cart
                        </button>
                        <i class="far fa-heart" id="like-button1"></i>
                    </div>
                </div>
            </div>
    `;
}




// Відображаємо товари на сторінці
getProducts().then(function (products) {
    let productsList = document.querySelector('.products-list')
    if (productsList) {
        products.forEach(function (product) {
            productsList.innerHTML += getCardHTML(product)
        })
    }




    // Отримуємо всі кнопки "Купити" на сторінці
    let buyButtons = document.querySelectorAll('.products-list .add-to-cart');
    // Навішуємо обробник подій на кожну кнопку "Купити"
    if (buyButtons) {
        buyButtons.forEach(function (button) {
            button.addEventListener('click', addToCart);
        });
    }
})


// Отримуємо кнопку "Кошик"
const cartBtn = document.getElementById('cartBtn')




// Навішуємо обробник подій на клік кнопки "Кошик"
cartBtn.addEventListener("click", function () {
    // Переходимо на сторінку кошика
    window.location.assign('cart.html')
})






// Створення класу кошика
class ShoppingCart {
    constructor() {
        this.items = {};
        this.cartCounter = document.querySelector('.cart-counter');
        // отримуємо лічильник кількості товарів у кошику
        this.cartElement = document.querySelector('#cart-items');
        this.loadCartFromCookies(); // завантажуємо з кукі-файлів раніше додані в кошик товари
    }




    // Додавання товару до кошика
    addItem(item) {
        if (this.items[item.title]) {
            this.items[item.title].quantity += 1; // Якщо товар вже є, збільшуємо його кількість на одиницю
        } else {
            this.items[item.title] = item; // Якщо товару немає в кошику, додаємо його
            this.items[item.title].quantity = 1;
        }
        this.updateCounter(); // Оновлюємо лічильник товарів
        this.saveCartToCookies();
    }




    // Зміна кількості товарів товарів
    updateQuantity(itemTitle, newQuantity) {
        if (this.items[itemTitle]) {
            this.items[itemTitle].quantity = newQuantity;
            if (this.items[itemTitle].quantity == 0) {
                delete this.items[itemTitle];
            }
            this.updateCounter();
            this.saveCartToCookies();
        }
    }




    // Оновлення лічильника товарів
    updateCounter() {
        let count = 0;
        for (let key in this.items) { // проходимося по всіх ключах об'єкта this.items
            count += this.items[key].quantity; // рахуємо кількість усіх товарів
        }
        this.cartCounter.innerHTML = count; // оновлюємо лічильник на сторінці
    }




    // Зберігання кошика в кукі
    saveCartToCookies() {
        let cartJSON = JSON.stringify(this.items);
        document.cookie = `cart=${cartJSON}; max-age=${60 * 60 * 24 * 7}; path=/`;
    }




    // Завантаження кошика з кукі
    loadCartFromCookies() {
        let cartCookie = getCookieValue('cart');
        if (cartCookie && cartCookie !== '') {
            this.items = JSON.parse(cartCookie);
            this.updateCounter();
        }
    }
    // Обчислення загальної вартості товарів у кошику
    calculateTotal() {
        let total = 0;
        for (let key in this.items) { // проходимося по всіх ключах об'єкта this.items
            total += this.items[key].price * this.items[key].quantity; // рахуємо вартість усіх товарів
        }
        return total;
    }
}




// Створення об'єкта кошика
let cart = new ShoppingCart();


// Функція для додавання товару до кошика при кліку на кнопку "Купити"
function addToCart(event) {
    // Отримуємо дані про товар з data-атрибута кнопки
    const productData = event.target.getAttribute('data-product');
    const product = JSON.parse(productData);




    // Додаємо товар до кошика
    cart.addItem(product);
    console.log(cart);
}




// Функція пошуку товарів
function searchProducts(event) {
    event.preventDefault(); // Запобігає перезавантаженню сторінки при відправці форми




    let query = document.querySelector('#searchForm input').value.toLowerCase();
    let productsList1 = document.querySelector('.products-list');
   
    // Очищуємо списки товарів
    productsList1.innerHTML = '';




    // Функція для відображення товарів
    function displayProducts(products, productsList) {
        products.forEach(function (product) {
            if (product.title.toLowerCase().includes(query)) {
                productsList.innerHTML += getCardHTML(product);
            }
        });
    }




    getProducts().then(function (products) {
        displayProducts(products, productsList1);




        let buyButtons = productsList1.querySelectorAll('.add-to-cart');
        buyButtons.forEach(function (button) {
            button.addEventListener('click', addToCart);
        });
    });




}




let searchForm = document.querySelector('#searchForm');
searchForm.addEventListener('submit', searchProducts);







