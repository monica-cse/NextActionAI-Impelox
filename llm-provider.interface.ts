import { Document } from 'mongoose';

export interface Config {
    apiVersion: string;
    baseUrl: string;
}

export interface LlmProvider extends Document {
    name: string;
    status: string[];
    config: Config;
}