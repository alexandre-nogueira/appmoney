import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class ResetPasswordStatuses extends BaseSchema {
  protected tableName = 'reset_password_tokens';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('status').nullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
