import { NextResponse } from 'next/server';
import { getUsers, saveUser, getTracks } from '@/lib/db';

export async function GET() {
    const users = getUsers();
    const tracks = getTracks();
    return NextResponse.json({ users, tracks });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, data } = body;

        switch (action) {
            case 'SAVE_USER':
                saveUser(data);
                return NextResponse.json({ success: true });
            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (e) {
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}
