import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class FamilyInvitationStatuses extends BaseSchema {
  protected tableName = 'family_invitations';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('status', 15);
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
