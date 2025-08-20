import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

import { DeliveryPersonDashboard } from './DeliveryPersonDashboard';
import { baseApi } from '../store/api/baseApi';
import '../store/api'; // Import to ensure endpoints are injected
import authReducer from '../store/slices/authSlice';
import { OrderStatus, OrderPriority } from '@rncp/types';

// Mock alert
const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});

// Mock data
const mockAvailableOrders = {
    orders: [
        {
            id: 1,
            merchantId: 1,
            customerName: 'Marie Dupont',
            customerPhone: '+33123456789',
            deliveryAddress: '25 Rue de Rivoli, Paris 1er',
            scheduledDeliveryTime: '2024-01-15T16:30:00Z',
            status: OrderStatus.PENDING,
            priority: OrderPriority.HIGH,
            deliveryPersonId: null,
            notes: 'Attention: fragile',
            estimatedDeliveryDuration: 20,
            createdAt: '2024-01-01T10:00:00Z',
            updatedAt: '2024-01-01T10:00:00Z',
        },
        {
            id: 2,
            merchantId: 2,
            customerName: 'Jean Leroy',
            customerPhone: null,
            deliveryAddress: '8 Avenue Montaigne, Paris 8e',
            scheduledDeliveryTime: '2024-01-15T17:00:00Z',
            status: OrderStatus.PENDING,
            priority: OrderPriority.NORMAL,
            deliveryPersonId: null,
            notes: null,
            estimatedDeliveryDuration: null,
            createdAt: '2024-01-01T11:00:00Z',
            updatedAt: '2024-01-01T11:00:00Z',
        },
        {
            id: 3,
            merchantId: 3,
            customerName: 'Sophie Martin',
            customerPhone: '+33987654321',
            deliveryAddress: '15 Boulevard Saint-Michel, Paris 5e',
            scheduledDeliveryTime: '2024-01-15T17:30:00Z',
            status: OrderStatus.PENDING,
            priority: OrderPriority.URGENT,
            deliveryPersonId: null,
            notes: 'Livraison urgente',
            estimatedDeliveryDuration: 30,
            createdAt: '2024-01-01T12:00:00Z',
            updatedAt: '2024-01-01T12:00:00Z',
        },
    ],
    total: 3,
    page: 1,
    limit: 10,
};

const mockAcceptedOrder = {
    ...mockAvailableOrders.orders[0],
    status: OrderStatus.ACCEPTED,
    deliveryPersonId: 2,
};

// Setup MSW server for API mocking
const server = setupServer(
    rest.get('/api/orders/available', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(mockAvailableOrders));
    }),
    rest.post('/api/orders/:id/accept', (req, res, ctx) => {
        const orderId = parseInt(req.params.id as string);
        return res(ctx.status(200), ctx.json({ ...mockAcceptedOrder, id: orderId }));
    }),
);

// Test store factory
const createTestStore = () => {
    return configureStore({
        reducer: {
            [baseApi.reducerPath]: baseApi.reducer,
            auth: authReducer,
        },
        middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
    });
};

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const store = createTestStore();
    return <Provider store={store}>{children}</Provider>;
};

describe('DeliveryPersonDashboard', () => {
    beforeAll(() => {
        server.listen();
    });

    afterEach(() => {
        server.resetHandlers();
        mockAlert.mockClear();
    });

    afterAll(() => {
        server.close();
        mockAlert.mockRestore();
    });

    describe('Component rendering', () => {
        it('should render dashboard with correct title and description', () => {
            render(
                <TestWrapper>
                    <DeliveryPersonDashboard />
                </TestWrapper>,
            );

            expect(screen.getByText('Espace Livreur')).toBeInTheDocument();
            expect(screen.getByText('Gestion de vos livraisons et tournées')).toBeInTheDocument();
        });

        it('should display delivery statistics', () => {
            render(
                <TestWrapper>
                    <DeliveryPersonDashboard />
                </TestWrapper>,
            );

            expect(screen.getByText('12')).toBeInTheDocument(); // todayDeliveries
            expect(screen.getByText('8')).toBeInTheDocument(); // completedDeliveries
            expect(screen.getByText('4')).toBeInTheDocument(); // pendingDeliveries
            expect(screen.getByText('85.5')).toBeInTheDocument(); // totalDistance
        });

        it('should display "Voir Commandes Disponibles" button', () => {
            render(
                <TestWrapper>
                    <DeliveryPersonDashboard />
                </TestWrapper>,
            );

            const viewOrdersButton = screen.getByRole('button', { name: /voir commandes disponibles/i });
            expect(viewOrdersButton).toBeInTheDocument();
        });

        it('should display other action buttons', () => {
            render(
                <TestWrapper>
                    <DeliveryPersonDashboard />
                </TestWrapper>,
            );

            expect(screen.getByRole('button', { name: /commencer la tournée/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /voir l'itinéraire/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /signaler un problème/i })).toBeInTheDocument();
        });

        it('should display delivery sections', () => {
            render(
                <TestWrapper>
                    <DeliveryPersonDashboard />
                </TestWrapper>,
            );

            expect(screen.getByText('Livraisons Assignées')).toBeInTheDocument();
            expect(screen.getByText('Livraisons Terminées')).toBeInTheDocument();
        });

        it('should not show available orders modal initially', () => {
            render(
                <TestWrapper>
                    <DeliveryPersonDashboard />
                </TestWrapper>,
            );

            expect(screen.queryByText('Commandes Disponibles')).not.toBeInTheDocument();
        });
    });

    describe('Available orders modal', () => {
        it('should open modal when "Voir Commandes Disponibles" button is clicked', async () => {
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <DeliveryPersonDashboard />
                </TestWrapper>,
            );

            const viewOrdersButton = screen.getByRole('button', { name: /voir commandes disponibles/i });
            await user.click(viewOrdersButton);

            expect(screen.getByText('Commandes Disponibles')).toBeInTheDocument();
        });

        it('should fetch available orders when modal opens', async () => {
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <DeliveryPersonDashboard />
                </TestWrapper>,
            );

            const viewOrdersButton = screen.getByRole('button', { name: /voir commandes disponibles/i });
            await user.click(viewOrdersButton);

            // Wait for loading to complete and orders to appear
            await waitFor(() => {
                expect(screen.getByText('Marie Dupont')).toBeInTheDocument();
                expect(screen.getByText('Jean Leroy')).toBeInTheDocument();
                expect(screen.getByText('Sophie Martin')).toBeInTheDocument();
            });
        });

        it('should close modal when close button is clicked', async () => {
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <DeliveryPersonDashboard />
                </TestWrapper>,
            );

            // Open modal
            const viewOrdersButton = screen.getByRole('button', { name: /voir commandes disponibles/i });
            await user.click(viewOrdersButton);

            // Close modal using top-right X button
            // Get the X close button (should have SVG with path for X)
            const xButton = Array.from(screen.getAllByRole('button')).find((button) =>
                button.querySelector('svg path[d*="M6 18L18 6M6 6l12 12"]'),
            );

            if (xButton) {
                await user.click(xButton);
            }

            expect(screen.queryByText('Commandes Disponibles')).not.toBeInTheDocument();
        });

        it('should close modal when "Fermer" button is clicked', async () => {
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <DeliveryPersonDashboard />
                </TestWrapper>,
            );

            // Open modal
            const viewOrdersButton = screen.getByRole('button', { name: /voir commandes disponibles/i });
            await user.click(viewOrdersButton);

            // Wait for modal to be fully loaded
            await waitFor(() => {
                expect(screen.getByText('Commandes Disponibles')).toBeInTheDocument();
            });

            // Close modal using "Fermer" button
            const fermerButton = screen.getByRole('button', { name: /fermer/i });
            await user.click(fermerButton);

            expect(screen.queryByText('Commandes Disponibles')).not.toBeInTheDocument();
        });

        it('should close modal when overlay is clicked', async () => {
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <DeliveryPersonDashboard />
                </TestWrapper>,
            );

            // Open modal
            const viewOrdersButton = screen.getByRole('button', { name: /voir commandes disponibles/i });
            await user.click(viewOrdersButton);

            await waitFor(() => {
                expect(screen.getByText('Commandes Disponibles')).toBeInTheDocument();
            });

            // Click overlay
            const overlay = document.querySelector('.absolute.inset-0.bg-gray-500.opacity-75');
            if (overlay) {
                await user.click(overlay);
            }

            expect(screen.queryByText('Commandes Disponibles')).not.toBeInTheDocument();
        });
    });

    describe('Available orders display', () => {
        beforeEach(async () => {
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <DeliveryPersonDashboard />
                </TestWrapper>,
            );

            const viewOrdersButton = screen.getByRole('button', { name: /voir commandes disponibles/i });
            await user.click(viewOrdersButton);

            await waitFor(() => {
                expect(screen.getByText('Marie Dupont')).toBeInTheDocument();
            });
        });

        it('should display all available orders', () => {
            expect(screen.getByText('Marie Dupont')).toBeInTheDocument();
            expect(screen.getByText('Jean Leroy')).toBeInTheDocument();
            expect(screen.getByText('Sophie Martin')).toBeInTheDocument();
        });

        it('should display order IDs with CMD prefix', () => {
            expect(screen.getByText('CMD-1')).toBeInTheDocument();
            expect(screen.getByText('CMD-2')).toBeInTheDocument();
            expect(screen.getByText('CMD-3')).toBeInTheDocument();
        });

        it('should format priorities correctly', () => {
            expect(screen.getByText('Haute')).toBeInTheDocument(); // HIGH
            expect(screen.getByText('Normale')).toBeInTheDocument(); // NORMAL
            expect(screen.getByText('Urgente')).toBeInTheDocument(); // URGENT
        });

        it('should format delivery times correctly', () => {
            // Should display formatted French dates
            expect(screen.getByText(/15\/01\/2024/)).toBeInTheDocument();
            expect(screen.getByText(/17:30/)).toBeInTheDocument();
        });

        it('should display customer addresses', () => {
            expect(screen.getByText('25 Rue de Rivoli, Paris 1er')).toBeInTheDocument();
            expect(screen.getByText('8 Avenue Montaigne, Paris 8e')).toBeInTheDocument();
            expect(screen.getByText('15 Boulevard Saint-Michel, Paris 5e')).toBeInTheDocument();
        });

        it('should display customer phone numbers when available', () => {
            expect(screen.getByText('+33123456789')).toBeInTheDocument();
            expect(screen.getByText('+33987654321')).toBeInTheDocument();
        });

        it('should display notes when available', () => {
            expect(screen.getByText('Attention: fragile')).toBeInTheDocument();
            expect(screen.getByText('Livraison urgente')).toBeInTheDocument();
        });

        it('should display estimated delivery duration when available', () => {
            expect(screen.getByText('Durée estimée: 20 min')).toBeInTheDocument();
            expect(screen.getByText('Durée estimée: 30 min')).toBeInTheDocument();
            expect(screen.getByText('Durée non estimée')).toBeInTheDocument(); // For order without duration
        });

        it('should display accept and localiser buttons for each order', () => {
            const acceptButtons = screen.getAllByText('Accepter');
            const localiserButtons = screen.getAllByText('Localiser');

            expect(acceptButtons).toHaveLength(3);
            expect(localiserButtons).toHaveLength(3);
        });
    });

    describe('Order acceptance', () => {
        beforeEach(async () => {
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <DeliveryPersonDashboard />
                </TestWrapper>,
            );

            const viewOrdersButton = screen.getByRole('button', { name: /voir commandes disponibles/i });
            await user.click(viewOrdersButton);

            await waitFor(() => {
                expect(screen.getByText('Marie Dupont')).toBeInTheDocument();
            });
        });

        it('should accept order when accept button is clicked', async () => {
            const user = userEvent.setup();

            // Find and click the first accept button
            const acceptButtons = screen.getAllByText('Accepter');
            await user.click(acceptButtons[0]);

            await waitFor(() => {
                expect(mockAlert).toHaveBeenCalledWith('Commande 1 acceptée !');
            });
        });

        it('should show loading state during acceptance', async () => {
            const user = userEvent.setup();

            // Delay the API response to test loading state
            server.use(
                rest.post('/api/orders/:id/accept', async (req, res, ctx) => {
                    await new Promise((resolve) => setTimeout(resolve, 100));
                    return res(ctx.status(200), ctx.json(mockAcceptedOrder));
                }),
            );

            const acceptButtons = screen.getAllByText('Accepter');
            await user.click(acceptButtons[0]);

            // Check loading state
            expect(screen.getByText('Acceptation...')).toBeInTheDocument();

            await waitFor(() => {
                expect(screen.queryByText('Acceptation...')).not.toBeInTheDocument();
            });
        });

        it('should handle API errors gracefully', async () => {
            const user = userEvent.setup();

            server.use(
                rest.post('/api/orders/:id/accept', (req, res, ctx) => {
                    return res(ctx.status(400), ctx.json({ message: 'Order no longer available' }));
                }),
            );

            const acceptButtons = screen.getAllByText('Accepter');
            await user.click(acceptButtons[0]);

            await waitFor(() => {
                expect(mockAlert).toHaveBeenCalledWith("Erreur lors de l'acceptation de la commande");
            });
        });

        it('should handle network errors gracefully', async () => {
            const user = userEvent.setup();

            server.use(
                rest.post('/api/orders/:id/accept', (req, res) => {
                    return res.networkError('Network error');
                }),
            );

            const acceptButtons = screen.getAllByText('Accepter');
            await user.click(acceptButtons[0]);

            await waitFor(() => {
                expect(mockAlert).toHaveBeenCalledWith("Erreur lors de l'acceptation de la commande");
            });
        });

        it('should disable accept button during loading', async () => {
            const user = userEvent.setup();

            server.use(
                rest.post('/api/orders/:id/accept', async (req, res, ctx) => {
                    await new Promise((resolve) => setTimeout(resolve, 100));
                    return res(ctx.status(200), ctx.json(mockAcceptedOrder));
                }),
            );

            const acceptButtons = screen.getAllByText('Accepter') as HTMLButtonElement[];
            await user.click(acceptButtons[0]);

            // Button should be disabled during loading
            expect(acceptButtons[0].closest('button')).toBeDisabled();

            await waitFor(() => {
                expect(acceptButtons[0].closest('button')).not.toBeDisabled();
            });
        });
    });

    describe('Loading and error states', () => {
        it('should show loading state while fetching orders', async () => {
            const user = userEvent.setup();

            server.use(
                rest.get('/api/orders/available', async (req, res, ctx) => {
                    await new Promise((resolve) => setTimeout(resolve, 100));
                    return res(ctx.status(200), ctx.json(mockAvailableOrders));
                }),
            );

            render(
                <TestWrapper>
                    <DeliveryPersonDashboard />
                </TestWrapper>,
            );

            const viewOrdersButton = screen.getByRole('button', { name: /voir commandes disponibles/i });
            await user.click(viewOrdersButton);

            // Check loading state
            expect(screen.getByText('Chargement des commandes disponibles...')).toBeInTheDocument();

            await waitFor(() => {
                expect(screen.queryByText('Chargement des commandes disponibles...')).not.toBeInTheDocument();
            });
        });

        it('should show error state when API call fails', async () => {
            const user = userEvent.setup();

            server.use(
                rest.get('/api/orders/available', (req, res, ctx) => {
                    return res(ctx.status(500), ctx.json({ message: 'Server error' }));
                }),
            );

            render(
                <TestWrapper>
                    <DeliveryPersonDashboard />
                </TestWrapper>,
            );

            const viewOrdersButton = screen.getByRole('button', { name: /voir commandes disponibles/i });
            await user.click(viewOrdersButton);

            await waitFor(() => {
                expect(screen.getByText('Erreur lors du chargement des commandes')).toBeInTheDocument();
                expect(screen.getByText('Réessayer')).toBeInTheDocument();
            });
        });

        it('should retry loading when retry button is clicked', async () => {
            const user = userEvent.setup();

            // First request fails, second succeeds
            server.use(
                rest.get('/api/orders/available', (req, res, ctx) => {
                    return res(ctx.status(500), ctx.json({ message: 'Server error' }));
                }),
            );

            render(
                <TestWrapper>
                    <DeliveryPersonDashboard />
                </TestWrapper>,
            );

            const viewOrdersButton = screen.getByRole('button', { name: /voir commandes disponibles/i });
            await user.click(viewOrdersButton);

            await waitFor(() => {
                expect(screen.getByText('Réessayer')).toBeInTheDocument();
            });

            // Update server to succeed on retry
            server.use(
                rest.get('/api/orders/available', (req, res, ctx) => {
                    return res(ctx.status(200), ctx.json(mockAvailableOrders));
                }),
            );

            const retryButton = screen.getByText('Réessayer');
            await user.click(retryButton);

            await waitFor(() => {
                expect(screen.getByText('Marie Dupont')).toBeInTheDocument();
            });
        });

        it('should show empty state when no orders available', async () => {
            const user = userEvent.setup();

            server.use(
                rest.get('/api/orders/available', (req, res, ctx) => {
                    return res(
                        ctx.status(200),
                        ctx.json({
                            orders: [],
                            total: 0,
                            page: 1,
                            limit: 10,
                        }),
                    );
                }),
            );

            render(
                <TestWrapper>
                    <DeliveryPersonDashboard />
                </TestWrapper>,
            );

            const viewOrdersButton = screen.getByRole('button', { name: /voir commandes disponibles/i });
            await user.click(viewOrdersButton);

            await waitFor(() => {
                expect(screen.getByText('Aucune commande disponible pour le moment')).toBeInTheDocument();
            });
        });
    });

    describe('Priority color coding', () => {
        beforeEach(async () => {
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <DeliveryPersonDashboard />
                </TestWrapper>,
            );

            const viewOrdersButton = screen.getByRole('button', { name: /voir commandes disponibles/i });
            await user.click(viewOrdersButton);

            await waitFor(() => {
                expect(screen.getByText('Marie Dupont')).toBeInTheDocument();
            });
        });

        it('should apply correct CSS classes for priority colors', () => {
            const urgentPriority = screen.getByText('Urgente');
            const hautePriority = screen.getByText('Haute');
            const normalePriority = screen.getByText('Normale');

            // Check that they have the correct CSS classes (these classes should be in the component)
            expect(urgentPriority.closest('span')).toHaveClass('bg-red-100', 'text-red-800');
            expect(hautePriority.closest('span')).toHaveClass('bg-orange-100', 'text-orange-800');
            expect(normalePriority.closest('span')).toHaveClass('bg-yellow-100', 'text-yellow-800');
        });
    });

    describe('Accessibility', () => {
        it('should have proper button roles and names', () => {
            render(
                <TestWrapper>
                    <DeliveryPersonDashboard />
                </TestWrapper>,
            );

            expect(screen.getByRole('button', { name: /voir commandes disponibles/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /commencer la tournée/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /voir l'itinéraire/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /signaler un problème/i })).toBeInTheDocument();
        });

        it('should be keyboard navigable', async () => {
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <DeliveryPersonDashboard />
                </TestWrapper>,
            );

            // Tab to the "Voir Commandes Disponibles" button and activate it
            await user.tab();
            await user.keyboard('[Enter]');

            await waitFor(() => {
                expect(screen.getByText('Commandes Disponibles')).toBeInTheDocument();
            });

            // Should be able to tab through accept buttons
            await user.tab(); // First accept button
            await user.tab(); // First localiser button
            await user.tab(); // Second accept button

            const acceptButtons = screen.getAllByText('Accepter');
            expect(document.activeElement).toBe(acceptButtons[1]);
        });

        it('should have proper heading hierarchy', () => {
            render(
                <TestWrapper>
                    <DeliveryPersonDashboard />
                </TestWrapper>,
            );

            // Check that headings are properly structured
            expect(screen.getByRole('heading', { level: 3, name: 'Livraisons Assignées' })).toBeInTheDocument();
            expect(screen.getByRole('heading', { level: 3, name: 'Livraisons Terminées' })).toBeInTheDocument();
        });
    });

    describe('Date and time formatting', () => {
        beforeEach(async () => {
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <DeliveryPersonDashboard />
                </TestWrapper>,
            );

            const viewOrdersButton = screen.getByRole('button', { name: /voir commandes disponibles/i });
            await user.click(viewOrdersButton);

            await waitFor(() => {
                expect(screen.getByText('Marie Dupont')).toBeInTheDocument();
            });
        });

        it('should format delivery times in French locale', () => {
            // Check that times are formatted with French locale
            const deliveryTimes = screen.getAllByText(/livraison:/i);
            expect(deliveryTimes.length).toBeGreaterThan(0);

            // Should contain French formatted dates (dd/mm/yyyy format)
            expect(screen.getByText(/15\/01\/2024/)).toBeInTheDocument();
        });

        it('should handle different time formats correctly', () => {
            // Should display times in 24-hour format
            expect(screen.getByText(/16:30/)).toBeInTheDocument();
            expect(screen.getByText(/17:00/)).toBeInTheDocument();
            expect(screen.getByText(/17:30/)).toBeInTheDocument();
        });
    });

    describe('Modal scrolling', () => {
        it('should handle scrolling when many orders are present', async () => {
            const user = userEvent.setup();

            // Mock many orders
            const manyOrders = {
                ...mockAvailableOrders,
                orders: Array.from({ length: 20 }, (_, i) => ({
                    ...mockAvailableOrders.orders[0],
                    id: i + 1,
                    customerName: `Customer ${i + 1}`,
                })),
                total: 20,
            };

            server.use(
                rest.get('/api/orders/available', (req, res, ctx) => {
                    return res(ctx.status(200), ctx.json(manyOrders));
                }),
            );

            render(
                <TestWrapper>
                    <DeliveryPersonDashboard />
                </TestWrapper>,
            );

            const viewOrdersButton = screen.getByRole('button', { name: /voir commandes disponibles/i });
            await user.click(viewOrdersButton);

            await waitFor(() => {
                expect(screen.getByText('Customer 1')).toBeInTheDocument();
            });

            // Modal content should be scrollable
            const modalContent = document.querySelector('.max-h-96.overflow-y-auto');
            expect(modalContent).toBeInTheDocument();
        });
    });
});
