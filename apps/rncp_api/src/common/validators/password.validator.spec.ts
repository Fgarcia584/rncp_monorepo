import { validatePasswordStrength } from './password.validator';

describe('Password Validator', () => {
    describe('validatePasswordStrength', () => {
        it('should accept a strong password', () => {
            const result = validatePasswordStrength('MySecureP@ssw0rd123!');
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should reject password shorter than 12 characters', () => {
            const result = validatePasswordStrength('Short1@');
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain(
                'Password must be at least 12 characters long',
            );
        });

        it('should reject password without uppercase letter', () => {
            const result = validatePasswordStrength('lowercase123!@#');
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain(
                'Password must contain at least one uppercase letter',
            );
        });

        it('should reject password without lowercase letter', () => {
            const result = validatePasswordStrength('UPPERCASE123!@#');
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain(
                'Password must contain at least one lowercase letter',
            );
        });

        it('should reject password without digit', () => {
            const result = validatePasswordStrength('NoDigitsHere!@#');
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain(
                'Password must contain at least one digit',
            );
        });

        it('should reject password without special character', () => {
            const result = validatePasswordStrength('NoSpecialChars123');
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain(
                'Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)',
            );
        });

        it('should return multiple errors for weak password', () => {
            const result = validatePasswordStrength('weak');
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(1);
            expect(result.errors).toContain(
                'Password must be at least 12 characters long',
            );
            expect(result.errors).toContain(
                'Password must contain at least one uppercase letter',
            );
            expect(result.errors).toContain(
                'Password must contain at least one digit',
            );
            expect(result.errors).toContain(
                'Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)',
            );
        });

        it('should accept various special characters', () => {
            const specialChars = [
                '!',
                '@',
                '#',
                '$',
                '%',
                '^',
                '&',
                '*',
                '(',
                ')',
                '_',
                '+',
                '-',
                '=',
                '[',
                ']',
                '{',
                '}',
                '|',
                ';',
                ':',
                ',',
                '.',
                '<',
                '>',
                '?',
            ];

            for (const char of specialChars) {
                const password = `MyPassword123${char}`;
                const result = validatePasswordStrength(password);
                expect(result.isValid).toBe(true);
            }
        });
    });
});
