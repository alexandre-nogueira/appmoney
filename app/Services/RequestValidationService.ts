import { RequestContract } from '@ioc:Adonis/Core/Request';
import { schema, rules, Rule } from '@ioc:Adonis/Core/Validator';

export abstract class RequestValidationService {
  public static async validateEmail(request: RequestContract, field: string) {
    const authSchema = schema.create({
      [field]: schema.string({}, [rules.email()]),
    });
    const payload = await request.validate({ schema: authSchema });
    return payload[field];
  }

  public static async validateString(
    request: RequestContract,
    field: string,
    rules: Rule[]
  ) {
    const authSchema = schema.create({
      [field]: schema.string({}, rules),
    });
    const payload = await request.validate({ schema: authSchema });
    return payload[field];
  }

  public static async validateNumber(
    request: RequestContract,
    field: string,
    rules: Rule[]
  ) {
    const authSchema = schema.create({
      [field]: schema.number(rules),
    });
    const payload = await request.validate({ schema: authSchema });
    return payload[field];
  }
}
