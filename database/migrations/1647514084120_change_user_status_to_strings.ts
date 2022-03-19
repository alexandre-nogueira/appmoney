import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class ChangeUserStatusToStrings extends BaseSchema {
  protected tableName = 'users';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('status', 20).alter();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('status').alter();
    });
  }
}
