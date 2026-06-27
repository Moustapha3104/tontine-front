import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LoanItem } from './LoanItem';
import React from 'react';

// Mock the API
vi.mock('../services/api', () => ({
    api: {
        getLoanSchedule: vi.fn(),
        approveLoan: vi.fn(),
        rejectLoan: vi.fn(),
        payInstallment: vi.fn(),
    }
}));

describe('LoanItem', () => {
    const mockLoan = {
        id: 1,
        membre_name: 'John Doe',
        motif: 'Medical',
        montant: 100000,
        status: 'En attente',
        approbations: '[]'
    };

    it('renders loan information correctly', () => {
        render(<LoanItem l={mockLoan} isGerant={false} onRefresh={() => { }} userId={1} />);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Medical')).toBeInTheDocument();
        expect(screen.getByText(/100.*000 F/)).toBeInTheDocument();
        expect(screen.getByText('En attente')).toBeInTheDocument();
        expect(screen.getByText('0/2')).toBeInTheDocument();
    });

    it('shows approval buttons for gerants', () => {
        render(<LoanItem l={mockLoan} isGerant={true} onRefresh={() => { }} userId={2} />);

        // Expand first
        fireEvent.click(screen.getByTestId('loan-header'));

        expect(screen.getByText(/Signer \(1\/2\)/)).toBeInTheDocument();
        expect(screen.getByText('Rejeter')).toBeInTheDocument();
    });

    it('disables approve button if already approved by current user', () => {
        const approvedLoan = { ...mockLoan, approbations: '[2]' };
        render(<LoanItem l={approvedLoan} isGerant={true} onRefresh={() => { }} userId={2} />);

        // Expand
        fireEvent.click(screen.getByTestId('loan-header'));

        const approveBtn = screen.getByText(/Déjà signé/);
        expect(approveBtn).toBeDisabled();
    });
});
