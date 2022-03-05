defmodule VoxelHandlerWeb.UploaderController do
  use VoxelHandlerWeb, :controller

  def handle(conn, params) do

    json(conn, %{ok: :ok})
  end
end
