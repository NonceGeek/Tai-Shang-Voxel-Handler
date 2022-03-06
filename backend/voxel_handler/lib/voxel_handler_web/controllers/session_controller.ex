defmodule VoxelHandlerWeb.SessionController do
  use VoxelHandlerWeb, :controller
  alias VoxelHandler.Users.User
  alias Pow.Ecto.Schema.Password

  def new(conn, _params) do
    render(conn, "sign_in.html")
  end

  def create(conn, %{"session" =>
    %{
      "email" => email,
      "password" => pwd
    }}) do
    user = User.get_by_email(email)

    with false <- is_nil(user),
      true <- Password.pbkdf2_verify(pwd, user.password_hash) do
        conn
        |> put_session(:current_user_id, user.id)
        |> redirect(to: "/")
      else
        _error ->
          conn
          |> put_flash(:error, "There was a problem with your username/password")
          |> render("sign_in.html")
    end
  end

  @spec delete(Plug.Conn.t(), any) :: Plug.Conn.t()
  def delete(conn, _params) do
    conn
    |> delete_session(:current_user_id)
    # |> put_flash(:info, "Signed out successfully.")
    |> redirect(to: "/")
  end
end
