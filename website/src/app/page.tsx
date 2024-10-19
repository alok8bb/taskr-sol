"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { AnchorProvider, Program, setProvider } from "@coral-xyz/anchor";
import idl from "@/solana/taskr-idl.json";
import type { Taskr } from "@/solana/taskr-types";
import { PublicKey } from "@solana/web3.js";
import { useState, useEffect } from "react";

type Task = {
    name: string;
    completed: boolean;
};

type Project = {
    tasks: Task[];
    name: string;
    amount: number;
    publicKey: PublicKey;
};

export default function Page() {
    const { connection } = useConnection();
    const wallet = useAnchorWallet();

    const provider = new AnchorProvider(connection, wallet!, {});
    setProvider(provider);

    const program = new Program(idl as Taskr, provider);

    const [projects, setProjects] = useState<Project[]>([]);

    const getProjects = async () => {
        const userPublicKey = wallet?.publicKey;
        if (userPublicKey) {
            try {
                const [pda, _] = PublicKey.findProgramAddressSync(
                    [Buffer.from("lookup"), userPublicKey.toBuffer()],
                    program.programId
                );

                const lookupAccount = await program.account.lookup.fetch(pda);

                if (lookupAccount.projects.length > 0) {
                    const fetchedProjects = await Promise.all(
                        lookupAccount.projects.map(
                            async (projectPda: PublicKey) => {
                                const projectAccount =
                                    await program.account.project.fetch(
                                        projectPda
                                    );
                                return {
                                    ...projectAccount,
                                    publicKey: projectPda,
                                    amount: projectAccount.amount.toNumber(),
                                };
                            }
                        )
                    );
                    console.log(fetchedProjects);
                    setProjects(fetchedProjects);
                } else {
                    console.log("No projects found");
                    setProjects([]);
                }
            } catch (error) {
                console.error("Error fetching projects:", error);
                setProjects([]);
            }
        } else {
            console.log("Wallet not connected");
            setProjects([]);
        }
    };

    useEffect(() => {
        getProjects();
    }, [wallet]);

    const transactions = [
        { address: "0x3289...1230", amount: 3, timestamp: "2 mins ago" },
        { address: "0x4567...7890", amount: 2.5, timestamp: "5 mins ago" },
        { address: "0x7890...1234", amount: 4, timestamp: "10 mins ago" },
    ];

    return (
        <div className="min-h-screen bg-black text-white p-6 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxsaW5lIHgxPSIwIiB5PSIwIiB4Mj0iMCIgeTI9IjQwIiBzdHJva2U9IiMxNEYxOTUiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3BhdHRlcm4pIiBvcGFjaXR5PSIwLjA1Ii8+PC9zdmc+')] opacity-50"></div>
            <div className="max-w-6xl mx-auto relative z-10">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#14F195] to-[#9945FF]">
                            Taskr on SOL
                        </h1>
                        <p className="text-gray-400 mt-2">
                            Decentralized Task Management
                        </p>
                    </div>
                    <WalletMultiButton />
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {projects.map((project, index) => (
                        <motion.div
                            key={project.publicKey.toString()}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <Card className="bg-gray-900 bg-opacity-50 backdrop-filter backdrop-blur-lg border-gray-800 overflow-hidden group hover:shadow-lg hover:shadow-[#14F195]/20 transition-all duration-300">
                                <CardHeader className="border-b border-gray-800 pb-4">
                                    <CardTitle className="text-xl font-semibold text-[#14F195] flex justify-between items-center">
                                        {project.name}
                                        <span className="text-sm font-normal text-gray-400">
                                            Deadline: {}
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-gray-400">
                                            Stake:
                                        </span>
                                        <span className="font-medium text-gray-300">
                                            {project.amount} SOL
                                        </span>
                                    </div>
                                    <div className="relative pt-1">
                                        <div className="flex mb-2 items-center justify-between">
                                            <div>
                                                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-[#14F195] bg-[#14F195]/20">
                                                    Progress
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-semibold inline-block text-[#14F195]">
                                                    {
                                                        project.tasks.filter(
                                                            (task) =>
                                                                task.completed
                                                        ).length
                                                    }
                                                    /{project.tasks.length}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-[#14F195]/20">
                                            <div
                                                style={{
                                                    width: `${
                                                        (project.tasks.filter(
                                                            (task) =>
                                                                task.completed
                                                        ).length /
                                                            project.tasks
                                                                .length) *
                                                        100
                                                    }%`,
                                                }}
                                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#14F195]"
                                            ></div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                <div className="bg-gray-900 bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-lg p-6 border border-gray-800">
                    <h2 className="text-2xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#14F195] to-[#9945FF]">
                        Recent Transactions
                    </h2>
                    <ul className="space-y-4">
                        {transactions.map((tx, index) => (
                            <motion.li
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                    duration: 0.5,
                                    delay: index * 0.1,
                                }}
                                className="flex justify-between items-center py-3 border-b border-gray-800 last:border-b-0"
                            >
                                <div>
                                    <p className="font-medium">{tx.address}</p>
                                    <p className="text-sm text-gray-400">
                                        {tx.timestamp}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-semibold text-[#14F195]">
                                        +{tx.amount} SOL
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Task Completed
                                    </p>
                                </div>
                            </motion.li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
