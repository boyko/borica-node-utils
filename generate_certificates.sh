#!/usr/bin/env bash

## Generate private keys
KEY_LENGTH=1024
KEYS_PATH="./certificates"
KEYS_PATH_TEST="./certificates_test"
COMMON_NAME="YOUR DOMAIN"
ORG_UTILITY="YOUR DEPARTMENT"
ORG="ENTITY NAME"
STATE="STATE"
LOCATION="LOCATION"
COUNTRY="COUNTRY CODE"

ETRANS_NAME="eTransactionLog"
BOREQ_NAME="BOReq"
BOREQ_NAME_TEST="BOReqTest"

mkdir $KEYS_PATH
openssl genrsa -out $KEYS_PATH/$ETRANS_NAME.key $KEY_LENGTH
openssl genrsa -out $KEYS_PATH/$BOREQ_NAME.key $KEY_LENGTH
openssl genrsa -out $KEYS_PATH/$BOREQ_NAME_TEST.key $KEY_LENGTH

REQ_SUB="/C=$COUNTRY/ST=$STATE/OU=$ORG_UTILITY/L=$LOCATION/O=$ORG/CN=$COMMON_NAME"
echo $REQ_SUB

openssl req -new -key $KEYS_PATH/$ETRANS_NAME.key -out $KEYS_PATH/$ETRANS_NAME.csr -subj $REQ_SUB
openssl req -new -key $KEYS_PATH/$BOREQ_NAME.key -out $KEYS_PATH/$BOREQ_NAME.csr -subj $REQ_SUB
openssl req -new -key $KEYS_PATH/$BOREQ_NAME_TEST.key -out $KEYS_PATH/$BOREQ_NAME_TEST.csr -subj $REQ_SUB

mkdir $KEYS_PATH_TEST

openssl genrsa -out $KEYS_PATH_TEST/$ETRANS_NAME.key $KEY_LENGTH
openssl genrsa -out $KEYS_PATH_TEST/$BOREQ_NAME.key $KEY_LENGTH
openssl genrsa -out $KEYS_PATH_TEST/$BOREQ_NAME_TEST.key $KEY_LENGTH

