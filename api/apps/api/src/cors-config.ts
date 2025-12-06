import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { HTTP_METHOD } from '@share/enums';

export default Object.freeze<CorsOptions>({
  origin: [process.env.ADMIN_ORIGIN_CORS!, process.env.SALE_ORIGIN_CORS!],
  methods: [HTTP_METHOD.POST, HTTP_METHOD.GET, HTTP_METHOD.PUT, HTTP_METHOD.DELETE],
  credentials: true,
  exposedHeaders: ['set-cookie'],
});
