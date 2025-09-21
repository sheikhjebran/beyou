import { NextRequest, NextResponse } from 'next/server';
import * as bannerService from '@/services/server/bannerService';
import { withAdminAuth } from '@/middleware/admin-auth';

interface ChunkUploadSession {
    sessionId: string;
    chunks: string[];
    totalChunks: number;
    filename: string;
    title: string;
    subtitle: string;
}

// In-memory storage for upload sessions
const uploadSessions: Map<string, ChunkUploadSession> = new Map();

async function POSTHandler(request: NextRequest) {
    try {
        console.log('=== CHUNKED UPLOAD (QUERY PARAMS) API CALLED ===');
        
        const url = new URL(request.url);
        const sessionId = url.searchParams.get('sessionId');
        const chunkIndex = url.searchParams.get('chunkIndex');
        const chunkData = url.searchParams.get('chunkData');
        const totalChunks = url.searchParams.get('totalChunks');
        const filename = url.searchParams.get('filename');
        const title = url.searchParams.get('title') || '';
        const subtitle = url.searchParams.get('subtitle') || '';
        
        console.log('Query parameters received:', {
            sessionId: !!sessionId,
            chunkIndex,
            totalChunks,
            filename,
            chunkDataLength: chunkData?.length || 0
        });

        if (!sessionId || chunkIndex === null || !chunkData || !totalChunks) {
            return NextResponse.json({ message: 'Missing required chunk parameters' }, { status: 400 });
        }

        const chunkIndexNum = parseInt(chunkIndex);
        const totalChunksNum = parseInt(totalChunks);

        // Initialize session if it doesn't exist
        if (!uploadSessions.has(sessionId)) {
            uploadSessions.set(sessionId, {
                sessionId,
                chunks: new Array(totalChunksNum),
                totalChunks: totalChunksNum,
                filename: filename || 'upload.jpg',
                title,
                subtitle
            });
            console.log('Created new upload session:', sessionId);
        }

        const session = uploadSessions.get(sessionId)!;
        session.chunks[chunkIndexNum] = chunkData;
        
        console.log('Stored chunk', chunkIndexNum, 'for session', sessionId);

        // Check if all chunks are received
        const receivedChunks = session.chunks.filter(chunk => chunk !== undefined).length;
        console.log(`Session ${sessionId}: ${receivedChunks}/${totalChunksNum} chunks received`);

        if (receivedChunks === totalChunksNum) {
            console.log('All chunks received, assembling file...');
            
            // Combine all chunks
            const completeBase64 = session.chunks.join('');
            console.log('Assembled base64 data length:', completeBase64.length);
            
            try {
                // Convert to buffer and upload
                const buffer = Buffer.from(completeBase64, 'base64');
                console.log('Decoded buffer size:', buffer.length);
                
                const banner = await bannerService.addBanner({
                    imageBuffer: buffer,
                    originalFilename: session.filename,
                    title: session.title,
                    subtitle: session.subtitle,
                });

                console.log('Banner uploaded via query param chunked method:', banner.id);
                
                // Clean up session
                uploadSessions.delete(sessionId);
                console.log('Cleaned up session:', sessionId);
                
                return NextResponse.json(banner);
                
            } catch (uploadError) {
                console.error('Upload error during chunked assembly:', uploadError);
                uploadSessions.delete(sessionId);
                return NextResponse.json(
                    { message: 'Failed to process assembled chunks', error: uploadError instanceof Error ? uploadError.message : 'Unknown error' },
                    { status: 500 }
                );
            }
        } else {
            // Return success for partial upload
            return NextResponse.json({
                message: 'Chunk received',
                sessionId,
                receivedChunks,
                totalChunks: totalChunksNum
            });
        }
        
    } catch (error) {
        console.error('Chunked upload error:', error);
        return NextResponse.json(
            { message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

export const POST = async (request: NextRequest) => {
    return withAdminAuth(request, POSTHandler);
};