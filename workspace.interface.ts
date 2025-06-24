import { Document } from 'mongoose';

export interface Workspace extends Document {
    workspaceName: string;
    workspaceType: string[];
    workspaceIcon: string;
    teamMembers?: string[];
    industryId: string;
    userId: string;
    integrationValues?: any[];
    datasourceValues?: any[];
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}
