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
  console.log('Manual parser - content-type:', contentType);
  
  if (!contentType || !contentType.includes('multipart/form-data')) {
    throw new Error('Invalid content type');
  }

  // Extract boundary from content-type header
  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/);
  if (!boundaryMatch) {
    throw new Error('No boundary found in content-type');
  }
  
  const boundary = boundaryMatch[1] || boundaryMatch[2];
  console.log('Manual parser - boundary:', boundary);
  
  // Clone the request to ensure we can read it
  const clonedRequest = request.clone();
  
  // First try to get the body as array buffer
  let bodyBuffer: Buffer;
  try {
    const body = await clonedRequest.arrayBuffer();
    bodyBuffer = Buffer.from(body);
    console.log('Manual parser - successfully read body, length:', bodyBuffer.length);
  } catch (error) {
    console.error('Failed to read request body as array buffer:', error);
    throw new Error('Failed to read request body');
  }
  
  if (bodyBuffer.length === 0) {
    throw new Error('Empty request body');
  }
  
  const fields: Record<string, string> = {};
  const files: Record<string, { name: string; type: string; buffer: Buffer }> = {};
  
  // Split by boundary - handle both --boundary and --boundary--
  const boundaryDelimiter = `--${boundary}`;
  const parts = bodyBuffer.toString('binary').split(boundaryDelimiter);
  console.log('Manual parser - found parts:', parts.length);
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    console.log(`Manual parser - processing part ${i}, length: ${part.length}`);
    
    if (part.length < 10) continue; // Skip empty or very small parts
    if (part.trim() === '--' || part.trim() === '') continue; // Skip end boundary
    
    // Look for the double CRLF that separates headers from body
    const doubleCrlfIndex = part.indexOf('\r\n\r\n');
    if (doubleCrlfIndex === -1) {
      console.log(`Manual parser - no double CRLF found in part ${i}`);
      continue;
    }
    
    const headerSection = part.substring(0, doubleCrlfIndex);
    const bodyContent = part.substring(doubleCrlfIndex + 4);
    
    console.log(`Manual parser - part ${i} headers:`, headerSection);
    
    const headers = headerSection.split('\r\n');
    let contentDisposition = '';
    let contentTypeHeader = '';
    
    for (const header of headers) {
      const trimmedHeader = header.trim();
      if (trimmedHeader.toLowerCase().startsWith('content-disposition:')) {
        contentDisposition = trimmedHeader;
      } else if (trimmedHeader.toLowerCase().startsWith('content-type:')) {
        contentTypeHeader = trimmedHeader;
      }
    }
    
    console.log(`Manual parser - part ${i} content-disposition:`, contentDisposition);
    
    // Parse content-disposition to get field name and filename
    const nameMatch = contentDisposition.match(/name="([^"]+)"/);
    const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
    
    if (!nameMatch) {
      console.log(`Manual parser - no name found in part ${i}`);
      continue;
    }
    
    const fieldName = nameMatch[1];
    console.log(`Manual parser - field name:`, fieldName);
    
    if (filenameMatch) {
      // This is a file
      const filename = filenameMatch[1];
      const mimeType = contentTypeHeader.replace(/^content-type:\s*/i, '').trim() || 'application/octet-stream';
      
      // Remove trailing CRLF that might be part of the next boundary
      let fileData = bodyContent;
      if (fileData.endsWith('\r\n')) {
        fileData = fileData.substring(0, fileData.length - 2);
      }
      
      const fileBuffer = Buffer.from(fileData, 'binary');
      console.log(`Manual parser - file found: ${filename}, size: ${fileBuffer.length}, type: ${mimeType}`);
      
      files[fieldName] = {
        name: filename,
        type: mimeType,
        buffer: fileBuffer
      };
    } else {
      // This is a regular field
      let fieldValue = bodyContent;
      if (fieldValue.endsWith('\r\n')) {
        fieldValue = fieldValue.substring(0, fieldValue.length - 2);
      }
      console.log(`Manual parser - field found: ${fieldName} = ${fieldValue}`);
      fields[fieldName] = fieldValue;
    }
  }
  
  console.log('Manual parser - final result:', { fieldCount: Object.keys(fields).length, fileCount: Object.keys(files).length });
  return { fields, files };
}