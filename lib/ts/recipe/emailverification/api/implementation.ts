import { APIInterface, User } from "../";
import { logDebugMessage } from "../../../logger";
import EmailVerificationRecipe from "../recipe";
import { GeneralErrorResponse } from "../../../types";
import { EmailVerificationClaim } from "../emailVerificationClaim";

export default function getAPIInterface(): APIInterface {
    return {
        verifyEmailPOST: async function ({
            token,
            options,
            session,
            userContext,
        }): Promise<
            { status: "OK"; user: User } | { status: "EMAIL_VERIFICATION_INVALID_TOKEN_ERROR" } | GeneralErrorResponse
        > {
            const res = await options.recipeImplementation.verifyEmailUsingToken({ token, userContext });

            if (res.status === "OK" && session !== undefined) {
                session.fetchAndSetClaim(EmailVerificationClaim);
            }
            return res;
        },

        isEmailVerifiedGET: async function ({
            userContext,
            session,
        }): Promise<
            | {
                  status: "OK";
                  isVerified: boolean;
              }
            | GeneralErrorResponse
        > {
            if (session === undefined) {
                throw new Error("Session is undefined. Should not come here.");
            }

            await session.fetchAndSetClaim(EmailVerificationClaim, userContext);
            const isVerified = await session.getClaimValue(EmailVerificationClaim, userContext);

            return {
                status: "OK",
                isVerified: isVerified === true,
            };
        },

        generateEmailVerifyTokenPOST: async function ({
            options,
            userContext,
            session,
        }): Promise<{ status: "OK" | "EMAIL_ALREADY_VERIFIED_ERROR" } | GeneralErrorResponse> {
            if (session === undefined) {
                throw new Error("Session is undefined. Should not come here.");
            }

            const userId = session.getUserId();

            const emailInfo = await EmailVerificationRecipe.getInstanceOrThrowError().getEmailForUserId(
                userId,
                userContext
            );

            if (emailInfo.status === "UNKNOWN_USER_ID_ERROR") {
                return {
                    status: "GENERAL_ERROR",
                    message: "UNKNOWN_USER_ID_ERROR",
                };
            } else if (emailInfo.status === "EMAIL_DOES_NOT_EXIST_ERROR") {
                logDebugMessage(
                    `Email verification email not sent to user ${userId} because it doesn't have an email address.`
                );
                return {
                    status: "EMAIL_ALREADY_VERIFIED_ERROR",
                };
            } else if (emailInfo.status === "OK") {
                let response = await options.recipeImplementation.createEmailVerificationToken({
                    userId,
                    email: emailInfo.email,
                    userContext,
                });

                if (response.status === "EMAIL_ALREADY_VERIFIED_ERROR") {
                    logDebugMessage(
                        `Email verification email not sent to ${emailInfo.email} because it is already verified.`
                    );
                    return response;
                }

                let emailVerifyLink =
                    options.appInfo.websiteDomain.getAsStringDangerous() +
                    options.appInfo.websiteBasePath.getAsStringDangerous() +
                    "/verify-email" +
                    "?token=" +
                    response.token +
                    "&rid=" +
                    options.recipeId;

                logDebugMessage(`Sending email verification email to ${emailInfo}`);
                await options.emailDelivery.ingredientInterfaceImpl.sendEmail({
                    type: "EMAIL_VERIFICATION",
                    user: {
                        id: userId,
                        email: emailInfo.email,
                    },
                    emailVerifyLink,
                    userContext,
                });

                return {
                    status: "OK",
                };
            } else {
                throw new Error("Should never come here: Invalid result from getEmailForUserId");
            }
        },
    };
}
