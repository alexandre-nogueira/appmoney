import { Exception } from '@adonisjs/core/build/standalone';
import AccountCategory from 'App/Models/AccountCategory';
import User from 'App/Models/User';
import { CrudUtilities } from 'App/Util/crudUtilities';

export class AccountCategoryService {
  private stdReturn = ['id', 'familyId', 'description'];

  public async create(accountCategory: AccountCategory) {
    const crudUtilities = new CrudUtilities();
    return crudUtilities.formatReturn(
      await accountCategory.save(),
      this.stdReturn
    );
  }

  public async edit(user: User, id: number, description: string) {
    let changed = false;
    const crudUtilities = new CrudUtilities();

    const accountCategory = await this.checkOwnership(user, id);

    changed = crudUtilities.compareField(
      description,
      accountCategory,
      'description',
      changed
    );

    if (changed === true) {
      return crudUtilities.formatReturn(
        await accountCategory.save(),
        this.stdReturn
      );
    } else {
      throw new Exception('No data changed', 400, 'E_NO_DATA_CHANGED');
    }
  }

  public async get(user: User, id: number) {
    const crudUtilities = new CrudUtilities();
    return crudUtilities.formatReturn(
      await this.checkOwnership(user, id),
      this.stdReturn
    );
  }

  public async getList(familyId: number) {
    return await AccountCategory.query()
      .select(this.stdReturn)
      .where('familyId', familyId);
  }

  public async delete(user: User, id: number) {
    const crudUtilities = new CrudUtilities();
    const accountCategory = await this.checkOwnership(user, id);
    await accountCategory.delete();
    return crudUtilities.formatReturn(accountCategory, this.stdReturn);
  }

  private async checkOwnership(user: User, id: number) {
    const accountCategory = await AccountCategory.query()
      .where('id', id)
      .andWhere('familyId', user.familyId)
      .first();

    if (!accountCategory) {
      throw new Exception(
        'Account category does not exists',
        400,
        'E_ENTITY_DOES_NOT_EXISTS'
      );
    }
    return accountCategory;
  }
}
