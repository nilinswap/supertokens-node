/* Copyright (c) 2022, VRAI Labs and/or its affiliates. All rights reserved.
 *
 * This software is licensed under the Apache License, Version 2.0 (the
 * "License") as published by the Apache Software Foundation.
 *
 * You may not use this file except in compliance with the License. You may
 * obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

import { DASHBOARD_VERSION } from "../../constants";
import { RecipeInterface } from "./types";

export default function getRecipeImplementation(): RecipeInterface {
    return {
        getDashboardBundleBasePath: async function () {
            return `https://cdn.jsdelivr.net/gh/supertokens/dashboard@${DASHBOARD_VERSION}/build/`;
        },
        shouldAllowAccess: async function (input) {
            let apiKeyHeaderValue: string | undefined = input.req.getHeaderValue("authorization");

            // We receieve the api key as `Bearer API_KEY`, this retrieves just the key
            apiKeyHeaderValue = apiKeyHeaderValue?.split(" ")[1];

            if (apiKeyHeaderValue === undefined) {
                return false;
            }

            return apiKeyHeaderValue === input.config.apiKey;
        },
    };
}
