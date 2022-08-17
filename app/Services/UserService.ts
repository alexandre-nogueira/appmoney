import { Exception } from '@adonisjs/core/build/standalone';
import { AuthContract } from '@ioc:Adonis/Addons/Auth';
import User from 'App/Models/User';
import { UserStatus } from 'App/types/UserStatus';
import { NotificationService } from './notificationService';
import { TokenService } from './tokenService';
import ResetPasswordToken from 'App/Models/ResetPasswordToken';
import { DateTime } from 'luxon';
import { TokenStatus } from 'App/types/TokenStatus';
import { FamilyService } from './FamilyService';
import Family from 'App/Models/Family';

export class UserService {
  //Create and register a new user.
  public async register(user: User, auth: AuthContract) {
    //If the user is the first of a family, family must be created
    if (user.familyId === 0) {
      const familyService = new FamilyService();
      let newFamily = new Family();
      newFamily.description = user.lastName;
      newFamily = await familyService.create(newFamily);
      user.familyId = newFamily.id;
    }

    //Generate confirmation user token.
    const tokenService = new TokenService();
    user.confirmationCode = await tokenService.generateJWT({
      email: user.email,
    });

    user.status = UserStatus.PENDING;

    return await this.save(user);
  }

  //LOGIN method
  public async login(email: string, password: string, auth: AuthContract) {
    //Attempt login
    const tokenData = await auth
      .use('api')
      .attempt(email, password, { expiresIn: '30 days' });

    //Validate User status
    if (tokenData.user.status === UserStatus.PENDING) {
      throw new Exception(
        'User email not confirmed',
        401,
        'E_USER_NOT_CONFIRMED'
      );
    }
    if (tokenData.user.status === UserStatus.INACTIVE) {
      throw new Exception('User is inactive', 401, 'E_USER_INACTIVE');
    }

    //Return user data and token
    return { user: tokenData.user, APIToken: tokenData.token };
  }

  //Get the inactive user using through email
  public async getInactiveUser(email: string) {
    const user = await User.query().where('email', email).first();
    if (!user) {
      throw new Exception(
        'User does not exists',
        401,
        'E_USER_DOES_NOT_EXISTS'
      );
    }
    if (user.status !== UserStatus.INACTIVE) {
      throw new Exception('User is not inactive', 401, 'E_USER_NOT_INACTIVE');
    }
    return user;
  }

  //Generate token to recover inactive user;
  public async generateRecoverToken(user: User) {
    const tokenService = new TokenService();
    user.rememberMeToken = await tokenService.generateJWT({
      email: user.email,
    });
    await this.save(user);
    return user;
  }

  //Update user password
  public async updatePassword(
    user: User,
    auth: AuthContract,
    newPassword: string
  ) {
    const tokenService = new TokenService();
    user.password = newPassword;
    await this.save(user);
    return tokenService.generateAPIToken(user, auth);
  }

  //Delete - Set the user status to inactive
  public async inactivateUser(user: User) {
    if (user.status !== UserStatus.INACTIVE) {
      user.status = UserStatus.INACTIVE;
      await this.save(user);
    } else {
      throw new Exception('User is not active', 400, 'E_USER_NOT_ACTIVE');
    }
  }

  //Edit user data
  public async edit(user: User, firstName: string, lastName: string) {
    let changed = false;

    if (user.firstName !== firstName) {
      changed = true;
      user.firstName = firstName;
    }

    if (user.lastName !== lastName) {
      changed = true;
      user.lastName = lastName;
    }

    if (changed) {
      return await this.save(user);
    } else {
      throw new Exception('No data changed', 400, 'E_NO_DATA_CHANGED');
    }
  }

  //Generate reset code for forggotten passwords
  public async forgotPassword(email: string) {
    //Generate confirmation user token.
    let resetPasswordToken = new ResetPasswordToken();
    const user = await User.query().where('email', email).first();
    if (user) {
      const tokenService = new TokenService();
      resetPasswordToken.token = await tokenService.generateJWT({
        email: email,
        timeStamp: DateTime.now(),
      });
      resetPasswordToken.userId = user.id;
      resetPasswordToken.expiresAt = DateTime.now().plus({ hours: 1 });
      resetPasswordToken.status = TokenStatus.NEW;
      await resetPasswordToken.save();
      return { email: email, resetCode: resetPasswordToken.token };
    }
    // else {
    //   throw new Exception('User does not exists', 400, 'E_USER_NOT_EXISTS');
    // }
  }

  //Validate if the reset password token is valid.
  public async validateResetPasswordToken(token: string) {
    const rpt = await ResetPasswordToken.query().where('token', token).first();
    if (rpt?.status !== TokenStatus.NEW || rpt?.expiresAt < DateTime.now()) {
      throw new Exception(
        'Invalid Token',
        400,
        'E_INVALID_RESET_PASSWORD_TOKEN'
      );
    } else {
      return User.find(rpt.userId);
    }
  }

  public async validateRestoreUserToken(token: string) {
    const user = await User.query().where('remember_me_token', token).first();
    if (user?.status !== UserStatus.INACTIVE) {
      throw new Exception(
        'Invalid Token',
        400,
        'E_INVALID_RESET_PASSWORD_TOKEN'
      );
    }
    return user;
  }

  public async destroyResetToken(token: string) {
    const rpt = await ResetPasswordToken.query().where('token', token).first();
    if (rpt) {
      rpt.status = TokenStatus.USED;
      await rpt.save();
      return true;
    } else {
      throw new Exception(
        'Invalid Token',
        400,
        'E_INVALID_RESET_PASSWORD_TOKEN'
      );
    }
  }

  //Save user data
  private async save(user: User) {
    //put some validations here if necessary.

    return await user.save();
  }

  //Send an email to the new registered user with the confirmation link
  public async sendConfirmationEmail(
    email: string,
    confirmationCode: string,
    appLinkAdress: string
  ) {
    console.log({ email: email, confirmationCode: confirmationCode });
    const notificationService = new NotificationService();
    notificationService.sendFakeMail(
      'App Money Confirmation',
      email,
      `<h2>Por favor confirme seu cadastro
      <a href=${appLinkAdress}/${confirmationCode}>
      clicando aqui</a></h2>`
    );
  }

  //Send an email to recover inactive user
  public async sendRecoverUserEmail(
    email: string,
    confirmationCode: string,
    appLinkAdress: string
  ) {
    console.log({ email: email, confirmationCode: confirmationCode });
    const notificationService = new NotificationService();
    notificationService.sendFakeMail(
      'App Money - Recover User',
      email,
      `<h2>Para recuperar seu usuário,
        <a href=${appLinkAdress}/${confirmationCode}>
        clique aqui</a></h2>`
    );
  }

  //Send an email to the new registered user with the confirmation link
  public async sendResetPasswordEmail(
    email: string,
    resetCode: string,
    appLinkAdress: string
  ) {
    const notificationService = new NotificationService();
    notificationService.sendFakeMail(
      'App Money Reset Password',
      email,
      `<h2>Defina uma nova senha
        <a href=${appLinkAdress}/${resetCode}>
        clicando aqui</a></h2>`
    );
  }

  public async confirmUserCode(token: string) {
    const user = await User.query().where('confirmation_code', token).first();
    if (user) {
      user.status = UserStatus.ACTIVE;
      user.confirmationCode = '';
      await user.save();
      return true;
    } else {
      throw new Exception(
        'Invalid confirmation code',
        400,
        'E_INVALID_CONFIRMATION_CODE'
      );
    }
  }

  public async reactivateUser(user: User) {
    user.status = UserStatus.ACTIVE;
    user.rememberMeToken = '';
    await user.save();
  }
}
