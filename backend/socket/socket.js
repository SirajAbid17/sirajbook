class BasicSocket {
    constructor() {
        this.users = new Map();
        console.log("Basic Socket initialized - Real-time features disabled");
    }

    userConnected(userId) {
        if (userId) {
            this.users.set(userId.toString(), { 
                connected: true,
                lastSeen: new Date()
            });
            console.log(`User ${userId} connected`);
        }
    }

   
    userDisconnected(userId) {
        if (userId) {
            this.users.set(userId.toString(), { 
                connected: false,
                lastSeen: new Date()
            });
            console.log(`User ${userId} disconnected`);
        }
    }

   
    isUserOnline(userId) {
        if (!userId) return false;
        const user = this.users.get(userId.toString());
        return user ? user.connected : false;
    }

    getOnlineUsers() {
        const onlineUsers = [];
        this.users.forEach((value, key) => {
            if (value.connected) {
                onlineUsers.push(key);
            }
        });
        return onlineUsers;
    }

    getUserStatus(userId) {
        if (!userId) return { online: false, lastSeen: null };
        const user = this.users.get(userId.toString());
        if (user) {
            return {
                online: user.connected,
                lastSeen: user.lastSeen
            };
        }
        return { online: false, lastSeen: null };
    }
}

const basicSocket = new BasicSocket();

module.exports = basicSocket;