import startUp from './pre-setup';
import UserService from '../user.service';
import UnknownError from '@share/test/pre-setup/mock/errors/unknown-error';
import { autoGeneratePassword } from '@share/utils';
import { user } from '@share/test/pre-setup/mock/data/user';
import UserCachingService from '@share/libs/caching/user/user.service';
import { LoginSessionPayload } from '@share/dto/validators/user.dto';
import { ValidationError } from 'class-validator';

let userService: UserService;
let userCachingService: UserCachingService;
const sessionId = autoGeneratePassword();
const sessionString = JSON.stringify({
  user: {
    email: user.email,
    canSignup: false,
    power: user.power,
    userId: user.user_id,
  },
});

beforeAll(async () => {
  const moduleRef = await startUp();
  userService = moduleRef.get(UserService);
  userCachingService = moduleRef.get(UserCachingService);
});

describe('check user already logged', () => {
  it('check user already logged return true', async () => {
    expect.hasAssertions();
    jest.spyOn(LoginSessionPayload.prototype, 'validate').mockResolvedValue([]);
    const checkUserAlreadyLogged = jest
      .spyOn(userCachingService, 'checkUserAlreadyLogged')
      .mockResolvedValue(sessionString);
    const checkUserLogged = jest.spyOn(userService, 'checkUserLogged');
    await expect(userService.checkUserLogged(sessionId)).resolves.toBe(true);
    expect(checkUserLogged).toHaveBeenCalledTimes(1);
    expect(checkUserLogged).toHaveBeenCalledWith(sessionId);
    expect(checkUserAlreadyLogged).toHaveBeenCalledTimes(1);
    expect(checkUserAlreadyLogged).toHaveBeenCalledWith(sessionId);
  });

  it('check user already logged return false when validate got error', async () => {
    expect.hasAssertions();
    jest.spyOn(LoginSessionPayload.prototype, 'validate').mockResolvedValue([new ValidationError()]);
    const checkUserAlreadyLogged = jest
      .spyOn(userCachingService, 'checkUserAlreadyLogged')
      .mockResolvedValue(sessionString);
    const checkUserLogged = jest.spyOn(userService, 'checkUserLogged');
    await expect(userService.checkUserLogged(sessionId)).resolves.toBe(false);
    expect(checkUserLogged).toHaveBeenCalledTimes(1);
    expect(checkUserLogged).toHaveBeenCalledWith(sessionId);
    expect(checkUserAlreadyLogged).toHaveBeenCalledTimes(1);
    expect(checkUserAlreadyLogged).toHaveBeenCalledWith(sessionId);
  });

  it('check user already logged return false when checkUserAlreadyLogged return null', async () => {
    expect.hasAssertions();
    const checkUserAlreadyLogged = jest.spyOn(userCachingService, 'checkUserAlreadyLogged').mockResolvedValue(null);
    const checkUserLogged = jest.spyOn(userService, 'checkUserLogged');
    await expect(userService.checkUserLogged(sessionId)).resolves.toBe(false);
    expect(checkUserLogged).toHaveBeenCalledTimes(1);
    expect(checkUserLogged).toHaveBeenCalledWith(sessionId);
    expect(checkUserAlreadyLogged).toHaveBeenCalledTimes(1);
    expect(checkUserAlreadyLogged).toHaveBeenCalledWith(sessionId);
  });

  it('check user already logged failed when validate got unknown error', async () => {
    expect.hasAssertions();
    jest.spyOn(LoginSessionPayload.prototype, 'validate').mockRejectedValue(UnknownError);
    const checkUserAlreadyLogged = jest
      .spyOn(userCachingService, 'checkUserAlreadyLogged')
      .mockResolvedValue(sessionString);
    const checkUserLogged = jest.spyOn(userService, 'checkUserLogged');
    await expect(userService.checkUserLogged(sessionId)).rejects.toThrow(UnknownError);
    expect(checkUserLogged).toHaveBeenCalledTimes(1);
    expect(checkUserLogged).toHaveBeenCalledWith(sessionId);
    expect(checkUserAlreadyLogged).toHaveBeenCalledTimes(1);
    expect(checkUserAlreadyLogged).toHaveBeenCalledWith(sessionId);
  });

  it('check user already logged failed when checkUserAlreadyLogged got unknown error', async () => {
    expect.hasAssertions();
    jest.spyOn(LoginSessionPayload.prototype, 'validate').mockResolvedValue([]);
    const checkUserAlreadyLogged = jest
      .spyOn(userCachingService, 'checkUserAlreadyLogged')
      .mockRejectedValue(UnknownError);
    const checkUserLogged = jest.spyOn(userService, 'checkUserLogged');
    await expect(userService.checkUserLogged(sessionId)).rejects.toThrow(UnknownError);
    expect(checkUserLogged).toHaveBeenCalledTimes(1);
    expect(checkUserLogged).toHaveBeenCalledWith(sessionId);
    expect(checkUserAlreadyLogged).toHaveBeenCalledTimes(1);
    expect(checkUserAlreadyLogged).toHaveBeenCalledWith(sessionId);
  });
});
