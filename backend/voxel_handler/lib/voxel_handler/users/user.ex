defmodule VoxelHandler.Users.User do
  use Ecto.Schema
  use Pow.Ecto.Schema
  alias VoxelHandler.Users.User, as: Ele
  alias VoxelHandler.Repo
  schema "users" do
    pow_user_fields()

    timestamps()
  end


  def get_all(), do: Repo.all(Ele)

  def get_by_email(email) do
    Repo.get_by(Ele, email: email)
  end

  def get_by_id(id) do
    Repo.get_by(Ele, id: id)
  end

  def create(ele) do
    %Ele{}
    |> changeset(ele)
    |> Repo.insert()
  end


end
