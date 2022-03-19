import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class ChangeResetTokenStatusToStrings extends BaseSchema {
  protected tableName = 'reset_password_tokens';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('status', 10).alter();
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('status').alter();
    });
  }
}
