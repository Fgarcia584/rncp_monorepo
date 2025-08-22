import { registerDecorator, ValidationOptions } from 'class-validator';

/**
 * Strong password validation decorator
 * Requires:
 * - Minimum 12 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 digit
 * - At least 1 special character (!@#$%^&*()_+-=[]{}|;:,.<>?)
 */
export function IsStrongPassword(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'isStrongPassword',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: unknown) {
                    if (typeof value !== 'string') {
                        return false;
                    }

                    // Minimum 12 characters
                    if (value.length < 12) {
                        return false;
                    }

                    // At least 1 uppercase letter
                    if (!/[A-Z]/.test(value)) {
                        return false;
                    }

                    // At least 1 lowercase letter
                    if (!/[a-z]/.test(value)) {
                        return false;
                    }

                    // At least 1 digit
                    if (!/\d/.test(value)) {
                        return false;
                    }

                    // At least 1 special character
                    if (!/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(value)) {
                        return false;
                    }

                    return true;
                },
                defaultMessage() {
                    return 'Password must be at least 12 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)';
                },
            },
        });
    };
}

/**
 * Utility function to validate password strength programmatically
 */
export function validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    if (password.length < 12) {
        errors.push('Password must be at least 12 characters long');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
        errors.push('Password must contain at least one digit');
    }

    if (!/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password)) {
        errors.push(
            'Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)',
        );
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}
