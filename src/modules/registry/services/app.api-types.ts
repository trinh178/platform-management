import type { DeepPartial } from 'react-hook-form';
import type { App } from '../types/app';
import type { ListRequest, ListResponse } from '@/shared/types/pagination';

// GET /registry/apps
export type ListAppsRequest = ListRequest;
export type ListAppsResponse = ListResponse<App>;

// POST /registry/apps
export type CreateAppRequest = Omit<App, 'id'>;
export type CreateAppResponse = App;

// GET /registry/apps/:id
export type AppDetailsRequest = App['id'];
export type AppDetailsResponse = App;

// PUT /registry/apps/:id
export type UpdateAppRequest = Pick<App, 'id'> & DeepPartial<App>;

// DELETE /registry/apps/:id
export type RemoveAppRequest = App['id'];
