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
import './Window.css';
import AppStream from './AppStream'; // Ensure .tsx extension if needed
import StreamConfig from '../stream.config.json';
// import USDAsset from "./USDAsset";
// import USDStage from "./USDStage";
import LogoImage from './assets/nvidia_logo.png';
import { Link } from 'react-router-dom';

interface USDAssetType {
    name: string;
    url: string;
}

interface USDPrimType {
    name?: string;
    path: string;
    children?: USDPrimType[];
}

interface AppState {
    gfnUser: string | null;
    streamReady: boolean;
    usdAssets: USDAssetType[];
    selectedUSDAsset: USDAssetType;
    usdPrims: USDPrimType[];
    selectedUSDPrims: Set<USDPrimType>;
    isLoadingAsset: boolean;
    loadingProgress: number;
    loadingActivity: string;
}

interface AppStreamMessageType {
    event_type: string;
    payload: any;
}

export default class App extends React.Component<{}, AppState> {
    
    // private usdStageRef = React.createRef<USDStage>();
    
    constructor(props: {}) {
        super(props);
        
        const usdAssets: USDAssetType[] = [
            {name: "Sample 1", url:"./samples/stage01.usd"},
            {name: "Sample 2", url:"./samples/stage02.usd"},
        ];
        
        this.state = {
            gfnUser: null,
            streamReady: false,
            usdAssets: usdAssets,
            selectedUSDAsset: usdAssets[0],
            usdPrims: [],
            selectedUSDPrims: new Set<USDPrimType>(),
            isLoadingAsset: false,
            loadingProgress: 0,
            loadingActivity: ""
        }
    }
    
    /**
    * @function _toggleLoadingState
    *
    * Toggle state of loading asset indicator.
    */
    private _toggleLoadingState (isLoading: boolean): void {
        console.log(`Setting loading indicator visibility to: ${isLoading ? "visible" : "hidden"}.`);
        this.setState({ loadingProgress: 0 });
        this.setState({ isLoadingAsset: isLoading });
    }
    
    /**
    * @function _onStreamStarted
    *
    * Send a request to open an asset when stream has started.
    */
    private _onStreamStarted (): void {
        //this._openSelectedAsset();
    }

    // /**
    // * @function _openSelectedAsset
    // *
    // * Send a request to load an asset.
    // */
    // private _openSelectedAsset (): void {
    //     this._toggleLoadingState(true);
    //     this.setState({ usdPrims: [], selectedUSDPrims: new Set<USDPrimType>() });
    //     this.usdStageRef.current?.resetExpandedIds();
    //     console.log(`Sending request to open asset: ${this.state.selectedUSDAsset.url}.`);
    //     const message: AppStreamMessageType = {
    //         event_type: "openStageRequest",
    //         payload: {
    //             url: this.state.selectedUSDAsset.url
    //         }
    //     };
    //     AppStream.sendMessage(JSON.stringify(message));
    // }

    // /**
    // * @function _onSelectUSDAsset
    // *
    // * React to user selecting an asset in the USDAsset selector.
    // */
    // private _onSelectUSDAsset (usdAsset: USDAssetType): void {
    //     console.log(`Asset selected: ${usdAsset.name}.`);
    //     this.setState({ selectedUSDAsset: usdAsset }, () => {
    //         this._openSelectedAsset();
    //     });
    // }
    
    /**
    * @function _getChildren
    *
    * Send a request for the child prims of the given usdPrim.
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
    * @function _getChildren
    *
    * Send a request for the child prims of the given usdPrim.
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

    // /**
    // * @function _onSelectUSDPrims
    // *
    // * React to user selecting items in the USDStage list.
    // * Sends a request to change the selection in the USD Stage.
    // */
    // private _onSelectUSDPrims (selectedUsdPrims: Set<USDPrimType>): void {
    //     console.log(`Sending request to select: ${selectedUsdPrims}.`);
    //     this.setState({ selectedUSDPrims: selectedUsdPrims });
    //     const paths: string[] = Array.from(selectedUsdPrims).map(obj => obj.path);
    //     const message: AppStreamMessageType = {
    //         event_type: "selectPrimsRequest",
    //         payload: {
    //             paths: paths
    //         }
    //     };
    //     AppStream.sendMessage(JSON.stringify(message));

    //     selectedUsdPrims.forEach(usdPrim => {this._onFillUSDPrim(usdPrim)});
    // }

    // /**
    // * @function _onStageReset
    // *
    // * Clears the selection and sends a request to reset the stage to how it was at the time it loaded.
    // */
    // private _onStageReset (): void {
    //     this.setState({ selectedUSDPrims: new Set<USDPrimType>() });
    //     const selection_message: AppStreamMessageType = {
    //         event_type: "selectPrimsRequest",
    //         payload: {
    //             paths: []
    //         }
    //     };
    //     AppStream.sendMessage(JSON.stringify(selection_message));

    //     const reset_message: AppStreamMessageType = {
    //         event_type: "resetStage",
    //         payload: {}
    //     };
    //     AppStream.sendMessage(JSON.stringify(reset_message));
    // }

    // /**
    // * @function _onFillUSDPrim
    // *
    // * If the usdPrim has a children property a request is sent for its children.
    // * When the streaming app sends an empty children value it is not an array.
    // * When a prim does not have children the streaming app does not provide a children
    // * property to being with.
    // */
    // private _onFillUSDPrim (usdPrim: USDPrimType): void {
    //     if (usdPrim !== null && "children" in usdPrim && !Array.isArray(usdPrim.children)) {
    //         this._getChildren(usdPrim);
    //     }
    // }
    
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
        // Streamed app notification of asset loaded.
        if (event.event_type === "openedStageResult") {
            if (event.payload.result === "success") {
                console.log('Kit App communicates an asset was loaded: ' + event.payload.url);
                this._getChildren(null); // Hide progress indicator
            }
            else {
                console.error('Kit App communicates there was an error loading: ' + event.payload.url);
                this._toggleLoadingState(false); // Hide progress indicator
            }
        }
        // Progress amount notification.
        else if (event.event_type === "updateProgressAmount") {
            console.log('Kit App communicates progress amount.');
            console.log(event.payload);
            const progress = Math.round(Number(event.payload.progress) * 100.0);
            if (progress > 0) {
                this.setState({ loadingProgress: progress });
            }
        }
        // Progress activity notification.
        else if (event.event_type === "updateProgressActivity") {
            console.log('Kit App communicates progress activity.');
            console.log(event.payload);
            this.setState({ loadingActivity: event.payload.text });
        }
        // Selection changed because user made a selection in streamed viewport.
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
                this._toggleLoadingState(false);
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
        const sidebarWidth = 0; //300;
        const headerHeight = 60;
        const streamConfig: any = StreamConfig.source === 'gfn' ? {
            ...StreamConfig[StreamConfig.source],
            source: StreamConfig.source,
            //@ts-ignore
            GFN: GFN
        } : {
            //@ts-ignore
            ...StreamConfig[StreamConfig.source],
            source: StreamConfig.source
        };

        
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
            <span className="header-title">Aerial Omniverse Digital Twin</span>
            <Link to="/nucleus">Go to Nucleus</Link>
            </div>
            
            {/* Show progress indicator based on isLoadingAsset state 
            {this.state.isLoadingAsset &&
                <div
                    className="progress-indicator-container"
                    style={{
                        position: 'absolute',
                        top: `${headerHeight}px`,
                        height: `calc(100% - ${headerHeight}px)`,
                        width: `calc(100% - ${sidebarWidth}px)`,
                        visibility: this.state.gfnUser ? 'visible' : 'hidden'
                    }}
                >
                    <div className="progress-indicator-label">
                        Loading {this.state.selectedUSDAsset.name} - {this.state.loadingProgress}%
                        <div>File: {this.state.loadingActivity}</div>
                    </div>
                </div>
            }*/}
            

                {/* Streamed app */}
                <AppStream
                    streamConfig={streamConfig}
                    onLoggedIn={(userId) => this.setState({ gfnUser: userId })}
                    onStarted={() => this._onStreamStarted()}
                    onFocus={() => this._handleAppStreamFocus()}
                    onBlur={() => this._handleAppStreamBlur()}
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: `${headerHeight}px`,
                        height: `calc(100% - ${headerHeight}px)`,
                        width: `calc(100% - ${sidebarWidth}px)`,
                        visibility: this.state.gfnUser ? 'visible' : 'hidden'
                    }}
                    handleCustomEvent={(event) => this._handleCustomEvent(event)}
                />

                {/*this.state.gfnUser &&
                    <>
                    {/* USD Asset Selector * /}
                    <USDAsset
                        usdAssets={this.state.usdAssets}
                        selectedAssetUrl={this.state.selectedUSDAsset?.url}
                        onSelectUSDAsset={(value) => this._onSelectUSDAsset(value)}
                        width={sidebarWidth}
                    />
                    {/* USD Stage Listing * /}
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
                */}
                </div>
            );
        }
    }
