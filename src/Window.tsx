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
import './App.css';
import AppStream from './AppStream'; // Ensure .tsx extension if needed
import StreamConfig from '../stream.config.json';
import USDAsset from "./USDAsset";
import USDStage from "./USDStage";
import { headerHeight } from './App';


interface USDAssetType {
    name: string;
    url: string;
}

interface USDPrimType {
    name?: string;
    path: string;
    children?: USDPrimType[];
}

export interface AppProps {
    sessionId: string
    backendUrl: string
    signalingserver: string
    signalingport: number
    mediaserver: string
    mediaport: number
    accessToken: string
    onStreamFailed: () => void;
}

interface AppState {
    usdAssets: USDAssetType[];
    selectedUSDAsset: USDAssetType;
    usdPrims: USDPrimType[];
    selectedUSDPrims: Set<USDPrimType>;
    isKitReady: boolean;
    showStream: boolean;
    showUI: boolean;
    isLoading: boolean;
    loadingText: string; 
}

interface AppStreamMessageType {
    event_type: string;
    payload: any;
}

export default class App extends React.Component<AppProps, AppState> {
    
    private usdStageRef = React.createRef<USDStage>();
    // private _streamConfig: StreamConfigType = getConfig();
    
    constructor(props: AppProps) {
        super(props);
        
        // list of selectable USD assets
        const usdAssets: USDAssetType[] = StreamConfig.source === "stream"? [
            {name: "Sample 1", url:"/app/samples/stage01.usd"},
            {name: "Sample 2", url:"/app/samples/stage02.usd"},
        ]
        :
        [
            {name: "Sample 1", url:"./samples/stage01.usd"},
            {name: "Sample 2", url:"./samples/stage02.usd"},
        ];

        this.state = {
            usdAssets: usdAssets,
            selectedUSDAsset: usdAssets[0],
            usdPrims: [],
            selectedUSDPrims: new Set<USDPrimType>(),
            isKitReady: false,
            showStream: false,
            showUI: false,
            loadingText: StreamConfig.source === "gfn" ? "Log in to GeForce NOW to view stream" : (StreamConfig.source === "stream" ? "Waiting for stream to initialize":  "Waiting for stream to begin"),
            isLoading: StreamConfig.source === "stream" ? true : false
        }
    }

    /**
    * @function _queryLoadingState
    *
    * Sends Kit a message to find out what the loading state is.
    * Receives a 'loadingStateResponse' event type
    */
    private _queryLoadingState(): void {
        const message: AppStreamMessageType = {
            event_type: "loadingStateQuery",
            payload: {}
        };
        AppStream.sendMessage(JSON.stringify(message));
    }

    /**
     * @function _onStreamStarted
     *
     * Sends a request to open an asset. If the stream is from GDN it is assumed that the
     * application will automatically load an asset on startup so a request to open a stage
     * is not sent. Instead, we wait for the streamed application to send a
     * openedStageResult message.
     */
        private _onStreamStarted(): void {
            this._pollForKitReady()
        }

    /**
    * @function _pollForKitReady
    *
    * Attempts to query Kit's loading state until a response is received.
    * Once received, the 'isKitReady' flag is set to true and polling ends
    */
    async _pollForKitReady() {
        if (this.state.isKitReady === true) return

        console.info("polling Kit availability")
        this._queryLoadingState()
        setTimeout(() => this._pollForKitReady(), 3000); // Poll every 3 seconds
    }
    
    /**
     * @function _getAsset
     * 
     * Attempts to retrieve an asset from the list of USD assets based on a supplied USD path
     * If a match is not found, a USDAssetType with empty values is returned.
     */
    private _getAsset(path: string): USDAssetType {
        if (!path)
            return {name: "", url: ""}
        
        // returns the file name from a path
        const getFileNameFromPath = (path: string): string | undefined => path.split(/[/\\]/).pop();

        for (const asset of this.state.usdAssets) {
            if (getFileNameFromPath(asset.url) === getFileNameFromPath(path))
                return asset
        }
        
        return {name: "", url: ""}
    }

    /**
    * @function _onLoggedIn
    *
    * Runs when the user logs in
    */
    private _onLoggedIn(userId: string): void {
        if (StreamConfig.source === "gfn"){
            console.info(`Logged in to GeForce NOW as ${userId}`)
            this.setState({ loadingText: "Waiting for stream to begin", isLoading: false})
        }
    }

    /**
    * @function _openSelectedAsset
    *
    * Send a request to load an asset based on the currently selected asset
    */
    private _openSelectedAsset(): void {
        this.setState({ loadingText: "Loading Asset...", showStream: false, isLoading: true })
        this.setState({ usdPrims: [], selectedUSDPrims: new Set<USDPrimType>() });
        this.usdStageRef.current?.resetExpandedIds();
        console.log(`Sending request to open asset: ${this.state.selectedUSDAsset.url}.`);
        const message: AppStreamMessageType = {
            event_type: "openStageRequest",
            payload: {
                url: this.state.selectedUSDAsset.url
            }
        };
        AppStream.sendMessage(JSON.stringify(message));
    }

    /**
    * @function _onSelectUSDAsset
    *
    * React to user selecting an asset in the USDAsset selector.
    */
    private _onSelectUSDAsset (usdAsset: USDAssetType): void {
        console.log(`Asset selected: ${usdAsset.name}.`);
        this.setState({ selectedUSDAsset: usdAsset }, () => {
            this._openSelectedAsset();
        });
    }
    
    /**
    * @function _getChildren
    *
    * Send a request for the child prims of the given usdPrim.
    * Note that a filter is supported.
    */
    private _getChildren (usdPrim: USDPrimType | null = null): void {
        // Get geometry prims. If no usdPrim is specified then get children of /World.
        console.log(`Requesting children for path: ${usdPrim ? usdPrim.path : '/World'}.`);
        const message: AppStreamMessageType = {
            event_type: "getChildrenRequest",
            payload: {
                prim_path   : usdPrim ? usdPrim.path : '/World',
                filters     : ['USDGeom']
            }
        };
        AppStream.sendMessage(JSON.stringify(message));
    }

    /**
    * @function _makePickable
    *
    * Send a request to make prims pickable/selectable.
    * By default the client requests to make only a handful of the prims selectable - leaving the background items unselectable.
    */
    private _makePickable (usdPrims: USDPrimType[]): void {
        const paths: string[] = usdPrims.map(prim => prim.path);
        console.log(`Sending request to make prims pickable: ${paths}.`);
        const message: AppStreamMessageType = {
            event_type: "makePrimsPickable",
            payload: {
                paths   : paths,
            }
        };
        AppStream.sendMessage(JSON.stringify(message));
    }

    /**
    * @function _onSelectUSDPrims
    *
    * React to user selecting items in the USDStage list.
    * Sends a request to change the selection in the USD Stage.
    */
    private _onSelectUSDPrims (selectedUsdPrims: Set<USDPrimType>): void {
        console.log(`Sending request to select: ${selectedUsdPrims}.`);
        this.setState({ selectedUSDPrims: selectedUsdPrims });
        const paths: string[] = Array.from(selectedUsdPrims).map(obj => obj.path);
        const message: AppStreamMessageType = {
            event_type: "selectPrimsRequest",
            payload: {
                paths: paths
            }
        };
        AppStream.sendMessage(JSON.stringify(message));

        selectedUsdPrims.forEach(usdPrim => {this._onFillUSDPrim(usdPrim)});
    }

    /**
    * @function _onStageReset
    *
    * Clears the selection and sends a request to reset the stage to how it was at the time it loaded.
    */
    private _onStageReset (): void {
        this.setState({ selectedUSDPrims: new Set<USDPrimType>() });
        const selection_message: AppStreamMessageType = {
            event_type: "selectPrimsRequest",
            payload: {
                paths: []
            }
        };
        AppStream.sendMessage(JSON.stringify(selection_message));

        const reset_message: AppStreamMessageType = {
            event_type: "resetStage",
            payload: {}
        };
        AppStream.sendMessage(JSON.stringify(reset_message));
    }

    /**
    * @function _onFillUSDPrim
    *
    * If the usdPrim has a children property a request is sent for its children.
    * When the streaming app sends an empty children value it is not an array.
    * When a prim does not have children the streaming app does not provide a children
    * property to begin with.
    */
    private _onFillUSDPrim (usdPrim: USDPrimType): void {
        if (usdPrim !== null && "children" in usdPrim && !Array.isArray(usdPrim.children)) {
            this._getChildren(usdPrim);
        }
    }
    
    /**
    * @function _findUSDPrimByPath
    *
    * Recursive search for a USDPrimType object by path.
    */
    private _findUSDPrimByPath (path: string, array: USDPrimType[] = this.state.usdPrims): USDPrimType | null {
        if (Array.isArray(array)) {
            for (const obj of array) {
                if (obj.path === path) {
                    return obj;
                }
                if (obj.children && obj.children.length > 0) {
                    const found = this._findUSDPrimByPath(path, obj.children);
                    if (found) {
                        return found;
                    }
                }
            }
        }
        return null;
    }
    
    /**
    * @function _handleCustomEvent
    *
    * Handle message from stream.
    */
    private _handleCustomEvent (event: any): void {
        if (!event) {
            return;
        }

        // response received once a USD asset is fully loaded
        if (event.event_type === "openedStageResult") {
            if (event.payload.result === "success") {
                this._queryLoadingState() 
            }
            else {
                console.error('Kit App communicates there was an error loading: ' + event.payload.url);
            }
        }
        
        // response received from the 'loadingStateQuery' request
        else if (event.event_type == "loadingStateResponse") {
            // loadingStateRequest is used to poll Kit for proof of life.
            // For the first loadingStateResponse we set isKitReady to true
            // and run one more query to find out what the current loading state
            // is in Kit
            if (this.state.isKitReady === false) {
                console.info("Kit is ready to load assets")
                this.setState({ isKitReady: true })
                this._queryLoadingState()
            }
            
            else {
                const usdAsset: USDAssetType = this._getAsset(event.payload.url)
                const isStageValid: boolean = !!(usdAsset.name && usdAsset.url)
                
                // set the USD Asset dropdown to the currently opened stage if it doesn't match
                if (isStageValid && usdAsset !== undefined && this.state.selectedUSDAsset !== usdAsset)
                    this.setState({ selectedUSDAsset: usdAsset })

                // if the stage is empty, force-load the selected usd asset; the loading state is irrelevant
                if (!event.payload.url)
                    this._openSelectedAsset()
                
                // if a stage has been fully loaded and isn't a part of this application, force-load the selected stage
                else if (!isStageValid && event.payload.loading_state === "idle"){
                    console.log(`The loaded asset ${event.payload.url} is invalid.`)
                    this._openSelectedAsset()
                }
                
                // show stream and populate children if the stage is valid and it's done loading
                if (isStageValid && event.payload.loading_state === "idle")
                {
                    this._getChildren()
                    this.setState({ showStream: true, loadingText: "Asset loaded", showUI: true, isLoading: false })
                }
            }
        }
        
        // Loading progress amount notification.
        else if (event.event_type === "updateProgressAmount") {
            console.log('Kit App communicates progress amount.');
        }
            
        // Loading activity notification.
        else if (event.event_type === "updateProgressActivity") {
            console.log('Kit App communicates progress activity.');
            if (this.state.loadingText !== "Loading Asset...")
                this.setState( {loadingText: "Loading Asset...", isLoading: true} )
        }
            
        // Notification from Kit about user changing the selection via the viewport.
        else if (event.event_type === "stageSelectionChanged") {
            console.log(event.payload.prims.constructor.name);
            if (!Array.isArray(event.payload.prims) || event.payload.prims.length === 0) {
                console.log('Kit App communicates an empty stage selection.');
                this.setState({ selectedUSDPrims: new Set<USDPrimType>() });
            }
            else {
                console.log('Kit App communicates selection of a USDPrimType: ' + event.payload.prims.map((obj: any) => obj).join(', '));
                const usdPrimsToSelect: Set<USDPrimType> = new Set<USDPrimType>();
                event.payload.prims.forEach((obj: any) => {
                    const result = this._findUSDPrimByPath(obj);
                    if (result !== null) {
                        usdPrimsToSelect.add(result);
                    }
                });
                this.setState({ selectedUSDPrims: usdPrimsToSelect });
            }
        }
        // Streamed app provides children of a parent USDPrimType
        else if (event.event_type === "getChildrenResponse") {
            console.log('Kit App sent stage prims');
            const prim_path = event.payload.prim_path;
            const children = event.payload.children;
            const usdPrim = this._findUSDPrimByPath(prim_path);
            if (usdPrim === null) {
                this.setState({ usdPrims: children });
            }
            else {
                usdPrim.children = children;
                this.setState({ usdPrims: this.state.usdPrims });
            }
            if (Array.isArray(children)){
                this._makePickable(children);
            }
        }
        // other messages from app to kit
        else if (event.messageRecipient === "kit") {
            console.log("onCustomEvent");
            console.log(JSON.parse(event.data).event_type);
        }
    }

    /**
    * @function _handleAppStreamFocus
    *
    * Update state when AppStream is in focus.
    */
    private _handleAppStreamFocus (): void {
        console.log('User is interacting in streamed viewer');
    }

    /**
    * @function _handleAppStreamBlur
    *
    * Update state when AppStream is not in focus.
    */
    private _handleAppStreamBlur (): void {
        console.log('User is not interacting in streamed viewer');
    }
    
    render() {

        const sidebarWidth = 300;
        return (
            <div
                style={{
                    position: 'absolute',
                    top: headerHeight,
                    width: '100%',
                    height: '100%'
                }}
            >
                <div style={{
                            position: 'absolute',
                            height: `calc(100% - ${headerHeight}px)`,
                            width: `calc(100% - ${sidebarWidth}px)`
                }}>
                    
                {/* Loading text indicator */}
                {!this.state.showStream && 
                    <div className="loading-indicator-label">
                        {this.state.loadingText}
                        <div className="spinner-border" role="status" style={{ marginTop: 10, visibility: this.state.isLoading? 'visible': 'hidden' }} />
                    </div>
                }

                {/* Streamed app */}
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
                        visibility: this.state.showStream? 'visible' : 'hidden'
                    }}
                    onLoggedIn={(userId) => this._onLoggedIn(userId)}
                    handleCustomEvent={(event) => this._handleCustomEvent(event)}
                    onStreamFailed={this.props.onStreamFailed}
                    />
                </div>

                {this.state.showUI &&
                <>
                        
                    {/* USD Asset Selector */}
                    <USDAsset
                        usdAssets={this.state.usdAssets}
                        selectedAssetUrl={this.state.selectedUSDAsset?.url}
                        onSelectUSDAsset={(value) => this._onSelectUSDAsset(value)}
                        width={sidebarWidth}
                    />
                    {/* USD Stage Listing */}
                    <USDStage
                        ref={this.usdStageRef}
                        width={sidebarWidth}
                        usdPrims={this.state.usdPrims}
                        onSelectUSDPrims={(value) => this._onSelectUSDPrims(value)}
                        selectedUSDPrims={this.state.selectedUSDPrims}
                        fillUSDPrim={(value) => this._onFillUSDPrim(value)}
                        onReset={() => this._onStageReset()}
                        />
                    </>
                }
            </div>
            );
        }
    }
