import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { FamilyService } from 'App/Services/FamilyService';
import { RequestValidationService } from 'App/Services/RequestValidationService';
import { rules } from '@ioc:Adonis/Core/Validator';

export default class FamiliesController {
  //Edit Family
  public async edit({ request, auth }: HttpContextContract) {
    const familyService = new FamilyService();
    const user = await auth.authenticate();

    let family = await familyService.get(user.familyId);

    family.description = await RequestValidationService.validateString(
      request,
      'description',
      [rules.minLength(2), rules.maxLength(150)]
    );

    return await familyService.edit(family);
  }
}
