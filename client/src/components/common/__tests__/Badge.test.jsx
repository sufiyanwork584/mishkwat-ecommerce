import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Badge from '../Badge';

describe('Badge Component', () => {
  it('renders children correctly', () => {
    render(<Badge>New Item</Badge>);
    expect(screen.getByText('New Item')).toBeDefined();
  });

  it('applies correct variant classes', () => {
    const { container } = render(<Badge variant="success">Success Item</Badge>);
    const spanElement = container.querySelector('span');
    expect(spanElement.className).toContain('text-emerald-400');
  });
});
