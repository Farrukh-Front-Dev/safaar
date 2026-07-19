/**
 * Application API Gateway.
 * Configures and re-exports the shared API Client SDK.
 */

import { apiConfig } from "@agoda/api-client";
import { config } from "./config";

// Configure base URL at initialization
apiConfig.setBaseUrl(config.apiUrl);

export { api, ApiRequestError } from "@agoda/api-client";
