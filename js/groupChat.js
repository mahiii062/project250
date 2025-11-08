// Global variables
let currentGroupId = null;
let selectedMembers = [];
let allGroups = [];
let currentUserId = null;
let messageRefreshInterval = null;
let groupRefreshInterval = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadGroups();

    // Set up auto-refresh
    groupRefreshInterval = setInterval(loadGroups, 10000); // Refresh groups every 10 seconds

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#userMenuBtn') && !e.target.closest('#userMenu')) {
            document.getElementById('userMenu').classList.remove('active');
        }
    });
});

// Check authentication
async function checkAuth() {
    try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();

        if (data.authenticated) {
            currentUserId = data.userId;
            document.getElementById('userName').textContent = data.userName || 'User';
        } else {
            // Redirect to login if not authenticated
            window.location.href = '../users/user.html';
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        // For development, set a default user
        currentUserId = 1;
        document.getElementById('userName').textContent = 'Test User';
    }
}

// Toggle user menu
function toggleUserMenu() {
    document.getElementById('userMenu').classList.toggle('active');
}

// Logout function
function logout() {
    fetch('/api/auth/logout', { method: 'POST' })
        .then(() => {
            window.location.href = '../index.html';
        })
        .catch(error => {
            console.error('Logout failed:', error);
            window.location.href = '../index.html';
        });
}

// Toggle sidebar for mobile
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

// Load all groups
async function loadGroups() {
    try {
        const response = await fetch('/api/groups');
        const data = await response.json();

        if (data.success) {
            allGroups = data.groups;
            displayGroups(data.groups);
        }
    } catch (error) {
        console.error('Error loading groups:', error);
        document.getElementById('groupsList').innerHTML =
            '<div class="loading" style="color: #e53e3e;">Failed to load groups. Please refresh.</div>';
    }
}

// Display groups in sidebar
function displayGroups(groups) {
    const groupsList = document.getElementById('groupsList');

    if (groups.length === 0) {
        groupsList.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #a0aec0;">
                <i class="fas fa-inbox" style="font-size: 40px; margin-bottom: 10px;"></i>
                <p>No groups yet.<br>Create one to get started!</p>
            </div>
        `;
        return;
    }

    groupsList.innerHTML = groups.map(group => `
        <div class="group-item ${currentGroupId === group.id ? 'active' : ''}" onclick="selectGroup(${group.id})">
            <div class="group-item-header">
                <span class="group-name">${escapeHtml(group.name)}</span>
                <div class="group-meta">
                    <span class="member-count"><i class="fas fa-users"></i> ${group.member_count}</span>
                    ${group.unread_count > 0 ? `<span class="unread-badge">${group.unread_count}</span>` : ''}
                </div>
            </div>
            <div class="last-message">${escapeHtml(group.last_message || 'No messages yet')}</div>
        </div>
    `).join('');
}

// Select a group and load its messages
async function selectGroup(groupId) {
    currentGroupId = groupId;

    // Close sidebar on mobile
    document.getElementById('sidebar').classList.remove('active');

    // Show chat interface
    document.getElementById('chatHeader').style.display = 'flex';
    document.getElementById('messageInputArea').style.display = 'flex';

    // Update active state in sidebar
    displayGroups(allGroups);

    // Load group details
    try {
        const response = await fetch(`/api/groups/${groupId}`);
        const data = await response.json();

        if (data.success) {
            document.getElementById('groupName').textContent = data.group.name;
            document.getElementById('groupMembers').textContent = `${data.members.length} members`;

            // Store group details for later use
            window.currentGroupDetails = data;
        }
    } catch (error) {
        console.error('Error loading group details:', error);
    }

    // Load messages
    loadMessages(groupId);

    // Clear previous interval and set up new one
    if (messageRefreshInterval) {
        clearInterval(messageRefreshInterval);
    }
    messageRefreshInterval = setInterval(() => {
        if (currentGroupId === groupId) {
            loadMessages(groupId, true); // Silent refresh
        }
    }, 3000);
}

// Load messages for a group
async function loadMessages(groupId, silent = false) {
    try {
        const response = await fetch(`/api/groups/${groupId}/messages?limit=100`);
        const data = await response.json();

        if (data.success) {
            displayMessages(data.messages);
        }
    } catch (error) {
        if (!silent) {
            console.error('Error loading messages:', error);
            showToast('Failed to load messages', 'error');
        }
    }
}

// Display messages
function displayMessages(messages) {
    const container = document.getElementById('messagesContainer');

    if (messages.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-comments"></i></div>
                <h3>No messages yet</h3>
                <p>Be the first to send a message in this group!</p>
            </div>
        `;
        return;
    }

    // Store current scroll position
    const isScrolledToBottom = container.scrollHeight - container.clientHeight <= container.scrollTop + 1;

    container.innerHTML = messages.map(msg => `
        <div class="message ${msg.sender_id === currentUserId ? 'own' : ''}">
            <div class="message-avatar">${getInitials(msg.sender_name)}</div>
            <div class="message-content">
                <div class="message-sender">${escapeHtml(msg.sender_name)}</div>
                <div class="message-bubble">${escapeHtml(msg.message)}</div>
                <div class="message-time">
                    <i class="far fa-clock"></i> ${formatTime(msg.created_at)}
                    ${msg.read_count > 0 ? `<i class="fas fa-check-double" style="margin-left: 5px;"></i>` : ''}
                </div>
            </div>
        </div>
    `).join('');

    // Scroll to bottom if was already at bottom or if new message
    if (isScrolledToBottom || messages.length === 1) {
        container.scrollTop = container.scrollHeight;
    }
}

// Send a message
async function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();

    if (!message || !currentGroupId) return;

    try {
        const response = await fetch(`/api/groups/${currentGroupId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });

        const data = await response.json();

        if (data.success) {
            input.value = '';
            loadMessages(currentGroupId);
            loadGroups(); // Refresh groups to update last message
        } else {
            showToast('Failed to send message', 'error');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        showToast('Failed to send message', 'error');
    }
}

// Handle Enter key press in message input
function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// Refresh messages manually
function refreshMessages() {
    if (currentGroupId) {
        loadMessages(currentGroupId);
        showToast('Messages refreshed', 'success');
    }
}

// Open new group modal
function openNewGroupModal() {
    document.getElementById('newGroupModal').classList.add('active');
    selectedMembers = [];
    document.getElementById('newGroupName').value = '';
    document.getElementById('newGroupDescription').value = '';
    document.getElementById('userSearch').value = '';
    document.getElementById('userList').innerHTML = '';
    document.getElementById('selectedMembers').innerHTML = '';
}

// Close new group modal
function closeNewGroupModal() {
    document.getElementById('newGroupModal').classList.remove('active');
}

// Search users
let searchTimeout;
async function searchUsers() {
    const query = document.getElementById('userSearch').value.trim();

    clearTimeout(searchTimeout);

    if (query.length < 2) {
        document.getElementById('userList').innerHTML = '<div style="padding: 15px; text-align: center; color: #a0aec0;">Type at least 2 characters to search...</div>';
        return;
    }

    searchTimeout = setTimeout(async () => {
        try {
            const response = await fetch(`/api/users/search?query=${encodeURIComponent(query)}`);
            const data = await response.json();

            if (data.success) {
                displayUserList(data.users);
            }
        } catch (error) {
            console.error('Error searching users:', error);
            document.getElementById('userList').innerHTML = '<div style="padding: 15px; text-align: center; color: #e53e3e;">Search failed. Please try again.</div>';
        }
    }, 300);
}

// Display user search results
function displayUserList(users) {
    const userList = document.getElementById('userList');

    if (users.length === 0) {
        userList.innerHTML = '<div style="padding: 15px; text-align: center; color: #a0aec0;">No users found</div>';
        return;
    }

    userList.innerHTML = users
        .filter(user => user.id !== currentUserId) // Don't show current user
        .map(user => {
            const isAdded = selectedMembers.some(m => m.userId === user.id);
            return `
                <div class="user-item">
                    <div class="user-info">
                        <h4>${escapeHtml(user.name)}</h4>
                        <p><i class="fas fa-briefcase"></i> ${escapeHtml(user.profession || 'No profession specified')}</p>
                    </div>
                    <button class="add-btn ${isAdded ? 'added' : ''}" onclick="toggleMember(${user.id}, '${escapeHtml(user.name)}', '${escapeHtml(user.profession || '')}')">
                        ${isAdded ? '<i class="fas fa-check"></i> Added' : '<i class="fas fa-plus"></i> Add'}
                    </button>
                </div>
            `;
        }).join('');
}

// Toggle member selection
function toggleMember(userId, name, profession) {
    const index = selectedMembers.findIndex(m => m.userId === userId);

    if (index > -1) {
        selectedMembers.splice(index, 1);
    } else {
        selectedMembers.push({ userId, name, profession });
    }

    displaySelectedMembers();
    searchUsers(); // Refresh the list to update button states
}

// Display selected members
function displaySelectedMembers() {
    const container = document.getElementById('selectedMembers');

    if (selectedMembers.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #a0aec0; width: 100%;">No members selected</div>';
        return;
    }

    container.innerHTML = selectedMembers.map((member, index) => `
        <div class="member-tag">
            ${escapeHtml(member.name)} ${member.profession ? `- ${escapeHtml(member.profession)}` : ''}
            <button onclick="removeMember(${index})" title="Remove">×</button>
        </div>
    `).join('');
}

// Remove a selected member
function removeMember(index) {
    selectedMembers.splice(index, 1);
    displaySelectedMembers();
    searchUsers();
}

// Create a new group
async function createGroup() {
    const name = document.getElementById('newGroupName').value.trim();
    const description = document.getElementById('newGroupDescription').value.trim();

    if (!name) {
        showToast('Please enter a group name', 'error');
        return;
    }

    if (selectedMembers.length === 0) {
        showToast('Please add at least one member', 'error');
        return;
    }

    try {
        const response = await fetch('/api/groups', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                description,
                members: selectedMembers
            })
        });

        const data = await response.json();

        if (data.success) {
            closeNewGroupModal();
            showToast('Group created successfully!', 'success');
            loadGroups();
            // Auto-select the new group
            setTimeout(() => selectGroup(data.groupId), 500);
        } else {
            showToast(data.error || 'Failed to create group', 'error');
        }
    } catch (error) {
        console.error('Error creating group:', error);
        showToast('Failed to create group', 'error');
    }
}

// Show group details modal
async function showGroupDetails() {
    if (!currentGroupId) return;

    try {
        const response = await fetch(`/api/groups/${currentGroupId}`);
        const data = await response.json();

        if (data.success) {
            document.getElementById('detailGroupName').textContent = data.group.name;
            document.getElementById('detailGroupDescription').textContent = data.group.description || 'No description';
            document.getElementById('detailGroupCreator').textContent = data.group.creator_name;
            document.getElementById('detailMemberCount').textContent = data.members.length;

            // Display members
            const membersList = document.getElementById('detailMembersList');
            membersList.innerHTML = data.members.map(member => `
                <div class="member-item">
                    <div class="member-avatar">${getInitials(member.name)}</div>
                    <div class="member-details">
                        <h5>${escapeHtml(member.name)} ${member.role === 'admin' ? '<i class="fas fa-crown" style="color: #f6ad55;"></i>' : ''}</h5>
                        <p>${escapeHtml(member.profession || 'No profession specified')}</p>
                    </div>
                </div>
            `).join('');

            document.getElementById('groupDetailsModal').classList.add('active');
        }
    } catch (error) {
        console.error('Error loading group details:', error);
        showToast('Failed to load group details', 'error');
    }
}

// Close group details modal
function closeGroupDetailsModal() {
    document.getElementById('groupDetailsModal').classList.remove('active');
}

// Open add members modal
function openAddMembersModal() {
    // Reuse the new group modal but with different context
    openNewGroupModal();
    document.getElementById('newGroupName').parentElement.style.display = 'none';
    document.getElementById('newGroupDescription').parentElement.style.display = 'none';
}

// Leave group
async function leaveGroup() {
    if (!currentGroupId) return;

    if (!confirm('Are you sure you want to leave this group?')) return;

    try {
        const response = await fetch(`/api/groups/${currentGroupId}/leave`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            closeGroupDetailsModal();
            showToast('Left group successfully', 'success');
            currentGroupId = null;
            document.getElementById('chatHeader').style.display = 'none';
            document.getElementById('messageInputArea').style.display = 'none';
            document.getElementById('messagesContainer').innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon"><i class="fas fa-comments"></i></div>
                    <h3>Select a group to start chatting</h3>
                    <p>Or create a new group to connect with service providers</p>
                </div>
            `;
            loadGroups();
        } else {
            showToast('Failed to leave group', 'error');
        }
    } catch (error) {
        console.error('Error leaving group:', error);
        showToast('Failed to leave group', 'error');
    }
}

// Handle attachment (placeholder)
function handleAttachment() {
    showToast('File attachment feature coming soon!', 'info');
}

// Toggle emoji picker (placeholder)
function toggleEmojiPicker() {
    showToast('Emoji picker coming soon!', 'info');
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast active ${type}`;

    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

// Utility function to get initials
function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
}

// Utility function to escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Utility function to format time
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    // Less than 1 minute
    if (diff < 60000) return 'Just now';

    // Less than 1 hour
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes}m ago`;
    }

    // Less than 24 hours
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours}h ago`;
    }

    // Less than 7 days
    if (diff < 604800000) {
        const days = Math.floor(diff / 86400000);
        return `${days}d ago`;
    }

    // More than 7 days - show date
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (messageRefreshInterval) clearInterval(messageRefreshInterval);
    if (groupRefreshInterval) clearInterval(groupRefreshInterval);
});