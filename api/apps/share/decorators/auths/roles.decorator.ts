import { SetMetadata } from '@nestjs/common';
import { ROLES } from '@share/di-token';
import { POWER_NUMERIC } from '@share/enums';

export default (...roles: POWER_NUMERIC[]) => SetMetadata(ROLES, roles);
