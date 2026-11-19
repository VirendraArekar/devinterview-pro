import { CodingDifficulty } from '../entities/coding-problem.entity';

export const initialCodingProblemsSeed = [
  // 1. Two Sum (Arrays / HashMap)
  {
    title: 'Two Sum',
    slug: 'two-sum',
    category: 'Arrays',
    difficulty: CodingDifficulty.EASY,
    problemStatement:
      'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
    inputDescription: 'A JSON string or arguments containing nums: number[] and target: number.',
    outputDescription: 'Array of two indices [index1, index2].',
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.',
    ],
    sampleTestCases: [
      {
        input: '{"nums": [2, 7, 11, 15], "target": 9}',
        output: '[0, 1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
      },
      {
        input: '{"nums": [3, 2, 4], "target": 6}',
        output: '[1, 2]',
        explanation: 'nums[1] + nums[2] == 2 + 4 == 6.',
      },
    ],
    hiddenTestCases: [
      {
        input: '{"nums": [3, 3], "target": 6}',
        expectedOutput: '[0, 1]',
      },
      {
        input: '{"nums": [-1, -2, -3, -4, -5], "target": -8}',
        expectedOutput: '[2, 4]',
      },
    ],
    starterCode: {
      javascript: `function solve(input) {\n  const { nums, target } = typeof input === 'string' ? JSON.parse(input) : input;\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}`,
      typescript: `function solve(input: any): number[] {\n  const { nums, target } = typeof input === 'string' ? JSON.parse(input) : input;\n  const map = new Map<number, number>();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement)!, i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}`,
      python: `import json\n\ndef solve(input_data):\n    data = json.loads(input_data) if isinstance(input_data, str) else input_data\n    nums, target = data['nums'], data['target']\n    seen = {}\n    for i, num in enumerate(nums):\n        comp = target - num\n        if comp in seen:\n            return [seen[comp], i]\n        seen[num] = i\n    return []`,
      java: `import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Reading standard JSON input or array\n        System.out.println("[0, 1]");\n    }\n}`,
      cpp: `#include <iostream>\n#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nint main() {\n    cout << "[0, 1]" << endl;\n    return 0;\n}`,
    },
    expectedTimeComplexity: 'O(N)',
    expectedSpaceComplexity: 'O(N)',
    hints: [
      'Can you use a hash map to look up if the complement (target - num) was previously seen?',
      'Hash map lookups run in O(1) average time complexity.',
    ],
    solutionExplanation:
      'Using a hash map, we iterate through nums while checking if (target - num) exists in our map. If it does, we return the stored index and current index. Otherwise, we record the current number and index.',
    optimizedSolutions: {
      javascript: `function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (map.has(diff)) return [map.get(diff), i];\n    map.set(nums[i], i);\n  }\n}`,
    },
    relatedQuestions: ['3Sum', '4Sum', 'Two Sum II - Input Array Is Sorted'],
    acceptanceRate: 88.4,
  },

  // 2. Longest Substring Without Repeating Characters (Sliding Window / Strings)
  {
    title: 'Longest Substring Without Repeating Characters',
    slug: 'longest-substring-without-repeating-characters',
    category: 'Sliding Window',
    difficulty: CodingDifficulty.MEDIUM,
    problemStatement:
      'Given a string s, find the length of the longest substring without duplicate characters.',
    inputDescription: 'String s.',
    outputDescription: 'Integer representing maximum length.',
    constraints: ['0 <= s.length <= 5 * 10^4', 's consists of English letters, digits, symbols and spaces.'],
    sampleTestCases: [
      {
        input: 'abcabcbb',
        output: '3',
        explanation: 'The answer is "abc", with the length of 3.',
      },
      {
        input: 'bbbbb',
        output: '1',
        explanation: 'The answer is "b", with the length of 1.',
      },
      {
        input: 'pwwkew',
        output: '3',
        explanation: 'The answer is "wke", with the length of 3.',
      },
    ],
    hiddenTestCases: [
      {
        input: '',
        expectedOutput: '0',
      },
      {
        input: 'dvdf',
        expectedOutput: '3',
      },
    ],
    starterCode: {
      javascript: `function solve(s) {\n  let maxLength = 0;\n  let start = 0;\n  const charIndexMap = new Map();\n  \n  for (let end = 0; end < s.length; end++) {\n    const char = s[end];\n    if (charIndexMap.has(char) && charIndexMap.get(char) >= start) {\n      start = charIndexMap.get(char) + 1;\n    }\n    charIndexMap.set(char, end);\n    maxLength = Math.max(maxLength, end - start + 1);\n  }\n  \n  return maxLength;\n}`,
      python: `def solve(s):\n    char_map = {}\n    max_len = 0\n    start = 0\n    for end, char in enumerate(s):\n        if char in char_map and char_map[char] >= start:\n            start = char_map[char] + 1\n        char_map[char] = end\n        max_len = max(max_len, end - start + 1)\n    return max_len`,
      java: `public class Solution {\n    public static void main(String[] args) {\n        System.out.println(3);\n    }\n}`,
    },
    expectedTimeComplexity: 'O(N)',
    expectedSpaceComplexity: 'O(min(M, N))',
    hints: [
      'Maintain a sliding window [start, end] and a hash map of last seen character indices.',
      'When duplicate is found inside current window, jump start to lastSeenIndex + 1.',
    ],
    solutionExplanation:
      'Maintain a sliding window with left and right pointers. Track the last seen index of each character. When a duplicate occurs, slide the left pointer past the previous occurrence.',
    acceptanceRate: 72.1,
  },

  // 3. Valid Parentheses (Stacks)
  {
    title: 'Valid Parentheses',
    slug: 'valid-parentheses',
    category: 'Stacks',
    difficulty: CodingDifficulty.EASY,
    problemStatement:
      'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.',
    inputDescription: 'String s of brackets.',
    outputDescription: 'Boolean true or false.',
    constraints: ['1 <= s.length <= 10^4', 's consists of parentheses only "()[]{}"'],
    sampleTestCases: [
      {
        input: '()',
        output: 'true',
      },
      {
        input: '()[]{}',
        output: 'true',
      },
      {
        input: '(]',
        output: 'false',
      },
    ],
    hiddenTestCases: [
      {
        input: '([)]',
        expectedOutput: 'false',
      },
      {
        input: '{[]}',
        expectedOutput: 'true',
      },
    ],
    starterCode: {
      javascript: `function solve(s) {\n  const stack = [];\n  const map = { ')': '(', '}': '{', ']': '[' };\n  for (const ch of s) {\n    if (ch === '(' || ch === '{' || ch === '[') {\n      stack.push(ch);\n    } else {\n      if (stack.pop() !== map[ch]) return false;\n    }\n  }\n  return stack.length === 0;\n}`,
      python: `def solve(s):\n    stack = []\n    pairs = {')': '(', '}': '{', ']': '['}\n    for char in s:\n        if char in '({[':\n            stack.append(char)\n        elif not stack or stack.pop() != pairs[char]:\n            return False\n    return len(stack) == 0`,
    },
    expectedTimeComplexity: 'O(N)',
    expectedSpaceComplexity: 'O(N)',
    hints: ['Push opening brackets onto stack. For closing brackets, pop and verify matching type.'],
    solutionExplanation:
      'A Stack maintains Last-In-First-Out ordering. Every closing bracket must match the most recently opened bracket at the top of the stack.',
    acceptanceRate: 85.3,
  },

  // 4. Merge Intervals (Sorting / Arrays)
  {
    title: 'Merge Intervals',
    slug: 'merge-intervals',
    category: 'Sorting',
    difficulty: CodingDifficulty.MEDIUM,
    problemStatement:
      'Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.',
    inputDescription: 'intervals: number[][] formatted as JSON string.',
    outputDescription: 'Merged intervals array.',
    constraints: ['1 <= intervals.length <= 10^4', 'intervals[i].length == 2', '0 <= starti <= endi <= 10^4'],
    sampleTestCases: [
      {
        input: '[[1,3],[2,6],[8,10],[15,18]]',
        output: '[[1,6],[8,10],[15,18]]',
        explanation: 'Since intervals [1,3] and [2,6] overlap, merge them into [1,6].',
      },
      {
        input: '[[1,4],[4,5]]',
        output: '[[1,5]]',
        explanation: 'Intervals [1,4] and [4,5] are considered overlapping.',
      },
    ],
    hiddenTestCases: [
      {
        input: '[[1,4],[2,3]]',
        expectedOutput: '[[1,4]]',
      },
    ],
    starterCode: {
      javascript: `function solve(input) {\n  const intervals = typeof input === 'string' ? JSON.parse(input) : input;\n  if (intervals.length <= 1) return intervals;\n  intervals.sort((a, b) => a[0] - b[0]);\n  const merged = [intervals[0]];\n  for (let i = 1; i < intervals.length; i++) {\n    const last = merged[merged.length - 1];\n    const curr = intervals[i];\n    if (curr[0] <= last[1]) {\n      last[1] = Math.max(last[1], curr[1]);\n    } else {\n      merged.push(curr);\n    }\n  }\n  return merged;\n}`,
    },
    expectedTimeComplexity: 'O(N log N)',
    expectedSpaceComplexity: 'O(N)',
    hints: ['Sort intervals by start time first.', 'Then iterate and merge when curr.start <= prev.end.'],
    solutionExplanation:
      'Sorting intervals by start time allows linear scan where overlaps only occur with the immediately preceding merged interval.',
    acceptanceRate: 68.2,
  },

  // 5. Coin Change (Dynamic Programming)
  {
    title: 'Coin Change',
    slug: 'coin-change',
    category: 'Dynamic Programming',
    difficulty: CodingDifficulty.MEDIUM,
    problemStatement:
      'You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money.\n\nReturn the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.',
    inputDescription: '{"coins": number[], "amount": number}',
    outputDescription: 'Minimum coins needed or -1.',
    constraints: ['1 <= coins.length <= 12', '1 <= coins[i] <= 2^31 - 1', '0 <= amount <= 10^4'],
    sampleTestCases: [
      {
        input: '{"coins": [1, 2, 5], "amount": 11}',
        output: '3',
        explanation: '11 = 5 + 5 + 1',
      },
      {
        input: '{"coins": [2], "amount": 3}',
        output: '-1',
      },
      {
        input: '{"coins": [1], "amount": 0}',
        output: '0',
      },
    ],
    hiddenTestCases: [
      {
        input: '{"coins": [2, 5, 10, 1], "amount": 27}',
        expectedOutput: '4',
      },
    ],
    starterCode: {
      javascript: `function solve(input) {\n  const { coins, amount } = typeof input === 'string' ? JSON.parse(input) : input;\n  const dp = new Array(amount + 1).fill(Infinity);\n  dp[0] = 0;\n  for (let i = 1; i <= amount; i++) {\n    for (const coin of coins) {\n      if (i - coin >= 0) {\n        dp[i] = Math.min(dp[i], dp[i - coin] + 1);\n      }\n    }\n  }\n  return dp[amount] === Infinity ? -1 : dp[amount];\n}`,
    },
    expectedTimeComplexity: 'O(amount * coins.length)',
    expectedSpaceComplexity: 'O(amount)',
    hints: ['dp[i] represents min coins to make amount i.', 'Transition: dp[i] = min(dp[i], dp[i - coin] + 1).'],
    solutionExplanation:
      'Bottom-up dynamic programming builds subproblem solutions from amount 0 to target amount.',
    acceptanceRate: 61.5,
  },
];
