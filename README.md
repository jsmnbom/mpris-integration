# Mpris integration

Adds [mpris](https://specifications.freedesktop.org/mpris-spec/latest/) integration for certain sites using a Firefox Webextension.

It allows you to have proper media key support for webplayers like youtube and spotify.

## Sites

The extension currently works with the following sites

- Spotify (open.spotify.com)
- Youtube (youtube.com)

## Getting started

### Prerequisites

The following software is required to use this project.

- A fairly recent version of firefox (anything above version 64.0 should be fine)
- glib, dbus (install using your package manager)
- Something to interact with mpris players (like playerctl or gnome shell)

### Installing

1. Install the webextension
    - Compiled version at [addons.mozilla.org](https://addons.mozilla.org/en-US/firefox/addon/mpris-integration/)
    - Or compile it yourself (see below)
2. Install the native host
    - Compiled version from [here](https://github.com/jsmnbom/mpris-integration/releases).
    - Or compile it yourself (see below)
3. Add a native manifest file
    - Copy the [mpris_integration_native_app.json](mpris_integration_native_app.json) file to `~/.mozilla/native-messaging-hosts/` and replace the `path` key with the location of the native host binary.

~~If you're running Arch Linux, steps 2 and 3 can be replaced by installing the AUR package [media-integration-native-host](https://aur.archlinux.org/)~~ (not yet released).

## Compiling yourself

### Compile prerequisites

In addition to the prerequisites above you will also need

- A copy of the source (clone this repo)
- [web-ext](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Getting_started_with_web-ext)
- rust and cargo (install using package manager or [rustup](https://www.rust-lang.org/tools/install))

### The extension

1. In the add-on/ directory, run the `web-ext build` command. The build extension will be placed as a .zip in `add-on/web-ext-artifacts`. To install it, look [here](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Getting_started_with_web-ext#Packaging_your_extension).
2. Run `cargo build` (optionally with the `--release` flag to make an optimized build). The binary will be placed in `target/{debug,release}`.

Don't forget to also add a native manifest file as described in the installation section.

## License

This webextension and native host is licensed under the [MIT license](LICENSE.txt).

## Acknowledgements

Icon made by [Freepik](https://www.freepik.com/") from [www.flaticon.com](https://www.flaticon.com/) is licensed by [CC 3.0 BY](http://creativecommons.org/licenses/by/3.0/).