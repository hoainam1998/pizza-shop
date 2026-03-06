export enum PRISMA_ERROR_CODE {
  NOT_FOUND = 'P2025',
  DATABASE_LOST_CONNECT = 'P1001',
  ALREADY_EXIST = 'P2002',
}

export enum HTTP_METHOD {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

export enum CHART_BY {
  DAY = 'day',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
}

export enum VIEW {
  ADMIN = 'admin',
  CLIENT = 'client',
}
