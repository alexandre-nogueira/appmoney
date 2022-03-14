import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import User from 'App/Models/User';
import { RequestValidationService } from 'App/Services/RequestValidationService';
import { UserService } from 'App/Services/UserService';
import { rules } from '@ioc:Adonis/Core/Validator';

export default class UsersController {
  //Register new user
  public async register({ response, request, auth }: HttpContextContract) {
    const userService = new UserService();
    let user: User = new User();

    user.email = await RequestValidationService.validateEmail(request, 'email');

    user.firstName = await RequestValidationService.validateString(
      request,
      'first_name',
      [rules.minLength(2)]
    );

    user.lastName = await RequestValidationService.validateString(
      request,
      'last_name',
      [rules.minLength(2)]
    );

    user.password = await RequestValidationService.validateString(
      request,
      'password',
      [rules.minLength(5)]
    );

    const registeredUserData = await userService.register(user, auth);
    if (registeredUserData) {
      await userService.sendConfirmationEmail(
        registeredUserData.user.email,
        registeredUserData.confirmationCode
      );
      response.status(200);
      return registeredUserData.user;
    }
  }

  public async confirmToken({ params, response }: HttpContextContract) {
    if (params.token) {
      const userService = new UserService();
      if (await userService.confirmUserCode(params.token)) {
        response.status(200);
        return { message: 'User confirmed' };
      }
    }
  }

  //Login
  public async login({ request, auth }: HttpContextContract) {
    const userService = new UserService();

    const email = await RequestValidationService.validateEmail(
      request,
      'email'
    );

    const password = await RequestValidationService.validateString(
      request,
      'password',
      [rules.minLength(5)]
    );

    return userService.login(email, password, auth);
  }

  public async loggout({ auth }: HttpContextContract) {
    return await auth.logout();
  }

  public async getMyData({ auth }: HttpContextContract) {
    return await auth.authenticate();
  }
}
