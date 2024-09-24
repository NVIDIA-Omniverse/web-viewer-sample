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
 * the default use case requires a client to send a request to open a file. Use the ViewportOnly component for other use
 * cases such as when streaming USD Viewer loading a file on startup or for completely different Kit applications.
 *
 * To switch to a Viewport-only interface:
 * 
 * Change:
 * import Window from './Window';
 * 
 * To:
 * import Window from './ViewportOnly';
 */

import "./App.css";
import Window from './Window';

function App() {
    return <Window />
}

export default App;
