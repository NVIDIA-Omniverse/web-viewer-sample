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

/*
 * The Web Viewer Sample is configured by default to connect to the USD Viewer application template and includes web UI
 * elements for sending messages to a running Kit application. This is necessary for the USD Viewer template, which in
 * the default use case requires a client to send a request to open a file.
 */
import 'bootstrap/dist/css/bootstrap.min.css';
import { AppStreamer } from '@nvidia/omniverse-webrtc-streaming-library';
import { Component } from 'react';
import "./App.css";
import Window from './Window';
import StreamOnlyWindow from './StreamOnlyWindow';
import { Application, AppOnlyForm, ServerURLsForm, ApplicationsForm, VersionsForm, ProfilesForm } from "./Forms"
import LogoImage from './assets/nvidia_logo.png';
import StreamConfig from '../stream.config.json';
import {
    getStreamingSessionInfo,
    createStreamingSession,
    destroyStreamingSession,
    StreamItem
} from './Endpoints';

export const headerHeight: number = 60;

enum StreamStatus {
    IDLE,
    INITIALIZING,
    INITIALIZED
}

export enum Forms {
    IDLE,
    AppOnly,
    StreamURLs,
    Applications,
    Versions,
    Profiles,
    Stream,
    StreamOnly
}

interface AppState {
    currentForm: Forms,
    useWebUI: boolean 
    streamServer: string,
    appServer: string,
    applications: Application[];
    applicationVersions: string[];
    applicationProfiles: string[];
    selectedApplicationId: string;
    selectedApplicationVersion: string;
    selectedApplicationProfile: string;
    streamStatus: StreamStatus;
    connectionText: string;
    backendUrl: string;
    signalingserver: string;
    signalingport: number;
    mediaserver: string;
    mediaport: number;
    accessToken: string;
    sessionId: string;
}

class App extends Component<{}, AppState>{
    constructor(props: {}) {
        super(props);
        this.state = {
            currentForm: Forms.AppOnly,
            useWebUI: true,
            streamServer: StreamConfig.stream.streamServer,
            appServer: StreamConfig.stream.appServer,
            applications: [],
            applicationVersions: [],
            applicationProfiles: [],
            selectedApplicationId: '',
            selectedApplicationVersion: '',
            selectedApplicationProfile: '',
            streamStatus: StreamStatus.IDLE,
            connectionText: '',
            backendUrl: '',
            signalingserver: '',
            signalingport: 0,
            mediaserver: '',
            mediaport: 0,
            accessToken: '',
            sessionId: '',
        };

        this._resetStream = this._resetStream.bind(this);
    }

    /**
     * Resets application state to default values
    */
    private _resetState() {
        this.setState({
            currentForm: Forms.AppOnly,
            useWebUI: true,
            streamServer: StreamConfig.stream.streamServer,
            appServer: StreamConfig.stream.appServer,
            applications: [],
            applicationVersions: [],
            applicationProfiles: [],
            selectedApplicationId: '',
            selectedApplicationVersion: '',
            selectedApplicationProfile: '',
            streamStatus: StreamStatus.IDLE,
            connectionText: '',
            backendUrl: '',
            signalingserver: '',
            signalingport: 0,
            mediaserver: '',
            mediaport: 0,
            accessToken: '',
            sessionId: '',
        });
    }

    /**
     * Polls for the session to be ready
     * 
     * @param sessionId - The ID of the session
     */
    async pollForSessionReady(sessionId: string) {
        try {
            console.info("polling for session");
            const response = await getStreamingSessionInfo(this.state.streamServer, sessionId);
            if (response.status === 200) {
                console.info("Session is ready. Waiting before setup...");
                //await this.sleep(30000); // 5 seconds delay, hardcoded for testing
                console.info("Delay complete. Setting up stream...");
                this.setupStream(response.data as StreamItem);
            }
            else {
                setTimeout(() => this.pollForSessionReady(sessionId), 10000);
                console.log( `Waiting for session ${sessionId} to be ready... Last checked at ${new Date().toLocaleTimeString()}`)
            }
        } catch (error) {
            console.error('Error polling session info:', error);
        }
    }

    /**
     * Creates and sets up a new streaming session
     * 
     * @param appId - The ID of the Kit application
     * @param version - The version of the Kit application
     * @param profile - The profile of the Kit application
     * @returns 
     */
   async _startStream(appId: string, version: string, profile: string) {
        this.setState({ currentForm: Forms.IDLE, selectedApplicationProfile: profile})
        console.log(`Creating Session for ${appId} ${version}. Errors are expected as the stream updates.`);
        this.setState({ connectionText: "Attempting to create streaming session..." })
        const createdStreamResponse = await createStreamingSession(this.state.streamServer, appId, version, profile);
        if (createdStreamResponse.status > 400) {
                console.log(`Failed to create a new streaming session for ${appId} ${version}. Error code ${createdStreamResponse.status}`);
                alert(`Failed to create a new streaming session for ${appId} ${version}. Error code ${createdStreamResponse.status}`)
                this._resetState()
                return;
            }
        
        this.setState({ sessionId: (createdStreamResponse.data as StreamItem).id, streamStatus: StreamStatus.INITIALIZING, connectionText: "Attempting to load stream..." })
        if (createdStreamResponse.status === 202) {
            this.pollForSessionReady((createdStreamResponse.data as StreamItem).id);
            return;
        }

        this.setupStream((createdStreamResponse.data as StreamItem));
    }
        
    /**
     * Sets up the stream with the created stream data
     * 
     * @param createdStream - The created stream data
     */
    setupStream(createdStream: StreamItem) {
        console.info("createdStream", createdStream);
        
        const sessionId = createdStream.id;
        const serverIP = Object.keys(createdStream.routes)[0];
        const routeData = createdStream.routes[serverIP].routes;

        const signalingData = routeData.find((item: any) => item.description === 'signaling');
        const mediaData = routeData.find((item: any) => item.description === 'media');
    
        if (!signalingData || !mediaData) {
            console.error('Signaling or media data is missing');
            return;
        }
                    
        this.setState({
            backendUrl: `${this.state.streamServer}/streaming/stream`,
            signalingserver: serverIP,
            signalingport: signalingData.source_port,
            mediaserver: serverIP,
            mediaport: mediaData.source_port,
            accessToken: '',
            sessionId: sessionId,
            currentForm: Forms.Stream,
            streamStatus: StreamStatus.INITIALIZED
        });
    }
    
    /**
     * Button press for ending stream
    */
    private async _resetStream() {
        await this._endStream()
        this._resetState()
        AppStreamer.terminate()
    }


    /**
     * Ends the currently running stream by the unique ID
    */
    private async _endStream() {
        const sessionId = this.state.sessionId;
        if (!sessionId) {
            return;
        }

        const response = await getStreamingSessionInfo(this.state.streamServer, sessionId);
        if (response.status !== 200) {
            return;
        }
        
        const destroyResponse = await destroyStreamingSession(this.state.streamServer, sessionId);
        if ('detail' in destroyResponse) {
            alert(destroyResponse.detail);
            return;
        }

        console.info(`Streaming Session ${sessionId} Destroyed`);
    }
            
    render() {

        return (
            <div
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%'
            }}
            >

            {/* Header */}
            <div className="header-bar">
                <img src={LogoImage} alt="Logo" className="header-logo" />
                    <span className="header-title">Omniverse Embedded Web Viewer Example</span>
                </div>

            { /* End Stream button */}
            {StreamConfig.source === "stream" &&
                <button className="nvidia-button"
                onClick={() => this._resetStream()}
                style={{ position: "absolute", right: "15px", top:"8px", width: "250px", visibility: this.state.streamStatus === StreamStatus.INITIALIZING || this.state.streamStatus === StreamStatus.INITIALIZED? "visible": "hidden" }}
                >
                End Stream
                </button>
            }
            
            { /* Idle Form */}
            {this.state.currentForm === Forms.IDLE &&
                <div>
                    <div className="loading-indicator-label">
                        {this.state.connectionText}          
                        <div className="spinner-border" role="status" style={{ marginTop: 10, visibility: this.state.streamStatus === (StreamStatus.INITIALIZING) ? 'visible': 'hidden'}} />
                    </div>
                </div>
            }

            { /* App Only Form  */}
            {(this.state.currentForm === Forms.AppOnly) &&
                <AppOnlyForm
                onNext={(state) => this.setState(StreamConfig.source === "stream" ?
                    { currentForm: Forms.StreamURLs, useWebUI: state.useWebUI } :
                    { currentForm: Forms.Stream, useWebUI: state.useWebUI })}
                    />        
                }

            { /* Stream URLs Form  */}
            {(this.state.currentForm === Forms.StreamURLs) &&
                <ServerURLsForm
                    appServer={this.state.appServer}
                    streamServer={this.state.streamServer}
                    onNext={(appServer, streamServer, applications) => this.setState({currentForm: Forms.Applications, appServer: appServer, streamServer: streamServer, applications: applications })}
                    onBack={(appServer, streamServer) => this.setState({currentForm: Forms.AppOnly, appServer: appServer, streamServer: streamServer })}
                />         
            }
                
            { /* Applications Form  */}
            {(this.state.currentForm === Forms.Applications) &&
                <ApplicationsForm
                appServer={this.state.appServer}
                applications={this.state.applications}
                onNext={(applicationId, versions) => this.setState({currentForm: Forms.Versions, selectedApplicationId: applicationId, applicationVersions: versions})}
                onBack={() => this.setState({currentForm: Forms.StreamURLs, selectedApplicationId: '', applicationVersions: []})}
                />           
            }
                
            { /* Application Versions Form  */}
            {(this.state.currentForm === Forms.Versions) &&
                <VersionsForm
                appServer={this.state.appServer}
                applicationId={this.state.selectedApplicationId}
                versions={this.state.applicationVersions}
                onNext={(selectedVersion, profiles) => this.setState({ currentForm: Forms.Profiles, selectedApplicationVersion: selectedVersion, applicationProfiles: profiles })}
                onBack={() => this.setState({currentForm: Forms.Applications,  selectedApplicationVersion: '', applicationProfiles: []})}
                />   
            }
                
            { /* Application Profiles Form  */}
            {(this.state.currentForm === Forms.Profiles) &&
                <ProfilesForm
                profiles={this.state.applicationProfiles}
                onNext={(selectedApplicationProfile) => this._startStream(this.state.selectedApplicationId, this.state.selectedApplicationVersion, selectedApplicationProfile)}
                onBack={() => this.setState({currentForm: Forms.Versions, selectedApplicationProfile: '', applicationProfiles: [] })}
                />       
            }
                
            { /* Stream with UI Form  */}
            {(this.state.currentForm === Forms.Stream) && this.state.useWebUI &&
                <Window
                    sessionId={this.state.sessionId}
                    backendUrl={this.state.backendUrl}
                    signalingserver={this.state.signalingserver}
                    signalingport={this.state.signalingport}
                    mediaserver={this.state.mediaserver}
                    mediaport={this.state.mediaport}
                    accessToken={this.state.accessToken}
                    onStreamFailed={this._resetStream}
                />    
                }
                
            { /* Stream without UI Form  */}
            {(this.state.currentForm === Forms.Stream) && (!this.state.useWebUI) &&
                <StreamOnlyWindow
                    sessionId={this.state.sessionId}
                    backendUrl={this.state.backendUrl}
                    signalingserver={this.state.signalingserver}
                    signalingport={this.state.signalingport}
                    mediaserver={this.state.mediaserver}
                    mediaport={this.state.mediaport}
                    accessToken={this.state.accessToken}
                    onStreamFailed={this._resetStream}
                />    
            }  
        </div>
    )
}    
}

export default App;
