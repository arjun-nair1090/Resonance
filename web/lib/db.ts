import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const TRACKS_FILE = path.join(DATA_DIR, 'tracks.json');

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJson(file: string) {
    if (!fs.existsSync(file)) return [];
    try {
        const data = fs.readFileSync(file, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

function writeJson(file: string, data: any) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

export function getUsers() {
    return readJson(USERS_FILE);
}

export function saveUser(user: any) {
    const users = getUsers();
    const idx = users.findIndex((u: any) => u.id === user.id || u.email === user.email);
    if (idx !== -1) {
        users[idx] = { ...users[idx], ...user };
    } else {
        users.push(user);
    }
    writeJson(USERS_FILE, users);
}

export function findUserByEmail(email: string) {
    const users = getUsers();
    return users.find((u: any) => u.email === email);
}

export function getTracks() {
    return readJson(TRACKS_FILE);
}

export function saveTrack(track: any) {
    const tracks = getTracks();
    const idx = tracks.findIndex((t: any) => t.id === track.id);
    if (idx !== -1) {
        tracks[idx] = track;
    } else {
        tracks.push(track);
    }
    writeJson(TRACKS_FILE, tracks);
}
