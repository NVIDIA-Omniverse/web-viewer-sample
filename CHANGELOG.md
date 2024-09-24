# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2024-09-24

### Added

- Loading state response is received from Kit to manage how assets are loaded and when stream is displayed
- Alternative Window for only showing the streamed application.
- 
### Changed

- Requires USD Viewer Template based application created using Kit 106.1.0 or more recent
- Progress indicator replaced with static messages indicating stream status
- Stream is not displayed unless asset is fully loaded
- USD asset does not force-loaded when client is launched if one of the client-supplied assets is already loaded in Kit
- Bumped dependency @nvidia/omniverse-webrtc-streaming-library to version 2.7.6.
- doReconnect and nativeTouchEvents properties passed to AppStreamer.setup
- Fixed errors with running `npm run build`.

## [1.0.0] - 2024-05-23

### Added

- Initial full external release of this sample application.