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
import './App.css';
import './USDAsset.css';


interface USDAssetProps {
    width: number;
    usdAssets: { name: string; url: string }[];
    selectedAssetUrl?: string;
    onSelectUSDAsset: (asset: { name: string; url: string }) => void;
}

interface USDAssetState {
    selectedUSDAssetIndex: number | null;
}

export default class USDAsset extends React.Component<USDAssetProps, USDAssetState> {
    constructor(props: USDAssetProps) {
        super(props);
        // Initialize state with the index of the asset matching the initial URL if provided
        this.state = {
            selectedUSDAssetIndex: this._findAssetIndexByUrl(props.selectedAssetUrl)
        };
    }
    
    /**
    * @function _handleSelectChange
    *
    * Handle selection in list.
    */
    _handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedIndex = parseInt(event.target.value, 10);
        this.setState({ selectedUSDAssetIndex: selectedIndex });
        if (this.props.onSelectUSDAsset) {
            this.props.onSelectUSDAsset(this.props.usdAssets[selectedIndex]);
        }
    };
    
    /**
    * @function componentDidUpdate
    *
    * Update state if the selectedAssetUrl prop changes.
    */
    componentDidUpdate(prevProps: USDAssetProps) {
        if (prevProps.selectedAssetUrl !== this.props.selectedAssetUrl) {
            const newIndex = this._findAssetIndexByUrl(this.props.selectedAssetUrl);
            if (newIndex !== this.state.selectedUSDAssetIndex) {
                this.setState({ selectedUSDAssetIndex: newIndex });
            }
        }
    }
    
    /**
    * @function _findAssetIndexByUrl
    *
    * Find index of asset by url.
    */
    private _findAssetIndexByUrl (url?: string): number {
        return this.props.usdAssets.findIndex(asset => asset.url === url);
    }
    
    /**
    * @function _renderSelector
    *
    * Render the selector.
    */
    private _renderSelector (): JSX.Element {
          const options = this.props.usdAssets.map((asset, index) => (
              <option key={index} value={index} className="usdAssetOption">
                  {asset.name}
              </option>
          ));

          return (
              <select
                  className="nvidia-dropdown"
                  onChange={this._handleSelectChange}
                  value={this.state.selectedUSDAssetIndex || ''}>
                  {options}
              </select>
          );
    }
    
    render() {
          return (
              <div className="usdAssetContainer" style={{ width: this.props.width }}>
                  <div className="usdAssetHeader">
                      {'USD Asset'}
                  </div>
                  <div className="usdAssetSelectorContainer">
                      {this._renderSelector()}
                  </div>
              </div>

          );
    }
}
