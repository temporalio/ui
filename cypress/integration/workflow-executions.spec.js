/// <reference types="cypress" />

const statuses = [
  'Running',
  'TimedOut',
  'Completed',
  'Failed',
  'ContinuedAsNew',
  'Canceled',
  'Terminated',
];

describe('Workflow Executions List', () => {
  beforeEach(() => {
    cy.interceptApi();

    cy.visit('/namespaces/default/workflows');

    cy.wait('@list-workflows-api');
    cy.wait('@namespaces-api');
  });

  it('should default to 24 hours for the time range', () => {
    cy.url().should('contain', 'time-range=24+hours');

    cy.get('#time-range-filter')
      .find('option:selected')
      .should('have.value', '24 hours');
  });

  it('should default to showing all workflows', () => {
    cy.get('#status-filter')
      .find('option:selected')
      .should('have.value', 'null');

    cy.get('#workflow-id-filter').should('have.value', '');

    cy.get('#workflow-type-filter').should('have.value', '');
  });

  describe('Workflow Filters', () => {
    it('should send the correct query for Workflow Type', () => {
      const result = encodeURIComponent('WorkflowType="ImportantWorkflowType"');

      cy.get('#workflow-type-filter').type('ImportantWorkflowType');

      cy.url().should('contain', 'workflow-type=ImportantWorkflowType');

      cy.wait('@list-workflows-api').then((interception) => {
        expect(interception.request.url).to.contain(result);
      });
    });

    it('should send the correct query for Workflow ID', () => {
      const result = encodeURIComponent('WorkflowId="002c98_Running"');

      cy.get('#workflow-id-filter').type('002c98_Running');

      cy.url().should('contain', 'workflow-id=002c98_Running');

      cy.wait('@list-workflows-api').then((interception) => {
        expect(interception.request.url).to.contain(result);
      });
    });

    for (const status of statuses) {
      it(`should redirect to the correct query params for ${status} workflows`, () => {
        cy.visit(`/namespaces/default`);
        cy.get('#status-filter').select(status).trigger('input');
        cy.url().should('contain', `status=${status}`);
      });

      it(`should send the correct query when filtering for ${status} workflows`, () => {
        cy.visit(`/namespaces/default/workflows?status=${status}`);

        cy.get('#status-filter').should('have.value', status);

        cy.wait('@list-workflows-api').then((interception) => {
          expect(interception.request.url).to.contain(
            encodeURIComponent(`ExecutionStatus="${status}"`),
          );
        });
      });
    }
  });
});
