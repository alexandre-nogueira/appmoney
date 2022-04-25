import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AccountsChangePrivateFieldNames extends BaseSchema {
  protected tableName = 'accounts';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('private', 'private_account');
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('private_account', 'private');
    });
  }
}
