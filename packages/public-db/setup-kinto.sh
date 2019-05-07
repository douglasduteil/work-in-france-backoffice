#!/bin/bash

# create the admin account

curl -X PUT http://localhost:8889/v1/accounts/admin \
     -d '{"data": {"password": "passw0rd"}}' \
     -H 'Content-Type:application/json'


curl -X PUT http://localhost:8889/v1/accounts/wif-bo \
     -d '{"data": {"password": "W0rkInFranceND"}}' \
     -H 'Content-Type:application/json'

# create the bucket `wif`


curl -u admin:passw0rd  \
     -X POST http://localhost:8889/v1/buckets \
     -d '{"data": {"id": "wif"}}' \
     -H 'Content-Type:application/json' 


# create the collections `validity_checks`

curl -u admin:passw0rd  \
     -X POST http://localhost:8889/v1/buckets/wif/collections \
     -d '{"data": {"id": "validity_checks"}}' \
     -H 'Content-Type:application/json' 

## the group `system` has READ/WRITE permission on `validity_checks`

curl -u admin:passw0rd  \
     -X POST http://localhost:8889/v1/buckets/wif/groups \
     -d '{"data": {"id": "system", "members": ["account:wif-bo"]}}' \
     -H 'Content-Type:application/json' 

curl -u admin:passw0rd  \
     -X PATCH http://localhost:8889/v1/buckets/wif/collections/validity_checks \
     -d '{"permissions": {"write": ["/buckets/wif/groups/system"]}}' \
     -H 'Content-Type:application/json' 

# anonymous user can READ collection `validity_checks`

curl -u admin:passw0rd  \
     -X PATCH http://localhost:8889/v1/buckets/wif/collections/validity_checks \
     -d '{"permissions": {"read": ["system.Everyone"]}}' \
     -H 'Content-Type:application/json' 


