{ config, pkgs, ... }:

{
  # path completion for above "test.nix"
  test.path = [ ../ ]
}
