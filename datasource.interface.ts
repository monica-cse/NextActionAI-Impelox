export interface IDatasource {
    name: string;
    type: string;
    description?: string;
    config: Record<string, any>;
}
  