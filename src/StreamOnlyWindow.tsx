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
import React from 'react';
import AppStream from './AppStream'; // Ensure .tsx extension if needed
import { AppProps } from './Window';
import { headerHeight } from './App';

export default class StreamOnly extends React.Component<AppProps> {
        
    constructor(props: AppProps) {
        super(props);
    }
    
    /**
    * @function _onStreamStarted
    *
    * Handle for post-stream start.
    */
    private _onStreamStarted (): void {
        console.log("The streaming session has started!")
    }
    
    /**
    * @function _handleCustomEvent
    *
    * Handle message from stream.
    */
    private _handleCustomEvent (event: any): void {
        console.log(event);
    }

    /**
     * @function _handleAppStreamFocus
     *
     * Triggered when user is interacting with the viewport.
     */
    private _handleAppStreamFocus (): void {
        console.log('User is interacting in streamed viewer');
    }

    /**
     * @function _handleAppStreamFocus
     *
     * Triggered when user is no longer interacting with the viewport.
     */
    private _handleAppStreamBlur (): void {
        console.log('User is not interacting in streamed viewer');
    }

    render() {

        return (
            <div
                style={{
                    position: 'absolute',
                    top: headerHeight,
                    width: '100%',
                    height: '100%'
                }}
            >
                <AppStream
                    sessionId={this.props.sessionId}
                    backendUrl={this.props.backendUrl}
                    signalingserver={this.props.signalingserver}
                    signalingport={this.props.signalingport}
                    mediaserver={this.props.mediaserver}
                    mediaport={this.props.mediaport}
                    accessToken={this.props.accessToken}
                    onStarted={() => this._onStreamStarted()}
                    onFocus={() => this._handleAppStreamFocus()}
                    onBlur={() => this._handleAppStreamBlur()}
                    style={{
                        position: 'relative',
                        top: 0,
                        left: 0,
                    }}
                    onLoggedIn={(userId) => console.log(`User logged in: ${userId}`)}
                    handleCustomEvent={(event) => this._handleCustomEvent(event)}
                    onStreamFailed={this.props.onStreamFailed}
                />
            </div>
            );
        }
    }
