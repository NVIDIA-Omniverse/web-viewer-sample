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
import './USDStage.css';


interface USDPrimType {
    name?: string;
    path: string;
    children?: USDPrimType[];
}

interface USDStageProps {
    width: number;
    usdPrims: USDPrimType[];
    selectedUSDPrims: Set<USDPrimType>;
    onSelectUSDPrims: (selectedUsdPrims: Set<USDPrimType>) => void;
    fillUSDPrim: (usdPrim: USDPrimType) => void;
    onReset: () => void;
}

export default class USDStage extends React.Component<USDStageProps, { expandedIds: Set<string> }> {
    constructor(props: USDStageProps) {
        super(props);
        this.state = { expandedIds: new Set<string>() };
    }
    
    /**
    * @function resetExpandedIds
    *
    * Public function for resetting the expanded state of the list.
    */
    public resetExpandedIds (): void {
        this.setState({ expandedIds: new Set<string>() });
    }
    
    /**
    * @function _toggleExpand
    *
    * Toggle the expanded states in the list.
    */
    private _toggleExpand(obj: USDPrimType, event: React.MouseEvent<HTMLSpanElement, MouseEvent>): void {
        event.stopPropagation(); // Prevents the click from bubbling up to parent elements
        this.props.fillUSDPrim(obj);
        this.setState(prevState => {
            const newExpandedIds = new Set(prevState.expandedIds); // Create a copy of the current Set
            if (newExpandedIds.has(obj.path)) {
                newExpandedIds.delete(obj.path); // Remove id if it's already expanded
            } else {
                newExpandedIds.add(obj.path); // Add id if it's not expanded
            }
            return { expandedIds: newExpandedIds };
        });
    }
    
    /**
    * @function _handleListClick
    *
    * Change state when list selection changes.
    */
    private _handleListClick(obj: USDPrimType, event: React.MouseEvent<HTMLDivElement, MouseEvent>): void {
        event.stopPropagation();
        const newSelectedItems = new Set(this.props.selectedUSDPrims);
        if (newSelectedItems.has(obj)) {
            newSelectedItems.delete(obj); // Deselect if already selected
        } else {
            newSelectedItems.add(obj); // Add to selection if not already selected
        }
        this.props.onSelectUSDPrims(newSelectedItems);
    }
    
    /**
    * @function _renderList
    *
    * Render the list.
    */
    private _renderList(usdPrims: USDPrimType[]): JSX.Element[] | undefined {
        if (usdPrims === null || !Array.isArray(usdPrims)) {
            return;
        }
        return usdPrims.map((obj, index) => {
            const isLeaf = !obj.children || obj.children.length === 0;
            const isOpen = this.state.expandedIds.has(obj.path);
            const isSelected = this.props.selectedUSDPrims.has(obj);
            const listItemClass = `list-item ${isLeaf ? 'leaf' : 'parent'} ${isOpen ? 'open' : ''} ${isSelected ? 'selected' : ''}`;
            const itemContentClass = `item-content ${isLeaf ? 'leaf' : 'parent'} ${isOpen ? 'open' : ''} ${isSelected ? 'selected' : ''}`;
            const expandToggleClass = `expand-toggle ${isSelected ? 'selected' : 'deselected'}`;

            return (
                <li key={obj.name || index} className={listItemClass}>
                    <div className={itemContentClass} onClick={(e) => this._handleListClick(obj, e)}
                        tabIndex={0}
                    >
                        {!isLeaf && (
                            <span onClick={(e) => this._toggleExpand(obj, e)} className={expandToggleClass}>
                                {isOpen ? '▼' : '▶'}
                            </span>
                        )}
                        {obj.name}
                    </div>
                    {isOpen && !isLeaf && obj.children && (
                        <ul className="nested-list">
                            {this._renderList(obj.children)}
                        </ul>
                    )}
                </li>
            );
        });
    }

    _onReset = () => {
        this.props.onReset();
    };

    render() {
        return (
            <div className="usdStageContainer" style={{ width: this.props.width }}>
                <div className="usdStageHeader">
                    {'USD Stage'}
                    <button className="nvidia-button" onClick={this._onReset}>Reset</button>
                </div>
                <ul className="list-container">
                    {this._renderList(this.props.usdPrims)}
                </ul>
            </div>
        );
    }
}
