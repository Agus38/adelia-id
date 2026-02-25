import { EventEmitter } from 'events';

// It's a good practice to type the events for better IntelliSense and type safety
interface ErrorEmitterEvents {
  'permission-error': (error: Error) => void;
}

declare interface ErrorEmitter {
  on<U extends keyof ErrorEmitterEvents>(event: U, listener: ErrorEmitterEvents[U]): this;
  emit<U extends keyof ErrorEmitterEvents>(event: U, ...args: Parameters<ErrorEmitterEvents[U]>): boolean;
}

class ErrorEmitter extends EventEmitter {}

// Create and export a singleton instance
export const errorEmitter = new ErrorEmitter();
