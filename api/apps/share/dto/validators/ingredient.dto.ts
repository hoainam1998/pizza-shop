import { Expose, Transform } from 'class-transformer';
import { IsString, IsInt } from 'class-validator';

export class IngredientCreate {
  @IsString()
  name: string;

  @IsString()
  unit: string;

  @IsInt()
  @Transform(({ value }) => +value)
  count: number;

  @IsInt()
  @Transform(({ value }) => +value)
  price: number;

  @IsString()
  expiredTime: string;

  @Expose({ toPlainOnly: true })
  get expired_time() {
    return this.expiredTime;
  }
}
