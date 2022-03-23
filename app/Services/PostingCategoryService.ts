import { Exception } from '@adonisjs/core/build/standalone';
import PostingCategory from 'App/Models/PostingCategory';
import User from 'App/Models/User';

export class PostingCategoryService {
  public async create(postingCategory: PostingCategory) {
    return await postingCategory.save();
  }

  public async edit(user: User, id: number, description: string) {
    let changed = false;

    const postingCategory = await this.checkOwnership(user, id);

    if (postingCategory.description !== description) {
      changed = true;
      postingCategory.description = description;
    }
    if (changed === true) {
      return await postingCategory.save();
    } else {
      throw new Exception('No data changed', 400, 'E_NO_DATA_CHANGED');
    }
  }

  public async get(user: User, id: number) {
    return this.checkOwnership(user, id);
  }

  public async getList(familyId: number) {
    return await PostingCategory.query().where('familyId', familyId);
  }

  public async delete(user: User, id: number) {
    const postingCategory = await this.checkOwnership(user, id);
    await postingCategory.delete();
    return postingCategory;
  }

  private async checkOwnership(user: User, id: number) {
    const postingCategory = await PostingCategory.query()
      .where('id', id)
      .andWhere('familyId', user.familyId)
      .first();

    if (!postingCategory) {
      throw new Exception(
        'Account category does not exists',
        400,
        'E_ENTITY_DOES_NOT_EXISTS'
      );
    }
    return postingCategory;
  }
}
