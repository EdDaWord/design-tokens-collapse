// Example usage: 
// `node createMapping.js "Win 11" "Semantic 2" "Fluent Web"`
// `node createMapping.js <Control-Tokens> <Semantic-Tokens> <Alias-Tokens>`

const fs = require('fs');

// Edit as needed:
const inputFile = 'control-tokens.json';
const selectedControlValues = process.argv[2] || "Win 11";
const selectedSemanticMode = process.argv[3] || "Semantic 2";
const selectedAliasMode = process.argv[4] || "Fluent Web"; 


// Helper Functions
const input = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));

const findModeIdByName = (name) => {
    const modeEntry = Object.entries(input.modes).find(([key, value]) => value === name);
    return modeEntry ? modeEntry[0] : null;
};

const selectedControlValuesID = findModeIdByName(selectedControlValues);
const selectedSemanticModeID = findModeIdByName(selectedSemanticMode);
const selectedAliasModeID = findModeIdByName(selectedAliasMode);


// Optional Step: add Alias tokens as parents to Semantic
const aliasToSemanticTree = input.variables.reduce((tree, variable) => {
    const aliasTokenName = variable.resolvedValuesByMode[selectedAliasModeID]?.aliasName;
    const semanticTokenName = variable.resolvedValuesByMode[selectedSemanticModeID]?.aliasName;
    if (aliasTokenName) {
        if (!tree[aliasTokenName] && semanticTokenName) {
            tree[aliasTokenName] = { value: null, children: [], parent: null };
        }
        tree[aliasTokenName].children.push({ [semanticTokenName]: { value: null, children: [], parent: aliasTokenName } });
    }

    return tree;
}, {});

fs.writeFileSync('[0] aliasToSemanticTree.json', JSON.stringify(aliasToSemanticTree, null, 2), 'utf-8');

// const semanticToControlTree = input.variables.reduce((tree, variable) => {
//     const semanticTokenName = variable.resolvedValuesByMode[selectedSemanticModeID]?.aliasName;
//     const selectedModeCtrlValue = variable.resolvedValuesByMode[selectedControlValuesID]?.resolvedValue;
//     const ctrlTokenName = variable.name;
//     if (!tree[semanticTokenName] && ctrlTokenName) {
//         tree[semanticTokenName] = { value: null, children: [], parent: null };
//     }
//     tree[semanticTokenName].children.push({ [ctrlTokenName]: { value: selectedModeCtrlValue, children: [], parent: semanticTokenName } });

//     return tree;
// }, {});

// // Comment out to debug
// fs.writeFileSync('[1] semanticToControlTree.json', JSON.stringify(semanticToControlTree, null, 2), 'utf-8');

// function simplifyTree(tree) {
//     Object.keys(tree).forEach(key => {
//         const node = tree[key];
//         if (node.children.length > 0) {
//             const valueCount = {};
//             let maxCount = 0;
//             let mostCommonValue = null;

//             // Count the occurrences of each value among the children
//             node.children.forEach(child => {
//                 const childKey = Object.keys(child)[0];
//                 const childValue = JSON.stringify(child[childKey].value);  // We use JSON.stringify to handle object comparison
//                 valueCount[childValue] = (valueCount[childValue] || 0) + 1;

//                 // Update most common value if current count is greater
//                 if (valueCount[childValue] > maxCount) {
//                     maxCount = valueCount[childValue];
//                     mostCommonValue = childValue;
//                 }
//             });

//             // Check if there is a most common value
//             if (mostCommonValue !== null) {
//                 // Update the parent node value
//                 node.value = JSON.parse(mostCommonValue);  // Parse the string back to an object

//                 // Remove children with the most common value
//                 node.children = node.children.filter(child => {
//                     const childKey = Object.keys(child)[0];
//                     return JSON.stringify(child[childKey].value) !== mostCommonValue;
//                 });
//             }

//             // Recursively apply the same logic to the children
//             node.children.forEach(child => {
//                 const childKey = Object.keys(child)[0];
//                 simplifyTree({[childKey]: child[childKey]});  // Pass the child node in the same format as the tree
//             });
//         }
//     });
// }

// simplifyTree(semanticToControlTree);

// // Comment out to debug
// fs.writeFileSync('[2] collapsedSemanticToControlTree.json', JSON.stringify(semanticToControlTree, null, 2), 'utf-8');


// // Convert the tree to a flat mapping
// function flattenTree(tree) {
//     let flatList = [];

//     function traverse(node, key) {
//         if (node.value != undefined) {
//             flatList.push({[key]: node.value});  // Store the value with the key
//         }
//         if (node.children && node.children.length > 0) {
//             node.children.forEach(child => {
//                 const childKey = Object.keys(child)[0];
//                 traverse(child[childKey], childKey);  // Recursively traverse children
//             });
//         }
//     }

//     Object.keys(tree).forEach(key => {
//         traverse(tree[key], key);  // Start the traversal for each root node
//     });

//     return flatList;
// }
// const tokensArray = flattenTree(semanticToControlTree);

// fs.writeFileSync('[3] tokensArray.json', JSON.stringify(tokensArray, null, 2), 'utf-8');


// function formatColor(color) {
//     return `rgba(${(color.r).toFixed(2)}, ${(color.g).toFixed(2)}, ${(color.b).toFixed(2)}, ${color.a})`;
// }

// function simplifyArray(array) {
//     const simplified = {};
//     array.forEach(item => {
//         const key = Object.keys(item)[0];
//         const value = item[key];
//         if (typeof value === 'object' && value !== null && 'r' in value) {
//             simplified[key] = formatColor(value);
//         } else {
//             simplified[key] = value;
//         }
//     });
//     return simplified;
// }

// fs.writeFileSync(`${selectedSemanticMode} & ${selectedControlValues} [${tokensArray.length} tokens].json`, JSON.stringify(simplifyArray(tokensArray), null, 2), 'utf-8');

// console.log(`Token count: ${tokensArray.length}`);