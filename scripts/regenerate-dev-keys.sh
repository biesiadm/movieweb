#!/bin/bash

if ! command -v 'openssl' &> /dev/null
then
    echo "Could not find openssl."
    echo "Install openssl to use this script."
    exit 1
fi

# Settings
domain='movieweb.local' # Should match PUBLIC_DOMAIN in env
certs_dir='services/load-balancer/docker-files/etc/nginx/certs/'

ca_passphrase='paper think remote opposite stand symbol late note test straight'
domain_passphrase='wall domain just clock busy able wing count farm govern'

country='PL'
state='mazowieckie'
locality='Warszawa'
organization='Movieweb'
organizationalunit='Movieweb IT'
email="admin@${domain}"

### Script starts here

out_dir='scripts/keys'
mkdir -p "${out_dir}"

# CA: Private key and cert
openssl genrsa -aes256 -passout pass:"${ca_passphrase}" -out "${out_dir}/ca.key" 4096
openssl req -new -x509 \
    -days "$((365 * 8))" \
    -key "${out_dir}/ca.key" -passin pass:"${ca_passphrase}" \
    -subj "/C=$country/ST=$state/L=$locality/O=$organization/OU=$organizationalunit/CN=Root CA/emailAddress=$email" \
    -out "${out_dir}/ca.crt"

# Domain: PK, request and signed cert
openssl genrsa -aes256 -passout pass:"${domain_passphrase}" -out "${out_dir}/${domain}.key" 4096
openssl req -newkey rsa:4096 \
    -keyout "${out_dir}/${domain}.key" -passout pass:"${domain_passphrase}" \
    -subj "/C=$country/ST=$state/L=$locality/O=$organization/OU=$organizationalunit/CN=$domain/emailAddress=$email" \
    -out "${out_dir}/${domain}.csr"
openssl x509 -req \
    -in "${out_dir}/${domain}.csr" \
    -CA "${out_dir}/ca.crt" \
    -CAkey "${out_dir}/ca.key" -passin pass:"${ca_passphrase}" \
    -CAcreateserial \
    -out "${out_dir}/${domain}.crt"

# Copy keys to Docker
mkdir -p "${certs_dir}"
cp ${out_dir}/${domain}.{crt,key} "${certs_dir}"
echo "${domain_passphrase}" > "${certs_dir}/${domain}.pass"
