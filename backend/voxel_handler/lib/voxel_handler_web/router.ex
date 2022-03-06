defmodule VoxelHandlerWeb.Router do

  use VoxelHandlerWeb, :router
  # for user
  use Pow.Phoenix.Router
  use Pow.Extension.Phoenix.Router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, {VoxelHandlerWeb.LayoutView, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :protected do
    plug Pow.Plug.RequireAuthenticated,
    error_handler: Pow.Phoenix.PlugErrorHandler
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  pipeline :api_allow_cross do
    plug CORSPlug, origin: [~r/.*/]
    plug :accepts, ["json"]
  end

  scope "/", VoxelHandlerWeb do
    pipe_through :browser

    live "/", IndexLive, :index

    # user sign in
    get "/user/sign-in", SessionController, :new
    post "/user/sign-in", SessionController, :create
    get "/user/logout", SessionController, :delete
  end

  # Other scopes may use custom stacks.
  scope "/voxel_handler/api/v1", VoxelHandlerWeb do
    pipe_through :api_allow_cross
    get "/place_order", OrderController, :get_msg
    post "/place_order", OrderController, :place_order

    get "/verify_sig", SigVerifierController, :get_msg
    post "/verify_sig", SigVerifierController, :verify_sig
  end

  # Enables LiveDashboard only for development
  #
  # If you want to use the LiveDashboard in production, you should put
  # it behind authentication and allow only admins to access it.
  # If your application does not have an admins-only section yet,
  # you can use Plug.BasicAuth to set up some basic authentication
  # as long as you are also using SSL (which you should anyway).
  # if Mix.env() in [:dev, :test] do
  #   import Phoenix.LiveDashboard.Router

  #   scope "/" do
  #     pipe_through :browser
  #     live_dashboard "/dashboard", metrics: VoxelHandlerWeb.Telemetry
  #   end
  # end

  # Enables the Swoosh mailbox preview in development.
  #
  # Note that preview only shows emails that were sent by the same
  # node running the Phoenix server.
  if Mix.env() == :dev do
    scope "/dev" do
      pipe_through :browser

      forward "/mailbox", Plug.Swoosh.MailboxPreview
    end
  end
end
