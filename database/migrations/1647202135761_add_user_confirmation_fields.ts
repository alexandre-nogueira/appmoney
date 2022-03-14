import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddUserConfirmationFields extends BaseSchema {
  protected tableName = 'users';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('status');
      table.string('confirmation_code');
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
