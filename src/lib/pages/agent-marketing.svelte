<script lang="ts">
  import agentHarnessDemo from '$lib/assets/agents/agent-harness-demo.mp4';
  import agentHarnessPreview from '$lib/assets/agents/agent-harness-preview.jpg';
  import integrationBraintrust from '$lib/assets/agents/integration-braintrust.svg';
  import integrationDeepAgents from '$lib/assets/agents/integration-deep-agents.svg';
  import integrationGoogleAdk from '$lib/assets/agents/integration-google-adk.svg';
  import integrationLangsmith from '$lib/assets/agents/integration-langsmith.svg';
  import integrationMastra from '$lib/assets/agents/integration-mastra.svg';
  import integrationOpenai from '$lib/assets/agents/integration-openai.svg';
  import integrationOpenbox from '$lib/assets/agents/integration-openbox.svg';
  import integrationParseable from '$lib/assets/agents/integration-parseable.svg';
  import integrationPydantic from '$lib/assets/agents/integration-pydantic.svg';
  import integrationSpringAi from '$lib/assets/agents/integration-spring-ai.svg';
  import integrationStrands from '$lib/assets/agents/integration-strands.svg';
  import integrationTenuo from '$lib/assets/agents/integration-tenuo.svg';
  import integrationTuningEngines from '$lib/assets/agents/integration-tuning-engines.svg';
  import integrationVercel from '$lib/assets/agents/integration-vercel.svg';
  import PageTitle from '$lib/components/page-title.svelte';
  import Button from '$lib/holocene/button.svelte';
  import { Badge } from '$lib/io/badge';
  import { IconCheckmark, IconCopy, IconPlaySolid } from '$lib/io/icon';
  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';

  type Language = 'Python' | 'TypeScript' | 'Java' | 'Go';

  type IntegrationLink = {
    href: string;
    languages: Language[];
  };

  type Integration = {
    name: string;
    logo: string;
    links: IntegrationLink[];
  };

  type ResourceLink = {
    name: string;
    href: string;
  };

  const integrations: Integration[] = [
    {
      name: 'Braintrust AI Observability',
      logo: integrationBraintrust,
      links: [
        {
          href: 'https://www.braintrust.dev/docs/cookbook/recipes/TemporalDeepResearch',
          languages: ['Python'],
        },
      ],
    },
    {
      name: 'Google ADK',
      logo: integrationGoogleAdk,
      links: [
        {
          href: 'https://docs.temporal.io/develop/python/integrations/google-adk',
          languages: ['Python'],
        },
        {
          href: 'https://docs.temporal.io/develop/go/integrations/google-adk',
          languages: ['Go'],
        },
      ],
    },
    {
      name: 'OpenAI Agents SDK',
      logo: integrationOpenai,
      links: [
        {
          href: 'https://docs.temporal.io/develop/python/integrations/openai-agents',
          languages: ['Python'],
        },
        {
          href: 'https://docs.temporal.io/develop/typescript/integrations/openai-agents',
          languages: ['TypeScript'],
        },
      ],
    },
    {
      name: 'Pydantic AI',
      logo: integrationPydantic,
      links: [
        {
          href: 'https://ai.pydantic.dev/durable_execution/temporal/',
          languages: ['Python'],
        },
      ],
    },
    {
      name: 'AI SDK by Vercel',
      logo: integrationVercel,
      links: [
        {
          href: 'https://github.com/temporalio/samples-typescript/tree/main/ai-sdk',
          languages: ['TypeScript'],
        },
      ],
    },
    {
      name: 'Langfuse',
      logo: integrationDeepAgents,
      links: [
        {
          href: 'https://langfuse.com/integrations/frameworks/temporal',
          languages: ['Python'],
        },
      ],
    },
    {
      name: 'Mastra Agent Framework',
      logo: integrationMastra,
      links: [
        {
          href: 'https://mastra.ai/integrations/deploy/temporal',
          languages: ['TypeScript'],
        },
      ],
    },
    {
      name: 'OpenBox',
      logo: integrationOpenbox,
      links: [
        {
          href: 'https://docs.openbox.ai/getting-started/temporal/temporal-101',
          languages: ['Python'],
        },
      ],
    },
    {
      name: 'Strands Agent',
      logo: integrationStrands,
      links: [
        {
          href: 'https://docs.temporal.io/develop/python/integrations/strands-agents',
          languages: ['Python'],
        },
        {
          href: 'https://docs.temporal.io/develop/typescript/integrations/strands-agents',
          languages: ['TypeScript'],
        },
      ],
    },
    {
      name: 'Parseable Observability',
      logo: integrationParseable,
      links: [
        {
          href: 'https://www.parseable.com/docs/ingest-data/ai-agents/temporal',
          languages: ['Python', 'TypeScript', 'Java'],
        },
      ],
    },
    {
      name: 'Spring AI',
      logo: integrationSpringAi,
      links: [
        {
          href: 'https://docs.temporal.io/develop/java/integrations/spring-ai',
          languages: ['Java'],
        },
      ],
    },
    {
      name: 'Tenuo Integration',
      logo: integrationTenuo,
      links: [
        {
          href: 'https://tenuo.ai/temporal',
          languages: ['Python'],
        },
      ],
    },
    {
      name: 'Tuning Engines',
      logo: integrationTuningEngines,
      links: [
        {
          href: 'https://app.tuningengines.com/docs/orchestration',
          languages: ['Python'],
        },
      ],
    },
    {
      name: 'LangGraph',
      logo: integrationLangsmith,
      links: [
        {
          href: 'https://docs.temporal.io/develop/python/integrations/langgraph',
          languages: ['Python'],
        },
      ],
    },
  ];

  const onboardingPrompt =
    'Fetch and follow the instructions at https://github.com/temporal-community/temporal-agent-harness/blob/main/README.md and get the monty example agent running';
  const { copy, copied } = copyToClipboard();
  let agentHarnessVideo: HTMLVideoElement;
  let agentHarnessDemoStarted = $state(false);

  const playAgentHarnessDemo = () => {
    void agentHarnessVideo
      .play()
      .catch(() => (agentHarnessDemoStarted = false));
  };

  const resetAgentHarnessDemo = () => {
    agentHarnessDemoStarted = false;
    agentHarnessVideo.load();
  };

  const copyOnboardingPrompt = (event: MouseEvent) => {
    copy(event, onboardingPrompt);
  };

  const cookbooks: ResourceLink[] = [
    {
      name: 'AI Cookbooks',
      href: 'https://docs.temporal.io/ai/cookbook',
    },
    {
      name: 'Temporal AI Agent Demo',
      href: 'https://github.com/temporal-community/temporal-ai-agent',
    },
    {
      name: 'OpenAI Agent Demo',
      href: 'https://github.com/temporal-community/openai-agents-demos',
    },
    {
      name: 'Durable React Agent',
      href: 'https://github.com/temporal-community/durable-react-agent-gemini',
    },
    {
      name: 'Durable MCP',
      href: 'https://github.com/temporal-community/durable-mcp',
    },
  ];
</script>

<PageTitle title="Agents | Temporal" />
<div
  class="agents-page surface-background min-h-full flex-none overflow-x-hidden"
>
  <header class="pb-4 text-base"><p>Agents</p></header>
  <main class="w-full">
    <div
      class="grid w-full items-start gap-5 min-[1400px]:grid-cols-[minmax(0,1fr)_18.4375rem]"
    >
      <div class="min-w-0 space-y-5">
        <section
          class="border-subtle bg-primary overflow-hidden rounded-lg border p-6 md:p-8"
          aria-labelledby="agents-heading"
        >
          <div class="mb-8 space-y-1 md:mb-12">
            <h1 id="agents-heading">
              <span class="block text-xl font-normal leading-7"
                >Build Durable AI Agents on Temporal</span
              >
            </h1>
            <p class="text-sm leading-5 text-secondary">
              Orchestrate your workflows, AI apps, and agents across any models,
              tools, systems, and length of time.
            </p>
          </div>

          <div class="grid items-start gap-8 lg:grid-cols-2 lg:justify-between">
            <div class="max-w-[25rem]">
              <Badge colorScheme="warning" text="EXPERIMENTAL"></Badge>
              <div class="mt-2 space-y-4">
                <div class="space-y-1">
                  <h2>
                    <span class="block text-base font-normal leading-6"
                      >Temporal Agent Harness</span
                    >
                  </h2>
                  <p class="text-base leading-6 text-secondary">
                    A durable agent harness and a matching session UI in one
                    repo. The harness adds durable turns, tool-approval
                    policies, and a structured AgentEvents stream; the UI reads
                    that stream and shows your agents in agent language, turns,
                    messages, tool calls, sub-agents, and live operational
                    state.
                  </p>
                </div>
                <Button
                  href="https://github.com/temporal-community/temporal-agent-harness"
                  target="_blank"
                  size="xs"
                  aria-label="Open Agent Harness"
                >
                  Go to Github
                </Button>
              </div>
            </div>

            <figure
              class="border-subtle bg-code-block relative aspect-[812/480] min-w-0 overflow-hidden rounded-lg border"
            >
              <video
                id="agent-harness-demo"
                bind:this={agentHarnessVideo}
                class="absolute inset-0 size-full object-cover"
                class:opacity-60={!agentHarnessDemoStarted}
                poster={agentHarnessPreview}
                preload="metadata"
                playsinline
                controls={agentHarnessDemoStarted}
                aria-label="Temporal Agent Harness session UI demo showing agent events and execution state"
                onplay={() => (agentHarnessDemoStarted = true)}
                onended={resetAgentHarnessDemo}
              >
                <source src={agentHarnessDemo} type="video/mp4" />
              </video>
              {#if !agentHarnessDemoStarted}
                <div
                  class="from-code-block/90 to-code-block/20 pointer-events-none absolute inset-0 bg-gradient-to-b"
                  aria-hidden="true"
                ></div>
                <Button
                  class="bg-secondary/80 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  onclick={playAgentHarnessDemo}
                  variant="secondary"
                  size="md"
                  aria-controls="agent-harness-demo"
                  aria-label="Play the Temporal Agent Harness demo"
                >
                  <IconPlaySolid class="size-5" />
                  Watch Demo
                </Button>
              {/if}
            </figure>
          </div>
        </section>

        <div class="grid gap-5 md:grid-cols-[1.049fr_1fr]">
          <section
            class="border-subtle bg-primary flex flex-col gap-4 rounded-lg border p-6 md:p-8"
            aria-labelledby="skills-heading"
          >
            <h2 id="skills-heading">
              <span class="block text-base font-normal leading-6"
                >Temporal Skills</span
              >
            </h2>
            <p class="text-base leading-6 text-secondary">
              Install the developer skill in the assistant you already code
              with, and point it at the knowledgebase for answers grounded in
              Temporal docs.
            </p>
            <button
              class="bg-secondary/50 hover:bg-secondary group relative flex max-w-fit items-center overflow-hidden rounded-sm border border-secondary font-mono text-xs leading-4 text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:h-6"
              type="button"
              aria-label={$copied
                ? 'Onboarding prompt copied'
                : 'Copy onboarding prompt'}
              title={$copied
                ? 'Onboarding prompt copied'
                : 'Copy onboarding prompt'}
              onclick={copyOnboardingPrompt}
            >
              <span class="min-w-fit px-3">Onboard with your coding agent</span>
              <span
                class="bg-secondary grid size-11 shrink-0 place-items-center group-hover:bg-interactive-secondary-hover md:size-6"
                aria-hidden="true"
              >
                {#if $copied}
                  <IconCheckmark class="size-3" />
                {:else}
                  <IconCopy class="size-3" />
                {/if}
              </span>
            </button>
          </section>

          <section
            class="border-subtle bg-primary min-h-[20.75rem] rounded-lg border p-6 md:p-8"
            aria-labelledby="cookbooks-heading"
          >
            <h2 id="cookbooks-heading">
              <span class="block text-base font-normal leading-6"
                >Cookbooks and Demos</span
              >
            </h2>
            <p
              class="mt-4 max-w-[25.125rem] text-base leading-6 text-secondary"
            >
              Recipes for the pieces of an agent, and full demos you can clone
              and run end to end.
            </p>
            <div class="mt-4 flex flex-col items-start gap-4">
              {#each cookbooks as cookbook (cookbook.href)}
                <a
                  class="inline-flex min-h-11 items-center text-sm leading-5 text-primary underline underline-offset-2 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-[1400px]:min-h-5"
                  href={cookbook.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {cookbook.name}
                </a>
              {/each}
            </div>
          </section>
        </div>
      </div>

      <aside
        id="integrations"
        class="border-subtle bg-primary self-start rounded-lg border p-6 md:p-8 min-[1400px]:sticky"
        aria-labelledby="integrations-heading"
      >
        <h2 id="integrations-heading">
          <span class="block text-xl font-normal leading-7">Integrations</span>
        </h2>
        <div class="mt-4 space-y-4">
          {#each integrations as integration (integration.name)}
            <a
              class="flex min-h-11 items-center gap-4 text-secondary no-underline hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-[1400px]:min-h-5"
              href={integration.links[0].href}
              target="_blank"
              rel="noreferrer"
              aria-label={'Open ' + integration.name + ' integration'}
            >
              <span
                class="relative size-5 shrink-0 overflow-hidden"
                aria-hidden="true"
              >
                <img
                  class="absolute inset-0 size-5 object-contain invert dark:invert-0"
                  src={integration.logo}
                  alt=""
                />
              </span>
              <span class="min-w-0 truncate text-xs leading-4"
                >{integration.name}</span
              >
            </a>
          {/each}
        </div>
      </aside>
    </div>
  </main>
</div>
