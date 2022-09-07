<article class="row">
  <div class="cell md:table-cell">
    <p />
  </div>
  <div class="cell w-1/2 md:table-cell">
    <p>Loading</p>
  </div>
  <div class="cell md:table-cell">
    <p />
  </div>
  <div class="cell inline-block md:hidden xl:table-cell">
    <p />
  </div>
  <div class="cell inline-block md:hidden xl:table-cell">
    <p />
  </div>
</article>

<style>
  .row {

    align-items: center;

    border-bottom-width: 2px;

    padding: 0.5rem;

    font-size: 0.875rem;

    line-height: 1.25rem;

    -webkit-text-decoration-line: none;

            text-decoration-line: none
}

.row:last-of-type {

    border-bottom-width: 0px
}

@media (min-width: 768px) {

    .row {

        display: table-row;

        font-size: 1rem;

        line-height: 1.5rem
    }
}

  .cell {

    padding: 0.5rem;

    text-align: left
}

  @media (min-width: 768px) {

    .cell {

        border-bottom-width: 2px
    }
}

  .row:last-of-type .cell {

    border-bottom-width: 0px
}

  .row:last-of-type .cell:first-of-type {

    border-bottom-left-radius: 0.5rem
}

  .row:last-of-type .cell:last-of-type {

    border-bottom-right-radius: 0.5rem
}</style>
