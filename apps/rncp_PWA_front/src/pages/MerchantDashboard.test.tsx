import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

import { MerchantDashboard } from './MerchantDashboard';
import { baseApi } from '../store/api/baseApi';
import '../store/api'; // Import to ensure endpoints are injected
import authReducer from '../store/slices/authSlice';

// Mock alert
const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});

// Setup MSW server for API mocking
const server = setupServer(
    rest.post('/api/orders', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                id: 1,
                merchantId: 1,
                customerName: 'John Doe',
                customerPhone: '+33123456789',
                deliveryAddress: '123 Main Street, Paris',
                scheduledDeliveryTime: '2024-01-15T14:30:00Z',
                status: 'pending',
                priority: 'normal',
                deliveryPersonId: null,
                notes: 'Test order',
                estimatedDeliveryDuration: 30,
                createdAt: '2024-01-01T10:00:00Z',
                updatedAt: '2024-01-01T10:00:00Z',
            }),
        );
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

describe('MerchantDashboard', () => {
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
                    <MerchantDashboard />
                </TestWrapper>,
            );

            expect(screen.getByText('Espace Commerçant')).toBeInTheDocument();
            expect(screen.getByText('Gestion de votre boutique et de vos ventes')).toBeInTheDocument();
        });

        it('should display business KPIs', () => {
            render(
                <TestWrapper>
                    <MerchantDashboard />
                </TestWrapper>,
            );

            expect(screen.getByText('24')).toBeInTheDocument(); // todayOrders
            expect(screen.getByText('1845.00€')).toBeInTheDocument(); // todayRevenue
            expect(screen.getByText('8')).toBeInTheDocument(); // pendingOrders
            expect(screen.getByText('16')).toBeInTheDocument(); // completedOrders
        });

        it('should display "Nouvelle Livraison" button', () => {
            render(
                <TestWrapper>
                    <MerchantDashboard />
                </TestWrapper>,
            );

            const newOrderButton = screen.getByRole('button', { name: /nouvelle livraison/i });
            expect(newOrderButton).toBeInTheDocument();
        });

        it('should display other action buttons', () => {
            render(
                <TestWrapper>
                    <MerchantDashboard />
                </TestWrapper>,
            );

            expect(screen.getByRole('button', { name: /nouveau produit/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /gérer l'inventaire/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /voir les rapports/i })).toBeInTheDocument();
        });

        it('should display recent orders and top products sections', () => {
            render(
                <TestWrapper>
                    <MerchantDashboard />
                </TestWrapper>,
            );

            expect(screen.getByText('Commandes Récentes')).toBeInTheDocument();
            expect(screen.getByText('Produits les Plus Vendus')).toBeInTheDocument();
        });

        it('should not show order modal initially', () => {
            render(
                <TestWrapper>
                    <MerchantDashboard />
                </TestWrapper>,
            );

            expect(screen.queryByText('Nouvelle Commande à Livrer')).not.toBeInTheDocument();
        });
    });

    describe('Order creation modal', () => {
        it('should open modal when "Nouvelle Livraison" button is clicked', async () => {
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <MerchantDashboard />
                </TestWrapper>,
            );

            const newOrderButton = screen.getByRole('button', { name: /nouvelle livraison/i });
            await user.click(newOrderButton);

            expect(screen.getByText('Nouvelle Commande à Livrer')).toBeInTheDocument();
        });

        it('should close modal when cancel button is clicked', async () => {
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <MerchantDashboard />
                </TestWrapper>,
            );

            // Open modal
            const newOrderButton = screen.getByRole('button', { name: /nouvelle livraison/i });
            await user.click(newOrderButton);

            // Close modal
            const cancelButton = screen.getByRole('button', { name: /annuler/i });
            await user.click(cancelButton);

            expect(screen.queryByText('Nouvelle Commande à Livrer')).not.toBeInTheDocument();
        });

        it('should close modal when overlay is clicked', async () => {
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <MerchantDashboard />
                </TestWrapper>,
            );

            // Open modal
            const newOrderButton = screen.getByRole('button', { name: /nouvelle livraison/i });
            await user.click(newOrderButton);

            // Click overlay
            const overlay = document.querySelector('.absolute.inset-0.bg-gray-500.opacity-75');
            if (overlay) {
                await user.click(overlay);
            }

            expect(screen.queryByText('Nouvelle Commande à Livrer')).not.toBeInTheDocument();
        });
    });

    describe('Order form fields', () => {
        beforeEach(async () => {
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <MerchantDashboard />
                </TestWrapper>,
            );

            const newOrderButton = screen.getByRole('button', { name: /nouvelle livraison/i });
            await user.click(newOrderButton);
        });

        it('should render all form fields', () => {
            expect(screen.getByLabelText(/nom du client/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/téléphone du client/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/adresse de livraison/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/heure de livraison souhaitée/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/priorité/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/durée estimée/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
        });

        it('should mark required fields with asterisk', () => {
            expect(screen.getByText(/nom du client \*/)).toBeInTheDocument();
            expect(screen.getByText(/adresse de livraison \*/)).toBeInTheDocument();
            expect(screen.getByText(/heure de livraison souhaitée \*/)).toBeInTheDocument();
        });

        it('should have default priority set to "normal"', () => {
            const prioritySelect = screen.getByLabelText(/priorité/i) as HTMLSelectElement;
            expect(prioritySelect.value).toBe('normal');
        });

        it('should display all priority options', () => {
            screen.getByLabelText(/priorité/i);

            expect(screen.getByRole('option', { name: /basse/i })).toBeInTheDocument();
            expect(screen.getByRole('option', { name: /normale/i })).toBeInTheDocument();
            expect(screen.getByRole('option', { name: /haute/i })).toBeInTheDocument();
            expect(screen.getByRole('option', { name: /urgente/i })).toBeInTheDocument();
        });
    });

    describe('Form interaction and validation', () => {
        let user: ReturnType<typeof userEvent.setup>;

        beforeEach(async () => {
            user = userEvent.setup();

            render(
                <TestWrapper>
                    <MerchantDashboard />
                </TestWrapper>,
            );

            const newOrderButton = screen.getByRole('button', { name: /nouvelle livraison/i });
            await user.click(newOrderButton);
        });

        it('should update form fields when user types', async () => {
            const customerNameInput = screen.getByLabelText(/nom du client/i);
            const customerPhoneInput = screen.getByLabelText(/téléphone du client/i);
            const addressTextarea = screen.getByLabelText(/adresse de livraison/i);

            await user.type(customerNameInput, 'John Doe');
            await user.type(customerPhoneInput, '+33123456789');
            await user.type(addressTextarea, '123 Main Street, Paris');

            expect(customerNameInput).toHaveValue('John Doe');
            expect(customerPhoneInput).toHaveValue('+33123456789');
            expect(addressTextarea).toHaveValue('123 Main Street, Paris');
        });

        it('should update priority when changed', async () => {
            const prioritySelect = screen.getByLabelText(/priorité/i);

            await user.selectOptions(prioritySelect, 'high');
            expect(prioritySelect).toHaveValue('high');
        });

        it('should update delivery time when changed', async () => {
            const dateInput = screen.getByLabelText(/heure de livraison souhaitée/i);

            await user.type(dateInput, '2024-01-15T14:30');
            expect(dateInput).toHaveValue('2024-01-15T14:30');
        });

        it('should validate required fields', async () => {
            const submitButton = screen.getByRole('button', { name: /créer la commande/i });

            // Try to submit without filling required fields
            await user.click(submitButton);

            // Form should not be submitted (browser validation should prevent it)
            expect(mockAlert).not.toHaveBeenCalled();
        });

        it('should allow optional fields to be empty', async () => {
            // Fill only required fields
            await user.type(screen.getByLabelText(/nom du client/i), 'John Doe');
            await user.type(screen.getByLabelText(/adresse de livraison/i), '123 Main Street');
            await user.type(screen.getByLabelText(/heure de livraison souhaitée/i), '2024-01-15T14:30');

            const submitButton = screen.getByRole('button', { name: /créer la commande/i });
            await user.click(submitButton);

            await waitFor(() => {
                expect(mockAlert).toHaveBeenCalledWith('Commande créée avec succès !');
            });
        });
    });

    describe('Form submission', () => {
        let user: ReturnType<typeof userEvent.setup>;

        beforeEach(async () => {
            user = userEvent.setup();

            render(
                <TestWrapper>
                    <MerchantDashboard />
                </TestWrapper>,
            );

            const newOrderButton = screen.getByRole('button', { name: /nouvelle livraison/i });
            await user.click(newOrderButton);
        });

        const fillRequiredFields = async () => {
            await user.type(screen.getByLabelText(/nom du client/i), 'John Doe');
            await user.type(screen.getByLabelText(/adresse de livraison/i), '123 Main Street, Paris');
            await user.type(screen.getByLabelText(/heure de livraison souhaitée/i), '2024-01-15T14:30');
        };

        const fillAllFields = async () => {
            await fillRequiredFields();
            await user.type(screen.getByLabelText(/téléphone du client/i), '+33123456789');
            await user.selectOptions(screen.getByLabelText(/priorité/i), 'high');
            await user.type(screen.getByLabelText(/durée estimée/i), '30');
            await user.type(screen.getByLabelText(/notes/i), 'Test order notes');
        };

        it('should submit form with correct data', async () => {
            await fillAllFields();

            const submitButton = screen.getByRole('button', { name: /créer la commande/i });
            await user.click(submitButton);

            await waitFor(() => {
                expect(mockAlert).toHaveBeenCalledWith('Commande créée avec succès !');
            });
        });

        it('should show loading state during submission', async () => {
            // Delay the API response to test loading state
            server.use(
                rest.post('/api/orders', async (req, res, ctx) => {
                    await new Promise((resolve) => setTimeout(resolve, 100));
                    return res(ctx.status(200), ctx.json({ id: 1 }));
                }),
            );

            await fillRequiredFields();

            const submitButton = screen.getByRole('button', { name: /créer la commande/i });
            await user.click(submitButton);

            // Check loading state
            expect(screen.getByText('Création...')).toBeInTheDocument();
            expect(submitButton).toBeDisabled();

            await waitFor(() => {
                expect(screen.getByText('Créer la commande')).toBeInTheDocument();
            });
        });

        it('should reset form after successful submission', async () => {
            await fillAllFields();

            const submitButton = screen.getByRole('button', { name: /créer la commande/i });
            await user.click(submitButton);

            await waitFor(() => {
                expect(mockAlert).toHaveBeenCalledWith('Commande créée avec succès !');
            });

            // Modal should be closed after successful submission
            expect(screen.queryByText('Nouvelle Commande à Livrer')).not.toBeInTheDocument();
        });

        it('should handle API errors gracefully', async () => {
            server.use(
                rest.post('/api/orders', (req, res, ctx) => {
                    return res(ctx.status(400), ctx.json({ message: 'Validation error' }));
                }),
            );

            await fillRequiredFields();

            const submitButton = screen.getByRole('button', { name: /créer la commande/i });
            await user.click(submitButton);

            await waitFor(() => {
                expect(mockAlert).toHaveBeenCalledWith('Erreur lors de la création de la commande');
            });

            // Modal should still be open after error
            expect(screen.getByText('Nouvelle Commande à Livrer')).toBeInTheDocument();
        });

        it('should handle network errors gracefully', async () => {
            server.use(
                rest.post('/api/orders', (req, res) => {
                    return res.networkError('Network error');
                }),
            );

            await fillRequiredFields();

            const submitButton = screen.getByRole('button', { name: /créer la commande/i });
            await user.click(submitButton);

            await waitFor(() => {
                expect(mockAlert).toHaveBeenCalledWith('Erreur lors de la création de la commande');
            });
        });
    });

    describe('Data conversion', () => {
        let user: ReturnType<typeof userEvent.setup>;

        beforeEach(async () => {
            user = userEvent.setup();

            render(
                <TestWrapper>
                    <MerchantDashboard />
                </TestWrapper>,
            );

            const newOrderButton = screen.getByRole('button', { name: /nouvelle livraison/i });
            await user.click(newOrderButton);
        });

        it('should convert datetime-local input to Date object', async () => {
            let requestData: unknown = null;

            server.use(
                rest.post('/api/orders', async (req, res, ctx) => {
                    requestData = await req.json();
                    return res(ctx.status(200), ctx.json({ id: 1 }));
                }),
            );

            await user.type(screen.getByLabelText(/nom du client/i), 'John Doe');
            await user.type(screen.getByLabelText(/adresse de livraison/i), '123 Main Street');
            await user.type(screen.getByLabelText(/heure de livraison souhaitée/i), '2024-01-15T14:30');

            const submitButton = screen.getByRole('button', { name: /créer la commande/i });
            await user.click(submitButton);

            await waitFor(() => {
                expect(requestData).toBeDefined();
                expect(requestData.scheduledDeliveryTime).toEqual('2024-01-15T14:30:00.000Z');
            });
        });

        it('should convert priority string to enum value', async () => {
            let requestData: unknown = null;

            server.use(
                rest.post('/api/orders', async (req, res, ctx) => {
                    requestData = await req.json();
                    return res(ctx.status(200), ctx.json({ id: 1 }));
                }),
            );

            await user.type(screen.getByLabelText(/nom du client/i), 'John Doe');
            await user.type(screen.getByLabelText(/adresse de livraison/i), '123 Main Street');
            await user.type(screen.getByLabelText(/heure de livraison souhaitée/i), '2024-01-15T14:30');
            await user.selectOptions(screen.getByLabelText(/priorité/i), 'urgent');

            const submitButton = screen.getByRole('button', { name: /créer la commande/i });
            await user.click(submitButton);

            await waitFor(() => {
                expect(requestData).toBeDefined();
                expect(requestData.priority).toBe('urgent');
            });
        });

        it('should convert estimatedDeliveryDuration to number', async () => {
            let requestData: unknown = null;

            server.use(
                rest.post('/api/orders', async (req, res, ctx) => {
                    requestData = await req.json();
                    return res(ctx.status(200), ctx.json({ id: 1 }));
                }),
            );

            await user.type(screen.getByLabelText(/nom du client/i), 'John Doe');
            await user.type(screen.getByLabelText(/adresse de livraison/i), '123 Main Street');
            await user.type(screen.getByLabelText(/heure de livraison souhaitée/i), '2024-01-15T14:30');
            await user.type(screen.getByLabelText(/durée estimée/i), '45');

            const submitButton = screen.getByRole('button', { name: /créer la commande/i });
            await user.click(submitButton);

            await waitFor(() => {
                expect(requestData).toBeDefined();
                expect(requestData.estimatedDeliveryDuration).toBe(45);
                expect(typeof requestData.estimatedDeliveryDuration).toBe('number');
            });
        });

        it('should handle empty optional fields correctly', async () => {
            let requestData: unknown = null;

            server.use(
                rest.post('/api/orders', async (req, res, ctx) => {
                    requestData = await req.json();
                    return res(ctx.status(200), ctx.json({ id: 1 }));
                }),
            );

            await user.type(screen.getByLabelText(/nom du client/i), 'John Doe');
            await user.type(screen.getByLabelText(/adresse de livraison/i), '123 Main Street');
            await user.type(screen.getByLabelText(/heure de livraison souhaitée/i), '2024-01-15T14:30');

            const submitButton = screen.getByRole('button', { name: /créer la commande/i });
            await user.click(submitButton);

            await waitFor(() => {
                expect(requestData).toBeDefined();
                expect(requestData.customerPhone).toBeUndefined();
                expect(requestData.notes).toBeUndefined();
                expect(requestData.estimatedDeliveryDuration).toBeUndefined();
            });
        });
    });

    describe('Accessibility', () => {
        it('should have proper form labels', async () => {
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <MerchantDashboard />
                </TestWrapper>,
            );

            const newOrderButton = screen.getByRole('button', { name: /nouvelle livraison/i });
            await user.click(newOrderButton);

            // All form fields should have associated labels
            expect(screen.getByLabelText(/nom du client/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/téléphone du client/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/adresse de livraison/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/heure de livraison souhaitée/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/priorité/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/durée estimée/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
        });

        it('should have proper button roles and names', () => {
            render(
                <TestWrapper>
                    <MerchantDashboard />
                </TestWrapper>,
            );

            expect(screen.getByRole('button', { name: /nouvelle livraison/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /nouveau produit/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /gérer l'inventaire/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /voir les rapports/i })).toBeInTheDocument();
        });

        it('should be keyboard navigable', async () => {
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <MerchantDashboard />
                </TestWrapper>,
            );

            // Tab to the "Nouvelle Livraison" button and activate it
            await user.tab();
            await user.keyboard('[Enter]');

            expect(screen.getByText('Nouvelle Commande à Livrer')).toBeInTheDocument();

            // Should be able to tab through form fields
            await user.tab(); // Customer name
            await user.tab(); // Customer phone
            await user.tab(); // Delivery address
            await user.tab(); // Scheduled time
            await user.tab(); // Priority
            await user.tab(); // Duration
            await user.tab(); // Notes
            await user.tab(); // Submit button
            await user.tab(); // Cancel button

            expect(document.activeElement).toBe(screen.getByRole('button', { name: /annuler/i }));
        });
    });
});
