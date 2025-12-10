import { Request, Response, NextFunction } from 'express';

type MockRequestType = Request & {
  headers: Request['headers'] & {
    'mock-session'?: string;
  };
};

export default function signupSession(req: MockRequestType, res: Response, next: NextFunction): void {
  if (req.headers['mock-session']) {
    req.session.user = JSON.parse(req.headers['mock-session']);
  }
  next();
}
