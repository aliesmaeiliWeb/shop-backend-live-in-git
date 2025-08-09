export interface IAttributeBody {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "color";
  options?: string[];
}