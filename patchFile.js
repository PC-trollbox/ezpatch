const fs = require("fs");
const arg = process.argv[2];
const arg_patchfile = process.argv[3];
let encoding = "utf8";
if (!arg_patchfile) {
    console.error("[err] Failed to find argument (argv[3]) for patchfile");
    return process.exit(1);
}
if (!fs.existsSync(arg_patchfile)) {
    console.error(`[err] Failed to find \"${arg_patchfile}\".`);
    return process.exit(1);
}
if (!arg) {
    console.error("[err] Failed to find argument (argv[2]) for file");
    return process.exit(1);
}
if (!fs.existsSync(arg)) {
    console.error(`[err] Failed to find \"${arg}\".`);
    return process.exit(1);
}
console.log("[log] EzPatch Manipulation Program");
console.log(`[log] Opening patching file \"${arg_patchfile}\"...`);
let patchfile = fs.readFileSync(arg_patchfile).toString();
patchfile = patchfile.split("\n");
if (patchfile[0].startsWith("#encoding ")) {
    encoding = patchfile[0].split(" ")[1];
    console.log(`[log] Selecting encoding ${patchfile[0].split(" ")[1]} for patching file...`);
    patchfile = fs.readFileSync(arg_patchfile).toString(patchfile[0].split(" ")[1]);
    patchfile = patchfile.split("\n");
    patchfile.splice(0, 1);
}
console.log(`[log] Opening original file file \"${arg_patchfile}\"...`);
let originalfile = fs.readFileSync(arg).toString(encoding);
originalfile = originalfile.split("\n");
console.log("[log] Starting manipulation...");
let endresult = new Array(Math.max(patchfile.length, originalfile.length));
endresult.fill("");
console.log("[log] Copying blocks to end result...");
for (let block in originalfile) {
    process.stdout.write(`\r[log] Processed block ${block}/${originalfile.length} (${(block / originalfile.length*100).toFixed(2)}%)`);
    endresult[block] = originalfile[block];
}
process.stdout.write(`\r[log] Processed block ${originalfile.length}/${originalfile.length} (100.00%)\r\n`);
let pointer = 0;
while (pointer != Math.max(patchfile.length, originalfile.length)) {
    if (!patchfile[pointer]) patchfile[pointer] = "";
    if (!endresult[pointer]) endresult[pointer] = "";
    if (patchfile[pointer].startsWith("#skiplines ")) {
        let a = 1;
        let lock = patchfile[pointer];
        while (a != Number(lock.split(" ")[1])) {
            patchfile.splice(pointer + 1, 0, "");
            a++;
        }
        pointer = pointer + Number(lock.split(" ")[1]) - 1;
    } else if (patchfile[pointer].startsWith("#removeline ") || patchfile[pointer] == "#removeline") {
        endresult.splice(pointer, 1);
        patchfile.splice(pointer, 1);
        pointer--;
    } else if (patchfile[pointer].startsWith("#")) {
    } else if (patchfile[pointer].startsWith("\\#")) {
        patchfile[pointer] = patchfile[pointer].replace("\\#", "#");
        endresult.splice(pointer, 0, patchfile[pointer]);
    } else if (patchfile[pointer]) {
        endresult.splice(pointer, 0, patchfile[pointer])
    }
    process.stdout.write(`\r[log] Processed command ${pointer}/${patchfile.length} (${(pointer / patchfile.length * 100).toFixed(2)}%)`);
    pointer++;
}
process.stdout.write(`\r[log] Processed command ${pointer}/${patchfile.length} (${(pointer / patchfile.length * 100).toFixed(2)}%)\r\n`);
console.log("[log] Writing new file...");
try {
    fs.writeFileSync(arg + ".patched", Buffer.from(endresult.join("\n"), encoding));
    console.log(`[log] Saved to \"${arg}.patched\"`)
} catch {
    console.warn(`[wrn] Failed to patch to \"${arg}.patched\"!`);
    try {
        fs.writeFileSync("./patched-file.patched", Buffer.from(endresult.join("\n"), encoding));
        console.log(`[log] Saved to \"./patched-file.patched\"`);
    } catch {
        console.error("[err] Failed to patch to \"./patched-file.patched!\"");
        process.exit(1);
    }
}