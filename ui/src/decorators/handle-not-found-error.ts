import { HttpStatusCode, type AxiosError } from 'axios';

/**
 * Handle axios not found error if allowed!
 * @param {*} target - The decorator target.
 * @param {string} propertyName - The decorator property name.
 * @param {TypedPropertyDescriptor<any>} descriptor - The decorator descriptor.
 * @returns {TypedPropertyDescriptor<any>} - The descriptor.
 */
export default function HandleNotFoundError(
  target: any,
  propertyName: string,
  descriptor: TypedPropertyDescriptor<any>):
   TypedPropertyDescriptor<any> {
  const originMethod = descriptor.value!;

  descriptor.value = function (...args: any[]) {
    const allowNotFound = args[2]?.allowNotFound;
    return originMethod.apply(this, args).catch((error: AxiosError) => {
      if (error.status === HttpStatusCode.NotFound && allowNotFound) {
        return error.response!;
      }
      throw error;
    });
  };
  return descriptor;
};
