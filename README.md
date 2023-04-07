# file-mask-cli

hide files/dirs

# Example

# Installation

```
npm install file-mask-cli -g
#or
yarn global add file-mask-cli
```

# API

## common

Property | Description | Type | Default | Required | Range | Command |
---------|----------|---------|----------|---------|---------|---------|
INPUT_DIR | the absolute path of input files/dirs | String | process_cwd(the path where the command exec) | False | - | -id |
OUTPUT_DIR | the absolute path of output | String | INPUT_DIR/output | False | - | -od |
INCLUDE_FILES | include files regx | String | - | False | - | -if |
EXCLUDE_FILES | exclude files regx | String | - | False | - | -ef |
COMPRESS_PASSWORD | the password to compress the file/dir | String | - | False | - | -cp |
CRYPTO_FILE | the relative path(relative to INPUT_DIR) of crypto file(it must be a json file) | String | "crypto.json" | False | - | -cf |
THREAD_NUMBER | the number of thread | Number | 12 | False | - | -tn |
RETRY_TIMES | the retry times | Number | 3 | False | - | -rt |

## hide

Property | Description | Type | Default | Required | Range | Command |
---------|----------|---------|----------|---------|---------|---------|
MASK_FILE | the relative path(relative to INPUT_DIR) of mask file which hide other files/dirs | String | - | True | - | -mf |

## show

Property | Description | Type | Default | Required | Range | Command |
---------|----------|---------|----------|---------|---------|---------|

# How to use it

## hide

your directory is like:

```
-demo.jpg
-2.txt
-3
  -1.txt
  -2.txt
```

when you run "file-mask-cli hide -mf demo.jpg"

it will generate the output dir which includes:demo1.jpg(it actually has 2.txt), demo2.jpg(it actually has 3)
it also will generate the crypto file which is called crypto.json

## show

move the crypto.json file which it was generated by hide command to output dir

and then you run "file-mask-cli show"

it will generate the output dir which includes:2.txt, 3

# update