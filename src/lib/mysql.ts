'use client'

// Database error types
export class DatabaseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DatabaseError';
    }
}

export class ConnectionError extends DatabaseError {
    constructor(message: string) {
        super(message);
        this.name = 'ConnectionError';
    }
}

export class QueryError extends DatabaseError {
    constructor(message: string) {
        super(message);
        this.name = 'QueryError';
    }
}

// Helper function to handle API responses
export async function handleDatabaseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error = await response.json();
        throw new DatabaseError(error.message || 'Database operation failed');
    }
    return response.json();
}

// Helper function to create API request options
export function createRequestOptions(method: string, body?: any) {
    return {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
    };
}
