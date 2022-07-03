import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddTokenFamilyInvitations extends BaseSchema {
  protected tableName = 'family_invitations';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('token').notNullable().unique();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
