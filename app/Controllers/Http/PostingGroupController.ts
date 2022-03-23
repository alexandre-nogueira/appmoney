import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import PostingGroup from 'App/Models/PostingGroup';
import { PostingGroupService } from 'App/Services/PostingGroupService';
import { rules } from '@ioc:Adonis/Core/Validator';
import { RequestValidationService } from 'App/Services/RequestValidationService';

export default class PostingGroupsController {
  public async getList({ auth }: HttpContextContract) {
    const user = await auth.authenticate();
    const postingGroupService = new PostingGroupService();

    return await postingGroupService.getList(user.familyId);
  }

  public async getSingle({ auth, params }: HttpContextContract) {
    const user = await auth.authenticate();
    const postingGroupService = new PostingGroupService();
    return await postingGroupService.get(user, params.id);
  }

  public async create({ auth, request }: HttpContextContract) {
    const user = await auth.authenticate();
    const postingGroupService = new PostingGroupService();
    let postingGroup = new PostingGroup();

    postingGroup.description = await RequestValidationService.validateString(
      request,
      'description',
      [rules.maxLength(120)]
    );
    postingGroup.familyId = user.familyId;

    return await postingGroupService.create(postingGroup);
  }

  public async edit({ auth, request, params }: HttpContextContract) {
    const user = await auth.authenticate();
    const postingGroupService = new PostingGroupService();

    const newDescription = await RequestValidationService.validateString(
      request,
      'description',
      [rules.maxLength(120)]
    );

    return postingGroupService.edit(user, params.id, newDescription);
  }

  public async delete({ auth, params }: HttpContextContract) {
    const user = await auth.authenticate();
    const postingGroupService = new PostingGroupService();

    return postingGroupService.delete(user, params.id);
  }
}
