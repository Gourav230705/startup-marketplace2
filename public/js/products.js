document.addEventListener('DOMContentLoaded', async () => {
    loadProducts();
    const user = JSON.parse(localStorage.getItem('user'));

    if (user && user.role === 'owner') {
        const btn = document.getElementById('add-product-btn');
        if (btn) btn.classList.remove('hidden');
        loadMyStartupsForSelect();
    }

    const modal = document.getElementById('product-modal');
    window.openProductModal = (isEdit = false, product = null) => {
        document.getElementById('modal-title').textContent = isEdit ? 'Edit Product' : 'Add Product';
        if (isEdit && product) {
            document.getElementById('product-id').value = product._id;
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-desc').value = product.description;
            document.getElementById('product-price').value = product.price;
            // Handle startup selection if needed, though usually fixed on creation
            const startupSelect = document.getElementById('product-startup');
            if (startupSelect) startupSelect.value = product.startup._id || product.startup;
            document.getElementById('startup-select-container').classList.add('hidden'); // Simplify: don't change startup on edit
        } else {
            document.getElementById('product-form').reset();
            document.getElementById('product-id').value = '';
            document.getElementById('startup-select-container').classList.remove('hidden');
        }
        modal.classList.remove('hidden');
    };
    window.closeProductModal = () => modal.classList.add('hidden');

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                loadProducts(e.target.value);
            }, 300);
        });
    }

    const form = document.getElementById('product-form');
    if (form) {
        form.addEventListener('submit', handleProductSubmit);
    }
});

async function loadProducts(query = '') {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const startupId = urlParams.get('startup');

        // Update page title or header if filtering by startup
        if (startupId && !query) { // Initial load
            // We could fetch startup details to show "Products by [Name]" but for now let's keep it simple
            // Or we rely on the generic title update later
        }

        let endpoint = `/products${query ? `?search=${query}` : ''}`;

        // Append startup filter if present
        if (startupId) {
            endpoint += endpoint.includes('?') ? `&startup=${startupId}` : `?startup=${startupId}`;

            // Visual cue
            const header = document.querySelector('h1', 'Marketplace Products'); // Rough selector default
            if (header && !query) header.textContent = 'Startup Products';
        }

        const products = await apiFetch(endpoint);
        const user = JSON.parse(localStorage.getItem('user'));
        const container = document.getElementById('products-list');

        if (products.length === 0) {
            container.innerHTML = '<div class="col-span-full text-center text-gray-500 py-10">No products available yet.</div>';
            return;
        }

        let displayProducts = products;
        if (user && user.role === 'owner') {
            displayProducts = products.filter(p => p.createdBy._id === user._id);

            // Update Heading
            const pageTitle = document.querySelector('h1');
            if (pageTitle) pageTitle.textContent = 'My Products';

            if (displayProducts.length === 0) {
                container.innerHTML = '<div class="col-span-full text-center text-gray-500 py-10">You have no products listed. Click "Add Product" to get started.</div>';
                return;
            }
        }

        container.innerHTML = displayProducts.map(product => {
            const isOwner = user && user._id === product.createdBy._id;
            const isCustomer = user && user.role === 'customer';

            return `
            <div class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col">
                <div class="p-6 flex-1 flex flex-col">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="text-xl font-bold text-gray-900">${product.name}</h3>
                        <span class="text-lg font-bold text-indigo-600">$${product.price}</span>
                    </div>
                    <p class="text-sm text-gray-500 mb-4 font-medium">By: ${product.startup.name}</p>
                    <p class="text-gray-600 text-sm mb-6 flex-1">${product.description}</p>
                    
                    <div class="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                        ${isCustomer ? `
                            <button onclick="buyProduct('${product._id}')" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition-colors flex justify-center items-center">
                                Buy Now
                            </button>
                        ` : ''}
                        
                         ${!user ? `
                            <a href="/login.html" class="w-full text-center text-indigo-600 border border-indigo-600 hover:bg-indigo-50 font-bold py-2 px-4 rounded transition-colors">
                                Login to Buy
                            </a>
                        ` : ''}

                        ${isOwner ? `
                            <div class="flex space-x-2 w-full justify-end">
                                <button onclick='openEditProduct(${JSON.stringify(product).replace(/'/g, "&#39;")})' class="text-gray-500 hover:text-indigo-600 text-sm font-medium px-3 py-1 border rounded hover:bg-gray-50">Edit</button>
                                <button onclick="deleteProduct('${product._id}')" class="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1 border rounded hover:bg-red-50">Delete</button>
                            </div>
                        ` : ''}
                        
                         ${user && user.role === 'owner' && !isOwner ? '<span class="text-gray-400 text-sm mx-auto">Founders Only</span>' : ''}
                    </div>
                </div>
            </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Error loading products', error);
        document.getElementById('products-list').innerHTML = '<p class="text-red-500 text-center col-span-full">Error loading products.</p>';
    }
}

async function loadMyStartupsForSelect() {
    // We reuse the logic effectively by calling generic apiFetch but filtering 
    // Ideally user only sees their own startups in the dropdown
    try {
        const startups = await apiFetch('/startups');
        const user = JSON.parse(localStorage.getItem('user'));
        const myStartups = startups.filter(s => s.owner._id === user._id && s.status === 'approved'); // Only approved startups can list products? Let's say yes for quality.

        const select = document.getElementById('product-startup');
        if (select) {
            if (myStartups.length === 0) {
                select.innerHTML = '<option value="">No Approved Startups Found</option>';
                // Maybe disable the add button if no startups
            } else {
                select.innerHTML = myStartups.map(s => `<option value="${s._id}">${s.name}</option>`).join('');
            }
        }
    } catch (error) {
        console.error(error);
    }
}

async function handleProductSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('product-id').value;
    const name = document.getElementById('product-name').value;
    const description = document.getElementById('product-desc').value;
    const price = document.getElementById('product-price').value;
    const startupId = document.getElementById('product-startup').value;

    const method = id ? 'PUT' : 'POST';
    const endpoint = id ? `/products/${id}` : '/products';
    const body = { name, description, price, startupId };

    try {
        await apiFetch(endpoint, method, body);
        closeProductModal();
        loadProducts();
    } catch (error) {
        alert('Error saving product: ' + error.message);
    }
}

// Helper to handle the string escaping for onclick
window.openEditProduct = (product) => {
    window.openProductModal(true, product);
}

async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
        await apiFetch(`/products/${id}`, 'DELETE');
        loadProducts();
    } catch (error) {
        alert('Error deleting product');
    }
}

async function buyProduct(id) {
    if (!confirm('Confirm purchase for this product?')) return;
    try {
        await apiFetch(`/orders/${id}`, 'POST');
        document.getElementById('success-modal').classList.remove('hidden');
    } catch (error) {
        alert('Purchase failed: ' + error.message);
    }
}
