/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/taskr.json`.
 */
export type Taskr = {
    address: "tPqXUGHcFf8BHdEiBAdMh7htxv3XxVZWoo2zAasBnJK";
    metadata: {
        name: "taskr";
        version: "0.1.0";
        spec: "0.1.0";
        description: "Created with Anchor";
    };
    instructions: [
        {
            name: "completeTask";
            discriminator: [109, 167, 192, 41, 129, 108, 220, 196];
            accounts: [
                {
                    name: "project";
                    writable: true;
                    pda: {
                        seeds: [
                            {
                                kind: "account";
                                path: "signer";
                            }
                        ];
                    };
                },
                {
                    name: "signer";
                    writable: true;
                    signer: true;
                },
                {
                    name: "systemProgram";
                    address: "11111111111111111111111111111111";
                }
            ];
            args: [
                {
                    name: "taskIndex";
                    type: "u64";
                }
            ];
        },
        {
            name: "createProject";
            discriminator: [148, 219, 181, 42, 221, 114, 145, 190];
            accounts: [
                {
                    name: "project";
                    writable: true;
                    pda: {
                        seeds: [
                            {
                                kind: "account";
                                path: "signer";
                            }
                        ];
                    };
                },
                {
                    name: "lookup";
                    writable: true;
                    pda: {
                        seeds: [
                            {
                                kind: "const";
                                value: [108, 111, 111, 107, 117, 112];
                            },
                            {
                                kind: "account";
                                path: "signer";
                            }
                        ];
                    };
                },
                {
                    name: "signer";
                    writable: true;
                    signer: true;
                },
                {
                    name: "systemProgram";
                    address: "11111111111111111111111111111111";
                }
            ];
            args: [
                {
                    name: "name";
                    type: "string";
                },
                {
                    name: "tasks";
                    type: {
                        vec: "string";
                    };
                },
                {
                    name: "amount";
                    type: "u64";
                }
            ];
        },
        {
            name: "initialize";
            discriminator: [175, 175, 109, 31, 13, 152, 155, 237];
            accounts: [];
            args: [];
        }
    ];
    accounts: [
        {
            name: "lookup";
            discriminator: [213, 171, 172, 12, 138, 241, 9, 209];
        },
        {
            name: "project";
            discriminator: [205, 168, 189, 202, 181, 247, 142, 19];
        }
    ];
    types: [
        {
            name: "lookup";
            type: {
                kind: "struct";
                fields: [
                    {
                        name: "projects";
                        type: {
                            vec: "pubkey";
                        };
                    }
                ];
            };
        },
        {
            name: "project";
            type: {
                kind: "struct";
                fields: [
                    {
                        name: "tasks";
                        type: {
                            vec: {
                                defined: {
                                    name: "task";
                                };
                            };
                        };
                    },
                    {
                        name: "name";
                        type: "string";
                    },
                    {
                        name: "amount";
                        type: "u64";
                    }
                ];
            };
        },
        {
            name: "task";
            type: {
                kind: "struct";
                fields: [
                    {
                        name: "name";
                        type: "string";
                    },
                    {
                        name: "completed";
                        type: "bool";
                    }
                ];
            };
        }
    ];
};
