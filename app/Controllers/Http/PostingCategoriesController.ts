import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { PostingCategoryService } from 'App/Services/PostingCategoryService';
import { RequestValidationService } from 'App/Util/RequestValidation';
import { rules } from '@ioc:Adonis/Core/Validator';
import PostingCategory from 'App/Models/PostingCategory';
export default class PostingCategoriesController {
  public async getList({ auth }: HttpContextContract) {
    const user = await auth.authenticate();
    const postingCategoryService = new PostingCategoryService();

    return await postingCategoryService.getList(user.familyId);
  }

  public async getSingle({ auth, params }: HttpContextContract) {
    const user = await auth.authenticate();
    const postingCategoryService = new PostingCategoryService();
    return await postingCategoryService.get(user, params.id);
  }

  public async create({ auth, request }: HttpContextContract) {
    const user = await auth.authenticate();
    const postingCategoryService = new PostingCategoryService();
    let postingCategory = new PostingCategory();

    postingCategory.description = await RequestValidationService.validateString(
      request,
      'description',
      [rules.maxLength(120)]
    );
    postingCategory.familyId = user.familyId;

    return await postingCategoryService.create(postingCategory);
  }

  public async edit({ auth, request, params }: HttpContextContract) {
    const user = await auth.authenticate();
    const postingCategoryService = new PostingCategoryService();

    const newDescription = await RequestValidationService.validateString(
      request,
      'description',
      [rules.maxLength(120)]
    );

    return postingCategoryService.edit(user, params.id, newDescription);
  }

  public async delete({ auth, params }: HttpContextContract) {
    const user = await auth.authenticate();
    const postingCategoryService = new PostingCategoryService();

    return postingCategoryService.delete(user, params.id);
  }
}
