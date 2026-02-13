import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Skeleton } from './Skeleton';

describe('Skeleton Component', () => {
    it('renders with default styles', () => {
        const { container } = render(<Skeleton />);
        const skeleton = container.firstChild;
        expect(skeleton).toHaveClass('animate-pulse');
        expect(skeleton).toHaveClass('bg-gray-700/50');
    });

    it('applies custom className', () => {
        const { container } = render(<Skeleton className="h-10 w-10 custom-class" />);
        const skeleton = container.firstChild;
        expect(skeleton).toHaveClass('custom-class');
        expect(skeleton).toHaveClass('h-10');
    });
});
