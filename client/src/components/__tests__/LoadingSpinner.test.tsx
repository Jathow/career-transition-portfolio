import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../common/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('MuiCircularProgress-root');
  });

  it('renders with custom size', () => {
    render(<LoadingSpinner size={60} />);
    
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveStyle({ width: '60px', height: '60px' });
  });

  it('renders with custom color', () => {
    render(<LoadingSpinner color="secondary" />);
    
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('MuiCircularProgress-colorSecondary');
  });

  it('renders with custom message', () => {
    const message = 'Loading projects...';
    render(<LoadingSpinner message={message} />);
    
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const customClass = 'custom-spinner-class';
    render(<LoadingSpinner className={customClass} />);
    
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass(customClass);
  });
}); 