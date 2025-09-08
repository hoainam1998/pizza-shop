import { IsBoolean } from 'class-validator';

export class CanSignupSerializer {
  @IsBoolean()
  canSignup: boolean;

  constructor(value: number) {
    this.canSignup = value === 0;
  }
}
