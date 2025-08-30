import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsMulterFile(validationOptions?: ValidationOptions) {
  const generateOptions = (propertyName: string) => {
    if (validationOptions) {
      if (!validationOptions.message) {
        return Object.assign(validationOptions, { message: `${propertyName} is missing!` });
      }
    }
    return validationOptions;
  };

  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isMulterFile',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: generateOptions(propertyName),
      validator: {
        validate(value: Express.Multer.File): boolean {
          return value && value instanceof Object && !!value.fieldname && !!value.originalname;
        },
      },
    });
  };
}
