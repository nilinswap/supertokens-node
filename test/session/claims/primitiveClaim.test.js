/* Copyright (c) 2021, VRAI Labs and/or its affiliates. All rights reserved.
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
const { printPath } = require("../../utils");
const assert = require("assert");
const sinon = require("sinon");
const { PrimitiveClaim } = require("../../../recipe/session/claims");

describe.only(`primitiveClaim: ${printPath("[test/session/claims/primitiveClaim.test.js]")}`, function () {
    describe("PrimitiveClaim", () => {
        afterEach(() => {
            sinon.restore();
        });

        describe("fetchAndGetAccessTokenPayloadUpdate", () => {
            it("should build the right payload", async () => {
                const val = { a: 1 };
                const fetchValue = sinon.stub().returns(val);
                const now = Date.now();
                sinon.useFakeTimers(now);
                const claim = new PrimitiveClaim({
                    key: "asdf",
                    fetchValue,
                });
                const ctx = {};
                const res = await claim.fetchAndGetAccessTokenPayloadUpdate("userId", ctx);
                assert.deepStrictEqual(res, {
                    asdf: {
                        t: now,
                        v: val,
                    },
                });
            });

            it("should build the right payload w/ async fetch", async () => {
                const val = { a: 1 };
                const fetchValue = sinon.stub().resolves(val);
                const now = Date.now();
                sinon.useFakeTimers(now);
                const claim = new PrimitiveClaim({
                    key: "asdf",
                    fetchValue,
                });
                const ctx = {};
                const res = await claim.fetchAndGetAccessTokenPayloadUpdate("userId", ctx);
                assert.deepStrictEqual(res, {
                    asdf: {
                        t: now,
                        v: val,
                    },
                });
            });

            it("should build the right payload matching addToPayload_internal", async () => {
                const val = { a: 1 };
                const fetchValue = sinon.stub().resolves(val);
                const now = Date.now();
                sinon.useFakeTimers(now);
                const claim = new PrimitiveClaim({
                    key: "asdf",
                    fetchValue,
                });
                const ctx = {};
                const res = await claim.fetchAndGetAccessTokenPayloadUpdate("userId", ctx);
                assert.deepStrictEqual(res, claim.addToPayload_internal({}, val));
            });

            it("should call fetchValue with the right params", async () => {
                const fetchValue = sinon.stub().returns(true);
                const claim = new PrimitiveClaim({
                    key: "asdf",
                    fetchValue,
                });
                const userId = "userId";

                const ctx = {};
                await claim.fetchAndGetAccessTokenPayloadUpdate(userId, ctx);
                assert.strictEqual(fetchValue.callCount, 1);
                assert.strictEqual(fetchValue.firstCall.args[0], userId);
                assert.strictEqual(fetchValue.firstCall.args[1], ctx);
            });

            it("should remove possible old value from the payload for undefined value", async () => {
                const fetchValue = sinon.stub().returns(undefined);
                const now = Date.now();
                sinon.useFakeTimers(now);
                const claim = new PrimitiveClaim({
                    key: "asdf",
                    fetchValue,
                });

                const ctx = {};

                const res = await claim.fetchAndGetAccessTokenPayloadUpdate("userId", ctx);
                assert.deepStrictEqual(res, {
                    // This is set to null, so that the key is removed by mergeIntoAccessTokenPayload0
                    asdf: null,
                });
            });
        });

        describe("getValueFromPayload", () => {
            it("should return undefined for empty payload", () => {
                const val = { a: 1 };
                const fetchValue = sinon.stub().resolves(val);
                const claim = new PrimitiveClaim({
                    key: "asdf",
                    fetchValue,
                });

                assert.strictEqual(claim.getValueFromPayload({}), undefined);
            });

            it("should return value set by fetchAndGetAccessTokenPayloadUpdate", async () => {
                const val = { a: 1 };
                const fetchValue = sinon.stub().resolves(val);
                const claim = new PrimitiveClaim({
                    key: "asdf",
                    fetchValue,
                });
                const payload = await claim.fetchAndGetAccessTokenPayloadUpdate("userId");

                assert.strictEqual(claim.getValueFromPayload(payload), val);
            });

            it("should return value set by addToPayload_internal", async () => {
                const val = { a: 1 };
                const fetchValue = sinon.stub().resolves(val);
                const claim = new PrimitiveClaim({
                    key: "asdf",
                    fetchValue,
                });
                const payload = await claim.addToPayload_internal({}, val);
                assert.strictEqual(claim.getValueFromPayload(payload), val);
            });
        });

        describe("getLastRefetchTime", () => {
            it("should return undefined for empty payload", () => {
                const val = { a: 1 };
                const fetchValue = sinon.stub().resolves(val);
                const claim = new PrimitiveClaim({
                    key: "asdf",
                    fetchValue,
                });

                assert.strictEqual(claim.getLastRefetchTime({}), undefined);
            });

            it("should return time matching the fetchAndGetAccessTokenPayloadUpdate call", async () => {
                const now = Date.now();
                sinon.useFakeTimers(now);

                const val = { a: 1 };
                const fetchValue = sinon.stub().resolves(val);
                const claim = new PrimitiveClaim({
                    key: "asdf",
                    fetchValue,
                });
                const payload = await claim.fetchAndGetAccessTokenPayloadUpdate("userId");

                assert.strictEqual(claim.getLastRefetchTime(payload), now);
            });
        });

        describe("validators.hasValue", () => {
            const val = { a: 1 };
            const val2 = { b: 1 };
            const claim = new PrimitiveClaim({
                key: "asdf",
                fetchValue: () => val,
            });

            it("should not validate empty payload", async () => {
                const res = await claim.validators.hasValue(val).validate({}, {});
                assert.deepStrictEqual(res, {
                    isValid: false,
                    reason: {
                        expectedValue: val,
                        actualValue: undefined,
                        message: "wrong value",
                    },
                });
            });

            it("should not validate mismatching payload", async () => {
                const payload = await claim.fetchAndGetAccessTokenPayloadUpdate("userId");
                const res = claim.validators.hasValue(val2).validate(payload, {});
                assert.deepStrictEqual(res, {
                    isValid: false,
                    reason: {
                        expectedValue: val2,
                        actualValue: val,
                        message: "wrong value",
                    },
                });
            });

            it("should validate matching payload", async () => {
                const payload = await claim.fetchAndGetAccessTokenPayloadUpdate("userId");
                const res = claim.validators.hasValue(val).validate(payload, {});
                assert.deepStrictEqual(res, {
                    isValid: true,
                });
            });

            it("should validate old values as well", async () => {
                const now = Date.now();
                const clock = sinon.useFakeTimers(now);

                const payload = await claim.fetchAndGetAccessTokenPayloadUpdate("userId");

                // advance clock by one week
                clock.tick(6.048e8);

                const res = claim.validators.hasValue(val).validate(payload, {});
                assert.deepStrictEqual(res, {
                    isValid: true,
                });
            });

            it("should refetch if value is not set", () => {
                assert.equal(claim.validators.hasValue(val2).shouldRefetch({}), true);
            });

            it("should not refetch if value is set", async () => {
                const payload = await claim.fetchAndGetAccessTokenPayloadUpdate("userId");

                assert.equal(claim.validators.hasValue(val2).shouldRefetch(payload), false);
            });
        });

        describe("validators.hasFreshValue", () => {
            const val = { a: 1 };
            const val2 = { b: 1 };
            const claim = new PrimitiveClaim({
                key: "asdf",
                fetchValue: () => val,
            });

            it("should not validate empty payload", async () => {
                const res = await claim.validators.hasFreshValue(val, 600).validate({}, {});
                assert.deepStrictEqual(res, {
                    isValid: false,
                    reason: {
                        expectedValue: val,
                        actualValue: undefined,
                        message: "wrong value",
                    },
                });
            });

            it("should not validate mismatching payload", async () => {
                const payload = await claim.fetchAndGetAccessTokenPayloadUpdate("userId");
                const res = claim.validators.hasFreshValue(val2, 600).validate(payload, {});
                assert.deepStrictEqual(res, {
                    isValid: false,
                    reason: {
                        expectedValue: val2,
                        actualValue: val,
                        message: "wrong value",
                    },
                });
            });

            it("should validate matching payload", async () => {
                const payload = await claim.fetchAndGetAccessTokenPayloadUpdate("userId");
                const res = claim.validators.hasFreshValue(val, 600).validate(payload, {});
                assert.deepStrictEqual(res, {
                    isValid: true,
                });
            });

            it("should not validate old values as well", async () => {
                const now = Date.now();
                const clock = sinon.useFakeTimers(now);

                const payload = await claim.fetchAndGetAccessTokenPayloadUpdate("userId");

                // advance clock by one week
                clock.tick(6.048e8);

                const res = claim.validators.hasFreshValue(val, 600).validate(payload, {});
                assert.deepStrictEqual(res, {
                    isValid: false,
                    reason: {
                        ageInSeconds: 604800,
                        maxAgeInSeconds: 600,
                        message: "expired",
                    },
                });
            });

            it("should refetch if value is not set", () => {
                assert.equal(claim.validators.hasFreshValue(val2, 600).shouldRefetch({}), true);
            });

            it("should not refetch if value is set", async () => {
                const payload = await claim.fetchAndGetAccessTokenPayloadUpdate("userId");

                assert.equal(claim.validators.hasFreshValue(val2, 600).shouldRefetch(payload), false);
            });

            it("should refetch if value is old", async () => {
                const now = Date.now();
                const clock = sinon.useFakeTimers(now);

                const payload = await claim.fetchAndGetAccessTokenPayloadUpdate("userId");

                // advance clock by one week
                clock.tick(6.048e8);

                assert.equal(claim.validators.hasFreshValue(val2, 600).shouldRefetch(payload), true);
            });
        });
    });
});
