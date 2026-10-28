<script lang="ts">
  import { twJoin } from 'tailwind-merge';

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
  import CopyPromptButton from '$lib/components/agents/copy-prompt-button.svelte';
  import FeatureCardBackground from '$lib/components/agents/feature-card-background.svelte';
  import McpExampleQuestions from '$lib/components/agents/mcp-example-questions.svelte';
  import SkillsTerminal, {
    type AgentSkill,
  } from '$lib/components/agents/skills-terminal.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { Badge } from '$lib/io/badge';
  import { IconGithub, IconPlay } from '$lib/io/icon';

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
          href: 'https://docs.temporal.io/develop/typescript/integrations/ai-sdk',
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
      name: 'Strands Agents',
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
      name: 'Tenuo',
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
          href: 'https://app.tuningengines.com/docs/orchestration#use-tuning-engines-from-temporal',
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

  const skills: AgentSkill[] = [
    {
      slug: 'temporal-developer',
      repository: 'temporalio/skill-temporal-developer',
      preview: false,
    },
    {
      slug: 'temporal-ops',
      repository: 'temporalio/skill-temporal-ops',
      preview: true,
    },
    {
      slug: 'temporal-serverless',
      repository: 'temporalio/skill-temporal-serverless',
      preview: true,
    },
    {
      slug: 'temporal-cloud',
      repository: 'temporalio/skill-temporal-cloud',
      preview: false,
    },
  ];

  const mcpQuestions = [
    'Which Workflows are stuck, and why?',
    'How many Workflows failed in the last hour?',
    'Do my running Workflows have Workers polling?',
    'Which Namespaces can you read?',
  ];

  const harnessPrompt =
    'Follow the installation instructions at https://github.com/temporal-community/temporal-agent-harness to clone the project on the latest stable release and help me get all of the examples up and running.';
  const mcpPrompt =
    'Follow the Get started instructions at https://github.com/temporalio/temporal-mcp to install temporal-mcp, connect it to my current agent over stdio, and check its connection to a local Temporal dev server.';
  const skillsPrompt =
    'Follow the instructions at https://docs.temporal.io/with-ai.md to install skills with your current agent.';

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

  const featureCardClasses = twJoin(
    'relative isolate flex flex-col gap-6 rounded-lg border bg-surface-primary p-6 md:p-8',
    'min-[1440px]:grid min-[1440px]:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] min-[1440px]:grid-rows-[1fr_auto_auto_1fr] min-[1440px]:gap-x-8 min-[1440px]:gap-y-0',
    'min-[1800px]:row-span-3 min-[1800px]:grid-cols-1 min-[1800px]:grid-rows-subgrid min-[1800px]:gap-y-6',
  );
  const featureContentClasses =
    'min-[1440px]:col-start-1 min-[1440px]:row-start-2 min-[1800px]:row-start-1';
  const featureMediaClasses = twJoin(
    'w-full min-w-0 rounded-lg bg-surface-secondary',
    'min-[1440px]:col-start-2 min-[1440px]:row-span-4 min-[1440px]:row-start-1 min-[1440px]:self-center',
    'min-[1800px]:col-start-1 min-[1800px]:row-span-1 min-[1800px]:row-start-2 min-[1800px]:self-stretch',
  );
  const featureMediaCenteredClasses = twJoin(
    featureMediaClasses,
    'min-[1800px]:flex min-[1800px]:flex-col min-[1800px]:justify-center',
  );
  const featureActionsClasses = twJoin(
    'mt-auto flex flex-wrap items-center gap-2',
    'min-[1440px]:col-start-1 min-[1440px]:row-start-3 min-[1440px]:mt-6 min-[1800px]:mt-0',
  );

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
</script>

<div
  class="agents-page min-h-full flex-none space-y-4 overflow-x-hidden md:space-y-8"
>
  <header>
    <h1>Agents</h1>
    <p class="text-sm text-secondary">
      Build durable AI agents on Temporal that survive failures and run for as
      long as the work takes, with any model or tool.
    </p>
  </header>

  <div
    class="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_18rem] min-[1800px]:grid-cols-1"
  >
    <div class="grid gap-5 min-[1800px]:grid-cols-3">
      <section class={featureCardClasses} aria-labelledby="harness-heading">
        <FeatureCardBackground stage="experimental" />
        <div class={featureContentClasses}>
          <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h2 id="harness-heading">Agent Harness</h2>
            <Badge colorScheme="warning" text="EXPERIMENTAL"></Badge>
          </div>
          <p class="mt-1 text-base text-secondary">
            A durable agent harness and a matching session UI in one repo. The
            harness adds durable turns, tool-approval policies, and a structured
            AgentEvents stream; the UI reads that stream and shows your agents
            in agent language, turns, messages, tool calls, sub-agents, and live
            operational state.
          </p>
        </div>
        <figure class={[featureMediaClasses, 'p-2']}>
          <div
            class="relative aspect-[812/480] overflow-hidden rounded min-[1800px]:aspect-auto min-[1800px]:h-full"
          >
            <video
              id="agent-harness-demo"
              bind:this={agentHarnessVideo}
              class="absolute inset-0 size-full object-cover min-[1800px]:object-contain"
              poster={agentHarnessPreview}
              preload="metadata"
              playsinline
              controls={agentHarnessDemoStarted}
              aria-label="Agent Harness session UI demo showing agent events and execution state"
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
                size="sm"
                aria-controls="agent-harness-demo"
                LeadingIcon={IconPlay}
              >
                Watch Demo <span class="sr-only">of the Agent Harness</span>
              </Button>
            {/if}
          </div>
        </figure>
        <div class={featureActionsClasses}>
          <CopyPromptButton
            label="Install harness with your agent"
            title="Copy harness prompt"
            prompt={harnessPrompt}
          />
          <span class="inline-flex shrink-0 rounded bg-surface-primary">
            <Button
              href="https://github.com/temporal-community/temporal-agent-harness"
              target="_blank"
              variant="tertiary"
              LeadingIcon={IconGithub}
              size="sm"
            >
              GitHub <span class="sr-only">repository for Agent Harness</span>
            </Button>
          </span>
        </div>
      </section>

      <section class={featureCardClasses} aria-labelledby="mcp-heading">
        <FeatureCardBackground stage="pre-release" />
        <div class={featureContentClasses}>
          <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h2 id="mcp-heading">MCP Server</h2>
            <Badge colorScheme="info" text="PRE-RELEASE"></Badge>
          </div>
          <p class="mt-1 text-base text-secondary">
            Ask your agent why a Workflow failed or is stuck, and let it find
            out. It reads Event History, checks a Task Queue's pollers and
            backlog, and searches runs with Visibility queries, with read-only
            access to the Namespaces you choose.
          </p>
        </div>
        <div class={[featureMediaCenteredClasses, 'p-2']}>
          <McpExampleQuestions questions={mcpQuestions} />
        </div>
        <div class={featureActionsClasses}>
          <CopyPromptButton
            label="Install MCP server with your agent"
            title="Copy MCP server prompt"
            prompt={mcpPrompt}
          />
          <span class="inline-flex shrink-0 rounded bg-surface-primary">
            <Button
              href="https://github.com/temporalio/temporal-mcp"
              target="_blank"
              variant="tertiary"
              LeadingIcon={IconGithub}
              size="sm"
            >
              GitHub <span class="sr-only">repository for MCP Server</span>
            </Button>
          </span>
        </div>
      </section>

      <section class={featureCardClasses} aria-labelledby="skills-heading">
        <FeatureCardBackground />
        <div class={featureContentClasses}>
          <h2 id="skills-heading">Skills</h2>
          <p class="mt-1 text-base text-secondary">
            Install the Developer, Ops, Serverless, Cloud and Cloud Setup skills
            in the assistant you already code with, and point it at the
            knowledgebase for answers grounded in Temporal docs.
          </p>
        </div>
        <SkillsTerminal class={featureMediaCenteredClasses} {skills} />
        <div class={featureActionsClasses}>
          <CopyPromptButton
            label="Install skills with your agent"
            title="Copy skills prompt"
            prompt={skillsPrompt}
          />
        </div>
      </section>
    </div>

    <section
      class="rounded-lg border bg-surface-primary p-6 md:p-8"
      aria-labelledby="resources-heading"
    >
      <h2 id="resources-heading">Resources</h2>
      <div
        class="mt-4 grid gap-8 min-[1800px]:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)]"
      >
        <div>
          <h3 class="text-base text-secondary">Cookbooks and Demos</h3>
          <ul class="mt-3 flex flex-col items-start gap-3 leading-5">
            {#each cookbooks as cookbook (cookbook.href)}
              <li>
                <Link
                  href={cookbook.href}
                  aria-label={'Open ' + cookbook.name + ' cookbook'}
                  newTab
                >
                  {cookbook.name}
                </Link>
              </li>
            {/each}
          </ul>
        </div>
        <div>
          <h3 class="text-base text-secondary">Integrations</h3>
          <ul
            class="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2 xl:grid-cols-1 min-[1800px]:grid-cols-3"
          >
            {#each integrations as integration (integration.name)}
              <li class="min-w-0">
                <Link
                  href={integration.links[0].href}
                  class="flex gap-3"
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
                  <span class="min-w-0 break-words text-sm leading-5"
                    >{integration.name}</span
                  >
                </Link>
              </li>
            {/each}
          </ul>
        </div>
        <div>
          <h3 class="text-base text-secondary">Blog</h3>
          <p class="mt-3 leading-5">
            <Link href="https://temporal.io/blog?query=agent" newTab>
              Agents on Temporal Blog
            </Link>
          </p>
        </div>
      </div>
    </section>
  </div>
</div>
