declare module "swagger-ui-react" {
  import type { FC } from "react";

  export interface SwaggerUIProps {
    url?: string;
    spec?: object;
    docExpansion?: "list" | "full" | "none";
    defaultModelsExpandDepth?: number;
  }

  const SwaggerUI: FC<SwaggerUIProps>;
  export default SwaggerUI;
}
