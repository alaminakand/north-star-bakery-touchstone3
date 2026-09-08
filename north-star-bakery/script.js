const productCatalog = [
    { id: "artisan-breads", name: "Artisan Breads" },
    { id: "pastries", name: "Morning Pastries" },
    { id: "celebration-cakes", name: "Celebration Cakes" }
];

const storageKeys = {
    favorites: "northStarFavorites",
    customer: "northStarCustomer"
};

function readStoredJSON(key, fallback) {
    try {
        const storedValue = localStorage.getItem(key);
        return storedValue ? JSON.parse(storedValue) : fallback;
    } catch (error) {
        return fallback;
    }
}

function saveFavorites(favorites) {
    localStorage.setItem(storageKeys.favorites, JSON.stringify(favorites));
}

function getProductName(productId) {
    const product = productCatalog.find((item) => item.id === productId);
    return product ? product.name : productId;
}

function renderFavorites(favorites) {
    const list = document.querySelector("#favorites-list");
    const status = document.querySelector("#favorites-status");
    const clearButton = document.querySelector("#clear-favorites");
    if (!list || !status || !clearButton) return;

    list.replaceChildren();
    favorites.forEach((productId) => {
        const item = document.createElement("li");
        item.textContent = getProductName(productId);
        list.appendChild(item);
    });

    status.textContent = favorites.length
        ? `${favorites.length} favorite ${favorites.length === 1 ? "item" : "items"} saved for your next visit.`
        : "No favorites saved yet.";
    clearButton.hidden = favorites.length === 0;

    document.querySelectorAll(".favorite-button").forEach((button) => {
        const selected = favorites.includes(button.dataset.product);
        button.setAttribute("aria-pressed", String(selected));
        button.textContent = selected ? "Remove from favorites" : "Add to favorites";
    });
}

function toggleFavorite(productId) {
    const favorites = readStoredJSON(storageKeys.favorites, []);
    const updatedFavorites = favorites.includes(productId)
        ? favorites.filter((id) => id !== productId)
        : [...favorites, productId];
    saveFavorites(updatedFavorites);
    renderFavorites(updatedFavorites);
}

function initializeFavorites() {
    const buttons = document.querySelectorAll(".favorite-button");
    if (!buttons.length) return;
    const favorites = readStoredJSON(storageKeys.favorites, []);
    renderFavorites(favorites);
    buttons.forEach((button) => button.addEventListener("click", () => toggleFavorite(button.dataset.product)));
    document.querySelector("#clear-favorites").addEventListener("click", () => {
        saveFavorites([]);
        renderFavorites([]);
    });
}

const validationRules = {
    "full-name": (value) => value.trim().length >= 2 ? "" : "Enter at least two characters for your name.",
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : "Enter an email address in the format name@example.com.",
    "request-type": (value) => value ? "" : "Choose a request type.",
    "pickup-date": (value) => value ? "" : "Choose a preferred pickup date.",
    "item-details": (value) => value.trim().length >= 10 ? "" : "Provide at least 10 characters of item details."
};

function showFieldError(field, message) {
    const errorElement = document.querySelector(`#${field.id}-error`);
    if (errorElement) errorElement.textContent = message;
    field.setAttribute("aria-invalid", String(Boolean(message)));
}

function validateField(field) {
    const validate = validationRules[field.id];
    if (!validate) return true;
    const message = validate(field.value);
    showFieldError(field, message);
    return message === "";
}

function initializeForm() {
    const form = document.querySelector("#preorder-form");
    if (!form) return;
    const storedCustomer = readStoredJSON(storageKeys.customer, {});
    if (storedCustomer.name) form.elements["full-name"].value = storedCustomer.name;
    if (storedCustomer.email) form.elements.email.value = storedCustomer.email;

    Object.keys(validationRules).forEach((id) => {
        const field = document.getElementById(id);
        field.addEventListener("blur", () => validateField(field));
        field.addEventListener("input", () => {
            if (field.getAttribute("aria-invalid") === "true") validateField(field);
        });
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const fields = Object.keys(validationRules).map((id) => document.getElementById(id));
        const valid = fields.map(validateField).every(Boolean);
        const success = document.querySelector("#form-success");
        if (!valid) {
            success.hidden = true;
            fields.find((field) => field.getAttribute("aria-invalid") === "true").focus();
            return;
        }

        const customer = {
            name: form.elements["full-name"].value.trim(),
            email: form.elements.email.value.trim()
        };
        localStorage.setItem(storageKeys.customer, JSON.stringify(customer));
        success.textContent = `Thanks, ${customer.name}. Your request is ready to be sent.`;
        success.hidden = false;
    });
}

function showReturningCustomer() {
    const message = document.querySelector("#returning-customer");
    if (!message) return;
    const customer = readStoredJSON(storageKeys.customer, {});
    if (customer.name) {
        message.textContent = `Welcome back, ${customer.name}. Your contact details are remembered on the preorder page.`;
        message.hidden = false;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initializeFavorites();
    initializeForm();
    showReturningCustomer();
});
