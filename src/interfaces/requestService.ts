import { IBaseDBProperties } from "./common"
import { EypleaseFile } from "./files"
import { IUser } from "./users"

export const UserRequestStatusTypes = {
    READY_FOR_REVIEW: 'ready-for-review',
    READY_FOR_PUBLISH: 'ready-for-publish',
    UNASSIGNED: 'unassigned',
    IN_PROGRESS: 'in-progress',
    COMPLETED: 'completed',
    PENDING_CORRECTION: 'correction'
} as const

export type UserRequestStatusTypes = typeof UserRequestStatusTypes[keyof typeof UserRequestStatusTypes];

export const UserRequestActivityTypes = {
    COMMENT: 'comment',
    REQUEST_CORRECTION: 'request_correction',
    UPDATE: 'update'
} as const

export type UserRequestActivityTypes = typeof UserRequestActivityTypes[keyof typeof UserRequestActivityTypes];

export interface UserRequestService {
    id: string;
    title: string;
    description: string | null;
    started_at: Date;
    delivery_date: Date;
    status: UserRequestStatusTypes;
    metadata: {
        primaryColor?: string
        secondaryColor?: string
    };
    category: string
    category_id: string
    files: IUserRequestServiceFile[];
}

export interface IUserRequestServiceActivity extends IBaseDBProperties {
    user: IUser;
    activity_type: UserRequestActivityTypes;
    activity_description: string;
}

export interface IUserRequestServiceFile extends IBaseDBProperties {
    uploaded_by: IUser;
    file: EypleaseFile
}

export interface ITaskCategory extends IBaseDBProperties {
    name: string
    slug: string
}