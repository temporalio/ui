type LoadQueueOptions = {
  concurrency: number;
  start: (id: string) => Promise<void>;
};

export class LoadQueue {
  private _pending: string[] = [];
  private _held = true;
  private _disposed = false;
  private readonly _active = new Set<string>();
  private readonly _concurrency: number;
  private readonly _start: (id: string) => Promise<void>;

  constructor({ concurrency, start }: LoadQueueOptions) {
    this._concurrency = concurrency;
    this._start = start;
  }

  get pending(): readonly string[] {
    return this._pending;
  }

  get active(): ReadonlySet<string> {
    return this._active;
  }

  push(id: string): void {
    if (this._active.has(id) || this._pending.includes(id)) {
      return;
    }
    this._pending.push(id);
    this._drain();
  }

  prioritize(id: string): void {
    if (this._active.has(id)) {
      return;
    }
    this._pending = [id, ...this._pending.filter((pending) => pending !== id)];
    this._drain();
  }

  remove(id: string): void {
    this._pending = this._pending.filter((pending) => pending !== id);
  }

  hold(): void {
    this._held = true;
  }

  release(): void {
    this._held = false;
    this._drain();
  }

  dispose(): void {
    this._disposed = true;
    this._pending = [];
  }

  private _drain(): void {
    while (
      !this._held &&
      !this._disposed &&
      this._active.size < this._concurrency &&
      this._pending.length > 0
    ) {
      const id = this._pending.shift()!;
      this._active.add(id);
      void this._run(id);
    }
  }

  private async _run(id: string): Promise<void> {
    try {
      await this._start(id);
    } catch {
      // A failed load only frees its slot; the caller records the failure.
    } finally {
      this._active.delete(id);
      this._drain();
    }
  }
}
