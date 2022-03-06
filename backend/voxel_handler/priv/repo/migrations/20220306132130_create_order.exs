defmodule VoxelHandler.Repo.Migrations.CreateOrder do
  use Ecto.Migration

  def change do
    create table :order do
      add :address, :string
      add :information, :text
      add :unique_id, :string
      add :signature, :string
      add :finished, :boolean, default: false
      timestamps()
    end
  end
end
