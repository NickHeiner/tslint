/*
 * Copyright 2013 Palantir Technologies, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

describe("<no-trailing-comma>", () => {
    const NoTrailingCommaRule = Lint.Test.getRule("no-trailing-comma");
    const fileName = "rules/notrailingcomma.test.ts";

    it("restricts the use of trailing commas in object literals", () => {
        const expectedFailure1 = Lint.Test.createFailure(fileName, [5, 15], [5, 16], NoTrailingCommaRule.FAILURE_STRING);
        const expectedFailure2 = Lint.Test.createFailure(fileName, [15, 9], [15, 10], NoTrailingCommaRule.FAILURE_STRING);
        const actualFailures = Lint.Test.applyRuleOnFile(fileName, NoTrailingCommaRule);

        Lint.Test.assertContainsFailure(actualFailures, expectedFailure1);
        Lint.Test.assertContainsFailure(actualFailures, expectedFailure2);
    });
});
