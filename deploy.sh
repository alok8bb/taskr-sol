#!/bin/bash

# Generate a new keypair
echo "Generating new keypair..."
solana-keygen grind --starts-with t:1
wait $!

KEYPAIR_FILE=$(ls | grep -E '^t.*\.json$' | grep -v 'tsconfig.json')
if [ -z "$KEYPAIR_FILE" ]; then
    echo "Error: Keypair file not found"
    exit 1
fi

mv "$KEYPAIR_FILE" target/deploy/taskr-keypair.json

# Get the public key
PUBLIC_KEY=$(solana-keygen pubkey target/deploy/taskr-keypair.json)
echo "Generated public key: $PUBLIC_KEY"

# Update lib.rs
echo "Updating lib.rs..."
sed -i "s/declare_id!(\"[^\"]*\")/declare_id!(\"$PUBLIC_KEY\")/" programs/taskr/src/lib.rs

# Update Anchor.toml
echo "Updating Anchor.toml..."
sed -i "s/taskr = \"[^\"]*\"/taskr = \"$PUBLIC_KEY\"/" Anchor.toml

# Build the project
echo "Building the project..."
anchor build
wait $!

# Copy IDL file
echo "Copying IDL file..."
cp target/idl/taskr.json website/src/solana/taskr-idl.json

# Copy types file
echo "Copying types file..."
cp target/types/taskr.ts website/src/solana/taskr-types.ts

# Deploy
echo "Deploying..."
anchor deploy
wait $!
