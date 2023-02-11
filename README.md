# ezpatch
Create easy patch files!

## ezpatch file syntax

### \# 
a comment

### \\#
escape the # sign

### \#skiplines [int]
skips following lines, leaving them unchanged.

### \#removelines [int]
removes following lines. doesn't get used by createPatchFile.js, meaning you can make yourself look human!

### \#removeline
removes current line

### \#encoding [encoding]
specifies used encoding, must be used at the top only

### any text
inserts specified line