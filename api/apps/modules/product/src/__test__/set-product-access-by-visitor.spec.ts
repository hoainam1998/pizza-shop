import startUp from './pre-setup';
import ProductService from '../product.service';
import ProductCachingService from '@share/libs/caching/product/product.service';
import { user } from '@share/test/pre-setup/mock/data/user';
import { createProductList } from '@share/test/pre-setup/mock/data/product';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';

let productService: ProductService;
let productCachingService: ProductCachingService;

const result = 1;
const products = createProductList(2);
const productIds = products.map((product) => product.product_id);

beforeEach(async () => {
  const moduleRef = await startUp();

  productService = moduleRef.get(ProductService);
  productCachingService = moduleRef.get(ProductCachingService);
});

describe('set product access by visitor', () => {
  it('set product access by visitor success', async () => {
    expect.hasAssertions();
    const setVisitor = jest.spyOn(productCachingService, 'setVisitor').mockResolvedValue(result);
    const setProductsAccessByVisitor = jest
      .spyOn(productCachingService, 'setProductsAccessByVisitor')
      .mockResolvedValue(result);
    const setProductAccessByVisitorService = jest.spyOn(productService as any, 'setProductAccessByVisitor');
    await expect((productService as any).setProductAccessByVisitor(products, user.user_id)).resolves.toBe(result);
    expect(setProductAccessByVisitorService).toHaveBeenCalledTimes(1);
    expect(setProductAccessByVisitorService).toHaveBeenCalledWith(products, user.user_id);
    expect(setVisitor).toHaveBeenCalledTimes(2);
    expect(setVisitor.mock.calls).toEqual([
      [products[0].product_id, user.user_id],
      [products[1].product_id, user.user_id],
    ]);
    expect(setProductsAccessByVisitor).toHaveBeenCalledTimes(1);
    expect(setProductsAccessByVisitor).toHaveBeenCalledWith(productIds, user.user_id);
  });

  it('set product access by visitor failed with setVisitor got unknown error', async () => {
    expect.hasAssertions();
    const setVisitor = jest.spyOn(productCachingService, 'setVisitor').mockRejectedValue(UnknownError);
    const setProductsAccessByVisitor = jest
      .spyOn(productCachingService, 'setProductsAccessByVisitor')
      .mockResolvedValue(result);
    const setProductAccessByVisitorService = jest.spyOn(productService as any, 'setProductAccessByVisitor');
    await expect((productService as any).setProductAccessByVisitor(products, user.user_id)).rejects.toThrow(
      UnknownError,
    );
    expect(setProductAccessByVisitorService).toHaveBeenCalledTimes(1);
    expect(setProductAccessByVisitorService).toHaveBeenCalledWith(products, user.user_id);
    expect(setVisitor).toHaveBeenCalledTimes(2);
    expect(setVisitor.mock.calls).toEqual([
      [products[0].product_id, user.user_id],
      [products[1].product_id, user.user_id],
    ]);
    expect(setProductsAccessByVisitor).not.toHaveBeenCalled();
  });

  it('set product access by visitor failed with setProductsAccessByVisitor got unknown error', async () => {
    expect.hasAssertions();
    const setVisitor = jest.spyOn(productCachingService, 'setVisitor').mockResolvedValue(result);
    const setProductsAccessByVisitor = jest
      .spyOn(productCachingService, 'setProductsAccessByVisitor')
      .mockRejectedValue(UnknownError);
    const setProductAccessByVisitorService = jest.spyOn(productService as any, 'setProductAccessByVisitor');
    await expect((productService as any).setProductAccessByVisitor(products, user.user_id)).rejects.toThrow(
      UnknownError,
    );
    expect(setProductAccessByVisitorService).toHaveBeenCalledTimes(1);
    expect(setProductAccessByVisitorService).toHaveBeenCalledWith(products, user.user_id);
    expect(setVisitor).toHaveBeenCalledTimes(2);
    expect(setVisitor.mock.calls).toEqual([
      [products[0].product_id, user.user_id],
      [products[1].product_id, user.user_id],
    ]);
    expect(setProductsAccessByVisitor).toHaveBeenCalledTimes(1);
    expect(setProductsAccessByVisitor).toHaveBeenCalledWith(productIds, user.user_id);
  });
});
