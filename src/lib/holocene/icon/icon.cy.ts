import Icon from './icon.svelte';

describe('Icon', () => {
  it('works', () => {
    cy.mount(Icon, { props: { name: 'add' } });
    cy.get('svg').matchImageSnapshot();
  });
});
