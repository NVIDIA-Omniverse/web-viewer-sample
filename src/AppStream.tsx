/*
 * SPDX-FileCopyrightText: Copyright (c) 2024 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NvidiaProprietary
 *
 * NVIDIA CORPORATION, its affiliates and licensors retain all intellectual
 * property and proprietary rights in and to this material, related
 * documentation and any modifications thereto. Any use, reproduction,
 * disclosure or distribution of this material and related documentation
 * without an express license agreement from NVIDIA CORPORATION or
 * its affiliates is strictly prohibited.
 */
import React from "react";
// @ts-ignore
import { AppStreamer } from '@nvidia/omniverse-webrtc-streaming-library';
import './AppStream.css';

interface StreamConfig {
    source: 'gfn' | 'local';
    server?: string;
}

interface AppStreamProps {
    streamConfig: StreamConfig;
    onLoggedIn: (userId: string) => void;
    onStarted: () => void;
    handleCustomEvent: (message: any) => void;
    style: React.CSSProperties;
    onFocus: () => void;
    onBlur: () => void;
}

interface AppStreamState {
    streamReady: boolean;
}

export default class AppStream extends React.Component<AppStreamProps, AppStreamState> {
    private _requested: boolean;

    constructor(props: AppStreamProps) {
        super(props);
        this._requested = false;
        this.state = {
            streamReady: false
        };
    }

    componentDidMount() {
      if (!this._requested) {
          this._requested = true;

          let streamConfig: any = {};

          if (this.props.streamConfig.source === 'gfn') {
              streamConfig = this.props.streamConfig;
          }
          if (this.props.streamConfig.source === 'local') {
              this.props.onLoggedIn('localUser');

              const server = this.props.streamConfig.server;
              const width = 1920;
              const height = 1080;
              const fps = 60;
              const url = `server=${server}&resolution=${width}:${height}&fps=${fps}&mic=0&cursor=free&autolaunch=true`;

              streamConfig = {
                  source: 'local',
                  videoElementId: 'remote-video',
                  audioElementId: 'remote-audio',
                  messageElementId: 'message-display',
                  urlLocation: { search: url }
              };
        }

        try {
          AppStreamer.setup({
              streamConfig: streamConfig,
              onUpdate: (message: any) => this._onUpdate(message),
              onStart: (message: any) => this._onStart(message),
              onCustomEvent: (message: any) => this._onCustomEvent(message)
          })
          .then((result: any) => {
              console.info(result);
          })
          .catch((error: any) => {
              console.error(error);
          });
        }
        catch (error) {
            console.error(error);
        }
      }
    }

    componentDidUpdate(_prevProps: AppStreamProps, prevState: AppStreamState) {
      if (prevState.streamReady === false && this.state.streamReady === true) {
          const player = document.getElementById("gfn-stream-player-video") as HTMLVideoElement;

          if (player) {
              player.tabIndex = -1;
              player.playsInline = true;
              player.muted = true;

              player.play().catch(e => console.error('Error playing video:', e));
          }
      }
    }

    static sendMessage(message: string, storeSelection?: boolean) {
        AppStreamer.sendMessage(message, storeSelection);
    }

    private _onStart(message: any) {
        if (message.action === 'start' && message.status === 'success' && !this.state.streamReady) {
            console.info('streamReady');
            this.setState({ streamReady: true });
            this.props.onStarted();
        }

        console.debug(message);
    }

    private _onUpdate(message: any) {
        try {
            if (message.action === 'authUser' && message.status === 'success') {
                this.props.onLoggedIn(message.info);
            }
        }
        catch (error) {
            console.error(message);
        }
    }

    private _onCustomEvent(message: any) {
        this.props.handleCustomEvent(message);
    }

    //@ts-ignore
    private _onFocus() {
        console.log("FOCUS");
    }

    //@ts-ignore
    private _onBlur() {
        console.log("BLUR");
    }

    render() {
        return (
            <div
                key={'stream-canvas'}
                id={'main-div'}
                style={{
                    visibility: this.state.streamReady ? 'visible' : 'hidden',
                    outline: 'none',
                    ...this.props.style
                }}
            >
                <div
                    id={'aspect-ratio-div'}
                    tabIndex={0}
                    onFocus={this.props.onFocus}
                    onBlur={this.props.onBlur}
                    style={{
                        position: 'relative',
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                        paddingBottom: '56.25%',
                        outline: 'none'
                    }}
                >
                    {this.props.streamConfig.source === 'gfn' &&
                        <div
                            id="view"
                            style={{
                                backgroundColor : '#dddddd',
                                display         : 'flex', justifyContent: 'space-between',
                                width           : '100%',
                                height          : '100%',
                                position        : 'absolute',
                                top             : 0,
                                bottom          : 0,
                                left            : 0,
                                right           : 0,
                                outline         : 'none'
                            }}
                        />}
                    {this.props.streamConfig.source === 'local' &&
                        <>
                            <video
                                key={'video-canvas'}
                                id={'remote-video'}
                                style={{
                                    position    : 'absolute',
                                    top         : 0,
                                    bottom      : 0,
                                    left        : 0,
                                    right       : 0,
                                    outline     : 'none'
                                }}
                                tabIndex={-1}
                                playsInline
                                muted
                                autoPlay/>
                            <audio id="remote-audio" muted></audio>
                            <h3 style={{visibility: 'hidden'}} id="message-display">...</h3>
                        </>
                    }
                </div>
            </div>
        );
    }
}
