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

// In-memory storage for upload sessions (in production, you might want to use Redis)
const uploadSessions: Map<string, ChunkUploadSession> = new Map();

async function POSTHandler(request: NextRequest) {
    try {
        console.log('=== CHUNKED UPLOAD API CALLED ===');
        console.log('Request method:', request.method);
        console.log('Request content-type:', request.headers.get('content-type'));
        
        let body;
        try {
            // First try to read the raw text
            const rawBody = await request.text();
            console.log('Raw request body length:', rawBody.length);
            
            if (rawBody.length === 0) {
                console.error('Request body is empty!');
                return NextResponse.json({ message: 'Empty request body - request body stripped by infrastructure' }, { status: 400 });
            }
            
            console.log('Raw request body (first 200 chars):', rawBody.substring(0, 200));
            
            body = JSON.parse(rawBody);
            console.log('Request body parsed successfully:', {
                hasSessionId: !!body.sessionId,
                hasChunkIndex: body.chunkIndex !== undefined,
                hasChunkData: !!body.chunkData,
                chunkDataLength: body.chunkData?.length || 0
            });
        } catch (parseError) {
            console.error('JSON parsing error:', parseError);
            return NextResponse.json({ message: 'Invalid JSON body', details: parseError instanceof Error ? parseError.message : 'Unknown parse error' }, { status: 400 });
        }
        
        const { sessionId, chunkIndex, chunkData, totalChunks, filename, title, subtitle, isLastChunk } = body;
        
        console.log('Chunk upload request:', {
            sessionId,
            chunkIndex,
            totalChunks,
            filename,
            chunkSize: chunkData?.length || 0,
            isLastChunk
        });

        if (!sessionId || chunkIndex === undefined || !chunkData) {
            return NextResponse.json({ message: 'Missing required chunk parameters' }, { status: 400 });
        }

        // Initialize session if it doesn't exist
        if (!uploadSessions.has(sessionId)) {
            uploadSessions.set(sessionId, {
                sessionId,
                chunks: new Array(totalChunks),
                totalChunks,
                filename: filename || 'upload.jpg',
                title: title || '',
                subtitle: subtitle || ''
            });
            console.log('Created new upload session:', sessionId);
        }

        const session = uploadSessions.get(sessionId)!;
        session.chunks[chunkIndex] = chunkData;
        
        console.log('Stored chunk', chunkIndex, 'for session', sessionId);

        // Check if all chunks are received
        const receivedChunks = session.chunks.filter(chunk => chunk !== undefined).length;
        console.log(`Session ${sessionId}: ${receivedChunks}/${totalChunks} chunks received`);

        if (receivedChunks === totalChunks) {
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

                console.log('Banner uploaded via chunked method:', banner.id);
                
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
                totalChunks
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