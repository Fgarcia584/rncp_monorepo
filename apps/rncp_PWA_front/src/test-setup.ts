import '@testing-library/jest-dom';
import { beforeAll, afterAll, afterEach, vi } from 'vitest';
import { setupServer } from 'msw/node';

// Global MSW server setup
export const server = setupServer();

beforeAll(() => {
    server.listen({
        onUnhandledRequest: (req, print) => {
            // Only warn about unhandled requests that aren't caught by MSW
            if (!req.url.includes('localhost:3001/api')) {
                print.warning();
            }
        },
    });
});
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

// Global mocks
global.alert = vi.fn();
global.console.error = vi.fn();

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    disconnect: vi.fn(),
    observe: vi.fn(),
    unobserve: vi.fn(),
    root: null,
    rootMargin: '',
    thresholds: [],
    takeRecords: vi.fn().mockReturnValue([]),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn(() => ({
    disconnect: vi.fn(),
    observe: vi.fn(),
    unobserve: vi.fn(),
}));
