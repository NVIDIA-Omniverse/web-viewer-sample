# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2025-01-08

### Changed
- Bumped dependency @nvidia/omniverse-webrtc-streaming-library to version 4.4.2.
- Polling frequency for streaming session availability changed from every 2 minutes to every 10 seconds.

## [1.3.1] - 2025-01-07

### Fixed
- WebSocket connection error when ending stream.
- Failure when starting a new streaming session after ending one

## [1.3.0] - 2024-11-13

### Added
- Error checking when AppStream fails to start

### Changed
- Bumped dependency @nvidia/omniverse-webrtc-streaming-library to version 3.6.0.

## [1.2.0] - 2024-10-24

### Added
- Omniverse Application Streaming Instance support
- Setup Wizard-style interface for selecting streaming options

### Changed
- Bumped dependency @nvidia/omniverse-webrtc-streaming-library to version 3.2.0.

## [1.1.0] - 2024-09-19

### Added

- Loading state response is received from Kit to manage how assets are loaded and when stream is displayed

### Changed

- Requires USD Viewer Template based application created using Kit 106.1.0 or more recent
- Progress indicator replaced with static messages indicating stream status
- Stream is not displayed unless asset is fully loaded
- USD asset does not force-loaded when client is launched if one of the client-supplied assets is already loaded in Kit
- Bumped dependency @nvidia/omniverse-webrtc-streaming-library to version 2.7.6.


## [1.0.3] - 2024-08-15

### Changed

- Bumped dependency @nvidia/omniverse-webrtc-streaming-library to version 2.7.0.
- doReconnect and nativeTouchEvents properties passed to AppStreamer.setup

## [1.0.2] - 2024-07-16

### Added

- Alternative Window for developers when running a Kit application with no Front End UI.

## [1.0.1] - 2024-07-03

### Changed

- Bumped dependency @nvidia/omniverse-webrtc-streaming-library to version 2.1.13.
- Fixed errors with running `npm run build`.

## [1.0.0] - 2024-05-23

### Added

- Initial full external release of this sample application.