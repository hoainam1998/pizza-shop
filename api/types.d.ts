import expressSession from 'express-session';

declare module 'express-session' {
  export interface SessionData {
    user?: {
      canSignup: boolean;
    };
  }
}

declare global {
  export namespace Express {
    export interface Request {
      session: expressSession.Session & Partial<expressSession.SessionData>;
    }
  }
}

declare module 'expect' {
  interface AsymmetricMatchers {
    toBeImageBase64(): void;
  }
  interface Matchers<R> {
    toBeImageBase64(): R;
  }
}
