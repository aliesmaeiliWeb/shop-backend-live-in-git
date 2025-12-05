export interface ICategoryCreate {
  name: string;
  parentId?: string; 
  icon?: string;
}

export interface ICategoryUpdate {
  name?: string;
  icon?: string;
  parentId?: string;
  isActive?: boolean;
}