import { DateTime } from 'luxon';
import { BaseModel, column, HasOne, hasOne } from '@ioc:Adonis/Lucid/Orm';
import Family from './Family';

export default class AccountCategory extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public familyId: number;
  @hasOne(() => Family)
  public family: HasOne<typeof Family>;

  @column()
  public description: string;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
