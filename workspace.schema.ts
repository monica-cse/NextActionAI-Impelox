import { Schema } from 'mongoose';

export const WorkspaceSchema = new Schema({
    workspaceName: { type: String, required: true },
    workspaceType: [{ type: String, required: true }],
    workspaceIcon: { type: String, required: true },
    teamMembers: [{ type: String }],
    industryId: { type: Schema.Types.ObjectId, ref: 'Industry', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    integrationValues: [
        {
            workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace' },
            integrationId: { type: Schema.Types.ObjectId, ref: 'Integration' },
            values: {
                integrationFieldId: { type: Schema.Types.ObjectId },
                webhookUrl: { type: String },
            },
            createdAt: { type: Date, default: Date.now },
            updatedAt: { type: Date, default: Date.now },
        },
    ],
    datasourceValues: [
        {
            workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace' },
            datasourceId: { type: Schema.Types.ObjectId, ref: 'Datasource' },
            values: {
                datasourceFieldId: { type: Schema.Types.ObjectId },
                datasourceFieldValues: {
                    customerName: String,
                    contact: String,
                },
            },
            createdAt: { type: Date, default: Date.now },
            updatedAt: { type: Date, default: Date.now },
        },
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null },
});
