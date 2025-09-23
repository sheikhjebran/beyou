import { NextRequest, NextResponse } from 'next/server';
import * as authService from '@/services/server/authService';

export async function POST(request: NextRequest) {
    try {
        const { email, password, operation } = await request.json();

        switch (operation) {
            case 'signUp':
                const newUser = await authService.signUpWithEmailPassword(email, password);
                return NextResponse.json(newUser, { status: 201 });

            case 'signIn':
                const user = await authService.signInWithEmailPassword(email, password);
                
                // Create a session token (you might want to use a proper JWT library in production)
                const sessionToken = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');
                
                const response = NextResponse.json({ 
                    user,
                    message: 'Successfully logged in'
                });

                // Set the session token in a secure HTTP-only cookie
                response.cookies.set('auth_token', sessionToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    path: '/',
                    maxAge: 60 * 60 * 24 // 24 hours
                });

                return response;

            case 'signOut':
                // Since we're using session-based auth, we just need to clear the session
                return NextResponse.json({ success: true });

            default:
                return NextResponse.json(
                    { error: 'Invalid operation' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Error in POST /api/auth:', error);
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json(
            { error: message },
            { status: error instanceof Error ? 400 : 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const contentType = request.headers.get('content-type') || '';
        if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            const displayName = formData.get('displayName')?.toString();
            const photoFile = formData.get('photoFile') as File | null;

            await authService.updateUserProfile(userId, {
                display_name: displayName,
                photo_file: photoFile || undefined
            });
        } else {
            const data = await request.json();
            switch (data.operation) {
                case 'updatePassword':
                    await authService.updatePassword(userId, data.currentPassword, data.newPassword);
                    break;
                default:
                    return NextResponse.json(
                        { error: 'Invalid operation' },
                        { status: 400 }
                    );
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in PUT /api/auth:', error);
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json(
            { error: message },
            { status: error instanceof Error ? 400 : 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const user = await authService.getUserById(userId);
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error in GET /api/auth:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
