"use strict";
var __awaiter =
    (this && this.__awaiter) ||
    function (thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P
                ? value
                : new P(function (resolve) {
                      resolve(value);
                  });
        }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value));
                } catch (e) {
                    reject(e);
                }
            }
            function rejected(value) {
                try {
                    step(generator["throw"](value));
                } catch (e) {
                    reject(e);
                }
            }
            function step(result) {
                result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
            }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
Object.defineProperty(exports, "__esModule", { value: true });
const recipeImplementation_1 = require("../../passwordless/recipeImplementation");
const recipeImplementation_2 = require("../../thirdparty/recipeImplementation");
const passwordlessRecipeImplementation_1 = require("./passwordlessRecipeImplementation");
const thirdPartyRecipeImplementation_1 = require("./thirdPartyRecipeImplementation");
function getRecipeInterface(passwordlessQuerier, thirdPartyQuerier) {
    let originalPasswordlessImplementation = (0, recipeImplementation_1.default)(passwordlessQuerier);
    let originalThirdPartyImplementation;
    if (thirdPartyQuerier !== undefined) {
        originalThirdPartyImplementation = (0, recipeImplementation_2.default)(thirdPartyQuerier);
    }
    return {
        consumeCode: function (input) {
            return __awaiter(this, void 0, void 0, function* () {
                return originalPasswordlessImplementation.consumeCode.bind(
                    (0, passwordlessRecipeImplementation_1.default)(this)
                )(input);
            });
        },
        createCode: function (input) {
            return __awaiter(this, void 0, void 0, function* () {
                return originalPasswordlessImplementation.createCode.bind(
                    (0, passwordlessRecipeImplementation_1.default)(this)
                )(input);
            });
        },
        createNewCodeForDevice: function (input) {
            return __awaiter(this, void 0, void 0, function* () {
                return originalPasswordlessImplementation.createNewCodeForDevice.bind(
                    (0, passwordlessRecipeImplementation_1.default)(this)
                )(input);
            });
        },
        getUserByPhoneNumber: function (input) {
            return __awaiter(this, void 0, void 0, function* () {
                return originalPasswordlessImplementation.getUserByPhoneNumber.bind(
                    (0, passwordlessRecipeImplementation_1.default)(this)
                )(input);
            });
        },
        listCodesByDeviceId: function (input) {
            return __awaiter(this, void 0, void 0, function* () {
                return originalPasswordlessImplementation.listCodesByDeviceId.bind(
                    (0, passwordlessRecipeImplementation_1.default)(this)
                )(input);
            });
        },
        listCodesByEmail: function (input) {
            return __awaiter(this, void 0, void 0, function* () {
                return originalPasswordlessImplementation.listCodesByEmail.bind(
                    (0, passwordlessRecipeImplementation_1.default)(this)
                )(input);
            });
        },
        listCodesByPhoneNumber: function (input) {
            return __awaiter(this, void 0, void 0, function* () {
                return originalPasswordlessImplementation.listCodesByPhoneNumber.bind(
                    (0, passwordlessRecipeImplementation_1.default)(this)
                )(input);
            });
        },
        listCodesByPreAuthSessionId: function (input) {
            return __awaiter(this, void 0, void 0, function* () {
                return originalPasswordlessImplementation.listCodesByPreAuthSessionId.bind(
                    (0, passwordlessRecipeImplementation_1.default)(this)
                )(input);
            });
        },
        revokeAllCodes: function (input) {
            return __awaiter(this, void 0, void 0, function* () {
                return originalPasswordlessImplementation.revokeAllCodes.bind(
                    (0, passwordlessRecipeImplementation_1.default)(this)
                )(input);
            });
        },
        revokeCode: function (input) {
            return __awaiter(this, void 0, void 0, function* () {
                return originalPasswordlessImplementation.revokeCode.bind(
                    (0, passwordlessRecipeImplementation_1.default)(this)
                )(input);
            });
        },
        updatePasswordlessUser: function (input) {
            return __awaiter(this, void 0, void 0, function* () {
                let user = yield this.getUserById({ userId: input.userId, userContext: input.userContext });
                if (user === undefined) {
                    return {
                        status: "UNKNOWN_USER_ID_ERROR",
                    };
                } else if ("thirdParty" in user) {
                    throw new Error(
                        "Cannot update passwordless user info for those who signed up using third party login."
                    );
                }
                return originalPasswordlessImplementation.updateUser.bind(
                    (0, passwordlessRecipeImplementation_1.default)(this)
                )(input);
            });
        },
        thirdPartySignInUp: function (input) {
            return __awaiter(this, void 0, void 0, function* () {
                if (originalThirdPartyImplementation === undefined) {
                    throw new Error("No thirdparty provider configured");
                }
                return originalThirdPartyImplementation.signInUp.bind(
                    (0, thirdPartyRecipeImplementation_1.default)(this)
                )(input);
            });
        },
        getUserById: function (input) {
            return __awaiter(this, void 0, void 0, function* () {
                let user = yield originalPasswordlessImplementation.getUserById.bind(
                    (0, passwordlessRecipeImplementation_1.default)(this)
                )(input);
                if (user !== undefined) {
                    return user;
                }
                if (originalThirdPartyImplementation === undefined) {
                    return undefined;
                }
                return yield originalThirdPartyImplementation.getUserById.bind(
                    (0, thirdPartyRecipeImplementation_1.default)(this)
                )(input);
            });
        },
        getUsersByEmail: function ({ email, userContext }) {
            return __awaiter(this, void 0, void 0, function* () {
                let userFromEmailPass = yield originalPasswordlessImplementation.getUserByEmail.bind(
                    (0, passwordlessRecipeImplementation_1.default)(this)
                )({ email, userContext });
                if (originalThirdPartyImplementation === undefined) {
                    return userFromEmailPass === undefined ? [] : [userFromEmailPass];
                }
                let usersFromThirdParty = yield originalThirdPartyImplementation.getUsersByEmail.bind(
                    (0, thirdPartyRecipeImplementation_1.default)(this)
                )({ email, userContext });
                if (userFromEmailPass !== undefined) {
                    return [...usersFromThirdParty, userFromEmailPass];
                }
                return usersFromThirdParty;
            });
        },
        getUserByThirdPartyInfo: function (input) {
            return __awaiter(this, void 0, void 0, function* () {
                if (originalThirdPartyImplementation === undefined) {
                    return undefined;
                }
                return originalThirdPartyImplementation.getUserByThirdPartyInfo.bind(
                    (0, thirdPartyRecipeImplementation_1.default)(this)
                )(input);
            });
        },
    };
}
exports.default = getRecipeInterface;
