import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AccountsActiveFields extends BaseSchema {
  protected tableName = 'accounts';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('active');
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
