"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    CheckCircle2,
    Circle,
    AlertCircle,
    Ghost,
    Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import type { Taskr } from "@/solana/taskr-types";
import { AnchorProvider, setProvider, Program, BN } from "@coral-xyz/anchor";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey, LAMPORTS_PER_SOL, Connection } from "@solana/web3.js";
import idl from "@/solana/taskr-idl.json";
import { Project } from "@/app/page";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export default function ProjectDetails({
    params,
}: {
    params: { slug: string };
}) {
    const projectId = params.slug;
    const wallet = useAnchorWallet();
    const provider = new AnchorProvider(
        new Connection("https://api.devnet.solana.com"),
        wallet!,
        {}
    );
    setProvider(provider);

    const program = new Program(idl as Taskr, provider);

    const [project, setProject] = useState<Project | null>(null);
    const [tasks, setTasks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const getProjectDetails = async () => {
        setIsLoading(true);
        try {
            const projectPda = new PublicKey(projectId as string);
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

    useEffect(() => {
        getProjectDetails();
    }, []);

    async function completeTask(taskId: number) {
        try {
            await program.methods
                .completeTask(project!.name, new BN(taskId - 1))
                .rpc();
            toast({
                title: "Task completed",
                description: "Your task transaction has been sent.",
            });
            await getProjectDetails();
        } catch (error) {
            console.error("Error completing task:", error);
            toast({
                title: "Error",
                description: "Failed to complete the task. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxsaW5lIHgxPSIwIiB5PSIwIiB4Mj0iMCIgeTI9IjQwIiBzdHJva2U9IiMxNEYxOTUiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3BhdHRlcm4pIiBvcGFjaXR5PSIwLjA1Ii8+PC9zdmc+')] opacity-50"></div>
            <div className="max-w-6xl mx-auto relative z-10">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <a href="/">
                            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#14F195] to-[#9945FF]">
                                Taskr on SOL
                            </h1>
                        </a>
                        <p className="text-gray-400 mt-2">
                            Decentralized Task Management
                        </p>
                    </div>
                    <WalletMultiButton />
                </header>

                <div className="mb-12">
                    {isLoading ? (
                        <Card className="bg-gray-900 bg-opacity-50 backdrop-filter backdrop-blur-lg border-gray-800 overflow-hidden">
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Loader2
                                    size={64}
                                    className="mb-4 text-gray-400 animate-spin"
                                />
                                <p className="text-xl text-gray-400">
                                    Loading project details...
                                </p>
                            </CardContent>
                        </Card>
                    ) : project ? (
                        <Card className="bg-gray-900 bg-opacity-50 backdrop-filter backdrop-blur-lg border-gray-800 overflow-hidden">
                            <CardHeader className="border-b border-gray-800 pb-4">
                                <CardTitle className="text-2xl font-semibold text-[#14F195] flex justify-between items-center">
                                    {project.name}
                                    <span className="text-sm font-normal text-gray-400">
                                        Project #
                                        {project.publicKey
                                            .toString()
                                            .slice(0, 8)}
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <p className="text-gray-400 mb-1">
                                            Total Stake
                                        </p>
                                        <p className="text-2xl font-semibold text-white">
                                            {project.amount / LAMPORTS_PER_SOL}{" "}
                                            SOL
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 mb-1">
                                            Tasks
                                        </p>
                                        <p className="text-2xl font-semibold text-white">
                                            {project.tasks.length}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 mb-1">
                                            Tasks Completed
                                        </p>
                                        <p className="text-2xl font-semibold text-white">
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
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Ghost
                                    size={64}
                                    className="mb-4 text-gray-400"
                                />
                                <p className="text-xl text-gray-400">
                                    404 Project Not Found
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {!isLoading && tasks.length > 0 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#14F195] to-[#9945FF]">
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
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                {task.status === "completed" ? (
                                                    <CheckCircle2 className="text-[#14F195] w-6 h-6" />
                                                ) : task.status ===
                                                  "in_progress" ? (
                                                    <Circle className="text-[#9945FF] w-6 h-6" />
                                                ) : (
                                                    <AlertCircle className="text-gray-400 w-6 h-6" />
                                                )}
                                                <h3 className="text-white text-lg font-semibold">
                                                    {task.name}
                                                </h3>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <Badge
                                                    variant="outline"
                                                    className={`
                          ${
                              task.status === "completed"
                                  ? "bg-[#14F195] bg-opacity-20 text-[#14F195] border-[#14F195]"
                                  : task.status === "in_progress"
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
                                                <div className="text-white">
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
                                                        className="text-white bg-[#14F195] bg-opacity-20 border-[#14F195]"
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
