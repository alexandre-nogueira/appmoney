import { string } from '@ioc:Adonis/Core/Helpers';
export class CrudUtilities {
  public compareField(
    newValue: any,
    obj: any,
    field: string,
    changed: boolean
  ) {
    if (newValue !== obj[field]) {
      obj[field] = newValue;
      return true;
    }
    return changed;
  }

  public formatReturn(entity, fields: Array<string>) {
    let obj = new Object();

    fields.forEach((field) => {
      obj[field] = entity[field];
    });

    return obj;
  }
}
