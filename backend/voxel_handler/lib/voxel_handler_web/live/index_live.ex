defmodule VoxelHandlerWeb.IndexLive do
  use VoxelHandlerWeb, :live_view
  alias VoxelHandler.Order
  @impl true
  def mount(_params, session, socket) do
    do_mount(session, socket)
  end

  def do_mount(%{"current_user_id" => _user_id}, socket) do
    orders = Order.get_all()
    {
      :ok,
      socket
      |> assign(logined: true)
      |> assign(orders: orders)
    }
  end

  def do_mount(_, socket) do
    {
      :ok,
      socket
      |> assign(logined: false)
    }
  end
  @impl true
  def handle_event(_key, _params, socket) do
    {:noreply, socket}
  end

end
