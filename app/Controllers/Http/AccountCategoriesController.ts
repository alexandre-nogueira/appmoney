import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import AccountCategory from 'App/Models/AccountCategory';
import { AccountCategoryService } from 'App/Services/AccountCategoryService';
import { RequestValidationService } from 'App/Util/RequestValidation';
import { rules } from '@ioc:Adonis/Core/Validator';

export default class AccountCategoriesController {
  public async getList({ auth }: HttpContextContract) {
    const user = await auth.authenticate();
    const accountCategoryService = new AccountCategoryService();

    return await accountCategoryService.getList(user.familyId);
  }

  public async getSingle({ auth, params }: HttpContextContract) {
    const accountCategoryService = new AccountCategoryService();
    const user = await auth.authenticate();
    return await accountCategoryService.get(user, params.id);
  }

  public async create({ auth, request }: HttpContextContract) {
    const user = await auth.authenticate();
    const accountCategoryService = new AccountCategoryService();
    let accountCategory = new AccountCategory();

    accountCategory.description = await RequestValidationService.validateString(
      request,
      'description',
      [rules.maxLength(120)]
    );

    accountCategory.familyId = user.familyId;

    return await accountCategoryService.create(accountCategory);
  }

  public async edit({ auth, request, params }: HttpContextContract) {
    const accountCategoryService = new AccountCategoryService();
    const user = await auth.authenticate();

    const newDescription = await RequestValidationService.validateString(
      request,
      'description',
      [rules.maxLength(120)]
    );

    return accountCategoryService.edit(user, params.id, newDescription);
  }

  public async delete({ auth, params }: HttpContextContract) {
    const accountCategoryService = new AccountCategoryService();
    const user = await auth.authenticate();

    return accountCategoryService.delete(user, params.id);
  }
}
