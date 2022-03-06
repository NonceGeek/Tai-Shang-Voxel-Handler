defmodule VoxelHandlerWeb.OrderController do
  use VoxelHandlerWeb, :controller
  alias VoxelHandler.Order
  def place_order(conn, %{
    "address" => addr,
    "message" => msg,
    "unique_id" => unique_id,
    "signature" => sig
  }) do
    result =
      msg
      |> EthWallet.verify_compact(sig, addr)
      |> handle_result()

    Order.create(%{
      address: addr,
      information: msg,
      unique_id: unique_id,
      signature: sig
    })
    text(conn, result)
  end

  def handle_result(true), do: "ur order is sent successful!"
  def handle_result(false), do: "signature is unvalid"

  def get_msg(conn, _params) do
    text(conn, RandGen.gen_hex(8))
  end
end
