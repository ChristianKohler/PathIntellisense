{ config, pkgs, ... }:

{
  imports =
    [
      # test if path completion works without string quotes
      ./apps/
    ]
    ++ [./services/]; # check if path completion still work even with characters prefixed

  system.stateVersion = "23.11";
}
