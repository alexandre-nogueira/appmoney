import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class FamilyInvitations extends BaseSchema {
  protected tableName = 'family_invitations';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table
        .integer('family_id')
        .unsigned()
        .references('families.id')
        .notNullable();
      table.string('invited_email');
      table.string('host_email');
      table.string('message', 300);
      table.timestamp('expires_at', { useTz: true });
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
