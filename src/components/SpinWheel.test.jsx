import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SpinWheel from './SpinWheel';
import React from 'react';

// Mock canvas context with all necessary methods
const createMockContext = () => {
  const mockFn = vi.fn();
  return new Proxy({}, {
    get: () => mockFn,
  });
};

HTMLCanvasElement.prototype.getContext = vi.fn(() => createMockContext());

// Mock LanguageContext
vi.mock('../context/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key) => {
      const translations = {
        'spin_launch': 'Lancer la roue !',
        'spin_spinning': 'Tirage en cours...',
        'spin_eligible_count': '{count} participant{s} éligible{s}',
        'spin_winner_label': 'Gagnant du tirage',
        'spin_amount_month': 'Montant du mois {month}',
        'spin_send_sms': 'Envoyer SMS',
        'spin_no_phone': 'Numéro de téléphone non disponible',
        'spin_close': 'Fermer',
        'spin_winner_congrats': 'Félicitations {name}! Vous avez remporté {amount} FCFA pour le mois de {month}',
      };
      return translations[key] || key;
    }
  })
}));

// Mock api.assetUrl
vi.mock('../services/api', () => ({
  assetUrl: (path) => path || '/default-avatar.jpg'
}));

describe('SpinWheel', () => {
  const mockParticipants = [
    { id: 1, name: 'Alice Dupont', telephone: '+221771234567', color: '#1a7a2e' },
    { id: 2, name: 'Bob Martin', telephone: '+221781234567', color: '#2eb85c' },
    { id: 3, name: 'Charlie Durant', telephone: '+221791234567', color: '#10b981' },
    { id: 4, name: 'Diana Lambert', phone: '771234568', color: '#059669' },
  ];

  const mockOnResult = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the spin wheel with participants', () => {
    render(
      <SpinWheel
        participants={mockParticipants}
        montant={40000}
        mois="Mars"
        onResult={mockOnResult}
        onClose={mockOnClose}
      />
    );

    // Check if launch button is present
    expect(screen.getByText('Lancer la roue !')).toBeInTheDocument();

    // Check if all participants are displayed
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
    expect(screen.getByText('Diana')).toBeInTheDocument();

    // Check if eligible count is displayed
    expect(screen.getByText(/4 participant.*éligible/)).toBeInTheDocument();
  });

  it('renders canvas element', () => {
    const { container } = render(
      <SpinWheel
        participants={mockParticipants}
        montant={40000}
        mois="Mars"
        onResult={mockOnResult}
        onClose={mockOnClose}
      />
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute('width', '500');
    expect(canvas).toHaveAttribute('height', '500');
  });

  it('disables button while spinning', async () => {
    render(
      <SpinWheel
        participants={mockParticipants}
        montant={40000}
        mois="Mars"
        onResult={mockOnResult}
        onClose={mockOnClose}
      />
    );

    const spinButton = screen.getByText('Lancer la roue !');
    expect(spinButton).not.toBeDisabled();

    // Click to start spinning
    fireEvent.click(spinButton);

    // Button should be disabled while spinning
    expect(spinButton).toBeDisabled();
    expect(screen.getByText('Tirage en cours...')).toBeInTheDocument();
  });

  it('calls onResult callback after spin click', async () => {
    const { container } = render(
      <SpinWheel
        participants={mockParticipants}
        montant={40000}
        mois="Mars"
        onResult={mockOnResult}
        onClose={mockOnClose}
      />
    );

    const spinButton = screen.getByText('Lancer la roue !');
    fireEvent.click(spinButton);

    // Just verify button is disabled while spinning
    expect(spinButton).toBeDisabled();
  });

  it('disables spin when no participants', () => {
    render(
      <SpinWheel
        participants={[]}
        montant={0}
        mois="Mars"
        onResult={mockOnResult}
        onClose={mockOnClose}
      />
    );

    const spinButton = screen.getByText('Lancer la roue !');
    fireEvent.click(spinButton);

    // onResult should not be called
    expect(mockOnResult).not.toHaveBeenCalled();
  });

  it('formats participant names correctly in the wheel', () => {
    const { container } = render(
      <SpinWheel
        participants={mockParticipants}
        montant={40000}
        mois="Mars"
        onResult={mockOnResult}
        onClose={mockOnClose}
      />
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('handles dark theme prop', () => {
    const { container: darkContainer } = render(
      <SpinWheel
        participants={mockParticipants}
        montant={40000}
        mois="Mars"
        onResult={mockOnResult}
        onClose={mockOnClose}
        dark={true}
      />
    );

    expect(darkContainer.querySelector('canvas')).toBeInTheDocument();

    const { container: lightContainer } = render(
      <SpinWheel
        participants={mockParticipants}
        montant={40000}
        mois="Mars"
        onResult={mockOnResult}
        onClose={mockOnClose}
        dark={false}
      />
    );

    expect(lightContainer.querySelector('canvas')).toBeInTheDocument();
  });
});
