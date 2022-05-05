describe('Set Data Encoder Settings', () => {
  describe('Data Encoder without site setting endpoint', () => {
    beforeEach(() => {
      cy.interceptApi();

      cy.visit('/namespaces/default/workflows');

      cy.fixture('namespaces.json')
        .then(({ namespaces }) => {
          return namespaces
            .map((n) => n.namespaceInfo.name)
            .filter((name) => name !== 'temporal-system');
        })
        .as('namespaces');

      cy.wait('@workflows-api');
      cy.wait('@namespaces-api');

      cy.get('[data-cy="navigation-header"]').as('header');
    });

    it('can set and clear both endpoint and port with error message', () => {
      cy.get('@header').find('[data-cy="data-encoder-status"]').click();
      cy.get('[data-cy="data-encoder-title"]').contains('Data Encoder');
      cy.get('[data-cy="data-encoder-endpoint-title"]').contains(
        'Remote Codec Endpoint',
      );
      cy.get('[data-cy="data-encoder-endpoint-input"]').should(
        'have.value',
        '',
      );
      cy.get('[data-cy="data-encoder-set-endpoint"]').contains('Set');

      cy.get('[data-cy="data-encoder-port-input"]').should('have.value', '');
      cy.get('[data-cy="data-encoder-set-port"]').contains('Set');

      // Set invalid endpoint and get error
      cy.get('[data-cy="data-encoder-endpoint-input"]').type('abc123');
      cy.get('[data-cy="data-encoder-set-endpoint"]').click();
      cy.get('[data-cy="data-encoder-endpoint-error"]').contains(
        'Endpoint must start with http:// or https://',
      );

      // Clear endpoint and set valid endpoint
      cy.get('[data-cy="data-encoder-endpoint-input"]').clear();
      cy.get('[data-cy="data-encoder-endpoint-input"]').type('http://test.com');
      cy.get('[data-cy="data-encoder-set-endpoint"]').click();
      cy.get('[data-cy="data-encoder-endpoint"]').contains('http://test.com');
      cy.get('[data-cy="data-encoder-clear-endpoint"]').contains('Clear');

      // Clear endpoint
      cy.get('[data-cy="data-encoder-clear-endpoint"]').click();
      cy.get('[data-cy="data-encoder-port-input"]').should('have.value', '');

      // Set port
      cy.get('[data-cy="data-encoder-port-input"]').type('5534');
      cy.get('[data-cy="data-encoder-set-port"]').click();
      cy.get('[data-cy="data-encoder-port"]').contains('5534');
      cy.get('[data-cy="data-encoder-clear-port"]').contains('Clear');
      cy.get('[data-cy="data-encoder-clear-port"]').click();
      cy.get('[data-cy="data-encoder-port-input"]').should('have.value', '');

      cy.get('[data-cy="data-encoder-info"]').contains(
        'If both are set, the Remote Codec Endpoint will be used.',
      );
    });
  });

  describe('Data Encoder with site setting endpoint', () => {
    beforeEach(() => {
      cy.interceptApi();

      cy.intercept(Cypress.env('VITE_API_HOST') + '/api/v1/settings*', {
        Auth: { Enabled: false, Options: null },
        Codec: {
          Endpoint: 'http://test.com',
        },
      }).as('settings-api');

      cy.visit('/namespaces/default/workflows');

      cy.fixture('namespaces.json')
        .then(({ namespaces }) => {
          return namespaces
            .map((n) => n.namespaceInfo.name)
            .filter((name) => name !== 'temporal-system');
        })
        .as('namespaces');

      cy.wait('@namespaces-api');
      cy.wait('@workflows-api');
      cy.wait('@settings-api');

      cy.get('[data-cy="navigation-header"]').as('header');
    });

    it('can set and clear both endpoint and port with error message', () => {
      cy.get('@header')
        .find('[data-cy="data-encoder-status-configured"]')
        .click();
      cy.get('[data-cy="data-encoder-title"]').contains('Data Encoder');
      cy.get('[data-cy="data-encoder-endpoint-title"]').contains(
        'Remote Codec Endpoint',
      );
      cy.get('[data-cy="data-encoder-endpoint-input"]').should(
        'have.value',
        '',
      );
      cy.get('[data-cy="data-encoder-set-endpoint"]').contains('Set');
      cy.get('[data-cy="data-encoder-site-endpoint"]').contains(
        'http://test.com',
      );

      cy.get('[data-cy="data-encoder-port-input"]').should('have.value', '');
      cy.get('[data-cy="data-encoder-set-port"]').contains('Set');

      // Set invalid endpoint and get error
      cy.get('[data-cy="data-encoder-endpoint-input"]').type('abc123');
      cy.get('[data-cy="data-encoder-set-endpoint"]').click();
      cy.get('[data-cy="data-encoder-endpoint-error"]').contains(
        'Endpoint must start with http:// or https://',
      );

      // Clear endpoint and set valid endpoint
      cy.get('[data-cy="data-encoder-endpoint-input"]').clear();
      cy.get('[data-cy="data-encoder-endpoint-input"]').type('http://test.com');
      cy.get('[data-cy="data-encoder-set-endpoint"]').click();
      cy.get('[data-cy="data-encoder-endpoint"]').contains('http://test.com');
      cy.get('[data-cy="data-encoder-clear-endpoint"]').contains('Clear');
      cy.get('[data-cy="data-encoder-endpoint-info"]').contains(
        'Set endpoint overrides site setting.',
      );

      // Clear endpoint
      cy.get('[data-cy="data-encoder-clear-endpoint"]').click();
      cy.get('[data-cy="data-encoder-port-input"]').should('have.value', '');

      // Set port
      cy.get('[data-cy="data-encoder-port-input"]').type('5534');
      cy.get('[data-cy="data-encoder-set-port"]').click();
      cy.get('[data-cy="data-encoder-port"]').contains('5534');
      cy.get('[data-cy="data-encoder-clear-port"]').contains('Clear');
      cy.get('[data-cy="data-encoder-clear-port"]').click();
      cy.get('[data-cy="data-encoder-port-input"]').should('have.value', '');

      cy.get('[data-cy="data-encoder-info"]').contains(
        'If both are set, the Remote Codec Endpoint will be used.',
      );
    });
  });

  describe('Data Encoder with site setting endpoint and access token', () => {
    beforeEach(() => {
      cy.interceptApi();

      cy.intercept(Cypress.env('VITE_API_HOST') + '/api/v1/settings*', {
        Auth: { Enabled: false, Options: null },
        Codec: {
          Endpoint: 'http://test.com',
          AccessToken: 'abcde',
        },
      }).as('settings-api');

      cy.visit('/namespaces/default/workflows');

      cy.fixture('namespaces.json')
        .then(({ namespaces }) => {
          return namespaces
            .map((n) => n.namespaceInfo.name)
            .filter((name) => name !== 'temporal-system');
        })
        .as('namespaces');

      cy.wait('@namespaces-api');
      cy.wait('@workflows-api');
      cy.wait('@settings-api');

      cy.get('[data-cy="navigation-header"]').as('header');
    });

    it('can set and clear both endpoint and port with error message', () => {
      cy.get('@header')
        .find('[data-cy="data-encoder-status-configured"]')
        .click();
      cy.get('[data-cy="data-encoder-title"]').contains('Data Encoder');
      cy.get('[data-cy="data-encoder-endpoint-title"]').contains(
        'Remote Codec Endpoint',
      );
      cy.get('[data-cy="data-encoder-endpoint-input"]').should(
        'have.value',
        '',
      );
      cy.get('[data-cy="data-encoder-set-endpoint"]').contains('Set');
      cy.get('[data-cy="data-encoder-site-endpoint"]').contains(
        'http://test.com',
      );

      cy.get('[data-cy="data-encoder-port-input"]').should('have.value', '');
      cy.get('[data-cy="data-encoder-set-port"]').contains('Set');

      // Set invalid endpoint and get error
      cy.get('[data-cy="data-encoder-endpoint-input"]').type('abc123');
      cy.get('[data-cy="data-encoder-set-endpoint"]').click();
      cy.get('[data-cy="data-encoder-endpoint-error"]').contains(
        'Endpoint must start with http:// or https://',
      );

      // Clear endpoint and set invalid http endpoint
      cy.get('[data-cy="data-encoder-endpoint-input"]').clear();
      cy.get('[data-cy="data-encoder-endpoint-input"]').type('http://test.com');
      cy.get('[data-cy="data-encoder-set-endpoint"]').click();
      cy.get('[data-cy="data-encoder-endpoint-error"]').contains(
        'Endpoint must start with https:// to authenticate',
      );

      // Clear endpoint and set valid https endpoint
      cy.get('[data-cy="data-encoder-endpoint-input"]').clear();
      cy.get('[data-cy="data-encoder-endpoint-input"]').type(
        'https://test.com',
      );
      cy.get('[data-cy="data-encoder-set-endpoint"]').click();

      cy.get('[data-cy="data-encoder-endpoint"]').contains('https://test.com');
      cy.get('[data-cy="data-encoder-clear-endpoint"]').contains('Clear');
      cy.get('[data-cy="data-encoder-endpoint-info"]').contains(
        'Set endpoint overrides site setting.',
      );

      // Clear endpoint
      cy.get('[data-cy="data-encoder-clear-endpoint"]').click();
      cy.get('[data-cy="data-encoder-port-input"]').should('have.value', '');

      // Set port
      cy.get('[data-cy="data-encoder-port-input"]').type('5534');
      cy.get('[data-cy="data-encoder-set-port"]').click();
      cy.get('[data-cy="data-encoder-port"]').contains('5534');
      cy.get('[data-cy="data-encoder-clear-port"]').contains('Clear');
      cy.get('[data-cy="data-encoder-clear-port"]').click();
      cy.get('[data-cy="data-encoder-port-input"]').should('have.value', '');

      cy.get('[data-cy="data-encoder-info"]').contains(
        'If both are set, the Remote Codec Endpoint will be used.',
      );
    });
  });
});
