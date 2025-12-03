import { type AxiosError } from 'axios';
import constants from '@/constants';

/**
 * Handle axios unknown error.
 *
 * @param {*} target - The decorator target.
 * @param {string} propertyName - The decorator property name.
 * @param {TypedPropertyDescriptor<any>} descriptor - The decorator descriptor.
 * @returns {TypedPropertyDescriptor<any>} - The descriptor.
 */
export default function HandleUnknownAxiosError(
  target: any,
  propertyName: string,
  descriptor: TypedPropertyDescriptor<any>):
   TypedPropertyDescriptor<any> {
  const originMethod = descriptor.value!;

  descriptor.value = function (...args: any[]) {
    return originMethod.apply(this, args).catch((error: AxiosError) => {
      if (!error.response) {
        throw {
          ...error,
          response: {
            data: {
              messages: [constants.AXIOS_UNKNOWN_MESSAGE]
            }
          }
        };
      }
      throw error;
    });
  };
  return descriptor;
};