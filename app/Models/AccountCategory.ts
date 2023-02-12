import { DateTime } from 'luxon';
import {
  belongsTo,
  column,
  HasOne,
  hasOne,
  BelongsTo,
} from '@ioc:Adonis/Lucid/Orm';
import Family from './Family';
import AppBaseModel from './AppBaseModel';
import Account from './Account';

export default class AccountCategory extends AppBaseModel {
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
