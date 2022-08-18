<script lang="ts">
  import { page } from '$app/stores';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { getSDKOrigin } from '$lib/utilities/stack-trace/get-sdk-origin';

  import {
    getWorkflowEnhancedStackTrace,
    getWorkflowStackTrace,
  } from '$lib/services/query-service';
  import type { ParsedQuery } from '$lib/services/query-service';

  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Button from '$holocene/button.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import PageTitle from '$lib/holocene/page-title.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import Link from '$lib/holocene/link.svelte';

  const { namespace } = $page.params;
  const { workflow, workers } = $workflowRun;
  const sliceSize = 10;

  let currentdate = new Date();
  let isLoading = false;
  let isEnhancedStackSelected = true;

  const getEnhancedStackTrace = () =>
    getWorkflowEnhancedStackTrace({
      workflow,
      namespace,
    });

  const getStackTrace = () =>
    getWorkflowStackTrace({
      workflow,
      namespace,
    });

  const getSnippet = (line: number, sourceText: string): [string, number] => {
    const snippetBeginning = Math.max(0, line - Math.floor(sliceSize / 2));
    const snippetEnd = Math.min(
      sourceText.length,
      Math.max(10, line + Math.floor(sliceSize / 2)),
    );
    const sourceSlice = sourceText
      .split('\n')
      .slice(snippetBeginning, snippetEnd)
      .join('\n');
    const lineInSlice =
      line <= Math.floor(sliceSize / 2) ? line : line - snippetBeginning;
    return [sourceSlice, lineInSlice];
  };

  let stackTrace: Eventual<ParsedQuery>;
  $: {
    if (workflow.isRunning)
      stackTrace = isEnhancedStackSelected
        ? getEnhancedStackTrace()
        : getStackTrace();
  }

  const refreshStackTrace = () => {
    stackTrace = isEnhancedStackSelected
      ? getWorkflowEnhancedStackTrace({
          workflow,
          namespace,
        })
      : getWorkflowStackTrace({
          workflow,
          namespace,
        });

    stackTrace.then(() => {
      currentdate = new Date();
    });
  };
</script>

<PageTitle title={`Stack Trace | ${workflow.id}`} url={$page.url.href} />
<section>
  {#if workflow.isRunning && workers?.pollers?.length > 0}
    {#await stackTrace}
      <div class="text-center">
        <Loading />
        <p>(This will fail if you have no workers running.)</p>
      </div>
    {:then result}
      {#if localStorage.getItem('isSDKsupported') === null}
        {localStorage.setItem(
          'isSDKsupported',
          getSDKOrigin(JSON.stringify(result)) === 'typescript' ? 'yes' : 'no',
        )}
      {/if}
      <div class="flex items-center gap-4">
        <Button
          on:click={refreshStackTrace}
          iconScale={0.8}
          icon="refresh"
          loading={isLoading}
        >
          Refresh
        </Button>
        {#if isEnhancedStackSelected}
          <Button
            on:click={() => {
              isEnhancedStackSelected = false;
            }}
            on:click={getStackTrace}
            >Regular view
          </Button>
        {:else}
          <Button
            on:click={() => {
              isEnhancedStackSelected = true;
            }}
            on:click={getEnhancedStackTrace}
            >Enhanced view
          </Button>
        {/if}
        <p>Stack Trace at {currentdate.toLocaleTimeString()}</p>
      </div>

      {#if isEnhancedStackSelected}
        {#if localStorage.getItem('isSDKsupported') === 'yes'}
          <div class="text-left">
            {#each result.stacks as stack}
              <div>
                {#each stack.locations as location}
                  {#if location.filePath}
                    <CodeBlock
                      content={location.filePath}
                      type="collapsible"
                      language="text"
                      stackHead={location === stack.locations[0]}
                    />
                    <CodeBlock
                      type="snippet"
                      content={getSnippet(
                        location.line,
                        result.sources[location.filePath][0].content,
                      )[0]}
                      highlightLine={location.line}
                      lineOffset={location.line -
                        getSnippet(
                          location.line,
                          result.sources[location.filePath][0].content,
                        )[1]}
                      language={result.sdk.name}
                      dataCy="query-stack-trace"
                    />
                  {:else}
                    <CodeBlock
                      content={location.functionName}
                      language="ts"
                      dataCy="query-stack-trace"
                    />
                  {/if}
                {/each}
              </div>
              <br />
            {/each}
          </div>
        {:else}
          <div class="text-center">
            <EmptyState title="The SDK is not supported yet." />
          </div>
        {/if}
      {:else}
        <div class="flex items-start h-full">
          <CodeBlock
            content={result}
            language="text"
            dataCy="query-stack-trace"
          />
        </div>
      {/if}
    {:catch _error}
      <EmptyState
        title="An Error Occured"
        content="Please make sure you have at least one worker running."
      />
    {/await}
  {:else}
    <EmptyState title="No Stack Traces Found" dataCy="query-stack-trace-empty">
      {#if workflow.isRunning && workers?.pollers?.length === 0}
        <p>
          To enable <Link
            href="https://docs.temporal.io/concepts/what-is-a-query/#stack-trace-query"
            >stack traces</Link
          >, run a Worker on the {workflow?.taskQueue} Task Queue.
        </p>
      {/if}
    </EmptyState>
  {/if}
</section>
