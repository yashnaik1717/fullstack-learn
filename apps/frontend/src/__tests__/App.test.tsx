import { describe, it, expect } from 'vitest';
import { App } from '../App';

describe('Frontend App component', () => {
  it('should compile and export App function', () => {
    expect(App).toBeTypeOf('function');
  });
});
