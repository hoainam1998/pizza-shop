import { Transform } from 'class-transformer';
import { IsInt } from 'class-validator';

export class PriceProduct {
  @IsInt()
  @Transform((value) => +value)
  private _price: number | string;

  constructor(price: number | string) {
    Object.assign(this, { _price: price });
  }

  get Price() {
    return this._price;
  }
}
