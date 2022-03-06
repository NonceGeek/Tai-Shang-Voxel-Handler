defmodule VoxelHandlerWeb.SigVerifierController do
  use VoxelHandlerWeb, :controller

  @msg_to_sign "i am a message, and i need to sign............."

  def verify_sig(conn, %{
    "address" => addr,
    "message" => msg,
    "signature" => sig
  }) do
    result =
      msg
      |> EthWallet.verify_compact(sig, addr)
      |> handle_result()
    text(conn, result)
  end

  def handle_result(true), do: "signature is valid"
  def handle_result(false), do: "signature is unvalid"
  def get_msg(conn, _params) do
    text(conn, @msg_to_sign)
  end
end
