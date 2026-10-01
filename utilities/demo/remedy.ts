/**
 * Failure messages a person can act on.
 *
 * A stage that shells out to a tool knows far more about why it failed than
 * the exit code carries, and that knowledge is worth spending: what was being
 * attempted, what the tool actually said, what to try, and where to look for
 * the rest. A bare "exit code 1" makes the reader rediscover all of it.
 */

export type Failure = {
  /** What the run was trying to do, in plain language. */
  attempting: string;
  /** Verbatim tool output. Never paraphrased: the exact string is searchable. */
  reported?: string;
  /** Concrete things to try, most likely first. */
  fixes?: readonly string[];
  /** Logs, docs, or commands that carry the rest of the story. */
  seeAlso?: readonly string[];
};

const section = (heading: string, lines: readonly string[]) =>
  lines.length ? [heading, ...lines.map((line) => `  ${line}`)] : [];

export const failureMessage = ({
  attempting,
  reported,
  fixes = [],
  seeAlso = [],
}: Failure): string =>
  [
    attempting,
    ...section('It reported:', reported?.trim() ? [reported.trim()] : []),
    ...section('Try:', fixes),
    ...section('See also:', seeAlso),
  ].join('\n');

export const failure = (details: Failure): Error =>
  new Error(failureMessage(details));

/**
 * ngrok names every failure with an ERR_NGROK_nnnn code and documents each one
 * at a predictable URL, so the code is worth surfacing even when we have no
 * specific advice for it.
 */
export const NGROK_DOC = (code: string) =>
  `https://ngrok.com/docs/errors/${code.toLowerCase()}/`;

/**
 * Remedies for the ngrok failures a first run actually hits. Deliberately
 * short: an unrecognised code still gets its documentation URL rather than a
 * guessed fix.
 */
const NGROK_REMEDIES: Record<string, readonly string[]> = {
  ERR_NGROK_105: [
    'The authtoken was rejected. Add a valid one: ngrok config add-authtoken <token>',
    'Get a token from https://dashboard.ngrok.com/get-started/your-authtoken',
  ],
  ERR_NGROK_4018: [
    'No authtoken is configured. Run: ngrok config add-authtoken <token>',
    'Get a token from https://dashboard.ngrok.com/get-started/your-authtoken',
  ],
  ERR_NGROK_108: [
    'The account already has its maximum simultaneous sessions.',
    'Stop other agents: pkill ngrok, or end the session in the ngrok dashboard.',
  ],
  ERR_NGROK_121: [
    'The ngrok agent is too old for the account. Upgrade it: brew upgrade ngrok',
  ],
};

export const ngrokFixes = (code?: string): readonly string[] => {
  if (!code) {
    return [
      'Check the agent is authenticated: ngrok config check',
      'Confirm the account may open TCP tunnels; some plans allow HTTP only.',
    ];
  }

  return [
    ...(NGROK_REMEDIES[code] ?? [
      'No specific remedy is known for this code; its documentation explains it.',
    ]),
  ];
};
