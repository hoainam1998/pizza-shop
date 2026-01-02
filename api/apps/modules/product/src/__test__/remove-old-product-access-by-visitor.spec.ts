import startUp from './pre-setup';
import ProductService from '../product.service';
import ProductCachingService from '@share/libs/caching/product/product.service';
import { user } from '@share/test/pre-setup/mock/data/user';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';

let productService: ProductService;
let productCachingService: ProductCachingService;

const productIds = [Date.now().toString(), (Date.now() + 1).toString()];
const result = 1;

beforeEach(async () => {
  const moduleRef = await startUp();

  productService = moduleRef.get(ProductService);
  productCachingService = moduleRef.get(ProductCachingService);
});

describe('remove old product access by visitor', () => {
  it('remove old product access by visitor success', async () => {
    expect.hasAssertions();
    const removeVisitor = jest.spyOn(productCachingService, 'removeVisitor').mockResolvedValue(result);
    const getProductsAccessByVisitor = jest
      .spyOn(productCachingService, 'getProductsAccessByVisitor')
      .mockResolvedValue(productIds);
    const removeProductsAccessByVisitor = jest
      .spyOn(productCachingService, 'removeProductsAccessByVisitor')
      .mockResolvedValue(result);
    const removeOldProductAccessByVisitor = jest.spyOn(productService as any, 'removeOldProductAccessByVisitor');
    await expect((productService as any).removeOldProductAccessByVisitor(user.user_id)).resolves.toBe(result);
    expect(removeOldProductAccessByVisitor).toHaveBeenCalledTimes(1);
    expect(removeOldProductAccessByVisitor).toHaveBeenCalledWith(user.user_id);
    expect(getProductsAccessByVisitor).toHaveBeenCalledTimes(1);
    expect(getProductsAccessByVisitor).toHaveBeenCalledWith(user.user_id);
    expect(removeVisitor).toHaveBeenCalledTimes(productIds.length);
    expect(removeVisitor.mock.calls).toEqual([
      [productIds[0], user.user_id],
      [productIds[1], user.user_id],
    ]);
    expect(removeProductsAccessByVisitor).toHaveBeenCalledTimes(1);
    expect(removeProductsAccessByVisitor).toHaveBeenLastCalledWith(user.user_id);
  });

  it('remove old product access by visitor failed with getProductsAccessByVisitor got unknown error', async () => {
    expect.hasAssertions();
    const removeVisitor = jest.spyOn(productCachingService, 'removeVisitor').mockResolvedValue(result);
    const getProductsAccessByVisitor = jest
      .spyOn(productCachingService, 'getProductsAccessByVisitor')
      .mockRejectedValue(UnknownError);
    const removeProductsAccessByVisitor = jest
      .spyOn(productCachingService, 'removeProductsAccessByVisitor')
      .mockResolvedValue(result);
    const removeOldProductAccessByVisitor = jest.spyOn(productService as any, 'removeOldProductAccessByVisitor');
    await expect((productService as any).removeOldProductAccessByVisitor(user.user_id)).rejects.toThrow(UnknownError);
    expect(removeOldProductAccessByVisitor).toHaveBeenCalledTimes(1);
    expect(removeOldProductAccessByVisitor).toHaveBeenCalledWith(user.user_id);
    expect(getProductsAccessByVisitor).toHaveBeenCalledTimes(1);
    expect(getProductsAccessByVisitor).toHaveBeenCalledWith(user.user_id);
    expect(removeVisitor).not.toHaveBeenCalled();
    expect(removeProductsAccessByVisitor).not.toHaveBeenCalled();
  });

  it('remove old product access by visitor failed with removeVisitor got unknown error', async () => {
    expect.hasAssertions();
    const removeVisitor = jest.spyOn(productCachingService, 'removeVisitor').mockRejectedValue(UnknownError);
    const getProductsAccessByVisitor = jest
      .spyOn(productCachingService, 'getProductsAccessByVisitor')
      .mockResolvedValue(productIds);
    const removeProductsAccessByVisitor = jest
      .spyOn(productCachingService, 'removeProductsAccessByVisitor')
      .mockResolvedValue(result);
    const removeOldProductAccessByVisitor = jest.spyOn(productService as any, 'removeOldProductAccessByVisitor');
    await expect((productService as any).removeOldProductAccessByVisitor(user.user_id)).rejects.toThrow(UnknownError);
    expect(removeOldProductAccessByVisitor).toHaveBeenCalledTimes(1);
    expect(removeOldProductAccessByVisitor).toHaveBeenCalledWith(user.user_id);
    expect(getProductsAccessByVisitor).toHaveBeenCalledTimes(1);
    expect(getProductsAccessByVisitor).toHaveBeenCalledWith(user.user_id);
    expect(removeVisitor).toHaveBeenCalledTimes(productIds.length);
    expect(removeVisitor.mock.calls).toEqual([
      [productIds[0], user.user_id],
      [productIds[1], user.user_id],
    ]);
    expect(removeProductsAccessByVisitor).not.toHaveBeenCalled();
  });

  it('remove old product access by visitor failed with removeProductsAccessByVisitor got unknown error', async () => {
    expect.hasAssertions();
    const removeVisitor = jest.spyOn(productCachingService, 'removeVisitor').mockResolvedValue(result);
    const getProductsAccessByVisitor = jest
      .spyOn(productCachingService, 'getProductsAccessByVisitor')
      .mockResolvedValue(productIds);
    const removeProductsAccessByVisitor = jest
      .spyOn(productCachingService, 'removeProductsAccessByVisitor')
      .mockRejectedValue(UnknownError);
    const removeOldProductAccessByVisitor = jest.spyOn(productService as any, 'removeOldProductAccessByVisitor');
    await expect((productService as any).removeOldProductAccessByVisitor(user.user_id)).rejects.toThrow(UnknownError);
    expect(removeOldProductAccessByVisitor).toHaveBeenCalledTimes(1);
    expect(removeOldProductAccessByVisitor).toHaveBeenCalledWith(user.user_id);
    expect(getProductsAccessByVisitor).toHaveBeenCalledTimes(1);
    expect(getProductsAccessByVisitor).toHaveBeenCalledWith(user.user_id);
    expect(removeVisitor).toHaveBeenCalledTimes(productIds.length);
    expect(removeVisitor.mock.calls).toEqual([
      [productIds[0], user.user_id],
      [productIds[1], user.user_id],
    ]);
    expect(removeProductsAccessByVisitor).toHaveBeenCalledTimes(1);
    expect(removeProductsAccessByVisitor).toHaveBeenLastCalledWith(user.user_id);
  });
});
