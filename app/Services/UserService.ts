import { Exception } from '@adonisjs/core/build/standalone';
import { AuthContract } from '@ioc:Adonis/Addons/Auth';
import User from 'App/Models/User';
import { TokenTypes } from 'App/types/TokenTypes';
import { UserStatus } from 'App/types/UserStatus';
import { NotificationService } from './notificationService';
import { TokenService } from './tokenService';
import ResetPasswordToken from 'App/Models/ResetPasswordToken';
import { DateTime } from 'luxon';
import { ResetTokenStatus } from 'App/types/ResetTokenStatus';

export class UserService {
  //Create and register a new user.
  public async register(user: User, auth: AuthContract) {
    //Generate confirmation user token.
    const tokenService = new TokenService();
    user.confirmationCode = await tokenService.generateJWT({
      email: user.email,
    });

    user.status = UserStatus.PENDING;

    await this.save(user);

    const newUser = await this.generateAuthToken(
      user,
      TokenTypes.GENERATE,
      auth
    );
    if (newUser) {
      return { user: newUser, confirmationCode: user.confirmationCode };
    }
  }

  //LOGIN method
  public async login(email: string, password: string, auth: AuthContract) {
    let user: User = new User();
    user.email = email;
    user.password = password;

    const loggedUser = await this.generateAuthToken(
      user,
      TokenTypes.LOGIN,
      auth
    );

    if (loggedUser?.status !== UserStatus.ACTIVE) {
      throw new Exception(
        'User email not confirmed',
        401,
        'E_USER_NOT_CONFIRMED'
      );
    }
    return { email: loggedUser.email, token: loggedUser.token };
  }

  //Update user password
  public async updatePassword(
    user: User,
    auth: AuthContract,
    newPassword: string
  ) {
    //const user = await auth.authenticate();
    // if (user) {
    user.password = newPassword;
    await this.save(user);
    return this.generateAuthToken(user, TokenTypes.GENERATE, auth);
    // }
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
      resetPasswordToken.status = ResetTokenStatus.NEW;
      await resetPasswordToken.save();
      return { email: email, resetCode: resetPasswordToken.token };
    } else {
      throw new Exception('User does not exists', 400, 'E_USER_NOT_EXISTS');
    }
  }

  public async validateResetPasswordToken(token: string) {
    const rpt = await ResetPasswordToken.query().where('token', token).first();
    if (
      rpt?.status !== ResetTokenStatus.NEW ||
      rpt?.expiresAt < DateTime.now()
    ) {
      throw new Exception(
        'Invalid Token',
        400,
        'E_INVALID_RESET_PASSWORD_TOKEN'
      );
    } else {
      return User.find(rpt.userId);
    }
  }

  public async destroyResetToken(token: string) {
    const rpt = await ResetPasswordToken.query().where('token', token).first();
    if (rpt) {
      rpt.status = ResetTokenStatus.USED;
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

    if (await user.save()) {
      return user;
    }
  }

  //Generate JWT and return user data
  private async generateAuthToken(
    user: User,
    tokenType: TokenTypes,
    auth: AuthContract
  ) {
    let token: any;
    if (tokenType === TokenTypes.GENERATE) {
      token = await auth.use('api').generate(user, { expiresIn: '1 days' });
    } else if (tokenType === TokenTypes.LOGIN) {
      token = await auth
        .use('api')
        .attempt(user.email, user.password, { expiresIn: '1 days' });
    }
    if (token) {
      return {
        id: user.id,
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        token: token.token,
        status: token.user.status,
      };
    }
  }

  //Send an email to the new registered user with the confirmation link
  public async sendConfirmationEmail(email: string, confirmationCode: string) {
    console.log({ email: email, confirmationCode: confirmationCode });
    const notificationService = new NotificationService();
    notificationService.sendFakeMail(
      'App Money Confirmation',
      email,
      `<h2>Por favor confirme seu cadastro
      <a href=http://127.0.0.1:3333/api/confirm/${confirmationCode}>
      clicando aqui</a></h2>`
    );
  }

  public async confirmUserCode(token: string) {
    const user = await User.query().where('confirmation_code', token).first();
    if (user) {
      user.status = UserStatus.ACTIVE;
      user.confirmationCode = '';
      user.save();
      return true;
    } else {
      throw new Exception(
        'Invalid confirmation code',
        400,
        'E_INVALID_CONFIRMATION_CODE'
      );
    }
  }
}
