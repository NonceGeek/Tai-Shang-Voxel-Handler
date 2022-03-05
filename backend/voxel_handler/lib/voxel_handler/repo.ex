defmodule VoxelHandler.Repo do
  use Ecto.Repo,
    otp_app: :voxel_handler,
    adapter: Ecto.Adapters.Postgres
end
