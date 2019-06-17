#!/bin/sh

INIT_KINTO_POD_STATUS=$(kubectl get job wif-bo-init-kinto"$1")

# Check if wif-bo-init-kinto job exists
if [ ! "$INIT_KINTO_POD_STATUS" ]
then
    kubectl apply -f k8s/kinto/job-init-kinto-wif-bo.yml
else
    kubectl delete job wif-bo-init-kinto"$1"
    kubectl apply -f k8s/kinto/job-init-kinto-wif-bo.yml
fi

