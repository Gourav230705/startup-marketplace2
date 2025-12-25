document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
});

function checkAuth() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const navContainer = document.getElementById('nav-container');

  if (navContainer) {
    if (token && user) {
      navContainer.innerHTML = `
        <nav class="bg-white shadow-lg fixed w-full z-50 top-0 left-0">
          <div class="max-w-7xl mx-auto px-4">
            <div class="flex justify-between h-16">
              <div class="flex items-center">
                <a href="/" class="text-2xl font-bold text-indigo-600">StartupMarket</a>
                <div class="ml-10 flex items-baseline space-x-4">
                  <a href="/" class="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md font-medium">Home</a>
                  <a href="/startups.html" class="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md font-medium">Browse</a>
                  <a href="/resources.html" class="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md font-medium">Resources</a>
                </div>
              </div>
              <div class="flex items-center">
                <a href="/dashboard.html" class="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md font-medium">Dashboard</a>
                <a href="/profile.html" class="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md font-medium">Profile</a>
                 <span class="text-gray-500 mx-2">|</span>
                <button onclick="logout()" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-medium">Logout</button>
              </div>
            </div>
          </div>
        </nav>
      `;
    } else {
      navContainer.innerHTML = `
        <nav class="bg-white shadow-lg fixed w-full z-50 top-0 left-0">
          <div class="max-w-7xl mx-auto px-4">
            <div class="flex justify-between h-16">
              <div class="flex items-center">
                <a href="/" class="text-2xl font-bold text-indigo-600">StartupMarket</a>
                <div class="ml-10 flex items-baseline space-x-4">
                  <a href="/" class="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md font-medium">Home</a>
                  <a href="/startups.html" class="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md font-medium">Browse</a>
                </div>
              </div>
              <div class="flex items-center space-x-4">
                <a href="/login.html" class="text-gray-700 hover:text-indigo-600 font-medium">Login</a>
                <a href="/register.html" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition duration-300">Sign Up</a>
              </div>
            </div>
          </div>
        </nav>
      `;
    }
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login.html';
}

async function apiFetch(endpoint, method = 'GET', body = null) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`/api${endpoint}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw { status: response.status, message: data.message };
  }

  return data;
}
