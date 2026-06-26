const sum = (a, b) => a + b;

describe('Backend Basic System Check', () => {
  test('should correctly add two numbers', () => {
    expect(sum(2, 3)).toBe(5);
  });
});