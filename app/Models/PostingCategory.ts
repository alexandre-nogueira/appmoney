import { DateTime } from 'luxon';
import {
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  HasOne,
  hasOne,
} from '@ioc:Adonis/Lucid/Orm';
import Family from './Family';
import AppBaseModel from './AppBaseModel';
import Posting from './Posting';

export default class PostingCategory extends AppBaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public familyId: number;
  @hasOne(() => Family)
  public family: HasOne<typeof Family>;

  @column()
  public description: string;

  @column()
  public nature: string;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
