import { describe, expect, it } from 'vitest';

import { getSDKandVersion } from './get-sdk-version';

describe('getSDKandVersion', () => {
  const workflowTaskCompletedEvent = {
    attributes: {
      sdkMetadata: {},
    },
  };
  it('should return empty string if neither exist in task', () => {
    const sdk = getSDKandVersion([workflowTaskCompletedEvent]).sdk;
    const version = getSDKandVersion([workflowTaskCompletedEvent]).version;
    expect(sdk).toBe('');
    expect(version).toBe('');
  });

  it('should return Go sdk and version if both exist in task', () => {
    const workflowTaskCompletedEvent = {
      attributes: {
        sdkMetadata: {
          sdkName: 'temporal-go',
          sdkVersion: '1.29.1',
        },
      },
    };

    const sdk = getSDKandVersion([workflowTaskCompletedEvent]).sdk;
    const version = getSDKandVersion([workflowTaskCompletedEvent]).version;
    expect(sdk).toBe('Go');
    expect(version).toBe('1.29.1');
  });

  it('should return Java sdk and version if both exist in task', () => {
    const workflowTaskCompletedEvent = {
      attributes: {
        sdkMetadata: {
          sdkName: 'temporal-java',
          sdkVersion: '1.0.5',
        },
      },
    };

    const sdk = getSDKandVersion([workflowTaskCompletedEvent]).sdk;
    const version = getSDKandVersion([workflowTaskCompletedEvent]).version;
    expect(sdk).toBe('Java');
    expect(version).toBe('1.0.5');
  });

  it('should return Typescript sdk and version if both exist in task', () => {
    const workflowTaskCompletedEvent = {
      attributes: {
        sdkMetadata: {
          sdkName: 'temporal-typescript',
          sdkVersion: '2.20.5',
        },
      },
    };

    const sdk = getSDKandVersion([workflowTaskCompletedEvent]).sdk;
    const version = getSDKandVersion([workflowTaskCompletedEvent]).version;
    expect(sdk).toBe('Typescript');
    expect(version).toBe('2.20.5');
  });

  it('should return Dotnet sdk and version if both exist in task', () => {
    const workflowTaskCompletedEvent = {
      attributes: {
        sdkMetadata: {
          sdkName: 'temporal-dotnet',
          sdkVersion: '2.20.5',
        },
      },
    };

    const sdk = getSDKandVersion([workflowTaskCompletedEvent]).sdk;
    const version = getSDKandVersion([workflowTaskCompletedEvent]).version;
    expect(sdk).toBe('.NET');
    expect(version).toBe('2.20.5');
  });

  it('should return Python sdk and version if both exist in task', () => {
    const workflowTaskCompletedEvent = {
      attributes: {
        sdkMetadata: {
          sdkName: 'temporal-python',
          sdkVersion: '0.2.11',
        },
      },
    };

    const sdk = getSDKandVersion([workflowTaskCompletedEvent]).sdk;
    const version = getSDKandVersion([workflowTaskCompletedEvent]).version;
    expect(sdk).toBe('Python');
    expect(version).toBe('0.2.11');
  });

  it('should return Php sdk and version if both exist in task', () => {
    const workflowTaskCompletedEvent = {
      attributes: {
        sdkMetadata: {
          sdkName: 'temporal-php',
          sdkVersion: '0.2.11',
        },
      },
    };

    const sdk = getSDKandVersion([workflowTaskCompletedEvent]).sdk;
    const version = getSDKandVersion([workflowTaskCompletedEvent]).version;
    expect(sdk).toBe('Php');
    expect(version).toBe('0.2.11');
  });

  it('should return Rust sdk and version if both exist in task', () => {
    const workflowTaskCompletedEvent = {
      attributes: {
        sdkMetadata: {
          sdkName: 'temporal-rust',
          sdkVersion: '1.3.2',
        },
      },
    };

    const sdk = getSDKandVersion([workflowTaskCompletedEvent]).sdk;
    const version = getSDKandVersion([workflowTaskCompletedEvent]).version;
    expect(sdk).toBe('Rust');
    expect(version).toBe('1.3.2');
  });

  it('should return Ruby sdk and version if both exist in task', () => {
    const workflowTaskCompletedEvent = {
      attributes: {
        sdkMetadata: {
          sdkName: 'temporal-ruby',
          sdkVersion: '1.3.21',
        },
      },
    };

    const sdk = getSDKandVersion([workflowTaskCompletedEvent]).sdk;
    const version = getSDKandVersion([workflowTaskCompletedEvent]).version;
    expect(sdk).toBe('Ruby');
    expect(version).toBe('1.3.21');
  });

  it('should return newer Go version with multiple tasks', () => {
    const workflowTaskCompletedEvent1 = {
      attributes: {
        sdkMetadata: {
          sdkName: 'temporal-go',
          sdkVersion: '1.29.1',
        },
      },
    };

    const workflowTaskCompletedEvent2 = {
      attributes: {
        sdkMetadata: {
          sdkVersion: '1.30.5',
        },
      },
    };
    const events = [workflowTaskCompletedEvent1, workflowTaskCompletedEvent2];

    const sdk = getSDKandVersion(events).sdk;
    const version = getSDKandVersion(events).version;
    expect(sdk).toBe('Go');
    expect(version).toBe('1.30.5');
  });

  it('should return newer SDK version with multiple tasks', () => {
    const workflowTaskCompletedEvent1 = {
      attributes: {
        sdkMetadata: {
          sdkName: 'temporal-go',
          sdkVersion: '1.29.1',
        },
      },
    };

    const workflowTaskCompletedEvent2 = {
      attributes: {
        sdkMetadata: {
          sdkName: 'temporal-ruby',
          sdkVersion: '1.2.3',
        },
      },
    };

    const workflowTaskCompletedEvent3 = {
      attributes: {
        sdkMetadata: {
          sdkVersion: '1.2.10',
        },
      },
    };
    const events = [
      workflowTaskCompletedEvent1,
      workflowTaskCompletedEvent2,
      workflowTaskCompletedEvent3,
    ];

    const sdk = getSDKandVersion(events).sdk;
    const version = getSDKandVersion(events).version;
    expect(sdk).toBe('Ruby');
    expect(version).toBe('1.2.10');
  });
});
