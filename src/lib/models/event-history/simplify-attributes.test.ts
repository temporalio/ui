import { simplifyAttributes } from './simplify-attributes';

const createAttributes = () => {
  return {
    shouldBeSimple: {
      name: 'SimpleResult',
    },
    notSoSimple: {
      name: 'NotSimple',
      type: 'NotSimple',
    },
  };
};

describe('simplifyAttributes', () => {
  it('should take single key attributes and reduce them down to their values', () => {
    const attributes = createAttributes();
    const { shouldBeSimple } = simplifyAttributes(attributes);

    expect(shouldBeSimple).toBe('SimpleResult');
  });

  it('should take single key attributes and reduce them down to their values', () => {
    const attributes = createAttributes();
    const { notSoSimple } = simplifyAttributes(attributes);

    expect(notSoSimple).toEqual({
      name: 'NotSimple',
      type: 'NotSimple',
    });
  });
});
