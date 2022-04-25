import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import Account from 'App/Models/Account';
import { AccountService } from 'App/Services/AccountService';
import { RequestValidationService } from 'App/Util/RequestValidation';
import { rules } from '@ioc:Adonis/Core/Validator';

export default class AccountsController {
  public async getSingle({ auth, params }: HttpContextContract) {
    const user = await auth.authenticate();
    const accountService = new AccountService();

    return await accountService.get(user, params.id);
  }

  public async getUserAccounts({ auth, request }: HttpContextContract) {
    const user = await auth.authenticate();
    const accountService = new AccountService();

    const getInactiveAccounts =
      await RequestValidationService.validateOptionalBoolean(
        request,
        'getInactiveAccounts',
        []
      );

    let active: boolean[] = [true];

    if (getInactiveAccounts === true) {
      active.push(false);
    }

    return await accountService.getUserAccounts(user, active);
  }

  public async getFamilyAccounts({ auth, request }: HttpContextContract) {
    const user = await auth.authenticate();
    const accountService = new AccountService();

    const getInactiveAccounts =
      await RequestValidationService.validateOptionalBoolean(
        request,
        'getInactiveAccounts',
        []
      );

    let active: boolean[] = [true];

    if (getInactiveAccounts === true) {
      active.push(false);
    }

    return await accountService.getFamilyAccounts(user, active);
  }

  public async create({ auth, request }: HttpContextContract) {
    const user = await auth.authenticate();
    const accountService = new AccountService();
    let account = new Account();

    account.description = await RequestValidationService.validateString(
      request,
      'description',
      [rules.maxLength(120)]
    );

    account.accountCategoryId = await RequestValidationService.validateNumber(
      request,
      'accountCategoryId',
      [
        rules.exists({
          table: 'account_categories',
          column: 'id',
          where: { family_id: user.familyId },
        }),
      ]
    );

    account.privateAccount = await RequestValidationService.validateBoolean(
      request,
      'privateAccount',
      []
    );

    account.active = true;
    account.userId = user.id;

    return await accountService.create(account);
  }

  public async edit({ auth, request, params }: HttpContextContract) {
    const user = await auth.authenticate();
    const accountService = new AccountService();

    const description = await RequestValidationService.validateString(
      request,
      'description',
      [rules.maxLength(120)]
    );

    const accountCategoryId = await RequestValidationService.validateNumber(
      request,
      'accountCategoryId',
      [
        rules.exists({
          table: 'account_categories',
          column: 'id',
          where: { family_id: user.familyId },
        }),
      ]
    );

    const privateAccount = await RequestValidationService.validateBoolean(
      request,
      'privateAccount',
      []
    );

    const active = await RequestValidationService.validateBoolean(
      request,
      'active',
      []
    );

    return await accountService.edit(
      user,
      params.id,
      description,
      privateAccount,
      accountCategoryId,
      active
    );
  }

  public async delete({ auth, params }) {
    const user = await auth.authenticate();
    const accountService = new AccountService();

    return accountService.delete(user, params.id);
  }
}
