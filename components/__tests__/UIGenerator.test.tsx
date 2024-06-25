import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UIGenerator from '../UIGenerator';
import { useCompletion } from 'ai/react';

jest.mock('ai/react', () => ({
  useCompletion: jest.fn(),
}));

describe('UIGenerator', () => {
  beforeEach(() => {
    (useCompletion as jest.Mock).mockReturnValue({
      complete: jest.fn(),
      completion: null,
      isLoading: false,
      error: null,
    });
  });

  it('renders the form correctly', () => {
    render(<UIGenerator />);
    expect(screen.getByLabelText(/describe your desired ui/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate ui/i })).toBeInTheDocument();
  });

  it('shows error message for short descriptions', async () => {
    render(<UIGenerator />);
    const input = screen.getByLabelText(/describe your desired ui/i);
    const submitButton = screen.getByRole('button', { name: /generate ui/i });

    fireEvent.change(input, { target: { value: 'Short' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/description must be at least 10 characters/i)).toBeInTheDocument();
    });
  });

  it('calls the AI completion when form is submitted', async () => {
    const mockComplete = jest.fn();
    (useCompletion as jest.Mock).mockReturnValue({
      complete: mockComplete,
      completion: null,
      isLoading: false,
      error: null,
    });

    render(<UIGenerator />);
    const input = screen.getByLabelText(/describe your desired ui/i);
    const submitButton = screen.getByRole('button', { name: /generate ui/i });

    fireEvent.change(input, { target: { value: 'Create a responsive navbar' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockComplete).toHaveBeenCalledWith('Create a responsive navbar');
    });
  });
});