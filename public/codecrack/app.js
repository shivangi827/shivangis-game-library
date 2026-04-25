(()=>{var S={easy:"Easy",medium:"Medium",hard:"Hard"},T={pattern:"Pattern Match",bigO:"Big O",output:"Output",bugspot:"Bug Spot"},L={easy:100,medium:200,hard:300};var E=[{type:"pattern",topic:"binary-search",difficulty:"easy",prompt:"You need to find if a target exists in a sorted array of 1 million elements. Which approach is most efficient?",options:["Linear search O(n)","Binary search O(log n)","Hash set O(1)","Sort then search O(n log n)"],answer:1,explanation:"Binary search on a sorted array gives O(log n). Only ~20 comparisons needed for 1 million elements."},{type:"pattern",topic:"arrays-hashing",difficulty:"easy",prompt:"Count the frequency of each character in a string. Which data structure is best?",options:["Array of booleans","Sorted array","Hash map","Linked list"],answer:2,explanation:"A hash map stores key-value pairs, perfect for mapping each character to its count in O(n) time."},{type:"pattern",topic:"stacks-queues",difficulty:"easy",prompt:'Check if a string of parentheses like "({[]})" is balanced. Which data structure helps?',options:["Queue","Hash map","Stack","Array with two pointers"],answer:2,explanation:"A stack lets you push opening brackets and pop when you find the matching closer."},{type:"pattern",topic:"arrays-hashing",difficulty:"easy",prompt:"Given an array, find two numbers that add up to a target. What's the optimal approach?",options:["Sort + binary search","Brute force all pairs","Hash map for complements","Divide and conquer"],answer:2,explanation:"Store each number in a hash map. For each element, check if (target - element) exists. O(n) time."},{type:"pattern",topic:"arrays-hashing",difficulty:"easy",prompt:"Remove all duplicate values from an unsorted array. Most efficient approach?",options:["Nested loops comparing every pair","Sort then compare adjacent","Hash set to track seen values","Binary search for each element"],answer:2,explanation:"A hash set tracks seen values in O(1) per lookup, giving O(n) total time."},{type:"pattern",topic:"two-pointers",difficulty:"easy",prompt:"Check if a string is a palindrome using O(1) extra space.",options:["Reverse and compare","Hash map of character counts","Two pointers from both ends","Stack-based comparison"],answer:2,explanation:"Two pointers start at the beginning and end, comparing characters inward. O(n) time, O(1) space."},{type:"pattern",topic:"trees-graphs",difficulty:"easy",prompt:"Traverse a binary tree level by level (left to right). Which approach?",options:["DFS preorder","DFS inorder","BFS with a queue","Stack-based postorder"],answer:2,explanation:"BFS with a queue processes nodes level by level, giving left-to-right level-order traversal."},{type:"pattern",topic:"sliding-window",difficulty:"easy",prompt:"Find the maximum sum of any k consecutive elements in an array.",options:["Sort the array","Sliding window","Dynamic programming","Binary search"],answer:1,explanation:"A sliding window of size k slides right, adding the new element and removing the leftmost. O(n) time."},{type:"pattern",topic:"two-pointers",difficulty:"medium",prompt:"Given a sorted array, find a pair that sums to a target with O(1) extra space.",options:["Hash map","Two pointers from both ends","Binary search for each element","Sliding window"],answer:1,explanation:"Two pointers start at ends. If sum < target, move left right. If sum > target, move right left. O(n) time, O(1) space."},{type:"pattern",topic:"sliding-window",difficulty:"medium",prompt:"Find the longest substring without repeating characters.",options:["Dynamic programming","Sliding window with hash set","Recursion","Sort the string first"],answer:1,explanation:"A sliding window expands right and shrinks from left when a duplicate is found. O(n) time."},{type:"pattern",topic:"trees-graphs",difficulty:"medium",prompt:"Find the shortest path between two nodes in an unweighted graph.",options:["Depth-First Search","Breadth-First Search","Dijkstra's algorithm","Binary search"],answer:1,explanation:"BFS explores level by level, guaranteeing the shortest path in an unweighted graph."},{type:"pattern",topic:"stacks-queues",difficulty:"medium",prompt:"Design a data structure with push, pop, and getMin all in O(1).",options:["Single stack with sorting","Two stacks (main + min tracker)","Priority queue","Hash map with min variable"],answer:1,explanation:"A min-stack uses a second stack to track the minimum at each level. All operations are O(1)."},{type:"pattern",topic:"binary-search",difficulty:"medium",prompt:"Find the insertion position for a value in a sorted array to keep it sorted.",options:["Linear scan from start","Binary search for lower bound","Two pointers","Hash map lookup"],answer:1,explanation:"Binary search for the lower bound finds the insertion point in O(log n) time."},{type:"pattern",topic:"stacks-queues",difficulty:"medium",prompt:'Evaluate a Reverse Polish Notation expression like ["2","1","+","3","*"].',options:["Recursion","Stack","Queue","Two pointers"],answer:1,explanation:"Push numbers onto a stack. On an operator, pop two operands, compute, push the result."},{type:"pattern",topic:"arrays-hashing",difficulty:"medium",prompt:'Group strings by their anagrams (e.g., ["eat","tea","tan","ate","nat","bat"]).',options:["Sort all strings globally","Hash map with sorted string as key","Trie data structure","Two pointers on each pair"],answer:1,explanation:"Sort each string to get a canonical form. Use it as a hash map key. Anagrams share the same sorted form."},{type:"pattern",topic:"dynamic-programming",difficulty:"medium",prompt:"Count unique paths from top-left to bottom-right of an m\xD7n grid (only right or down).",options:["BFS","DFS with backtracking","Dynamic programming","Greedy"],answer:2,explanation:"dp[i][j] = dp[i-1][j] + dp[i][j-1]. Each cell = paths from above + from left."},{type:"pattern",topic:"recursion-backtracking",difficulty:"medium",prompt:"Find all subsets of a set of distinct integers.",options:["Sliding window","BFS level by level","Backtracking with include/exclude","Two pointers"],answer:2,explanation:"For each element, choose to include or exclude it. This builds 2\u207F subsets through backtracking."},{type:"pattern",topic:"trees-graphs",difficulty:"medium",prompt:"Determine if a binary tree is a valid Binary Search Tree.",options:["Check each node > left and < right child","DFS with min/max range tracking","BFS level-order comparison","Compare with sorted inorder"],answer:1,explanation:"DFS passing a valid range (min, max) down the tree. Each node must be within its ancestor-derived range."},{type:"pattern",topic:"sliding-window",difficulty:"hard",prompt:"Find the minimum window in string S containing all characters of string T.",options:["Sort both strings","Dynamic programming","Sliding window with frequency map","Trie-based search"],answer:2,explanation:"Expand window to include all chars of T, then shrink from left to minimize. O(n) with a frequency map."},{type:"pattern",topic:"dynamic-programming",difficulty:"hard",prompt:"Given n items with weights and values, maximize total value within a weight limit (0/1 Knapsack).",options:["Greedy by value/weight ratio","Dynamic programming","Backtracking only","Binary search"],answer:1,explanation:"DP builds a table of max values for each capacity. dp[i][w] = max of including or excluding item i."},{type:"pattern",topic:"recursion-backtracking",difficulty:"hard",prompt:"Generate all valid combinations of n pairs of parentheses.",options:["Dynamic programming","BFS level by level","Backtracking with open/close counts","Stack-based iteration"],answer:2,explanation:'Backtrack by adding "(" when open < n and ")" when close < open. Generates only valid combinations.'},{type:"pattern",topic:"dynamic-programming",difficulty:"hard",prompt:"Find the length of the longest increasing subsequence in an array.",options:["Sliding window","Sort + two pointers","DP with binary search (patience sort)","Hash map counting"],answer:2,explanation:"DP gives O(n\xB2). Optimized: maintain a tails array and use binary search for O(n log n)."},{type:"pattern",topic:"trees-graphs",difficulty:"hard",prompt:"Detect a cycle in a directed graph.",options:["BFS only","DFS with three-color marking","Union-Find","Two pointers"],answer:1,explanation:"DFS with white/gray/black coloring detects back edges (gray\u2192gray), which indicate cycles."},{type:"pattern",topic:"binary-search",difficulty:"hard",prompt:"Find the kth smallest element in a matrix where each row and column is sorted.",options:["Flatten and sort","Binary search on value range","BFS from top-left","Sliding window"],answer:1,explanation:"Binary search on [min, max] and count elements \u2264 mid. Adjust bounds based on count vs k."},{type:"bigO",topic:"arrays-hashing",difficulty:"easy",prompt:"What is the time complexity?",code:`function sum(arr) {
  let total = 0;
  for (let i = 0; i < arr.length; i++) {
    total += arr[i];
  }
  return total;
}`,options:["O(1)","O(log n)","O(n)","O(n\xB2)"],answer:2,explanation:"A single loop through n elements = O(n)."},{type:"bigO",topic:"arrays-hashing",difficulty:"easy",prompt:"What is the time complexity?",code:`function findPairs(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      console.log(arr[i], arr[j]);
    }
  }
}`,options:["O(n)","O(n log n)","O(n\xB2)","O(2\u207F)"],answer:2,explanation:"Nested loops = n*(n-1)/2 iterations = O(n\xB2)."},{type:"bigO",topic:"binary-search",difficulty:"easy",prompt:"What is the time complexity?",code:`function search(arr, target) {
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}`,options:["O(n)","O(log n)","O(n log n)","O(1)"],answer:1,explanation:"Binary search halves the search space each step = O(log n)."},{type:"bigO",topic:"arrays-hashing",difficulty:"easy",prompt:"What is the time complexity of accessing arr[5] in an array?",options:["O(n)","O(log n)","O(1)","O(n\xB2)"],answer:2,explanation:"Array index access is O(1) \u2014 direct memory address calculation."},{type:"bigO",topic:"arrays-hashing",difficulty:"easy",prompt:"What is the time complexity?",code:`function process(arr) {
  for (let i = 0; i < arr.length; i++) {
    arr[i] *= 2;
  }
  for (let i = 0; i < arr.length; i++) {
    console.log(arr[i]);
  }
}`,options:["O(n\xB2)","O(2n) = O(n)","O(n log n)","O(1)"],answer:1,explanation:"Two sequential O(n) loops = O(n) + O(n) = O(2n) = O(n)."},{type:"bigO",topic:"trees-graphs",difficulty:"easy",prompt:"What is the time complexity of searching in a balanced BST with n nodes?",options:["O(n)","O(log n)","O(n log n)","O(1)"],answer:1,explanation:"A balanced BST has height log n. Search compares at each level = O(log n)."},{type:"bigO",topic:"recursion-backtracking",difficulty:"easy",prompt:"What is the space complexity of a recursive function with depth n and no extra data?",options:["O(1)","O(n)","O(log n)","O(n\xB2)"],answer:1,explanation:"Each recursive call adds a frame to the call stack. Depth n = O(n) space."},{type:"bigO",topic:"recursion-backtracking",difficulty:"medium",prompt:"What is the time complexity?",code:`function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}`,options:["O(n)","O(n log n)","O(n\xB2)","O(log n)"],answer:1,explanation:"Divides in half (log n levels), merges n elements per level = O(n log n)."},{type:"bigO",topic:"trees-graphs",difficulty:"medium",prompt:"What is the time complexity of DFS on a graph with V vertices and E edges?",options:["O(V)","O(E)","O(V + E)","O(V \xD7 E)"],answer:2,explanation:"DFS visits each vertex once (V) and traverses each edge once (E) = O(V + E)."},{type:"bigO",topic:"arrays-hashing",difficulty:"medium",prompt:"What is the average time complexity of a hash map lookup?",options:["O(n)","O(log n)","O(1)","O(n log n)"],answer:2,explanation:"Hash maps provide O(1) average lookup. Worst case is O(n) with collisions."},{type:"bigO",topic:"stacks-queues",difficulty:"medium",prompt:"What is the time complexity?",code:`function nextGreater(arr) {
  const result = new Array(arr.length).fill(-1);
  const stack = [];
  for (let i = 0; i < arr.length; i++) {
    while (stack.length && arr[stack[stack.length-1]] < arr[i]) {
      result[stack.pop()] = arr[i];
    }
    stack.push(i);
  }
  return result;
}`,options:["O(n\xB2)","O(n log n)","O(n)","O(n\xB3)"],answer:2,explanation:"Each element is pushed and popped at most once = O(n) total, despite the nested while loop."},{type:"bigO",topic:"two-pointers",difficulty:"medium",prompt:"What is the time complexity?",code:`function twoSum(sorted, target) {
  let l = 0, r = sorted.length - 1;
  while (l < r) {
    const sum = sorted[l] + sorted[r];
    if (sum === target) return [l, r];
    if (sum < target) l++;
    else r--;
  }
  return [-1, -1];
}`,options:["O(n\xB2)","O(n)","O(log n)","O(n log n)"],answer:1,explanation:"Two pointers move towards each other, covering at most n steps total = O(n)."},{type:"bigO",topic:"arrays-hashing",difficulty:"medium",prompt:"What is the time complexity?",code:`function hasDuplicate(arr) {
  const seen = new Set();
  for (const num of arr) {
    if (seen.has(num)) return true;
    seen.add(num);
  }
  return false;
}`,options:["O(n\xB2)","O(n)","O(n log n)","O(1)"],answer:1,explanation:"One pass. Set has/add are O(1) average. Total = O(n)."},{type:"bigO",topic:"sliding-window",difficulty:"medium",prompt:"What is the time complexity of finding the longest substring without repeating characters using a sliding window?",options:["O(n\xB2)","O(n)","O(n log n)","O(26n)"],answer:1,explanation:"Each character is added and removed at most once. Both pointers traverse n total = O(n)."},{type:"bigO",topic:"dynamic-programming",difficulty:"medium",prompt:"What is the time complexity of the 0/1 knapsack with n items and capacity W?",options:["O(n \xD7 W)","O(2\u207F)","O(n\xB2)","O(n log W)"],answer:0,explanation:"The DP table has n rows and W+1 columns. Each cell is O(1) = O(n \xD7 W) total."},{type:"bigO",topic:"trees-graphs",difficulty:"medium",prompt:"What is the time complexity of BFS on a graph with an adjacency list?",options:["O(V\xB2)","O(V + E)","O(V \xD7 E)","O(E log V)"],answer:1,explanation:"BFS visits each vertex once (V) and examines each edge once (E) = O(V + E)."},{type:"bigO",topic:"recursion-backtracking",difficulty:"hard",prompt:"What is the time complexity of generating all subsets of n elements?",options:["O(n\xB2)","O(n!)","O(2\u207F)","O(n \xD7 2\u207F)"],answer:3,explanation:"There are 2\u207F subsets, and building each takes up to O(n) work = O(n \xD7 2\u207F)."},{type:"bigO",topic:"recursion-backtracking",difficulty:"hard",prompt:"What is the time complexity of generating all permutations of n elements?",options:["O(2\u207F)","O(n!)","O(n \xD7 n!)","O(n\u207F)"],answer:2,explanation:"There are n! permutations, each requiring O(n) to build = O(n \xD7 n!)."},{type:"bigO",topic:"dynamic-programming",difficulty:"hard",prompt:"What is the time complexity?",code:`function fib(n, memo = {}) {
  if (n <= 1) return n;
  if (memo[n]) return memo[n];
  memo[n] = fib(n-1, memo) + fib(n-2, memo);
  return memo[n];
}`,options:["O(2\u207F)","O(n\xB2)","O(n)","O(n log n)"],answer:2,explanation:"Memoization ensures each sub-problem is solved once. n sub-problems, each O(1) = O(n)."},{type:"bigO",topic:"dynamic-programming",difficulty:"hard",prompt:"What is the time complexity WITHOUT memoization?",code:`function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}`,options:["O(n)","O(n\xB2)","O(2\u207F)","O(n log n)"],answer:2,explanation:"Without memoization, the recursion tree has ~2\u207F nodes. Each does O(1) work = O(2\u207F)."},{type:"bigO",topic:"binary-search",difficulty:"hard",prompt:"What is the time complexity?",code:`function searchMatrix(matrix, target) {
  let row = 0, col = matrix[0].length - 1;
  while (row < matrix.length && col >= 0) {
    if (matrix[row][col] === target) return true;
    if (matrix[row][col] > target) col--;
    else row++;
  }
  return false;
}`,options:["O(m \xD7 n)","O(m + n)","O(log(m \xD7 n))","O(m \xD7 log n)"],answer:1,explanation:"Starting from top-right, each step eliminates a row or column. At most m + n steps."},{type:"output",topic:"arrays-hashing",difficulty:"easy",prompt:"What does this code output?",code:`let sum = 0;
for (let i = 1; i <= 5; i++) {
  sum += i;
}
console.log(sum);`,options:["10","15","5","6"],answer:1,explanation:"1 + 2 + 3 + 4 + 5 = 15."},{type:"output",topic:"arrays-hashing",difficulty:"easy",prompt:"What does this code output?",code:`const arr = [1, 2, 3, 4, 5];
console.log(arr.slice(1, 3));`,options:["[1, 2, 3]","[2, 3]","[2, 3, 4]","[1, 2]"],answer:1,explanation:"slice(1, 3) returns elements from index 1 up to (not including) index 3 = [2, 3]."},{type:"output",topic:"arrays-hashing",difficulty:"easy",prompt:"What does this code output?",code:`const arr = [3, 1, 4, 1, 5];
console.log(arr.filter(x => x > 2));`,options:["[3, 4, 5]","[1, 1]","[3, 4, 1, 5]","[4, 5]"],answer:0,explanation:"filter keeps elements where x > 2: 3, 4, and 5."},{type:"output",topic:"arrays-hashing",difficulty:"easy",prompt:"What does this code output?",code:"console.log(10 % 3);",options:["3","1","3.33","0"],answer:1,explanation:"10 % 3 is the remainder: 10 \xF7 3 = 3 remainder 1."},{type:"output",topic:"arrays-hashing",difficulty:"easy",prompt:"What does this code output?",code:`const map = new Map();
map.set("a", 1);
map.set("b", 2);
map.set("a", 3);
console.log(map.get("a"));`,options:["1","3","undefined","Error"],answer:1,explanation:'Setting the same key again overwrites the value. "a" was updated from 1 to 3.'},{type:"output",topic:"stacks-queues",difficulty:"easy",prompt:"What does this code output?",code:`const queue = [];
queue.push("a");
queue.push("b");
queue.push("c");
console.log(queue.shift());
console.log(queue.shift());`,options:["c then b","a then b","b then c","a then c"],answer:1,explanation:'Queue is FIFO. shift() removes from the front: first "a", then "b".'},{type:"output",topic:"recursion-backtracking",difficulty:"easy",prompt:"What does this code output?",code:`function power(base, exp) {
  if (exp === 0) return 1;
  return base * power(base, exp - 1);
}
console.log(power(2, 4));`,options:["8","16","4","32"],answer:1,explanation:"2\u2074 = 2 \xD7 2 \xD7 2 \xD7 2 = 16."},{type:"output",topic:"recursion-backtracking",difficulty:"medium",prompt:"What does this code output?",code:`function countdown(n) {
  if (n === 0) return;
  countdown(n - 1);
  console.log(n);
}
countdown(3);`,options:["3 2 1","1 2 3","3 2 1 0","0 1 2 3"],answer:1,explanation:"The recursive call happens before the log, so the deepest call prints first: 1, 2, 3."},{type:"output",topic:"arrays-hashing",difficulty:"medium",prompt:"What does this code output?",code:`const arr = [1, 2, 3, 4, 5];
const result = arr.reduce((acc, val) => {
  return val % 2 === 0 ? acc + val : acc;
}, 0);
console.log(result);`,options:["15","6","9","2"],answer:1,explanation:"reduce sums only even numbers: 2 + 4 = 6."},{type:"output",topic:"stacks-queues",difficulty:"medium",prompt:"What does this code output?",code:`const stack = [];
stack.push(1);
stack.push(2);
stack.push(3);
stack.pop();
stack.push(4);
console.log(stack);`,options:["[1, 2, 3, 4]","[1, 2, 4]","[1, 4]","[4, 2, 1]"],answer:1,explanation:"Push 1,2,3 \u2192 pop removes 3 \u2192 push 4 \u2192 [1, 2, 4]."},{type:"output",topic:"recursion-backtracking",difficulty:"medium",prompt:"What does this code output?",code:`function mystery(n) {
  if (n <= 0) return 0;
  return n + mystery(n - 2);
}
console.log(mystery(5));`,options:["15","9","5","6"],answer:1,explanation:"mystery(5) = 5 + 3 + 1 + 0 = 9. Steps down by 2 each call."},{type:"output",topic:"arrays-hashing",difficulty:"medium",prompt:"What does this code output?",code:`const set = new Set([1, 2, 3, 2, 1]);
set.add(4);
set.delete(2);
console.log([...set]);`,options:["[1, 3, 4]","[1, 2, 3, 4]","[1, 3, 2, 4]","[3, 4]"],answer:0,explanation:"Set removes duplicates: {1,2,3}. Add 4 \u2192 {1,2,3,4}. Delete 2 \u2192 {1,3,4}."},{type:"output",topic:"arrays-hashing",difficulty:"medium",prompt:"What does this code output?",code:`const arr = [10, 9, 2, 1, 100];
arr.sort();
console.log(arr);`,options:["[1, 2, 9, 10, 100]","[100, 10, 9, 2, 1]","[1, 10, 100, 2, 9]","[1, 100, 10, 2, 9]"],answer:2,explanation:'JS sort() converts to strings by default. "1" < "10" < "100" < "2" < "9" lexicographically.'},{type:"output",topic:"dynamic-programming",difficulty:"medium",prompt:"What does this code output?",code:`function maxSubarray(arr) {
  let max = arr[0], current = arr[0];
  for (let i = 1; i < arr.length; i++) {
    current = Math.max(arr[i], current + arr[i]);
    max = Math.max(max, current);
  }
  return max;
}
console.log(maxSubarray([-2,1,-3,4,-1,2,1,-5,4]));`,options:["4","6","7","5"],answer:1,explanation:"Kadane's algorithm: the max subarray is [4,-1,2,1] = 6."},{type:"output",topic:"two-pointers",difficulty:"medium",prompt:"What does this code output?",code:`function compress(s) {
  let result = "";
  let i = 0;
  while (i < s.length) {
    let j = i;
    while (j < s.length && s[j] === s[i]) j++;
    result += s[i] + (j - i);
    i = j;
  }
  return result;
}
console.log(compress("aaabbc"));`,options:["a3b2c1","abc","a3b2c","321"],answer:0,explanation:'Groups: "aaa"\u2192a3, "bb"\u2192b2, "c"\u2192c1. Result = "a3b2c1".'},{type:"output",topic:"trees-graphs",difficulty:"medium",prompt:"What does this code output?",code:`function inorder(node) {
  if (!node) return [];
  return [
    ...inorder(node.left),
    node.val,
    ...inorder(node.right)
  ];
}
const tree = {
  val: 4,
  left: { val: 2, left: { val: 1, left: null, right: null },
    right: { val: 3, left: null, right: null } },
  right: { val: 6, left: { val: 5, left: null, right: null },
    right: null }
};
console.log(inorder(tree));`,options:["[4,2,1,3,6,5]","[1,2,3,4,5,6]","[1,3,2,5,6,4]","[4,2,6,1,3,5]"],answer:1,explanation:"Inorder on a BST gives sorted order: left, root, right \u2192 [1,2,3,4,5,6]."},{type:"output",topic:"dynamic-programming",difficulty:"hard",prompt:"What does this code output?",code:`function climb(n, memo = {}) {
  if (n <= 1) return 1;
  if (memo[n]) return memo[n];
  memo[n] = climb(n-1, memo) + climb(n-2, memo);
  return memo[n];
}
console.log(climb(5));`,options:["5","8","13","3"],answer:1,explanation:"Stair climbing: climb(5) = climb(4)+climb(3) = 5+3 = 8. Sequence: 1,1,2,3,5,8."},{type:"output",topic:"two-pointers",difficulty:"hard",prompt:"What does this code output?",code:`function reverse(arr) {
  let l = 0, r = arr.length - 1;
  while (l < r) {
    [arr[l], arr[r]] = [arr[r], arr[l]];
    l++; r--;
  }
  return arr;
}
console.log(reverse([1,2,3,4,5]));`,options:["[5,4,3,2,1]","[1,2,3,4,5]","[5,4,3,4,5]","[1,5,3,2,4]"],answer:0,explanation:"Two pointers swap from ends inward: 1\u21945, 2\u21944, 3 stays \u2192 [5,4,3,2,1]."},{type:"output",topic:"trees-graphs",difficulty:"hard",prompt:"What does this code output?",code:`function maxDepth(node) {
  if (!node) return 0;
  return 1 + Math.max(
    maxDepth(node.left), maxDepth(node.right)
  );
}
const tree = {
  val: 1,
  left: { val: 2,
    left: { val: 4, left: null, right: null },
    right: null },
  right: { val: 3, left: null, right: null }
};
console.log(maxDepth(tree));`,options:["2","3","4","1"],answer:1,explanation:"Deepest path is 1\u21922\u21924 = depth 3."},{type:"output",topic:"sliding-window",difficulty:"hard",prompt:"What does this code output?",code:`function maxSum(arr, k) {
  let sum = 0;
  for (let i = 0; i < k; i++) sum += arr[i];
  let max = sum;
  for (let i = k; i < arr.length; i++) {
    sum += arr[i] - arr[i - k];
    max = Math.max(max, sum);
  }
  return max;
}
console.log(maxSum([2,1,5,1,3,2], 3));`,options:["8","9","10","7"],answer:1,explanation:"Windows of 3: [2,1,5]=8, [1,5,1]=7, [5,1,3]=9, [1,3,2]=6. Max = 9."},{type:"output",topic:"binary-search",difficulty:"hard",prompt:"What does this code output?",code:`function lowerBound(arr, target) {
  let lo = 0, hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}
console.log(lowerBound([1,3,3,5,7], 3));`,options:["1","2","3","0"],answer:0,explanation:"Lower bound finds first position where value >= target. Index 1 has the first 3."},{type:"bugspot",topic:"arrays-hashing",difficulty:"easy",prompt:"This should return the sum of an array. What's the bug?",code:`function sum(arr) {
  let total = 0;
  for (let i = 0; i <= arr.length; i++) {
    total += arr[i];
  }
  return total;
}`,options:["total should start at 1","Loop uses <= instead of <","arr[i] should be arr[i-1]","return should be inside the loop"],answer:1,explanation:"i <= arr.length goes one past the end, adding undefined (NaN). Should be i < arr.length."},{type:"bugspot",topic:"arrays-hashing",difficulty:"easy",prompt:"This should find the max value. What's the bug?",code:`function findMax(arr) {
  let max = 0;
  for (const num of arr) {
    if (num > max) max = num;
  }
  return max;
}`,options:["Should use <= instead of >","max should start at -Infinity","Should use indexed loop","Missing return"],answer:1,explanation:"If all numbers are negative, max stays 0. Initialize with -Infinity or arr[0]."},{type:"bugspot",topic:"recursion-backtracking",difficulty:"easy",prompt:"This should calculate factorial. What's the bug?",code:`function factorial(n) {
  if (n === 0) return 1;
  return n * factorial(n);
}`,options:["Base case should return 0","Should be factorial(n - 1)","Should use a loop","n === 0 should be n === 1"],answer:1,explanation:"factorial(n) calls factorial(n) \u2014 infinite recursion! Should be factorial(n - 1)."},{type:"bugspot",topic:"arrays-hashing",difficulty:"easy",prompt:"This should check if a value exists. What's the bug?",code:`function contains(arr, target) {
  for (const item of arr) {
    if (item === target) return true;
    else return false;
  }
}`,options:["Should use == not ===","Returns false on first non-match","Missing default return","Should use indexOf"],answer:1,explanation:"The else immediately returns false if the first element doesn't match. Move return false after the loop."},{type:"bugspot",topic:"stacks-queues",difficulty:"easy",prompt:"This should reverse a string using a stack. What's the bug?",code:`function reverseStr(s) {
  const stack = [];
  for (const ch of s) stack.push(ch);
  let result = "";
  while (stack.length > 0) {
    result += stack.shift();
  }
  return result;
}`,options:["push should be unshift","shift should be pop","result should be an array","Loop condition is wrong"],answer:1,explanation:"shift() removes from the front (FIFO). For a stack, use pop() to get LIFO order."},{type:"bugspot",topic:"arrays-hashing",difficulty:"easy",prompt:"This should count vowels in a string. What's the bug?",code:`function countVowels(s) {
  let count = 0;
  const vowels = "aeiou";
  for (const ch of s) {
    if (vowels.includes(ch)) count++;
  }
  return count;
}`,options:["No bug \u2014 this is correct","Should use indexOf","Doesn't handle uppercase","Count should start at 1"],answer:2,explanation:`The vowels string only has lowercase. "A","E" etc. won't match. Convert ch to lowercase first.`},{type:"bugspot",topic:"binary-search",difficulty:"medium",prompt:"This binary search has a subtle bug. What is it?",code:`function binarySearch(arr, target) {
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) / 2;
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}`,options:["lo should start at 1","mid isn't rounded to an integer","while should use <","hi should be arr.length"],answer:1,explanation:"(lo + hi) / 2 can be non-integer in JS. Use Math.floor() or >> 1."},{type:"bugspot",topic:"two-pointers",difficulty:"medium",prompt:"This merges two sorted arrays. What's the bug?",code:`function merge(a, b) {
  const result = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] <= b[j]) result.push(a[i++]);
    else result.push(b[j++]);
  }
  return result;
}`,options:["Should use < instead of <=","Missing remaining elements after loop","i and j should start at 1","Result should be pre-allocated"],answer:1,explanation:"When one array is exhausted, the remaining elements of the other are lost. Add them after the loop."},{type:"bugspot",topic:"trees-graphs",difficulty:"medium",prompt:"This BFS should find shortest path but has a bug. What is it?",code:`function bfs(graph, start, end) {
  const queue = [start];
  const visited = new Set();
  let steps = 0;
  while (queue.length > 0) {
    const node = queue.shift();
    if (node === end) return steps;
    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        queue.push(neighbor);
      }
    }
    steps++;
  }
  return -1;
}`,options:["Should use a stack","Nodes never marked as visited","steps should start at 1","shift should be pop"],answer:1,explanation:"Neighbors are enqueued but never added to visited. This causes infinite revisiting."},{type:"bugspot",topic:"sliding-window",difficulty:"medium",prompt:"This sliding window finds max sum of k elements. What's the bug?",code:`function maxSum(arr, k) {
  let sum = 0, max = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
    if (i >= k) sum -= arr[i - k];
    max = Math.max(max, sum);
  }
  return max;
}`,options:["max updates before window has k elements","sum -= should use i - k + 1","Initial max should be -Infinity","Loop should start at k"],answer:0,explanation:"max is updated when the window has fewer than k elements. Only compare when i >= k - 1."},{type:"bugspot",topic:"dynamic-programming",difficulty:"medium",prompt:"This DP coin change has a bug. What is it?",code:`function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (const coin of coins) {
    for (let i = coin; i <= amount; i++) {
      dp[i] = Math.min(dp[i], dp[i - coin]);
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}`,options:["dp[0] should be 1","Missing + 1 in transition","Loop should go backwards","Should use dp[i-1]"],answer:1,explanation:"dp[i - coin] is the count for that sub-amount. Need dp[i - coin] + 1 to count the current coin."},{type:"bugspot",topic:"recursion-backtracking",difficulty:"medium",prompt:"This should flatten a nested array. What's the bug?",code:`function flatten(arr) {
  const result = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      result.push(flatten(item));
    } else {
      result.push(item);
    }
  }
  return result;
}`,options:["Should use concat for arrays","Base case is missing","Should spread: push(...flatten(item))","Loop should use index"],answer:2,explanation:"push(flatten(item)) nests the result. Use push(...flatten(item)) to spread elements flat."},{type:"bugspot",topic:"recursion-backtracking",difficulty:"hard",prompt:"This finds all permutations. What's the bug?",code:`function permute(nums) {
  const result = [];
  function backtrack(path) {
    if (path.length === nums.length) {
      result.push(path);
      return;
    }
    for (const num of nums) {
      if (path.includes(num)) continue;
      path.push(num);
      backtrack(path);
      path.pop();
    }
  }
  backtrack([]);
  return result;
}`,options:["path.includes is O(n), use Set","result.push(path) should be push([...path])","path.pop() should be shift()","Base case should use >"],answer:1,explanation:"path is mutated after being pushed. Push a copy with [...path] to preserve each permutation."},{type:"bugspot",topic:"trees-graphs",difficulty:"hard",prompt:"This cycle detection in a directed graph has a bug. What is it?",code:`function hasCycle(graph, n) {
  const visited = new Set();
  function dfs(node) {
    if (visited.has(node)) return true;
    visited.add(node);
    for (const nb of graph[node]) {
      if (dfs(nb)) return true;
    }
    return false;
  }
  for (let i = 0; i < n; i++) {
    if (!visited.has(i) && dfs(i)) return true;
  }
  return false;
}`,options:["Should use BFS",'Needs separate "in current path" set',"visited should be an array","Missing leaf node base case"],answer:1,explanation:`A single visited set can't distinguish back edges from cross edges. Need a "recursion stack" set.`},{type:"bugspot",topic:"dynamic-programming",difficulty:"hard",prompt:"This 0/1 knapsack has a directional bug. What is it?",code:`function knapsack(weights, values, capacity) {
  const dp = new Array(capacity + 1).fill(0);
  for (let i = 0; i < weights.length; i++) {
    for (let w = weights[i]; w <= capacity; w++) {
      dp[w] = Math.max(dp[w], dp[w-weights[i]] + values[i]);
    }
  }
  return dp[capacity];
}`,options:["dp should be 2D","Inner loop should go right to left","Should use values[w]","Missing base case"],answer:1,explanation:"For 0/1 knapsack with 1D DP, iterate right-to-left to avoid reusing the same item. Left-to-right = unbounded."},{type:"bugspot",topic:"binary-search",difficulty:"hard",prompt:"This should find the first bad version. What's the bug?",code:`function firstBadVersion(n, isBad) {
  let lo = 1, hi = n;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (isBad(mid)) hi = mid - 1;
    else lo = mid + 1;
  }
  return lo;
}`,options:["lo should start at 0","hi = mid - 1 should be hi = mid","while should use <=","Should return hi"],answer:1,explanation:"When mid is bad, it might be the first bad version. Keep it in range: hi = mid (not mid - 1)."},{type:"bugspot",topic:"arrays-hashing",difficulty:"hard",prompt:"This LRU Cache has a bug. What is it?",code:`class LRUCache {
  constructor(cap) {
    this.cap = cap;
    this.map = new Map();
  }
  get(key) {
    if (!this.map.has(key)) return -1;
    return this.map.get(key);
  }
  put(key, value) {
    if (this.map.size >= this.cap) {
      const first = this.map.keys().next().value;
      this.map.delete(first);
    }
    this.map.set(key, value);
  }
}`,options:["Should use Object not Map","get() doesn't refresh the key's position","put() should check existing key first","Capacity check should use >"],answer:1,explanation:'get() should delete and re-insert the key to move it to "most recent". Otherwise eviction order is wrong.'},{type:"bugspot",topic:"stacks-queues",difficulty:"hard",prompt:'This "daily temperatures" solution has a bug. What is it?',code:`function dailyTemps(temps) {
  const result = new Array(temps.length).fill(0);
  const stack = [];
  for (let i = 0; i < temps.length; i++) {
    while (stack.length && temps[stack[stack.length-1]] < temps[i]) {
      const idx = stack.pop();
      result[idx] = idx - i;
    }
    stack.push(i);
  }
  return result;
}`,options:["Stack should store temps not indices","result[idx] should be i - idx","while should use <=","Should iterate right to left"],answer:1,explanation:"Days to wait = i - idx (future minus past), not idx - i which gives negative."}];var d="codecrack.leaderboard",N="codecrack.name",$=10,h=!1,p="easy",g=120,e;function j(t){let n=[...t];for(let i=n.length-1;i>0;i--){let o=Math.floor(Math.random()*(i+1));[n[i],n[o]]=[n[o],n[i]]}return n}function K(t){return j(E.filter(n=>n.difficulty===t))}function y(){return localStorage.getItem(N)||""}function X(t){localStorage.setItem(N,t)}function w(t,n){return`${t}-${n}`}function m(t,n){try{let i=localStorage.getItem(d);if(i)return JSON.parse(i)[w(t,n)]||[]}catch{}return[]}function Z(t,n,i){let o;try{let s=localStorage.getItem(d);o=s?JSON.parse(s):{}}catch{o={}}let r=w(t,n);o[r]||(o[r]=[]),o[r].push(i),o[r].sort((s,J)=>J.score-s.score),o[r]=o[r].slice(0,$),localStorage.setItem(d,JSON.stringify(o))}function tt(t,n,i){let o;try{let r=localStorage.getItem(d);o=r?JSON.parse(r):{}}catch{o={}}o[w(t,n)]=i.slice(0,$),localStorage.setItem(d,JSON.stringify(o))}async function et(){try{h=(await(await fetch("/api/codecrack/configured")).json()).configured===!0}catch{h=!1}}async function f(t,n){if(!h)return m(t,n);try{let i=await fetch(`/api/codecrack/scores/${t}/${n}`);if(!i.ok)return m(t,n);let o=await i.json();return tt(t,n,o),o}catch{return m(t,n)}}async function nt(t,n,i){if(Z(t,n,i),!!h)try{await fetch("/api/codecrack/scores",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({difficulty:t,timeMode:n,...i})})}catch{}}var a=t=>document.getElementById(t),H=a("screen-home"),b=a("screen-game"),P=a("screen-over"),G=document.querySelectorAll(".diff-btn"),ot=a("btn-120"),it=a("btn-180"),at=a("btn-300"),R=document.querySelectorAll(".lb-tab"),W=a("home-lb-list"),D=a("home-lb-empty"),M=a("game-countdown"),c=a("countdown-fill"),rt=a("game-score"),st=a("game-streak"),ct=a("game-correct"),B=a("game-diff-label"),I=a("question-type"),lt=a("question-prompt"),F=a("code-block"),pt=a("code-content"),x=document.querySelectorAll(".option-btn"),u=a("explanation"),q=a("modal-name"),l=a("input-name"),A=a("btn-name-confirm"),ut=a("over-score"),dt=a("over-correct"),ht=a("over-accuracy"),mt=a("over-streak"),ft=a("over-new-best"),gt=a("over-lb-list"),yt=a("btn-play-again");function V(t){let n=document.createElement("div");return n.textContent=t,n.innerHTML}function k(t){[H,b,P].forEach(n=>n.classList.add("hidden")),t.classList.remove("hidden")}function Q(t){p=t,G.forEach(n=>n.classList.toggle("active",n.dataset.diff===t)),v(g)}function U(t,n,i){t.innerHTML=n.map((o,r)=>{let s=i&&o.score===i.score&&o.correct===i.correct&&o.name===i.name&&o.date===i.date;return`<li class="lb-entry ${r===0?"lb-gold":""} ${s?"lb-current":""}">
      <span class="lb-rank">${r+1}</span>
      <span class="lb-name">${V(o.name||"Anonymous")}</span>
      <span class="lb-score">${o.score}</span>
      <span class="lb-detail">${o.correct}/${o.total}</span>
      <span class="lb-date">${o.date}</span>
    </li>`}).join("")}async function v(t){g=t,R.forEach(i=>i.classList.toggle("active",Number(i.dataset.mode)===t));let n=await f(p,t);if(n.length===0){W.innerHTML="",D.classList.remove("hidden");return}D.classList.add("hidden"),U(W,n)}function wt(t){let n=y();n&&(l.value=n),q.classList.remove("hidden"),l.focus();function i(){let r=l.value.trim();r&&(X(r),q.classList.add("hidden"),A.removeEventListener("click",i),l.removeEventListener("keydown",o),t())}function o(r){r.key==="Enter"&&i()}A.addEventListener("click",i),l.addEventListener("keydown",o)}function C(t){e={difficulty:p,timeMode:t,questions:K(p),currentIndex:0,score:0,streak:0,bestStreak:0,correct:0,total:0,timeLeft:t,timerInterval:null,answered:!1},B&&(B.textContent=S[p]),k(b),z(),bt()}function O(t){y()?C(t):wt(()=>C(t))}function z(){e.currentIndex>=e.questions.length&&(e.questions=j([...e.questions]),e.currentIndex=0);let t=e.questions[e.currentIndex];e.answered=!1,I.textContent=T[t.type],I.className=`question-type type-${t.type}`,lt.textContent=t.prompt,t.code?(F.classList.remove("hidden"),pt.textContent=t.code):F.classList.add("hidden");let n=["A","B","C","D"];x.forEach((i,o)=>{i.className="option-btn",i.disabled=!1,i.innerHTML=`<span class="option-label">${n[o]}</span><span class="option-text">${V(t.options[o])}</span>`}),u.classList.add("hidden"),u.textContent="",_()}function Y(t){if(!e||e.answered||!e.timerInterval)return;e.answered=!0,e.total++;let n=e.questions[e.currentIndex],i=t===n.answer;if(i){let o=1+Math.floor(e.streak/3)*.25,r=Math.round(L[n.difficulty]*o);e.score+=r,e.streak++,e.correct++,e.streak>e.bestStreak&&(e.bestStreak=e.streak)}else e.streak=0;x.forEach((o,r)=>{o.disabled=!0,r===n.answer&&o.classList.add("correct"),r===t&&!i&&o.classList.add("wrong")}),u.textContent=n.explanation,u.classList.remove("hidden"),u.className=`explanation ${i?"explanation-correct":"explanation-wrong"}`,_(),setTimeout(()=>{e.timerInterval&&(e.currentIndex++,z())},i?1800:2500)}function bt(){e.timerInterval&&clearInterval(e.timerInterval);let t=e.timeMode;c.style.transition="none",c.style.width="100%",c.offsetWidth,c.style.transition="width 1s linear",e.timerInterval=window.setInterval(()=>{e.timeLeft--,c.style.width=`${e.timeLeft/t*100}%`,c.classList.toggle("timer-danger",e.timeLeft<=10);let o=Math.floor(e.timeLeft/60),r=e.timeLeft%60;M.textContent=`${o}:${r.toString().padStart(2,"0")}`,e.timeLeft<=0&&xt()},1e3);let n=Math.floor(e.timeLeft/60),i=e.timeLeft%60;M.textContent=`${n}:${i.toString().padStart(2,"0")}`}async function xt(){e.timerInterval&&(clearInterval(e.timerInterval),e.timerInterval=null);let n={name:y()||"Anonymous",score:e.score,correct:e.correct,total:e.total,streak:e.bestStreak,date:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"})},i=await f(e.difficulty,e.timeMode),o=i.length>0?i[0].score:0,r=e.score>o&&e.score>0;await nt(e.difficulty,e.timeMode,n),ut.textContent=`${e.score}`,dt.textContent=`${e.correct}/${e.total}`,ht.textContent=e.total>0?`${Math.round(e.correct/e.total*100)}%`:"0%",mt.textContent=`${e.bestStreak}`,ft.classList.toggle("hidden",!r);let s=await f(e.difficulty,e.timeMode);U(gt,s,n),k(P)}function _(){rt.textContent=`${e.score}`,st.textContent=`${e.streak}`,ct.textContent=`${e.correct}`}function kt(){return!!e&&e.timerInterval!==null&&!b.classList.contains("hidden")}document.addEventListener("keydown",t=>{if(!kt()||e.answered)return;let n=parseInt(t.key);n>=1&&n<=4&&(t.preventDefault(),Y(n-1))});x.forEach((t,n)=>t.addEventListener("click",()=>Y(n)));ot.addEventListener("click",()=>O(120));it.addEventListener("click",()=>O(180));at.addEventListener("click",()=>O(300));yt.addEventListener("click",()=>{v(g),k(H)});R.forEach(t=>{t.addEventListener("click",()=>v(Number(t.dataset.mode)))});G.forEach(t=>{t.addEventListener("click",()=>Q(t.dataset.diff))});et().then(()=>{Q("easy")});})();
//# sourceMappingURL=app.js.map
