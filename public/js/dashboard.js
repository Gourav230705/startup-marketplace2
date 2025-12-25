document.addEventListener('DOMContentLoaded', async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = '/login.html';
        return;
    }

    document.getElementById('welcome-message').textContent = `Hello, ${user.name}!`;

    if (user.role === 'owner') {
        document.getElementById('owner-section').classList.remove('hidden');
        loadMyStartups();
    } else if (user.role === 'customer') {
        document.getElementById('customer-section').classList.remove('hidden');
        loadMyInquiries();
    } else if (user.role === 'admin') {
        document.getElementById('admin-section').classList.remove('hidden');
        loadAdminResources();
        loadAdminStartups();
    }

    // Modal logic
    const modal = document.getElementById('startup-modal');
    window.openStartupModal = () => modal.classList.remove('hidden');
    window.closeStartupModal = () => modal.classList.add('hidden');

    // Admin Resource Modal Logic
    const resourceModal = document.getElementById('resource-modal');
    window.openResourceModal = () => resourceModal.classList.remove('hidden');
    window.closeResourceModal = () => resourceModal.classList.add('hidden');

    const resourceForm = document.getElementById('resource-form');
    if (resourceForm) {
        resourceForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('resource-title').value;
            const description = document.getElementById('resource-desc').value;
            const type = document.getElementById('resource-type').value;
            const expertise = document.getElementById('resource-expertise').value;
            const image = document.getElementById('resource-image').value;
            const link = document.getElementById('resource-link').value;

            try {
                await apiFetch('/resources', 'POST', { title, description, type, expertise, image, link });
                alert('Resource added!');
                closeResourceModal();
                loadAdminResources();
                resourceForm.reset();
            } catch (error) {
                alert('Error adding resource: ' + error.message);
            }
        });
    }

    // Add Startup Form
    const startupForm = document.getElementById('startup-form');
    if (startupForm) {
        startupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('startup-name').value;
            const description = document.getElementById('startup-desc').value;
            const industry = document.getElementById('startup-industry').value;
            const contactEmail = document.getElementById('startup-email').value;

            try {
                await apiFetch('/startups', 'POST', { name, description, industry, contactEmail });
                closeStartupModal();
                loadMyStartups();
                startupForm.reset();
            } catch (error) {
                alert('Error creating startup: ' + error.message);
            }
        });
    }
    // Reply Modal Logic
    const replyModal = document.getElementById('reply-modal');
    window.closeReplyModal = () => replyModal.classList.add('hidden');

    window.openReplyModal = (id, message) => {
        document.getElementById('reply-inquiry-id').value = id;
        document.getElementById('reply-original-message').textContent = message;
        replyModal.classList.remove('hidden');
    };

    const replyForm = document.getElementById('reply-form');
    if (replyForm) {
        replyForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('reply-inquiry-id').value;
            const reply = document.getElementById('reply-message').value;
            try {
                await apiFetch(`/inquiries/${id}/reply`, 'POST', { reply });
                alert('Reply sent!');
                closeReplyModal();
                loadMyStartups(); // Refresh list associated with inquiries
            } catch (error) {
                alert('Error sending reply: ' + error.message);
            }
        });
    }
});


async function loadMyStartups() {
    try {
        const startups = await apiFetch('/startups'); // Actually this gets ALL startups. Need to filter in frontend or create a /my-startups endpoint. 
        // For simplicity, filtering in frontend by owner ID, or better, assuming generic getStartups returns all but we want only ours.
        // Wait, the backend endpoint GET /startups returns ALL. I should filter here for now.
        const user = JSON.parse(localStorage.getItem('user'));

        const myStartups = startups.filter(s => s.owner && s.owner._id === user._id);

        const container = document.getElementById('my-startups-list');
        container.innerHTML = myStartups.map(startup => `
            <div class="bg-white p-4 rounded shadow border border-gray-200">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-bold text-lg">${startup.name}</h3>
                    <span class="px-2 py-1 rounded text-xs uppercase font-bold 
                        ${startup.status === 'approved' ? 'bg-green-100 text-green-800' :
                startup.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}">
                        ${startup.status || 'pending'}
                    </span>
                </div>
                <p class="text-gray-600 text-sm mt-1">${startup.description.substring(0, 80)}...</p>
                 <div class="mt-2 text-xs text-gray-500">Industry: ${startup.industry}</div>
                 <button onclick="deleteStartup('${startup._id}')" class="mt-3 text-red-500 hover:text-red-700 text-sm">Delete</button>
            </div>
        `).join('');

        // Also load inquiries for these startups
        loadOwnerInquiries(myStartups);
        loadResourceRequests();

    } catch (error) {
        console.error('Error loading startups', error);
    }
}

async function loadResourceRequests() {
    try {
        const requests = await apiFetch('/resource-requests/my');
        const container = document.getElementById('my-resource-requests-list');

        if (requests.length === 0) {
            container.innerHTML = '<p class="text-gray-500">No requests sent yet.</p>';
            return;
        }

        container.innerHTML = requests.map(req => `
            <div class="bg-white p-4 rounded shadow border border-gray-100 flex justify-between items-start">
                <div>
                    <h4 class="font-bold text-gray-800">${req.resource ? req.resource.title : 'Unknown Resource'} <span class="text-xs font-normal text-gray-500">(${req.resource ? req.resource.type : 'N/A'})</span></h4>
                    <p class="text-sm text-gray-600 mt-1"><span class="font-semibold">Reason:</span> ${req.reason}</p>
                    <p class="text-sm text-gray-600"><span class="font-semibold">Need:</span> ${req.need}</p>
                    <div class="text-xs text-gray-400 mt-2">Sent: ${new Date(req.createdAt).toLocaleDateString()}</div>
                </div>
                <div>
                    <span class="px-2 py-1 rounded text-xs font-semibold uppercase ${req.status === 'accepted' ? 'bg-green-100 text-green-800' :
                req.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
            }">${req.status}</span>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading resource requests', error);
        document.getElementById('my-resource-requests-list').innerHTML = '<p class="text-red-500">Error loading requests.</p>';
    }
}

async function deleteStartup(id) {
    if (!confirm('Are you sure?')) return;
    try {
        await apiFetch(`/startups/${id}`, 'DELETE');
        loadMyStartups();
    } catch (error) {
        alert('Error deleting startup');
    }
}

async function loadMyInquiries() {
    try {
        const inquiries = await apiFetch('/inquiries/my');
        const container = document.getElementById('my-inquiries-list');
        if (inquiries.length === 0) {
            container.innerHTML = '<p class="text-gray-500">No messages yet.</p>';
            return;
        }
        container.innerHTML = inquiries.map(inquiry => `
            <div class="bg-white p-4 rounded shadow">
                <p class="font-bold text-indigo-600">To: ${inquiry.startup.name}</p>
                <p class="mt-1">${inquiry.message}</p>
                ${inquiry.reply ? `
                    <div class="mt-3 ml-4 p-3 bg-indigo-50 rounded border-l-4 border-indigo-500">
                        <p class="text-xs font-bold text-indigo-800 mb-1">Reply from Owner:</p>
                        <p class="text-sm text-gray-700">${inquiry.reply}</p>
                        <p class="text-xs text-gray-400 mt-1">${new Date(inquiry.repliedAt).toLocaleDateString()}</p>
                    </div>
                ` : ''}
                <div class="text-xs text-gray-400 mt-2">${new Date(inquiry.createdAt).toLocaleDateString()}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error(error);
    }
}

async function loadOwnerInquiries(startups) {
    const container = document.getElementById('owner-inquiries-list');
    container.innerHTML = '<p class="text-gray-500 text-sm">Loading messages...</p>';

    // This is inefficient (N+1), but simple for now. 
    // Better backend would be /inquiries/received which aggregates.
    // But I have /inquiries/startup/:startupId

    let allInquiries = [];
    for (const startup of startups) {
        try {
            const result = await apiFetch(`/inquiries/startup/${startup._id}`);
            allInquiries = [...allInquiries, ...result];
        } catch (e) {
            // ignore if 401/404
        }
    }

    if (allInquiries.length === 0) {
        container.innerHTML = '<p class="text-gray-500">No inquiries yet.</p>';
        return;
    }

    container.innerHTML = allInquiries.map(inquiry => `
        <div class="bg-white p-3 rounded border border-gray-100">
            <p class="text-sm font-bold text-gray-800">From: ${inquiry.sender.name} (${inquiry.sender.email})</p>
            <p class="text-xs text-gray-500 mb-1">For: ${startups.find(s => s._id === inquiry.startup)?.name || 'Unknown Startup'}</p>
            <p class="text-gray-700 bg-gray-50 p-2 rounded text-sm">${inquiry.message}</p>
            ${inquiry.reply ? `
                <div class="mt-2 ml-2 pl-2 border-l-2 border-gray-300">
                    <p class="text-xs text-gray-500">Your Reply:</p>
                    <p class="text-sm text-gray-600">${inquiry.reply}</p>
                </div>
            ` : `
                <button onclick="openReplyModal('${inquiry._id}', '${inquiry.message.replace(/'/g, "\\'")}')" class="mt-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-200">Reply</button>
            `}
        </div>
     `).join('');
}

async function loadAdminResources() {
    try {
        const resources = await apiFetch('/resources');
        const container = document.getElementById('admin-resources-list');

        // Update Stats
        const statEl = document.getElementById('admin-stat-resources');
        if (statEl) statEl.textContent = resources.length;

        if (resources.length === 0) {
            container.innerHTML = '<p class="text-gray-500 col-span-3 text-center py-10">No resources found. Add your first one!</p>';
            return;
        }

        container.innerHTML = resources.map(resource => `
            <div class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col h-full">
                <div class="h-32 bg-gray-100 relative">
                    ${resource.image ?
                `<img src="${resource.image}" alt="${resource.title}" class="w-full h-full object-cover">` :
                `<div class="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                            <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        </div>`
            }
                    <div class="absolute top-2 right-2">
                        <span class="px-2 py-1 bg-white bg-opacity-90 backdrop-blur-sm rounded text-xs font-bold uppercase tracking-wider text-gray-700 shadow-sm">${resource.type}</span>
                    </div>
                </div>
                <div class="p-5 flex-1 flex flex-col">
                    <h4 class="font-bold text-lg text-gray-900 mb-2 truncate">${resource.title}</h4>
                    <p class="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">${resource.description}</p>
                    
                    <div class="flex flex-wrap gap-1 mb-4">
                        ${resource.expertise ? resource.expertise.slice(0, 2).map(exp => `<span class="text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded border border-gray-100">${exp}</span>`).join('') : ''}
                        ${resource.expertise && resource.expertise.length > 2 ? `<span class="text-xs text-gray-400 px-1">+${resource.expertise.length - 2} more</span>` : ''}
                    </div>

                    <div class="pt-4 border-t border-gray-100 flex justify-between items-center mt-auto">
                        <a href="${resource.link}" target="_blank" class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">View</a>
                        <button onclick="deleteResource('${resource._id}')" 
                            class="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading resources', error);
    }
}

async function deleteResource(id) {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    try {
        await apiFetch(`/resources/${id}`, 'DELETE');
        loadAdminResources();
    } catch (error) {
        alert('Error deleting resource: ' + error.message);
    }
}

async function loadAdminStartups() {
    try {
        const startups = await apiFetch('/startups/admin');
        const container = document.getElementById('admin-approvals-list');
        const pendingStartups = startups.filter(s => s.status === 'pending');

        // Update Stats
        const statEl = document.getElementById('admin-stat-pending');
        if (statEl) statEl.textContent = pendingStartups.length;

        if (pendingStartups.length === 0) {
            container.innerHTML = '<p class="text-gray-500 col-span-2">No pending approvals.</p>';
            return;
        }

        container.innerHTML = pendingStartups.map(startup => `
            <div class="bg-white p-5 rounded-lg shadow-sm border border-orange-100">
                <div class="flex justify-between items-start">
                    <div>
                        <h4 class="font-bold text-lg text-gray-800">${startup.name}</h4>
                        <p class="text-sm text-gray-500">Owner: ${startup.owner.name} (${startup.owner.email})</p>
                    </div>
                    <span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs uppercase font-bold">Pending</span>
                </div>
                <p class="text-gray-600 mt-2 text-sm">${startup.description}</p>
                <div class="mt-4 flex space-x-3">
                    <button onclick="updateStartupStatus('${startup._id}', 'approved')" class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors">Approve</button>
                    <button onclick="updateStartupStatus('${startup._id}', 'rejected')" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors">Reject</button>
                    <a href="${startup.website}" target="_blank" class="text-indigo-600 hover:text-indigo-800 text-sm flex items-center mt-1">Visit Website &rarr;</a>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading admin startups', error);
    }
}

async function updateStartupStatus(id, status) {
    if (!confirm(`Are you sure you want to ${status} this startup?`)) return;
    try {
        await apiFetch(`/startups/${id}/status`, 'PUT', { status });
        alert(`Startup ${status} successfully!`);
        loadAdminStartups();
    } catch (error) {
        alert('Error updating status: ' + error.message);
    }
}

// Ensure global scope
window.deleteResource = deleteResource;
window.updateStartupStatus = updateStartupStatus;
window.loadAdminStartups = loadAdminStartups;
window.loadAdminResources = loadAdminResources;
