import { vi } from 'vitest'

const BroadcastChannelMock = vi.fn(() => ({ addEventListener: () => { }, postMessage: () => { } }))

vi.stubGlobal('BroadcastChannel', BroadcastChannelMock)
