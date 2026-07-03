export class AppError extends Error {
	public readonly statusCode: number;
	public readonly isOperational: boolean;
	public readonly details?: unknown;

	constructor(message: string, statusCode: number = 500, details?: unknown) {
		super(message);
		this.statusCode = statusCode;
		this.isOperational = true;
		this.details = details;

		Object.setPrototypeOf(this, AppError.prototype);
	}
}

export class ValidationError extends AppError {
	constructor(message: string = "Validation failed", details?: unknown) {
		super(message, 400, details);
		Object.setPrototypeOf(this, ValidationError.prototype);
	}
}

export class AuthenticationError extends AppError {
	constructor(message: string = "Authentication failed") {
		super(message, 401);
		Object.setPrototypeOf(this, AuthenticationError.prototype);
	}
}

export class AuthorizationError extends AppError {
	constructor(message: string = "Access denied") {
		super(message, 403);
		Object.setPrototypeOf(this, AuthorizationError.prototype);
	}
}

export class NotFoundError extends AppError {
	constructor(message: string = "Resource not found") {
		super(message, 404);
		Object.setPrototypeOf(this, NotFoundError.prototype);
	}
}
