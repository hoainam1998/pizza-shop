import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '@share/di-token';

export default () => SetMetadata(IS_PUBLIC_KEY, true);
