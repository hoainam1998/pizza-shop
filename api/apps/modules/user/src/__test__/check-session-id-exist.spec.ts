import startUp from './pre-setup';
import UserService from '../user.service';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { autoGeneratePassword } from '@share/utils';

let userService: UserService;
const sessionId = autoGeneratePassword();

beforeAll(async () => {
  const moduleRef = await startUp();
  userService = moduleRef.get(UserService);
});

describe('check session id exists', () => {
  it('check session id exists success', async () => {
    expect.hasAssertions();
    const checkSessionIdExist = jest.spyOn(userService, 'checkSessionIdExist').mockResolvedValue(true);
    await expect(userService.checkSessionIdExist(sessionId)).resolves.toBe(true);
    expect(checkSessionIdExist).toHaveBeenCalledTimes(1);
    expect(checkSessionIdExist).toHaveBeenCalledWith(sessionId);
  });

  it('check session id exists failed', async () => {
    expect.hasAssertions();
    const checkSessionIdExist = jest.spyOn(userService, 'checkSessionIdExist').mockResolvedValue(false);
    await expect(userService.checkSessionIdExist(sessionId)).resolves.toBe(false);
    expect(checkSessionIdExist).toHaveBeenCalledTimes(1);
    expect(checkSessionIdExist).toHaveBeenCalledWith(sessionId);
  });

  it('check session id exists failed with unknown error', async () => {
    expect.hasAssertions();
    const checkSessionIdExist = jest.spyOn(userService, 'checkSessionIdExist').mockRejectedValue(UnknownError);
    await expect(userService.checkSessionIdExist(sessionId)).rejects.toThrow(UnknownError);
    expect(checkSessionIdExist).toHaveBeenCalledTimes(1);
    expect(checkSessionIdExist).toHaveBeenCalledWith(sessionId);
  });
});
