defmodule VoxelHandler.Order do
  use Ecto.Schema
  import Ecto.Changeset
  alias VoxelHandler.Repo
  alias VoxelHandler.Order, as: Ele

  schema "order" do
    field :address, :string
    field :information, :string
    field :signature, :string
    field :unique_id, :string
    field :finished, :boolean, default: false
    timestamps()
  end

  def get_all(), do: Repo.all(Ele)

  def get_by_unique_id(id) do
    Repo.get_by(Ele, unique_id: id)
  end

  def create(attrs \\ %{}) do
    %Ele{}
    |> Ele.changeset(attrs)
    |> Repo.insert()
  end

  def update(%Ele{} = ele, attrs) do
    ele
    |> changeset(attrs)
    |> Repo.update()
  end

  def changeset(%Ele{} = ele) do
    Ele.changeset(ele, %{})
  end

  @doc false
  def changeset(%Ele{} = ele, attrs) do
    ele
    |> cast(attrs, [:address, :information, :signature, :unique_id, :finished])
    |> unique_constraint(:unique_id)
  end
end
