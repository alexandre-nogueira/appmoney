export class CrudUtilities {
  public compareField(
    newValue: any,
    obj: any,
    field: string,
    changed: boolean
  ) {
    if (newValue !== obj[field]) {
      obj[field] = newValue;
      console.log('entrei no campo', field, obj[field], newValue);
      console.log(typeof obj[field], typeof newValue);
      return true;
    }
    return changed;
  }
}
