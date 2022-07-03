import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { FamilyService } from 'App/Services/FamilyService';
import { RequestValidationService } from 'App/Util/RequestValidation';
import { rules } from '@ioc:Adonis/Core/Validator';

export default class FamiliesController {
  //Edit Family
  public async edit({ request, auth }: HttpContextContract) {
    const familyService = new FamilyService();
    const user = await auth.authenticate();

    const description = await RequestValidationService.validateString(
      request,
      'description',
      [rules.minLength(2), rules.maxLength(150)]
    );

    return await familyService.edit(user, description);
  }

  public async inviteMember({ request, auth, response }: HttpContextContract) {
    const familyService = new FamilyService();
    const user = await auth.authenticate();

    const invitedEmail = await RequestValidationService.validateEmail(
      request,
      'invitedEmail'
    );

    const message = await RequestValidationService.validateString(
      request,
      'message',
      [rules.maxLength(300)]
    );

    const token = await familyService.generateMemberInvitation(
      user,
      invitedEmail,
      message
    );
    if (token) {
      response.status(200);
      return {
        invitedEmail: invitedEmail,
        message: 'Novo membro da família convidado com sucesso',
      };
    } else {
      response.status(400);
      return {
        invitedEmail: invitedEmail,
        message: 'Não foi possível convidar o novo membro da família',
      };
    }
  }

  public async getMemberInvitation({ params }: HttpContextContract) {
    const familyService = new FamilyService();

    return familyService.getMemberInvitation(params.token);
  }

  public async getMembers({ auth }: HttpContextContract) {
    const user = await auth.authenticate();
    const familyService = new FamilyService();

    return await familyService.getMembers(user.familyId);
  }
}
