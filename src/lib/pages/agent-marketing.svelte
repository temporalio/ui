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
  import Button from '$lib/holocene/button.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { Badge } from '$lib/io/badge';
  import { IconCheckmark, IconCopy, IconPlay } from '$lib/io/icon';
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

  const cookbooks: ResourceLink[] = [
    {
      name: 'AI Cookbooks',
      href: 'https://docs.temporal.io/ai/cookbook',
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
      name: 'Durable Async MCP',
      href: 'https://github.com/temporal-community/durable-async-mcp',
    },
    {
      name: 'Durable Agents Workshop',
      href: 'https://github.com/temporal-community/ai-agents-workshop-python',
    },
  ];

  const { copy: copyHarness, copied: copiedHarness } = copyToClipboard();
  const { copy: copySkill, copied: copiedSkill } = copyToClipboard();

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

  const copyHarnessPrompt = (event: MouseEvent) => {
    const prompt =
      'Follow the installation instructions at https://github.com/temporal-community/temporal-agent-harness to clone the project on the latest stable release and start running examples with your current agent.';
    copyHarness(event, prompt);
  };

  const copySkillPrompt = (event: MouseEvent) => {
    const prompt =
      'Follow the instructions at https://docs.temporal.io/with-ai.md to install skills with your current agent.';
    copySkill(event, prompt);
  };
</script>

<div
  class="agents-page surface-background min-h-full flex-none overflow-x-hidden"
>
  <header class="pb-4 text-base"><p>Agents</p></header>
  <div class="w-full">
    <div
      class="grid w-full items-start gap-5 min-[1400px]:grid-cols-[minmax(0,1fr)_18.4375rem]"
    >
      <div class="min-w-0 space-y-5">
        <section
          class="border-subtle bg-primary overflow-hidden rounded-lg border p-6 md:p-8"
          aria-labelledby="agents-heading"
        >
          <div class="mb-8 space-y-1 md:mb-12">
            <h2 id="agents-heading">Build Durable AI Agents on Temporal</h2>
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
                  <h3>Temporal Agent Harness</h3>
                  <p class="text-base leading-6 text-secondary">
                    A durable agent harness and a matching session UI in one
                    repo. The harness adds durable turns, tool-approval
                    policies, and a structured AgentEvents stream; the UI reads
                    that stream and shows your agents in agent language, turns,
                    messages, tool calls, sub-agents, and live operational
                    state.
                  </p>
                </div>
                <div class="flex flex-col gap-2 md:flex-row md:items-center">
                  <Button
                    href="https://github.com/temporal-community/temporal-agent-harness"
                    target="_blank"
                    size="xs"
                    aria-label="Open Agent Harness"
                  >
                    Go to Github
                  </Button>
                  <Button
                    class="font-mono text-primary"
                    variant="secondary"
                    size="xs"
                    aria-label={$copiedHarness
                      ? 'Harness prompt copied'
                      : 'Copy harness prompt'}
                    title={$copiedHarness
                      ? 'Harness prompt copied'
                      : 'Copy harness prompt'}
                    onclick={copyHarnessPrompt}
                  >
                    Install harness with your coding agent
                    {#if $copiedHarness}
                      <IconCheckmark class="size-3" />
                    {:else}
                      <IconCopy class="size-3" />
                    {/if}
                  </Button>
                </div>
              </div>
            </div>

            <figure
              class="border-subtle bg-code-block relative aspect-[812/480] min-w-0 overflow-hidden rounded-lg border"
            >
              <video
                id="agent-harness-demo"
                bind:this={agentHarnessVideo}
                class="absolute inset-0 size-full object-cover"
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
                <Button
                  class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white"
                  onclick={playAgentHarnessDemo}
                  variant="tertiary"
                  size="md"
                  aria-controls="agent-harness-demo"
                  aria-label="Play the Temporal Agent Harness demo"
                  LeadingIcon={IconPlay}
                >
                  Watch Demo
                </Button>
              {/if}
            </figure>
          </div>
        </section>

        <div class="grid gap-5 md:grid-cols-[1.049fr_1fr]">
          <section
            class="border-subtle bg-primary flex min-h-[20.75rem] flex-col rounded-lg border p-6 md:p-8"
            aria-labelledby="skills-heading"
          >
            <h2 id="skills-heading">Temporal Skills</h2>
            <p class="my-4 text-base leading-6 text-secondary">
              Install the Developer, Ops, Serverless, Cloud and Cloud Setup
              skills in the assistant you already code with, and point it at the
              knowledgebase for answers grounded in Temporal docs.
            </p>
            <Button
              class="font-mono text-primary"
              variant="secondary"
              size="xs"
              aria-label={$copiedSkill
                ? 'Install skill prompt copied'
                : 'Copy install skill prompt'}
              title={$copiedSkill
                ? 'Install skill prompt copied'
                : 'Copy install skill prompt'}
              onclick={copySkillPrompt}
            >
              Install skills with your coding agent
              {#if $copiedSkill}
                <IconCheckmark class="size-3" />
              {:else}
                <IconCopy class="size-3" />
              {/if}
            </Button>
          </section>

          <section
            class="border-subtle bg-primary min-h-[20.75rem] rounded-lg border p-6 md:p-8"
            aria-labelledby="cookbooks-heading"
          >
            <h2 id="cookbooks-heading">Cookbooks and Demos</h2>
            <p
              class="mt-4 max-w-[25.125rem] text-base leading-6 text-secondary"
            >
              Recipes for the pieces of an agent, and full demos you can clone
              and run end to end.
            </p>
            <div class="mt-4 flex flex-col items-start gap-4">
              {#each cookbooks as cookbook (cookbook.href)}
                <Link
                  href={cookbook.href}
                  aria-label={'Open ' + cookbook.name + ' cookbook'}
                  newTab
                >
                  {cookbook.name}
                </Link>
              {/each}
            </div>
          </section>
        </div>
      </div>

      <div class="space-y-5 self-start min-[1400px]:sticky">
        <aside
          id="integrations"
          class="border-subtle bg-primary rounded-lg border p-6 md:p-8"
          aria-labelledby="integrations-heading"
        >
          <h2 id="integrations-heading">Integrations</h2>
          <div class="mt-4 space-y-4">
            {#each integrations as integration (integration.name)}
              <Link
                href={integration.links[0].href}
                class="flex gap-4"
                newTab
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
              </Link>
            {/each}
          </div>
        </aside>

        <section
          class="border-subtle bg-primary rounded-lg border p-6 md:p-8"
          aria-labelledby="blog-heading"
        >
          <h2 id="blog-heading">Blog</h2>
          <article>
            <p class="mt-4 text-base leading-6 text-secondary">
              Read practical guidance and ideas for building reliable agents
              with durable execution.
            </p>
            <Link
              href="https://temporal.io/blog?query=agent"
              newTab
              aria-label="Browse Temporal blog posts about AI agents"
            >
              Browse agent articles
            </Link>
          </article>
        </section>
      </div>
    </div>
  </div>
</div>
