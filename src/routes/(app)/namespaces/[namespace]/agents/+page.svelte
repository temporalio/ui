<script lang="ts">
  import PageTitle from '$lib/components/page-title.svelte';
  import Button from '$lib/holocene/button.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import {
    IconArrowUpRight,
    IconBook,
    IconCode,
    type IconComponent,
    IconExternalLink,
    IconGithub,
    IconGoColorblock,
    IconJavaColorblock,
    IconPlaySolid,
    IconPythonColorblock,
    IconStarAi,
    IconTerminal,
    IconToolbox,
    IconTypescriptColorblock,
  } from '$lib/io/icon';
  import ziggy from '$lib/vendor/ziggy-full-face.png';

  type ResourceLink = {
    label: string;
    href: string;
  };

  type Resource = {
    name: string;
    links: ResourceLink[];
  };

  type Language = 'All' | 'Python' | 'TypeScript' | 'Java' | 'Go';

  const languages: { name: Language; Icon: IconComponent }[] = [
    { name: 'All', Icon: IconCode },
    { name: 'Python', Icon: IconPythonColorblock },
    { name: 'TypeScript', Icon: IconTypescriptColorblock },
    { name: 'Java', Icon: IconJavaColorblock },
    { name: 'Go', Icon: IconGoColorblock },
  ];

  let activeLanguage = $state<Language>('All');

  const visibleLinks = (resource: Resource) =>
    activeLanguage === 'All'
      ? resource.links
      : resource.links.filter((link) =>
          link.label.toLowerCase().includes(activeLanguage.toLowerCase()),
        );

  type FlowNode = {
    id: 'input' | 'runtime' | 'model' | 'tools' | 'approval' | 'events';
    label: string;
    state: string;
    detail: string;
  };

  const flowNodes: FlowNode[] = [
    {
      id: 'input',
      label: 'Agent turn',
      state: 'Input',
      detail: 'A user message starts a durable turn.',
    },
    {
      id: 'runtime',
      label: 'Agent runtime',
      state: 'Running',
      detail: 'Temporal preserves execution state across any length of time.',
    },
    {
      id: 'model',
      label: 'Model call',
      state: 'Complete',
      detail: 'Use any model while Temporal records the durable sequence.',
    },
    {
      id: 'tools',
      label: 'Tool execution',
      state: 'Running',
      detail: 'Tools execute inside retryable, observable workflow steps.',
    },
    {
      id: 'approval',
      label: 'Human approval',
      state: 'Awaiting',
      detail: 'Policy gates pause safely until a person approves the action.',
    },
    {
      id: 'events',
      label: 'AgentEvents',
      state: 'Streaming',
      detail:
        'Structured events expose turns, messages, tools, and sub-agents.',
    },
  ];

  let activeFlowId = $state<FlowNode['id']>('runtime');
  let activeFlowNode = $derived(
    flowNodes.find((node) => node.id === activeFlowId) ?? flowNodes[0],
  );

  const integrations: Resource[] = [
    {
      name: 'AI SDK by Vercel',
      links: [
        {
          label: 'TypeScript',
          href: 'https://github.com/temporalio/samples-typescript/tree/main/ai-sdk',
        },
      ],
    },
    {
      name: 'Braintrust AI Observability',
      links: [
        {
          label: 'Python',
          href: 'https://www.braintrust.dev/docs/cookbook/recipes/TemporalDeepResearch',
        },
      ],
    },
    {
      name: 'Deep Agents',
      links: [
        {
          label: 'Python',
          href: 'https://docs.temporal.io/develop/python/integrations/deepagents',
        },
      ],
    },
    {
      name: 'Google ADK',
      links: [
        {
          label: 'Python',
          href: 'https://docs.temporal.io/develop/python/integrations/google-adk',
        },
        {
          label: 'Go',
          href: 'https://docs.temporal.io/develop/go/integrations/google-adk',
        },
      ],
    },
    {
      name: 'Google GenAI integration',
      links: [
        {
          label: 'Python',
          href: 'https://docs.temporal.io/develop/python/integrations/google-genai',
        },
      ],
    },
    {
      name: 'LangGraph integration',
      links: [
        {
          label: 'Python',
          href: 'https://docs.temporal.io/develop/python/integrations/langgraph',
        },
      ],
    },
    {
      name: 'Mastra Agent Framework',
      links: [
        {
          label: 'TypeScript',
          href: 'https://mastra.ai/integrations/deploy/temporal',
        },
      ],
    },
    {
      name: 'OpenAI Agents SDK',
      links: [
        {
          label: 'Python',
          href: 'https://docs.temporal.io/develop/python/integrations/openai-agents',
        },
        {
          label: 'TypeScript',
          href: 'https://docs.temporal.io/develop/typescript/integrations/openai-agents',
        },
      ],
    },
    {
      name: 'OpenBox',
      links: [
        {
          label: 'Python',
          href: 'https://docs.openbox.ai/getting-started/temporal/temporal-101',
        },
      ],
    },
    {
      name: 'Parseable Observability Integration',
      links: [
        {
          label: 'Python, TypeScript, Java',
          href: 'https://www.parseable.com/docs/ingest-data/ai-agents/temporal',
        },
      ],
    },
    {
      name: 'Pydantic AI',
      links: [
        {
          label: 'Python',
          href: 'https://ai.pydantic.dev/durable_execution/temporal/',
        },
      ],
    },
    {
      name: 'Spring AI',
      links: [
        {
          label: 'Java',
          href: 'https://docs.temporal.io/develop/java/integrations/spring-ai',
        },
      ],
    },
    {
      name: 'Strands Agent',
      links: [
        {
          label: 'Python',
          href: 'https://docs.temporal.io/develop/python/integrations/strands-agents',
        },
        {
          label: 'TypeScript',
          href: 'https://docs.temporal.io/develop/typescript/integrations/strands-agents',
        },
      ],
    },
    {
      name: 'Tenuo Integration',
      links: [
        {
          label: 'Python',
          href: 'https://tenuo.ai/temporal',
        },
      ],
    },
    {
      name: 'Trace Temporal Workflows with Langfuse',
      links: [
        {
          label: 'Python',
          href: 'https://langfuse.com/integrations/frameworks/temporal',
        },
      ],
    },
    {
      name: 'Tuning Engines Integration',
      links: [
        {
          label: 'Python',
          href: 'https://app.tuningengines.com/docs/orchestration',
        },
      ],
    },
  ];

  const skills: Resource[] = [
    {
      name: 'Temporal Developer Skill',
      links: [
        {
          label: 'GitHub',
          href: 'https://github.com/temporalio/skill-temporal-developer',
        },
      ],
    },
    {
      name: 'Claude',
      links: [
        {
          label: 'Plugin',
          href: 'https://github.com/temporalio/claude-temporal-plugin',
        },
      ],
    },
    {
      name: 'Codex',
      links: [
        {
          label: 'Plugin',
          href: 'https://github.com/temporalio/codex-temporal-plugin',
        },
      ],
    },
    {
      name: 'Cursor',
      links: [
        {
          label: 'Plugin',
          href: 'https://github.com/temporalio/cursor-temporal-plugin',
        },
      ],
    },
    {
      name: 'Knowledgebase MCP Server',
      links: [
        {
          label: 'Open server',
          href: 'https://temporal.mcp.kapa.ai',
        },
      ],
    },
  ];

  const cookbooks = [
    {
      name: 'AI Cookbooks',
      description:
        'Patterns and recipes for building AI applications with Temporal.',
      href: 'https://docs.temporal.io/ai/cookbook',
      linkLabel: 'Browse recipes',
    },
    {
      name: 'Temporal AI Agent Demo',
      description: 'A multi-turn agent with native tools and MCP tools.',
      href: 'https://github.com/temporal-community/temporal-ai-agent',
      linkLabel: 'View repository',
      videoHref: 'https://www.youtube.com/watch?v=GEXllEH2XiQ',
    },
    {
      name: 'OpenAI Agents Demo',
      description: 'Four examples of OpenAI Agents SDK with durable execution.',
      href: 'https://github.com/temporal-community/openai-agents-demos',
      linkLabel: 'View repository',
      videoHref: 'https://www.youtube.com/watch?v=fFBZqzT4DD8',
    },
    {
      name: 'Durable React Agent Gemini',
      description: 'A durable agent loop using Gemini and Temporal.',
      href: 'https://github.com/temporal-community/durable-react-agent-gemini',
      linkLabel: 'View repository',
    },
    {
      name: 'Durable MCP',
      description: 'Durable Model Context Protocol workflows and examples.',
      href: 'https://github.com/temporal-community/durable-mcp',
      linkLabel: 'View repository',
    },
  ];
</script>

<PageTitle title="Agents | Temporal" />

<svelte:head>
  <meta
    name="description"
    content="Build durable AI agents on Temporal with integrations, skills, cookbooks, demos, and the experimental Temporal Agent Harness."
  />
</svelte:head>

<div class="min-h-full flex-none overflow-visible bg-primary text-primary">
  <main
    class="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pb-20 pt-4 md:px-8 md:pt-8 lg:pt-[3.625rem]"
  >
    <section
      class="relative overflow-hidden rounded-xl border border-subtle bg-primary md:min-h-[30rem] lg:min-h-[36rem]"
      aria-labelledby="agents-heading"
    >
      <div class="relative z-20 w-full p-6 md:w-[48%] md:py-16 md:pl-16">
        <p class="mb-3 text-xs font-medium text-subtle">
          Durable execution for agents
        </p>
        <h1 id="agents-heading">Build Durable AI Agents on Temporal</h1>
        <p class="mt-3 max-w-[30rem] text-sm leading-relaxed text-secondary">
          Orchestrate your workflows, AI apps, and agents across any models,
          tools, systems, and length of time. Reliably complete complex work at
          any scale with Durable Execution.
        </p>
        <div class="mt-6 flex flex-wrap gap-2">
          <Button class="rounded-sm text-sm" href="#integrations" size="sm">
            Explore integrations
            <IconArrowUpRight class="size-4" />
          </Button>
          <Button
            class="rounded-sm border-secondary bg-primary text-sm"
            href="https://github.com/temporal-community/temporal-agent-harness"
            variant="secondary"
            size="sm"
            target="_blank"
          >
            <IconGithub class="size-4" />
            Open Agent Harness
          </Button>
        </div>
      </div>

      <figure
        class="relative z-10 mx-4 mb-4 overflow-hidden rounded-lg border border-interactive bg-code-block opacity-90 shadow-2xl transition-[opacity,border-color] duration-200 focus-within:border-interactive-hover focus-within:opacity-100 hover:border-interactive-hover hover:opacity-100 md:absolute md:right-4 md:top-6 md:m-0 md:w-[60%] md:max-w-3xl md:opacity-70 lg:right-6 lg:w-[63%]"
      >
        <div
          class="flex h-9 items-center justify-between border-b border-subtle bg-secondary px-3 font-mono text-[0.6875rem] uppercase tracking-wider text-subtle"
        >
          <span>State flow</span>
          <span>Select a node</span>
        </div>

        <div
          class="relative grid grid-cols-2 gap-px bg-code-block p-px md:block md:aspect-[720/430] md:min-h-[15.5rem] md:overflow-hidden md:border-y md:border-subtle md:p-0"
        >
          <svg
            class="pointer-events-none absolute inset-0 hidden size-full md:block"
            viewBox="0 0 720 430"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              class="{activeFlowId === 'runtime' || activeFlowId === 'input'
                ? 'stroke-current text-brand'
                : 'stroke-current text-subtle'} fill-none transition-colors duration-200"
              d="M144 200H180"
              stroke-width="1.5"
              stroke-linecap="square"
              stroke-linejoin="miter"
              vector-effect="non-scaling-stroke"
            />
            <path
              class="{activeFlowId === 'runtime' || activeFlowId === 'model'
                ? 'stroke-current text-brand'
                : 'stroke-current text-subtle'} fill-none transition-colors duration-200"
              d="M425 154H452V62H486"
              stroke-width="1.5"
              stroke-linecap="square"
              stroke-linejoin="miter"
              vector-effect="non-scaling-stroke"
            />
            <path
              class="{activeFlowId === 'runtime' || activeFlowId === 'tools'
                ? 'stroke-current text-brand'
                : 'stroke-current text-subtle'} fill-none transition-colors duration-200"
              d="M425 200H486"
              stroke-width="1.5"
              stroke-linecap="square"
              stroke-linejoin="miter"
              vector-effect="non-scaling-stroke"
            />
            <path
              class="{activeFlowId === 'runtime' || activeFlowId === 'approval'
                ? 'stroke-current text-brand'
                : 'stroke-current text-subtle'} fill-none transition-colors duration-200"
              d="M425 226H452V320H486"
              stroke-width="1.5"
              stroke-linecap="square"
              stroke-linejoin="miter"
              vector-effect="non-scaling-stroke"
            />
            <path
              class="{activeFlowId === 'runtime' || activeFlowId === 'events'
                ? 'stroke-current text-brand'
                : 'stroke-current text-subtle'} fill-none transition-colors duration-200"
              d="M302 252V335"
              stroke-width="1.5"
              stroke-linecap="square"
              stroke-linejoin="miter"
              vector-effect="non-scaling-stroke"
            />
          </svg>

          {#each flowNodes as node (node.id)}
            <button
              class="relative grid min-h-[4.5rem] cursor-pointer content-center gap-1 border border-subtle bg-secondary p-3 text-left text-primary transition-[transform,background-color,border-color] duration-200 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
                {node.id === 'input'
                ? 'md:absolute md:left-[2%] md:top-[40%] md:w-[18%]'
                : ''}
                {node.id === 'runtime'
                ? 'col-span-2 min-h-[6.5rem] grid-cols-[3.5rem_minmax(0,1fr)] grid-rows-2 gap-x-3.5 md:absolute md:left-[25%] md:top-[27%] md:min-h-[8.5rem] md:w-[34%] md:p-4'
                : ''}
                {node.id === 'model'
                ? 'md:absolute md:left-[67.5%] md:top-[8%] md:w-[29%]'
                : ''}
                {node.id === 'tools'
                ? 'md:absolute md:left-[67.5%] md:top-[40%] md:w-[29%]'
                : ''}
                {node.id === 'approval'
                ? 'md:absolute md:left-[67.5%] md:top-[68%] md:w-[29%]'
                : ''}
                {node.id === 'events'
                ? 'md:absolute md:left-[30%] md:top-[78%] md:w-[24%]'
                : ''}
                {activeFlowId === node.id
                ? '-translate-y-px border-interactive bg-interactive-secondary-active ring-1 ring-primary'
                : 'hover:border-primary'}"
              type="button"
              aria-pressed={activeFlowId === node.id}
              onclick={() => (activeFlowId = node.id)}
              onfocus={() => (activeFlowId = node.id)}
              onmouseenter={() => (activeFlowId = node.id)}
            >
              {#if node.id === 'runtime'}
                <span
                  class="row-span-2 grid size-14 place-items-center self-center border border-interactive bg-information text-brand"
                  aria-hidden="true"
                >
                  <IconStarAi class="size-6" />
                  <span
                    class="font-mono text-[0.5rem] font-semibold tracking-[0.12em] text-brand"
                    >LLM</span
                  >
                </span>
              {/if}
              <span
                class="self-end font-mono text-[0.5625rem] uppercase tracking-wider text-subtle {node.id ===
                'runtime'
                  ? 'col-start-2'
                  : ''}">{node.state}</span
              >
              <strong
                class="self-start text-[0.6875rem] font-medium {node.id ===
                'runtime'
                  ? 'col-start-2 text-sm'
                  : ''}">{node.label}</strong
              >
            </button>
          {/each}
        </div>

        <figcaption
          class="grid min-h-14 grid-cols-1 gap-1 border-t border-subtle bg-secondary px-3 py-2.5 text-[0.6875rem] leading-relaxed text-subtle sm:grid-cols-[minmax(7rem,0.6fr)_minmax(0,1.4fr)]"
          aria-live="polite"
        >
          <span class="font-medium text-primary">{activeFlowNode.label}</span>
          <span>{activeFlowNode.detail}</span>
        </figcaption>
      </figure>
    </section>

    <section
      id="integrations"
      class="border-t border-subtle pt-8"
      aria-labelledby="get-started-heading"
    >
      <header class="mb-5 flex items-start justify-between gap-8">
        <div class="max-w-xl">
          <h2 id="get-started-heading">Get started</h2>
          <p class="mt-2 text-sm leading-relaxed text-secondary">
            <strong class="font-medium text-primary"
              >Temporal runs underneath the SDK you already use.</strong
            >
            Pick your framework and language to get a working durable agent from the
            integration guide.
          </p>
        </div>
      </header>

      <div
        class="mb-4 flex w-fit max-w-full overflow-x-auto rounded border border-subtle [scrollbar-width:none]"
        aria-label="Filter integrations by language"
      >
        {#each languages as language (language.name)}
          {@const LanguageIcon = language.Icon}
          <ToggleButton
            class="h-10 min-w-max rounded-none border-y-0 border-l-0 border-r border-subtle px-3 text-sm last:border-r-0 {activeLanguage ===
            language.name
              ? 'bg-subtle text-primary'
              : 'bg-primary text-secondary hover:bg-interactive-secondary-hover'}"
            active={activeLanguage === language.name}
            size="sm"
            onclick={() => (activeLanguage = language.name)}
            aria-label={'Show ' + language.name + ' integrations'}
          >
            <span
              class="inline-flex size-6 flex-none items-center justify-center {language.name ===
              'All'
                ? 'border border-secondary bg-subtle text-subtle'
                : ''}"
              aria-hidden="true"
            >
              <LanguageIcon
                class={language.name === 'All' ? 'size-4' : 'size-6'}
              />
            </span>
            {language.name}
          </ToggleButton>
        {/each}
      </div>

      <div
        class="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-subtle bg-subtle sm:grid-cols-2 lg:grid-cols-4"
      >
        {#each integrations as integration, index (integration.name)}
          {@const filteredLinks = visibleLinks(integration)}
          {#if filteredLinks.length}
            <article
              class="grid min-h-[7.75rem] grid-cols-[1.5rem_minmax(0,1fr)] grid-rows-[auto_1fr] content-start gap-x-2 gap-y-2.5 bg-primary p-4 transition-colors duration-200 hover:bg-interactive-secondary-hover"
            >
              <span class="font-mono text-[0.625rem] text-subtle"
                >{String(index + 1).padStart(2, '0')}</span
              >
              <h3>{integration.name}</h3>
              <div
                class="col-start-2 flex flex-wrap items-end gap-1.5 self-end"
              >
                {#each filteredLinks as link (link.href + link.label)}
                  <a
                    class="inline-flex min-h-7 items-center gap-1.5 rounded-sm border border-subtle bg-information px-2 py-1 text-[0.6875rem] text-brand no-underline hover:border-interactive-hover hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>{link.label}</span>
                    <IconExternalLink class="size-3.5" />
                  </a>
                {/each}
              </div>
            </article>
          {/if}
        {/each}
      </div>
    </section>

    <section
      id="agent-harness"
      class="relative min-h-[30.3125rem] overflow-hidden rounded-xl border border-subtle bg-primary"
      aria-labelledby="harness-heading"
    >
      <div
        class="pointer-events-none absolute inset-x-[31%] bottom-[-10rem] top-28 w-[75%] bg-subtle opacity-50"
        aria-hidden="true"
      ></div>

      <div
        class="relative z-10 flex h-12 items-center justify-between gap-4 px-6 text-xs text-subtle"
      >
        <span class="flex min-w-0 items-center gap-2 truncate"
          ><IconGithub class="size-4 shrink-0" />
          temporal-community / temporal-agent-harness</span
        >
        <span>Experimental</span>
      </div>

      <div
        class="relative z-10 grid gap-8 px-6 pb-6 md:grid-cols-[minmax(0,0.85fr)_minmax(28rem,1.15fr)]"
      >
        <div class="self-start py-3">
          <div
            class="mb-2 flex items-center gap-2 text-[0.6875rem] text-subtle"
          >
            <img class="size-6 object-contain" src={ziggy} alt="" />
            <span>New from Temporal</span>
          </div>
          <h2 id="harness-heading">Temporal Agent Harness</h2>
          <p class="mt-2 max-w-lg text-sm leading-relaxed text-secondary">
            A durable agent harness and a matching session UI in one repository.
            The harness adds durable turns, tool-approval policies, and a
            structured AgentEvents stream.
          </p>
          <Button
            class="mt-6 rounded-sm text-sm"
            href="https://github.com/temporal-community/temporal-agent-harness"
            size="sm"
            target="_blank"
          >
            <IconGithub class="size-4" />
            Open repository
            <IconArrowUpRight class="size-4" />
          </Button>
        </div>

        <div
          class="mt-0 overflow-hidden rounded-lg border border-interactive bg-secondary p-4 shadow-2xl md:mt-24"
        >
          <p
            class="mb-4 font-mono text-[0.6875rem] leading-relaxed text-subtle"
          >
            The UI reads the event stream and shows agents in agent language:
            turns, messages, tool calls, sub-agents, and live operational state.
          </p>
          <ul class="grid border border-b-0 border-subtle">
            <li
              class="grid min-h-[3.75rem] grid-cols-[2rem_1fr] items-center gap-2 border-b border-subtle bg-secondary px-3 py-2.5 transition-[transform,background-color] duration-200 hover:-translate-x-1 hover:bg-interactive-secondary-hover"
            >
              <span class="font-mono text-[0.625rem] text-success">01</span>
              <div>
                <strong class="block text-xs font-medium text-primary"
                  >Durable turns</strong
                >
                <small class="mt-0.5 block text-[0.6875rem] text-subtle"
                  >Resume work after failures or long waits.</small
                >
              </div>
            </li>
            <li
              class="grid min-h-[3.75rem] grid-cols-[2rem_1fr] items-center gap-2 border-b border-subtle bg-secondary px-3 py-2.5 transition-[transform,background-color] duration-200 hover:-translate-x-1 hover:bg-interactive-secondary-hover"
            >
              <span class="font-mono text-[0.625rem] text-success">02</span>
              <div>
                <strong class="block text-xs font-medium text-primary"
                  >Tool approvals</strong
                >
                <small class="mt-0.5 block text-[0.6875rem] text-subtle"
                  >Pause safely at policy and human gates.</small
                >
              </div>
            </li>
            <li
              class="grid min-h-[3.75rem] grid-cols-[2rem_1fr] items-center gap-2 border-b border-subtle bg-secondary px-3 py-2.5 transition-[transform,background-color] duration-200 hover:-translate-x-1 hover:bg-interactive-secondary-hover"
            >
              <span class="font-mono text-[0.625rem] text-success">03</span>
              <div>
                <strong class="block text-xs font-medium text-primary"
                  >Structured AgentEvents</strong
                >
                <small class="mt-0.5 block text-[0.6875rem] text-subtle"
                  >Stream a consistent record of agent activity.</small
                >
              </div>
            </li>
            <li
              class="grid min-h-[3.75rem] grid-cols-[2rem_1fr] items-center gap-2 border-b border-subtle bg-secondary px-3 py-2.5 transition-[transform,background-color] duration-200 hover:-translate-x-1 hover:bg-interactive-secondary-hover"
            >
              <span class="font-mono text-[0.625rem] text-success">04</span>
              <div>
                <strong class="block text-xs font-medium text-primary"
                  >Live session UI</strong
                >
                <small class="mt-0.5 block text-[0.6875rem] text-subtle"
                  >Inspect messages, tools, sub-agents, and state.</small
                >
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section
      id="skills"
      class="border-t border-subtle pt-8"
      aria-labelledby="skills-heading"
    >
      <header
        class="mb-5 flex flex-col items-start justify-between gap-2 md:flex-row md:gap-8"
      >
        <div class="flex items-center gap-2">
          <IconToolbox class="size-6" />
          <h2 id="skills-heading">Temporal skills</h2>
        </div>
        <p class="max-w-xl text-sm leading-relaxed text-secondary">
          Give your coding agent direct access to Temporal development guidance
          and the Temporal knowledge base.
        </p>
      </header>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {#each skills as skill (skill.name)}
          {#each skill.links as link (link.href)}
            <a
              class="grid min-h-[5.25rem] grid-cols-[1.25rem_1fr_auto] items-start gap-3 rounded-lg border border-subtle bg-primary p-4 text-primary no-underline transition-colors duration-200 hover:border-interactive-hover hover:bg-interactive-secondary-hover hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              href={link.href}
              target="_blank"
              rel="noreferrer"
            >
              <IconTerminal class="size-4" />
              <span>
                <strong class="block text-sm font-medium">{skill.name}</strong>
                <small class="block text-[0.6875rem] text-subtle"
                  >{link.label}</small
                >
              </span>
              <span
                class="flex items-center gap-1 text-[0.6875rem] text-subtle"
              >
                Open resource
                <IconExternalLink class="size-3.5" />
              </span>
            </a>
          {/each}
        {/each}
      </div>
    </section>

    <section
      id="cookbooks"
      class="border-t border-subtle pt-8"
      aria-labelledby="cookbooks-heading"
    >
      <header
        class="mb-5 flex flex-col items-start justify-between gap-2 md:flex-row md:gap-8"
      >
        <div>
          <h2 id="cookbooks-heading">Cookbooks and demos</h2>
        </div>
        <p class="max-w-xl text-sm leading-relaxed text-secondary">
          Start from working code, then adapt the durable agent pattern to your
          application.
        </p>
      </header>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {#each cookbooks as cookbook, index (cookbook.name)}
          <article
            class="grid min-h-[8.5rem] grid-cols-[1.25rem_minmax(0,1fr)] grid-rows-[1fr_auto] items-start gap-2 rounded-lg border border-subtle bg-primary p-4 transition-colors duration-200 hover:border-interactive-hover hover:bg-interactive-secondary-hover"
          >
            <span class="font-mono text-[0.625rem] text-subtle"
              >{String(index + 1).padStart(2, '0')}</span
            >
            <div class="col-start-2">
              <div class="flex items-center gap-2">
                {#if index === 0}
                  <IconBook class="size-5" />
                {:else}
                  <IconCode class="size-5" />
                {/if}
                <h3>{cookbook.name}</h3>
              </div>
              <p class="mt-1.5 text-xs leading-relaxed text-subtle">
                {cookbook.description}
              </p>
            </div>
            <div class="col-start-2 flex flex-wrap gap-x-3 gap-y-1">
              <a
                class="inline-flex items-center gap-1 text-[0.6875rem] text-brand no-underline hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                href={cookbook.href}
                target="_blank"
                rel="noreferrer"
              >
                {cookbook.linkLabel}
                <IconExternalLink class="size-3.5" />
              </a>
              {#if cookbook.videoHref}
                <a
                  class="inline-flex items-center gap-1 text-[0.6875rem] text-brand no-underline hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  href={cookbook.videoHref}
                  target="_blank"
                  rel="noreferrer"
                >
                  <IconPlaySolid class="size-3.5" />
                  Watch demo
                </a>
              {/if}
            </div>
          </article>
        {/each}
      </div>
    </section>
  </main>
</div>
