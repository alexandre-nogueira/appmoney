import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AlterUserFkFamilies extends BaseSchema {
  protected tableName = 'users';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .integer('family_id')
        .unsigned()
        .references('families.id')
        .onDelete('CASCADE')
        .notNullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
