// Alternative FormData parser for cases where Next.js FormData parsing fails
export interface ParsedFormData {
  fields: Record<string, string>;
  files: Record<string, {
    name: string;
    type: string;
    buffer: Buffer;
  }>;
}

export async function parseMultipartFormData(request: Request): Promise<ParsedFormData> {
  const contentType = request.headers.get('content-type');
  if (!contentType || !contentType.includes('multipart/form-data')) {
    throw new Error('Invalid content type');
  }

  // Extract boundary from content-type header
  const boundaryMatch = contentType.match(/boundary=(.+)$/);
  if (!boundaryMatch) {
    throw new Error('No boundary found in content-type');
  }
  
  const boundary = boundaryMatch[1];
  const body = await request.arrayBuffer();
  const bodyBuffer = Buffer.from(body);
  
  const fields: Record<string, string> = {};
  const files: Record<string, { name: string; type: string; buffer: Buffer }> = {};
  
  // Split by boundary
  const parts = bodyBuffer.toString('binary').split(`--${boundary}`);
  
  for (const part of parts) {
    if (part.length < 4) continue; // Skip empty parts
    
    const [headerSection, ...bodyParts] = part.split('\r\n\r\n');
    if (!headerSection || bodyParts.length === 0) continue;
    
    const headers = headerSection.split('\r\n');
    let contentDisposition = '';
    let contentType = '';
    
    for (const header of headers) {
      if (header.toLowerCase().startsWith('content-disposition:')) {
        contentDisposition = header;
      } else if (header.toLowerCase().startsWith('content-type:')) {
        contentType = header;
      }
    }
    
    // Parse content-disposition to get field name and filename
    const nameMatch = contentDisposition.match(/name="([^"]+)"/);
    const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
    
    if (!nameMatch) continue;
    
    const fieldName = nameMatch[1];
    const bodyContent = bodyParts.join('\r\n\r\n');
    
    if (filenameMatch) {
      // This is a file
      const filename = filenameMatch[1];
      const mimeType = contentType.replace('Content-Type: ', '').trim() || 'application/octet-stream';
      
      // Remove the trailing boundary and CRLF
      const fileData = bodyContent.substring(0, bodyContent.lastIndexOf('\r\n--'));
      const fileBuffer = Buffer.from(fileData, 'binary');
      
      files[fieldName] = {
        name: filename,
        type: mimeType,
        buffer: fileBuffer
      };
    } else {
      // This is a regular field
      const fieldValue = bodyContent.substring(0, bodyContent.lastIndexOf('\r\n--')).trim();
      fields[fieldName] = fieldValue;
    }
  }
  
  return { fields, files };
}