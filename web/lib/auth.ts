// User database using localStorage
export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    avatar?: string;
    createdAt: string;
    preferences: UserPreferences;
    listeningHistory: ListeningEntry[];
}

export interface UserPreferences {
    favoriteGenres: string[];
    favoriteArtists: string[];
    locationEnabled: boolean;
    lastKnownLocation?: { city: string; country: string; lat: number; lng: number };
}

export interface ListeningEntry {
    trackId: string;
    trackTitle: string;
    artist: string;
    genre: string;
    mood: string;
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night' | 'lateNight';
    dayOfWeek: string;
    timestamp: string;
    location?: string;
    energy: number;
    valence: number;
    cover?: string;
}

const USERS_KEY = 'resonance_users';
const CURRENT_USER_KEY = 'resonance_current_user';

function getUsers(): User[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
}

function saveUsers(users: User[]) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export function signup(name: string, email: string, password: string): { success: boolean; error?: string; user?: User } {
    const users = getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, error: 'An account with this email already exists' };
    }

    if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
    }

    const newUser: User = {
        id: generateId(),
        name,
        email: email.toLowerCase(),
        password, // In production, this would be hashed
        createdAt: new Date().toISOString(),
        preferences: {
            favoriteGenres: [],
            favoriteArtists: [],
            locationEnabled: false,
        },
        listeningHistory: [],
    };

    users.push(newUser);
    saveUsers(users);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));

    // Sync to server database
    if (typeof window !== 'undefined') {
        fetch('/api/db', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'SAVE_USER', data: newUser })
        }).catch(console.error);
    }
    
    return { success: true, user: newUser };
}

export function login(email: string, password: string): { success: boolean; error?: string; user?: User } {
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
        return { success: false, error: 'No account found with this email' };
    }

    if (user.password !== password) {
        return { success: false, error: 'Incorrect password' };
    }

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return { success: true, user };
}

export function logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
}

export function getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
}

export function updateUser(updatedUser: User) {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === updatedUser.id);
    if (idx !== -1) {
        users[idx] = updatedUser;
        saveUsers(users);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
        
        // Sync to server database
        if (typeof window !== 'undefined') {
            fetch('/api/db', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'SAVE_USER', data: updatedUser })
            }).catch(console.error);
        }
    }
}

export function addListeningEntry(userId: string, entry: Omit<ListeningEntry, 'timestamp' | 'timeOfDay' | 'dayOfWeek'>) {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const now = new Date();
    const hour = now.getHours();
    let timeOfDay: ListeningEntry['timeOfDay'];
    if (hour >= 5 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
    else if (hour >= 21 || hour < 1) timeOfDay = 'night';
    else timeOfDay = 'lateNight';

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const fullEntry: ListeningEntry = {
        ...entry,
        timeOfDay,
        dayOfWeek: days[now.getDay()],
        timestamp: now.toISOString(),
    };

    user.listeningHistory.push(fullEntry);

    // Keep last 500 entries
    if (user.listeningHistory.length > 500) {
        user.listeningHistory = user.listeningHistory.slice(-500);
    }

    updateUser(user);
}

export function getTimeOfDay(): { period: string; greeting: string; emoji: string } {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { period: 'morning', greeting: 'Good Morning', emoji: '🌅' };
    if (hour >= 12 && hour < 17) return { period: 'afternoon', greeting: 'Good Afternoon', emoji: '☀️' };
    if (hour >= 17 && hour < 21) return { period: 'evening', greeting: 'Good Evening', emoji: '🌆' };
    if (hour >= 21 || hour < 1) return { period: 'night', greeting: 'Good Night', emoji: '🌙' };
    return { period: 'lateNight', greeting: 'Late Night', emoji: '🌌' };
}
