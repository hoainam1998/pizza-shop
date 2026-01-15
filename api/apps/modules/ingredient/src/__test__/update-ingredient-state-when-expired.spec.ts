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

describe('update ingredient state when expired', () => {
  it('update ingredient state when expired', () => {
    expect.hasAssertions();
    const updateStateExpired = jest.spyOn(schedulerService as any, 'updateStateExpired');
    (ingredientService as any).updateIngredientStateWhenExpired(ingredient, actionName);
    expect(updateStateExpired).toHaveBeenCalledTimes(1);
    expect(updateStateExpired).toHaveBeenCalledWith(
      +ingredient.expired_time,
      expect.any(Function),
      expect.any(String),
      actionName,
    );
  });

  it('update ingredient state when expired success when cronJob was exits', () => {
    expect.hasAssertions();
    const updateStateExpired = jest.spyOn(schedulerService as any, 'updateStateExpired');
    (ingredientService as any).updateIngredientStateWhenExpired(ingredient, actionName);
    expect(updateStateExpired).toHaveBeenCalledTimes(1);
    expect(updateStateExpired).toHaveBeenCalledWith(
      +ingredient.expired_time,
      expect.any(Function),
      expect.any(String),
      actionName,
    );
  });

  it('update ingredient state when expired failed due date regis used past', () => {
    expect.hasAssertions();
    ingredient.expired_time = (Date.now() - 1000 * 10).toString();
    const updateStateExpired = jest.spyOn(schedulerService as any, 'updateStateExpired');
    (ingredientService as any).updateIngredientStateWhenExpired(ingredient, actionName);
    expect(updateStateExpired).toHaveBeenCalledTimes(1);
    expect(updateStateExpired).toHaveBeenCalledWith(
      +ingredient.expired_time,
      expect.any(Function),
      expect.any(String),
      actionName,
    );
  });
});
