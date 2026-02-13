import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Logo from './Logo';

describe('Logo Component', () => {
    it('renders the logo image', () => {
        render(<Logo />);
        const logoImage = screen.getByAltText('Focus Arena');
        expect(logoImage).toBeInTheDocument();
        expect(logoImage).toHaveClass('h-12'); // Default className
    });

    it('applies custom className', () => {
        render(<Logo className="h-24 w-24" />);
        const logoImage = screen.getByAltText('Focus Arena');
        expect(logoImage).toHaveClass('h-24 w-24');
    });
});
