import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import User from 'App/Models/User';
import { RequestValidationService } from 'App/Util/RequestValidation';
import { UserService } from 'App/Services/UserService';
import { rules } from '@ioc:Adonis/Core/Validator';

export default class UsersController {
  //Register new user
  public async register({ response, request, auth }: HttpContextContract) {
    const userService = new UserService();
    let user: User = new User();

    user.email = await RequestValidationService.validateString(
      request,
      'email',
      [rules.email(), rules.unique({ table: 'users', column: 'email' })]
    );

    user.firstName = await RequestValidationService.validateString(
      request,
      'firstName',
      [rules.minLength(2), rules.maxLength(120)]
    );

    user.lastName = await RequestValidationService.validateString(
      request,
      'lastName',
      [rules.minLength(2), rules.maxLength(120)]
    );

    user.password = await RequestValidationService.validateString(
      request,
      'password',
      [rules.minLength(5)]
    );

    user.familyId = await RequestValidationService.validateNumber(
      request,
      'familyId',
      []
    );

    if (user.familyId !== 0) {
      user.familyId = await RequestValidationService.validateNumber(
        request,
        'familyId',
        [rules.exists({ table: 'families', column: 'id' })]
      );
    }

    const registeredUserData = await userService.register(user, auth);
    if (registeredUserData) {
      await userService.sendConfirmationEmail(
        registeredUserData.email,
        registeredUserData.confirmationCode
      );
      response.status(200);
      registeredUserData.confirmationCode = '';
      return registeredUserData;
    }
  }

  //Confirm user registration token
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

    const userData = await userService.login(email, password, auth);

    return {
      APIToken: userData.APIToken,
      id: userData.user.id,
      email: userData.user.email,
      firstName: userData.user.firstName,
      lastName: userData.user.lastName,
      familyId: userData.user.familyId,
      status: userData.user.status,
    };
  }

  //Loggout
  public async loggout({ auth }: HttpContextContract) {
    return await auth.logout();
  }

  //Edit some user data
  public async edit({ auth, request }: HttpContextContract) {
    const userService = new UserService();

    let currentUser = await auth.authenticate();

    const firstName = await RequestValidationService.validateString(
      request,
      'first_name',
      [rules.minLength(2), rules.maxLength(120)]
    );

    const lastName = await RequestValidationService.validateString(
      request,
      'last_name',
      [rules.minLength(2), rules.maxLength(120)]
    );

    return await userService.edit(currentUser, firstName, lastName);
  }

  //Get user data
  public async getMyData({ auth }: HttpContextContract) {
    return await auth.authenticate();
  }

  //Update user password
  public async updatePassword({ request, auth }: HttpContextContract) {
    const userService = new UserService();

    const user = await auth.authenticate();

    const newPassword = await RequestValidationService.validateString(
      request,
      'newPassword',
      [rules.minLength(5)]
    );

    const tokenData = await userService.updatePassword(user, auth, newPassword);
    return { user: tokenData.user, token: tokenData.token };
  }

  //Generates the reset code for Forgotten password
  public async forgotPassword({ request }: HttpContextContract) {
    const userService = new UserService();

    const email = await RequestValidationService.validateEmail(
      request,
      'email'
    );

    return userService.forgotPassword(email);
  }

  //Reset password using the reset code
  public async resetPassword({ params, request, auth }: HttpContextContract) {
    const userService = new UserService();

    const newPassword = await RequestValidationService.validateString(
      request,
      'newPassword',
      [rules.minLength(5)]
    );

    const user = await userService.validateResetPasswordToken(params.resetCode);
    if (user) {
      const userUpdated = await userService.updatePassword(
        user,
        auth,
        newPassword
      );
      if (userUpdated) {
        await userService.destroyResetToken(params.resetCode);
        return userUpdated;
      }
    }
  }

  //Recover inactivated user
  public async recoverUser({ request, response }: HttpContextContract) {
    const userService = new UserService();
    const email = await RequestValidationService.validateEmail(
      request,
      'email'
    );
    let user = await userService.getInactiveUser(email);
    await userService.generateRecoverToken(user);

    await userService.sendRecoverUserEmail(email, user.rememberMeToken);

    response.status(200);
    return { message: `Recover email send to ${user.email}` };
  }

  //Confirm token to reactivate userr
  public async confirmRecoverToken({
    request,
    params,
    response,
  }: HttpContextContract) {
    const newPassword = await RequestValidationService.validateString(
      request,
      'newPassword',
      [rules.minLength(5)]
    );
    if (params.token) {
      const userService = new UserService();

      const user = await userService.validateRestoreUserToken(params.token);

      user.password = newPassword;
      await userService.reactivateUser(user);

      response.status(200);
      return { message: `User ${user.email} recovered` };
    }
  }

  //Set user as inactive
  public async delete({ response, auth }: HttpContextContract) {
    const user = await auth.authenticate();
    const userService = new UserService();
    await userService.inactivateUser(user);
    response.status(200);
    return { message: `User ${user.email} is now inactive` };
  }
}
