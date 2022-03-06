# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#
# Inside the script, you can read and write to any of your
# repositories directly:
#
#     VoxelHandler.Repo.insert!(%VoxelHandler.SomeSchema{})
#
# We recommend using the bang functions (`insert!`, `update!`
# and so on) as they will fail if something goes wrong.

VoxelHandler.Users.User.create(
  %{email: "leeduckgo@leeduckgo.com",
  password: "123456789",
  password_confirmation: "123456789"})
