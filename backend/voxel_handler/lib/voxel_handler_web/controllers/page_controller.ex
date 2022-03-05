defmodule VoxelHandlerWeb.PageController do
  use VoxelHandlerWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end
end
