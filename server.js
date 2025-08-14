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

/**
 * This server is used to drive a web server in the built container.
 */

const express = require('express');
const path = require('path');
const cors = require('cors'); // Import CORS package
const app = express();
const PORT = process.env.PORT || 3000;

// Configure CORS
app.use(cors({
    origin: "*", // Allow all origins
    methods: "*", // Allow all methods
    allowedHeaders: "*", // Allow all headers
}));

// Middleware to set custom headers
app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    // Uncomment and adjust headers as needed
    //res.setHeader("Content-Security-Policy", "frame-ancestors 'self' YOUR_DOMAIN_HERE");
    next();
});

// Serve static files from the Vite build directory
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all route for client-side routing
app.get('*splat', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
