import IngredientService from '../ingredient.service';
import SchedulerService from '@share/libs/scheduler/scheduler.service';
import startUp from './pre-setup';
import { ingredient } from '@share/test/pre-setup/mock/data/ingredient';

let ingredientService: IngredientService;
let schedulerService: SchedulerService;
const actionName = 'action_name';

beforeEach(async () => {
  const moduleRef = await startUp();

  ingredientService = moduleRef.get(IngredientService);
  schedulerService = moduleRef.get(SchedulerService);
});

afterEach((done) => {
  jest.restoreAllMocks();
  jest.resetAllMocks();
  done();
});

describe('delete ingredient expired', () => {
  it('delete ingredient expired success', () => {
    expect.hasAssertions();
    const deleteItemExpired = jest.spyOn(schedulerService as any, 'deleteItemExpired');
    (ingredientService as any).deleteIngredientExpired(ingredient, actionName);
    expect(deleteItemExpired).toHaveBeenCalledTimes(1);
    expect(deleteItemExpired).toHaveBeenCalledWith(
      +ingredient.expired_time,
      expect.any(Function),
      expect.any(String),
      actionName,
    );
  });

  it('delete ingredient expired success when cronJob was exits', () => {
    expect.hasAssertions();
    const deleteItemExpired = jest.spyOn(schedulerService as any, 'deleteItemExpired');
    (ingredientService as any).deleteIngredientExpired(ingredient, actionName);
    expect(deleteItemExpired).toHaveBeenCalledTimes(1);
    expect(deleteItemExpired).toHaveBeenCalledWith(
      +ingredient.expired_time,
      expect.any(Function),
      expect.any(String),
      actionName,
    );
  });

  it('delete ingredient expired failed due date regis used past', () => {
    expect.hasAssertions();
    ingredient.expired_time = (Date.now() - 1000 * 10).toString();
    const deleteItemExpired = jest.spyOn(schedulerService as any, 'deleteItemExpired');
    (ingredientService as any).deleteIngredientExpired(ingredient, actionName);
    expect(deleteItemExpired).toHaveBeenCalledTimes(1);
    expect(deleteItemExpired).toHaveBeenCalledWith(
      +ingredient.expired_time,
      expect.any(Function),
      expect.any(String),
      actionName,
    );
  });
});
