const fs = require("fs");
const arg = process.argv[2];
const arg_patched = process.argv[3];
if (!arg) {
    console.error("[err] Failed to find argument (argv[2]) for file");
    return process.exit(1);
}
if (!fs.existsSync(arg)) {
    console.error(`[err] Failed to find \"${arg}\".`);
    return process.exit(1);
}
if (!arg_patched) {
    console.error("[err] Failed to find argument (argv[3]) for file_patched");
    return process.exit(1);
}
if (!fs.existsSync(arg_patched)) {
    console.error(`[err] Failed to find \"${arg_patched}\".`);
    return process.exit(1);
}
console.log("[log] EzPatch Creator");
console.warn("[wrn] ASSUMING ENCODING UTF-8! May brick your patch results if they are 011000100110100101101110011000010111001001111001.");
console.log(`[log] Opening original file \"${arg}\"...`);
let file = fs.readFileSync(arg).toString("utf8");
file = file.split("\n");
console.log(`[log] Opening patched file \"${arg_patched}\"...`);
let file_patched = fs.readFileSync(arg_patched).toString("utf8");
file_patched = file_patched.split("\n");
console.log("[log] Starting file creation...");
let patch = "";
let skipped = 0;
let pointer = 0;
while (pointer != Math.max(file.length, file_patched.length)) {
    if (!file[pointer]) file[pointer] = "";
    if (!file_patched[pointer]) file_patched[pointer] = "";
    if (file[pointer] == file_patched[pointer]) skipped++;
    if (file[pointer] != file_patched[pointer]) {
        if (skipped) {
            patch = patch + "#skiplines " + skipped + "\n";
            skipped = 0;
        }
        patch = patch + "#removeline\n";
        if (file_patched[pointer].startsWith("#")) {
            patch = patch + "\\\#" + file_patched[pointer].replace("#", "") + "\n";
        } else {
            patch = patch + file_patched[pointer] + "\n";
        }
    }
    pointer++;
    process.stdout.write(`\r[log] Processed files ${pointer}/${file.length} (${(pointer / file.length * 100).toFixed(2)}%)`);
}
process.stdout.write(`\r[log] Processed files ${pointer}/${file.length} (${(pointer / file.length * 100).toFixed(2)}%)\r\n`);
console.log("[log] Writing new file...");
try {
    fs.writeFileSync(arg + ".ezpatch", Buffer.from(patch, "utf-8"));
    console.log(`[log] Saved to \"${arg}.ezpatch\"`)
} catch {
    console.warn(`[wrn] Failed to patch to \"${arg}.ezpatch\"!`);
    try {
        fs.writeFileSync("./patch-file.ezpatch", Buffer.from(patch, "utf-8"));
        console.log(`[log] Saved to \"./patch-file.ezpatch\"`);
    } catch {
        console.error("[err] Failed to patch to \"./patch-file.ezpatch\"!");
        process.exit(1);
    }
}