// Demo version with hardcoded data
// Global variables
let currentGroupId = null;
let selectedMembers = [];
let allGroups = [];
let currentUserId = 1; // Hardcoded current user
let messageRefreshInterval = null;
let groupRefreshInterval = null;

// Hardcoded demo data
const DEMO_USERS = [
    { id: 1, name: 'John Doe', profession: 'Plumber', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', profession: 'Electrician', email: 'jane@example.com' },
    { id: 3, name: 'Bob Wilson', profession: 'Carpenter', email: 'bob@example.com' },
    { id: 4, name: 'Alice Brown', profession: 'Painter', email: 'alice@example.com' },
    { id: 5, name: 'Charlie Davis', profession: 'HVAC Technician', email: 'charlie@example.com' },
    { id: 6, name: 'Diana Miller', profession: 'Landscaper', email: 'diana@example.com' }
];

const DEMO_GROUPS = [
    {
        id: 1,
        name: 'Home Renovation Project',
        description: 'Discussing the kitchen renovation',
        created_by: 1,
        creator_name: 'John Doe',
        member_count: 4,
        last_message: 'When can you start the electrical work?',
        last_message_time: new Date(Date.now() - 3600000).toISOString(),
        unread_count: 2,
        members: [1, 2, 3, 4]
    },
    {
        id: 2,
        name: 'Garden Makeover',
        description: 'Planning the backyard transformation',
        created_by: 1,
        creator_name: 'John Doe',
        member_count: 3,
        last_message: 'I can start next Monday',
        last_message_time: new Date(Date.now() - 7200000).toISOString(),
        unread_count: 0,
        members: [1, 6, 4]
    },
    {
        id: 3,
        name: 'HVAC Installation',
        description: 'New AC system installation',
        created_by: 1,
        creator_name: 'John Doe',
        member_count: 2,
        last_message: 'Got the parts ordered',
        last_message_time: new Date(Date.now() - 86400000).toISOString(),
        unread_count: 1,
        members: [1, 5]
    }
];

const DEMO_MESSAGES = {
    1: [
        {
            id: 1,
            group_id: 1,
            sender_id: 1,
            sender_name: 'John Doe',
            message: 'Hi everyone! Thanks for joining this group.',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            read_count: 3
        },
        {
            id: 2,
            group_id: 1,
            sender_id: 2,
            sender_name: 'Jane Smith',
            message: 'Happy to help with the electrical work!',
            created_at: new Date(Date.now() - 72000000).toISOString(),
            read_count: 2
        },
        {
            id: 3,
            group_id: 1,
            sender_id: 3,
            sender_name: 'Bob Wilson',
            message: 'I can handle all the carpentry. When do we start?',
            created_at: new Date(Date.now() - 54000000).toISOString(),
            read_count: 2
        },
        {
            id: 4,
            group_id: 1,
            sender_id: 1,
            sender_name: 'John Doe',
            message: 'Great! I was thinking we could start next week.',
            created_at: new Date(Date.now() - 36000000).toISOString(),
            read_count: 2
        },
        {
            id: 5,
            group_id: 1,
            sender_id: 2,
            sender_name: 'Jane Smith',
            message: 'When can you start the electrical work?',
            created_at: new Date(Date.now() - 3600000).toISOString(),
            read_count: 0
        }
    ],
    2: [
        {
            id: 6,
            group_id: 2,
            sender_id: 1,
            sender_name: 'John Doe',
            message: 'Looking forward to transforming the backyard!',
            created_at: new Date(Date.now() - 172800000).toISOString(),
            read_count: 2
        },
        {
            id: 7,
            group_id: 2,
            sender_id: 6,
            sender_name: 'Diana Miller',
            message: 'I have some great ideas for the landscaping.',
            created_at: new Date(Date.now() - 144000000).toISOString(),
            read_count: 1
        },
        {
            id: 8,
            group_id: 2,
            sender_id: 6,
            sender_name: 'Diana Miller',
            message: 'I can start next Monday',
            created_at: new Date(Date.now() - 7200000).toISOString(),
            read_count: 1
        }
    ],
    3: [
        {
            id: 9,
            group_id: 3,
            sender_id: 5,
            sender_name: 'Charlie Davis',
            message: 'I reviewed the space. We\'ll need a 3-ton unit.',
            created_at: new Date(Date.now() - 172800000).toISOString(),
            read_count: 1
        },
        {
            id: 10,
            group_id: 3,
            sender_id: 5,
            sender_name: 'Charlie Davis',
            message: 'Got the parts ordered',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            read_count: 0
        }
    ]
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    setupDemo();
    loadGroups();

    // Set up auto-refresh (reduced frequency for demo)
    groupRefreshInterval = setInterval(loadGroups, 30000);

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#userMenuBtn') && !e.target.closest('#userMenu')) {
            document.getElementById('userMenu').classList.remove('active');
        }
    });
});

// Setup demo
function setupDemo() {
    currentUserId = 1;
    document.getElementById('userName').textContent = DEMO_USERS[0].name;

    // Add demo badge
    const userName = document.getElementById('userName');
    if (!userName.querySelector('.demo-badge')) {
        const badge = document.createElement('span');
        badge.className = 'demo-badge';
        badge.textContent = 'DEMO';
        badge.style.cssText = 'background: #f56565; color: white; font-size: 10px; padding: 2px 6px; border-radius: 4px; margin-left: 8px;';
        userName.appendChild(badge);
    }
}

// Toggle user menu
function toggleUserMenu() {
    document.getElementById('userMenu').classList.toggle('active');
}

// Logout function (demo version)
function logout() {
    showToast('Demo mode - logout simulated', 'info');
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

// Toggle sidebar for mobile
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

// Load all groups (demo version)
function loadGroups() {
    allGroups = [...DEMO_GROUPS];
    displayGroups(allGroups);
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
function selectGroup(groupId) {
    currentGroupId = groupId;

    // Close sidebar on mobile
    document.getElementById('sidebar').classList.remove('active');

    // Show chat interface
    document.getElementById('chatHeader').style.display = 'flex';
    document.getElementById('messageInputArea').style.display = 'flex';

    // Update active state in sidebar
    displayGroups(allGroups);

    // Load group details
    const group = DEMO_GROUPS.find(g => g.id === groupId);
    if (group) {
        document.getElementById('groupName').textContent = group.name;
        document.getElementById('groupMembers').textContent = `${group.member_count} members`;
    }

    // Load messages
    loadMessages(groupId);

    // Clear previous interval and set up new one
    if (messageRefreshInterval) {
        clearInterval(messageRefreshInterval);
    }
    messageRefreshInterval = setInterval(() => {
        if (currentGroupId === groupId) {
            loadMessages(groupId, true);
        }
    }, 5000);
}

// Load messages for a group (demo version)
function loadMessages(groupId, silent = false) {
    const messages = DEMO_MESSAGES[groupId] || [];
    displayMessages(messages);
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

// Send a message (demo version)
function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();

    if (!message || !currentGroupId) return;

    // Add message to demo data
    if (!DEMO_MESSAGES[currentGroupId]) {
        DEMO_MESSAGES[currentGroupId] = [];
    }

    const newMessage = {
        id: Date.now(),
        group_id: currentGroupId,
        sender_id: currentUserId,
        sender_name: DEMO_USERS[0].name,
        message: message,
        created_at: new Date().toISOString(),
        read_count: 0
    };

    DEMO_MESSAGES[currentGroupId].push(newMessage);

    // Update last message in group
    const group = DEMO_GROUPS.find(g => g.id === currentGroupId);
    if (group) {
        group.last_message = message;
        group.last_message_time = new Date().toISOString();
    }

    input.value = '';
    loadMessages(currentGroupId);
    displayGroups(allGroups);
    showToast('Message sent (demo)', 'success');
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
        showToast('Messages refreshed (demo)', 'success');
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

// Search users (demo version)
let searchTimeout;
function searchUsers() {
    const query = document.getElementById('userSearch').value.trim().toLowerCase();

    clearTimeout(searchTimeout);

    if (query.length < 2) {
        document.getElementById('userList').innerHTML = '<div style="padding: 15px; text-align: center; color: #a0aec0;">Type at least 2 characters to search...</div>';
        return;
    }

    searchTimeout = setTimeout(() => {
        const filtered = DEMO_USERS.filter(user =>
            user.id !== currentUserId &&
            (user.name.toLowerCase().includes(query) ||
                user.profession.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query))
        );
        displayUserList(filtered);
    }, 300);
}

// Display user search results
function displayUserList(users) {
    const userList = document.getElementById('userList');

    if (users.length === 0) {
        userList.innerHTML = '<div style="padding: 15px; text-align: center; color: #a0aec0;">No users found</div>';
        return;
    }

    userList.innerHTML = users.map(user => {
        const isAdded = selectedMembers.some(m => m.userId === user.id);
        return `
            <div class="user-item">
                <div class="user-info">
                    <h4>${escapeHtml(user.name)}</h4>
                    <p><i class="fas fa-briefcase"></i> ${escapeHtml(user.profession)}</p>
                </div>
                <button class="add-btn ${isAdded ? 'added' : ''}" onclick="toggleMember(${user.id}, '${escapeHtml(user.name)}', '${escapeHtml(user.profession)}')">
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
    searchUsers();
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
            ${escapeHtml(member.name)} - ${escapeHtml(member.profession)}
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

// Create a new group (demo version)
function createGroup() {
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

    const newGroup = {
        id: DEMO_GROUPS.length + 1,
        name: name,
        description: description,
        created_by: currentUserId,
        creator_name: DEMO_USERS[0].name,
        member_count: selectedMembers.length + 1,
        last_message: null,
        last_message_time: new Date().toISOString(),
        unread_count: 0,
        members: [currentUserId, ...selectedMembers.map(m => m.userId)]
    };

    DEMO_GROUPS.unshift(newGroup);
    DEMO_MESSAGES[newGroup.id] = [];

    closeNewGroupModal();
    showToast('Group created successfully (demo)!', 'success');
    loadGroups();
    setTimeout(() => selectGroup(newGroup.id), 500);
}

// Show group details modal (demo version)
function showGroupDetails() {
    if (!currentGroupId) return;

    const group = DEMO_GROUPS.find(g => g.id === currentGroupId);
    if (!group) return;

    document.getElementById('detailGroupName').textContent = group.name;
    document.getElementById('detailGroupDescription').textContent = group.description || 'No description';
    document.getElementById('detailGroupCreator').textContent = group.creator_name;
    document.getElementById('detailMemberCount').textContent = group.member_count;

    // Display members
    const members = DEMO_USERS.filter(u => group.members.includes(u.id));
    const membersList = document.getElementById('detailMembersList');
    membersList.innerHTML = members.map(member => `
        <div class="member-item">
            <div class="member-avatar">${getInitials(member.name)}</div>
            <div class="member-details">
                <h5>${escapeHtml(member.name)} ${member.id === group.created_by ? '<i class="fas fa-crown" style="color: #f6ad55;"></i>' : ''}</h5>
                <p>${escapeHtml(member.profession)}</p>
            </div>
        </div>
    `).join('');

    document.getElementById('groupDetailsModal').classList.add('active');
}

// Close group details modal
function closeGroupDetailsModal() {
    document.getElementById('groupDetailsModal').classList.remove('active');
}

// Leave group (demo version)
function leaveGroup() {
    if (!currentGroupId) return;

    if (!confirm('Are you sure you want to leave this group? (Demo mode)')) return;

    const groupIndex = DEMO_GROUPS.findIndex(g => g.id === currentGroupId);
    if (groupIndex > -1) {
        DEMO_GROUPS.splice(groupIndex, 1);
    }

    closeGroupDetailsModal();
    showToast('Left group successfully (demo)', 'success');
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
}

// Handle attachment (placeholder)
function handleAttachment() {
    showToast('File attachment feature coming soon! (Demo)', 'info');
}

// Toggle emoji picker (placeholder)
function toggleEmojiPicker() {
    showToast('Emoji picker coming soon! (Demo)', 'info');
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