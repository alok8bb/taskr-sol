"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    CheckCircle2,
    Circle,
    AlertCircle,
    Ghost,
    Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import {
    useAnchorWallet,
    useConnection,
    useWallet,
} from "@solana/wallet-adapter-react";
import { AnchorProvider, BN, Program, setProvider } from "@coral-xyz/anchor";
import idl from "@/solana/taskr-idl.json";
import type { Taskr } from "@/solana/taskr-types";
import { toast } from "@/hooks/use-toast";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { Project } from "@/app/page";

const WalletMultiButton = dynamic(
    () =>
        import("@solana/wallet-adapter-react-ui").then(
            (mod) => mod.WalletMultiButton
        ),
    { ssr: false }
);

export default function ProjectDetails({
    params,
}: {
    params: { slug: string };
}) {
    const projectId = params.slug;
    const wallet = useAnchorWallet();
    const { connection } = useConnection();
    const [project, setProject] = useState<Project | null>(null);
    const [tasks, setTasks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (isClient && wallet) {
            const provider = new AnchorProvider(connection, wallet, {});
            setProvider(provider);
            const program = new Program(idl as Taskr, provider);
            getProjectDetails(program);
        }
    }, [isClient, wallet, connection, projectId]);

    const getProjectDetails = async (program: Program<Taskr>) => {
        setIsLoading(true);
        try {
            const projectPda = new PublicKey(projectId);
            const projectAccount = await program.account.project.fetch(
                projectPda
            );

            setProject({
                ...projectAccount,
                publicKey: projectPda,
                amount: projectAccount.amount.toNumber(),
            });

            setTasks(
                projectAccount.tasks.map((task: any, index: number) => ({
                    id: index + 1,
                    name: task.name,
                    status: task.completed ? "completed" : "in_progress",
                }))
            );
        } catch (error) {
            console.error("Error fetching project details:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description:
                    "Failed to fetch project details. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    async function completeTask(taskId: number) {
        if (!wallet || !project) return;

        const provider = new AnchorProvider(connection, wallet, {});
        setProvider(provider);
        const program = new Program(idl as Taskr, provider);

        try {
            await program.methods
                .completeTask(project.name, new BN(taskId - 1))
                .rpc();
            toast({
                title: "Task completed",
                description: "Your task transaction has been sent.",
            });
            getProjectDetails(program);
        } catch (error) {
            console.error("Error completing task:", error);
            toast({
                title: "Error",
                description: "Failed to complete the task. Please try again.",
                variant: "destructive",
            });
        }
    }

    if (!isClient) {
        return null;
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 sm:p-6 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxsaW5lIHgxPSIwIiB5PSIwIiB4Mj0iMCIgeTI9IjQwIiBzdHJva2U9IiMxNEYxOTUiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3BhdHRlcm4pIiBvcGFjaXR5PSIwLjA1Ii8+PC9zdmc+')] opacity-50"></div>
            <div className="max-w-6xl mx-auto relative z-10">
                <header className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-12">
                    <div className="mb-4 sm:mb-0 text-center sm:text-left">
                        <a href="/">
                            <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#14F195] to-[#9945FF]">
                                Taskr on SOL
                            </h1>
                        </a>
                        <p className="text-gray-400 mt-2 text-sm sm:text-base">
                            Decentralized Task Management
                        </p>
                    </div>
                    <WalletMultiButton />
                </header>

                <div className="mb-8 sm:mb-12">
                    {isLoading ? (
                        <Card className="bg-gray-900 bg-opacity-50 backdrop-filter backdrop-blur-lg border-gray-800 overflow-hidden">
                            <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
                                <Loader2
                                    size={48}
                                    className="mb-4 text-gray-400 animate-spin"
                                />
                                <p className="text-lg sm:text-xl text-gray-400">
                                    Loading project details...
                                </p>
                            </CardContent>
                        </Card>
                    ) : !wallet ? (
                        <Card className="bg-gray-900 bg-opacity-50 backdrop-filter backdrop-blur-lg border-gray-800 overflow-hidden">
                            <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
                                <AlertCircle
                                    size={48}
                                    className="mb-4 text-gray-400"
                                />
                                <p className="text-lg sm:text-xl text-gray-400 mb-4">
                                    Wallet not connected
                                </p>
                                <p className="text-base text-center text-gray-500 mb-6">
                                    Please connect your wallet to view project
                                    details
                                </p>
                                <WalletMultiButton />
                            </CardContent>
                        </Card>
                    ) : project ? (
                        <Card className="bg-gray-900 bg-opacity-50 backdrop-filter backdrop-blur-lg border-gray-800 overflow-hidden">
                            <CardHeader className="border-b border-gray-800 pb-4">
                                <CardTitle className="text-xl sm:text-2xl font-semibold text-[#14F195] flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                    <span className="mb-2 sm:mb-0">
                                        {project.name}
                                    </span>
                                    <span className="text-sm font-normal text-gray-400">
                                        Project #
                                        {project.publicKey
                                            .toString()
                                            .slice(0, 8)}
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    <div>
                                        <p className="text-gray-400 mb-1 text-sm">
                                            Total Stake
                                        </p>
                                        <p className="text-xl sm:text-2xl font-semibold text-white">
                                            {project.amount / LAMPORTS_PER_SOL}{" "}
                                            SOL
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 mb-1 text-sm">
                                            Tasks
                                        </p>
                                        <p className="text-xl sm:text-2xl font-semibold text-white">
                                            {project.tasks.length}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 mb-1 text-sm">
                                            Tasks Completed
                                        </p>
                                        <p className="text-xl sm:text-2xl font-semibold text-white">
                                            {
                                                project.tasks.filter(
                                                    (task) => task.completed
                                                ).length
                                            }{" "}
                                            / {project.tasks.length}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="bg-gray-900 bg-opacity-50 backdrop-filter backdrop-blur-lg border-gray-800 overflow-hidden">
                            <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
                                <Ghost
                                    size={48}
                                    className="mb-4 text-gray-400"
                                />
                                <p className="text-lg sm:text-xl text-gray-400">
                                    404 Project Not Found
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {!isLoading && tasks.length > 0 && (
                    <div className="space-y-6">
                        <h2 className="text-xl sm:text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#14F195] to-[#9945FF]">
                            Project Tasks
                        </h2>
                        {tasks.map((task, index) => (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.5,
                                    delay: index * 0.1,
                                }}
                            >
                                <Card className="bg-gray-900 bg-opacity-50 backdrop-filter backdrop-blur-lg border-gray-800 overflow-hidden hover:shadow-lg hover:shadow-[#14F195]/20 transition-all duration-300">
                                    <CardContent className="p-4 sm:p-6">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                                            <div className="flex items-center space-x-3 mb-4 sm:mb-0">
                                                {task.status === "completed" ? (
                                                    <CheckCircle2 className="text-[#14F195] w-5 h-5 sm:w-6 sm:h-6" />
                                                ) : task.status ===
                                                  "in_progress" ? (
                                                    <Circle className="text-[#9945FF] w-5 h-5 sm:w-6 sm:h-6" />
                                                ) : (
                                                    <AlertCircle className="text-gray-400 w-5 h-5 sm:w-6 sm:h-6" />
                                                )}
                                                <h3 className="text-white text-base sm:text-lg font-semibold">
                                                    {task.name}
                                                </h3>
                                            </div>
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                                                <Badge
                                                    variant="outline"
                                                    className={`
                                                        ${
                                                            task.status ===
                                                            "completed"
                                                                ? "bg-[#14F195] bg-opacity-20 text-[#14F195] border-[#14F195]"
                                                                : task.status ===
                                                                  "in_progress"
                                                                ? "bg-[#9945FF] bg-opacity-20 text-[#9945FF] border-[#9945FF]"
                                                                : "bg-gray-700 bg-opacity-20 text-gray-400 border-gray-400"
                                                        }
                                                    `}
                                                >
                                                    {task.status === "completed"
                                                        ? "Completed"
                                                        : task.status ===
                                                          "in_progress"
                                                        ? "In Progress"
                                                        : "Not Started"}
                                                </Badge>
                                                <div className="text-white text-sm sm:text-base">
                                                    {(
                                                        project?.amount! /
                                                        LAMPORTS_PER_SOL /
                                                        tasks.length
                                                    ).toFixed(2)}{" "}
                                                    SOL
                                                </div>
                                                {task.status !==
                                                    "completed" && (
                                                    <Button
                                                        variant="outline"
                                                        className="text-white bg-[#14F195] bg-opacity-20 border-[#14F195] text-sm sm:text-base w-full sm:w-auto"
                                                        onClick={() =>
                                                            completeTask(
                                                                task.id
                                                            )
                                                        }
                                                    >
                                                        Complete Task
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
