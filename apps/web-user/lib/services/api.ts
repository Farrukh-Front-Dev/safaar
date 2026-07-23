/**
 * Application API Gateway.
 * Configures and re-exports the shared API Client SDK.
 */

import { apiConfig } from "@safaar/api-client";
import { config } from "../config/config";

// Configure base URL at initialization
apiConfig.setBaseUrl(config.apiUrl);

export { api, ApiRequestError } from "@safaar/api-client";
