class CreateAdmins < ActiveRecord::Migration[5.0]
  def change
    create_table :admins do |t|
      t.string :name
      t.string :email
      t.boolean :enabled, default: true
      t.string :password_digest

      t.timestamps
    end
  end
end
