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
import { Http } from "./http";

export interface ApplicationItem {
  id: string;
  name: string;
  description: string;
  tags: string[];
}

export interface ApplicationResponse {
  offset: number;
  limit: number;
  count: number;
  items: ApplicationItem[];
}

export interface VersionData {
  version: string;
}

export interface ApplicationVersionResponse {
  count: number;
  limit: number;
  offset: number;
  items: VersionData[];
}

export interface ProfileData {
  id: string;
  name: string;
  description: string;
}

export interface ApplicationProfileResponse {
  count: number;
  limit: number;
  offset: number;
  items: ProfileData[];
}

export interface StreamData {
  description: "signaling" | "media";
  destination_port: number;
  protocol: "TCP" | "UDP";
  source_port: number;
}

export interface StreamRoutes {
  routes: StreamData[];
}

export interface StreamItem {
  id: string;
  routes: { [key: string]: StreamRoutes };
}
export interface StreamingResponse {
  count: number;
  items: StreamItem[];
  limit: number;
  offset: number;
}

export interface ErrorItem {
  detail: string;
}

export async function getApplications(appServer: string) {
  const endpoint = `${appServer}/cfg/apps`;
  const response = await Http.get<ApplicationResponse>(endpoint);

  const applications = response.data.items.reduce((lookup: { [key: string]: ApplicationItem }, application) => {
    lookup[application.id] = application;
    return lookup;
  }, {});

  return { status: response.status, data: applications };
}

export async function getApplicationVersions(appServer: string, appId: string) {
  const endpoint = `${appServer}/cfg/apps/${appId}/versions`;
  const response = await Http.get<ApplicationVersionResponse>(endpoint);

  return {
    status: response.status,
    data: {
      appId,
      versions: response.data.items.map((item) => item.version)
    }
  };
}

export async function getApplicationVersionProfiles(appServer: string, appId: string, appVersion: string) {
  const endpoint = `${appServer}/cfg/apps/${appId}/versions/${appVersion}/profiles`;
  const response = await Http.get<ApplicationProfileResponse>(endpoint);

  return { status: response.status, data: { appId, appVersion, profiles: response.data.items } };
}

export async function getStreamingSessions(streamServer: string) {
  const endpoint = `${streamServer}/streaming/stream`;
  const response = await Http.get<StreamingResponse>(endpoint);

  return response;
}

export async function getStreamingSessionInfo(streamServer: string, sessionId: string) {
  const endpoint = `${streamServer}/streaming/stream/${sessionId}`;
  const response = await Http.get<StreamItem>(endpoint);

  return response;
}

export async function createStreamingSession(streamServer: string, appId: string, appVersion: string, profile: string) {
  const endpoint = `${streamServer}/streaming/stream`;

  const payload = {
    "id": appId,
    "version": appVersion,
    "profile": profile
  };

  const response = await Http.post<typeof payload, StreamItem | ErrorItem>(endpoint, payload);
  return response;
}

export async function destroyStreamingSession(streamServer: string, sessionId: string) {
  const endpoint = `${streamServer}/streaming/stream`;
  const payload = { "id": sessionId };

  const response = await Http.del(endpoint, payload);
  return response;
}
