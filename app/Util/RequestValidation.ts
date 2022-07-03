import { RequestContract } from '@ioc:Adonis/Core/Request';
import { schema, rules, Rule } from '@ioc:Adonis/Core/Validator';
import { DateTime } from 'luxon';

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

  public static async validateOptionalString(
    request: RequestContract,
    field: string,
    rules: Rule[]
  ) {
    const authSchema = schema.create({
      [field]: schema.string.optional({}, rules),
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

  public static async validateOptionalNumber(
    request: RequestContract,
    field: string,
    rules: Rule[]
  ) {
    const authSchema = schema.create({
      [field]: schema.number.optional(rules),
    });
    const payload = await request.validate({ schema: authSchema });
    return payload[field];
  }

  public static async validateBoolean(
    request: RequestContract,
    field: string,
    rules: Rule[]
  ) {
    const authSchema = schema.create({ [field]: schema.boolean(rules) });
    const payload = await request.validate({ schema: authSchema });
    return payload[field];
  }

  public static async validateOptionalBoolean(
    request: RequestContract,
    field: string,
    rules: Rule[]
  ) {
    const authSchema = schema.create({
      [field]: schema.boolean.optional(rules),
    });
    const payload = await request.validate({ schema: authSchema });
    return payload[field];
  }

  public static async validateDate(
    request: RequestContract,
    field: string,
    rules: Rule[]
  ) {
    const authSchema = schema.create({
      [field]: schema.date({ format: 'yyyy-MM-dd' }, rules),
    });
    const payload = await request.validate({ schema: authSchema });
    return payload[field];
  }

  public static async validateOptionalDate(
    request: RequestContract,
    field: string,
    rules: Rule[]
  ) {
    const authSchema = schema.create({
      [field]: schema.date.optional({ format: 'yyyy-MM-dd' }, rules),
    });
    const payload = await request.validate({ schema: authSchema });
    return payload[field];
  }

  public static async validateNumberArray(
    request: RequestContract,
    field: string,
    rules: Rule[]
  ) {
    const authSchema = schema.create({
      [field]: schema.array().members(schema.number(rules)),
    });
    const payload = await request.validate({ schema: authSchema });
    return payload[field];
  }

  public static async validateStringArray(
    request: RequestContract,
    field: string,
    rules: Rule[]
  ) {
    const authSchema = schema.create({
      [field]: schema.array().members(schema.string({}, rules)),
    });
    const payload = await request.validate({ schema: authSchema });
    return payload[field];
  }

  public static async validateEnum(
    request: RequestContract,
    field: string,
    values: string[]
  ) {
    const authSchema = schema.create({
      [field]: schema.enum(values),
    });
    const payload = await request.validate({ schema: authSchema });
    return payload[field];
  }
}
