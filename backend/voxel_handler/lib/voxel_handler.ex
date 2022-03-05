defmodule VoxelHandler do
  @moduledoc """
  handle voxel
  """

  def folder_to_arweave(folder_path, priv_key_path) do
    "arkb deploy #{folder_path} --auto-confirm --wallet #{priv_key_path}"
    |> String.to_charlist()
    |> :os.cmd()
  end
end
