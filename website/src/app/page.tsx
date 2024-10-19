"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { PlusCircle, X, Ghost, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

const WalletMultiButton = dynamic(
    () =>
        import("@solana/wallet-adapter-react-ui").then(
            (mod) => mod.WalletMultiButton
        ),
    { ssr: false }
);

export type Task = {
    name: string;
    completed: boolean;
};

export type Project = {
    tasks: Task[];
    name: string;
    amount: number;
    publicKey: PublicKey;
};

export default function Page() {
    const [isClientSide, setIsClientSide] = useState(false);
    const wallet = useAnchorWallet();
    const { connection } = useConnection();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
    const [newProject, setNewProject] = useState({
        name: "",
        stake: "",
        tasks: [""],
    });
    const [isLoading, setIsLoading] = useState(true);

    const provider = new AnchorProvider(connection, wallet!, {});
    setProvider(provider);
    const program = new Program(idl as Taskr, provider);

    useEffect(() => {
        setIsClientSide(true);
    }, []);

    useEffect(() => {
        if (isClientSide && wallet) {
            getProjects();
        } else if (isClientSide) {
            setIsLoading(false);
        }
    }, [isClientSide, wallet]);

    const getProjects = async () => {
        setIsLoading(true);
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
        setIsLoading(false);
    };

    const handleAddTask = () => {
        setNewProject((prev) => ({ ...prev, tasks: [...prev.tasks, ""] }));
    };

    const handleTaskChange = (index: number, value: string) => {
        setNewProject((prev) => {
            const newTasks = [...prev.tasks];
            newTasks[index] = value;
            return { ...prev, tasks: newTasks };
        });
    };

    const handleCreateProject = async () => {
        if (!wallet) {
            toast({
                title: "Wallet not connected",
                description: "Please connect your wallet to create a project.",
                variant: "destructive",
            });
            return;
        }

        if (
            !newProject.name.trim() ||
            !newProject.stake ||
            newProject.tasks.some((task) => !task.trim())
        ) {
            toast({
                title: "Invalid project details",
                description: "Please fill in all required fields.",
                variant: "destructive",
            });
            return;
        }

        const stake = parseFloat(newProject.stake);
        if (isNaN(stake) || stake <= 0) {
            toast({
                title: "Invalid stake amount",
                description:
                    "Please enter a valid stake amount greater than 0.",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsLoading(true);
            console.log("Creating project:", newProject);

            await program.methods
                .createProject(
                    newProject.name,
                    newProject.tasks,
                    new BN(Number(newProject.stake) * LAMPORTS_PER_SOL)
                )
                .rpc();

            toast({
                title: "Project created",
                description: "Your new project has been successfully created.",
            });

            setIsCreateProjectOpen(false);
            setNewProject({
                name: "",
                stake: "",
                tasks: [""],
            });
            await getProjects(); // Re-fetch projects after creation
        } catch (error) {
            console.error("Error creating project:", error);
            toast({
                title: "Error",
                description:
                    "An error occurred while creating the project. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isClientSide) {
        return null; // or a loading spinner
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxsaW5lIHgxPSIwIiB5PSIwIiB4Mj0iMCIgeTI9IjQwIiBzdHJva2U9IiMxNEYxOTUiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3BhdHRlcm4pIiBvcGFjaXR5PSIwLjA1Ii8+PC9zdmc+')] opacity-50"></div>
            <div className="max-w-6xl mx-auto relative z-10">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#14F195] to-[#9945FF]">
                            Taskr on SOL
                        </h1>
                        <p className="text-gray-400 mt-2 text-lg">
                            Decentralized Task Management
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Dialog
                            open={isCreateProjectOpen}
                            onOpenChange={setIsCreateProjectOpen}
                        >
                            <DialogTrigger asChild>
                                <Button className="bg-[#14F195] text-black hover:bg-[#14F195]/90 transition-all duration-300">
                                    Create Project
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl max-w-md w-full">
                                <DialogHeader className="relative">
                                    <DialogTitle className="text-3xl font-bold text-[#14F195]">
                                        Create New Project
                                    </DialogTitle>
                                    <Button
                                        className="absolute right-0 top-0 text-gray-400 hover:text-white transition-colors"
                                        onClick={() =>
                                            setIsCreateProjectOpen(false)
                                        }
                                    >
                                        <X size={24} />
                                    </Button>
                                </DialogHeader>
                                <div className="space-y-6 mt-8">
                                    <div>
                                        <Label
                                            htmlFor="project-name"
                                            className="text-sm font-medium text-gray-300 block mb-2"
                                        >
                                            Project Name
                                        </Label>
                                        <Input
                                            id="project-name"
                                            value={newProject.name}
                                            onChange={(e) =>
                                                setNewProject((prev) => ({
                                                    ...prev,
                                                    name: e.target.value,
                                                }))
                                            }
                                            className="bg-gray-800 border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#14F195] focus:border-transparent transition-all"
                                            placeholder="Enter project name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label
                                            htmlFor="project-stake"
                                            className="text-sm font-medium text-gray-300 block mb-2"
                                        >
                                            Stake (SOL)
                                        </Label>
                                        <Input
                                            id="project-stake"
                                            type="number"
                                            step="0.000000001"
                                            min="0"
                                            value={newProject.stake}
                                            onChange={(e) =>
                                                setNewProject((prev) => ({
                                                    ...prev,
                                                    stake: e.target.value,
                                                }))
                                            }
                                            className="bg-gray-800 border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#14F195] focus:border-transparent transition-all"
                                            placeholder="Enter stake amount"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-300 block mb-2">
                                            Tasks
                                        </Label>
                                        {newProject.tasks.map((task, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center space-x-2 mt-2"
                                            >
                                                <Input
                                                    value={task}
                                                    onChange={(e) =>
                                                        handleTaskChange(
                                                            index,
                                                            e.target.value
                                                        )
                                                    }
                                                    className="bg-gray-800 border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#14F195] focus:border-transparent flex-grow"
                                                    placeholder={`Task ${
                                                        index + 1
                                                    }`}
                                                    required
                                                />
                                                {index > 0 && (
                                                    <Button
                                                        onClick={() => {
                                                            const newTasks = [
                                                                ...newProject.tasks,
                                                            ];
                                                            newTasks.splice(
                                                                index,
                                                                1
                                                            );
                                                            setNewProject(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    tasks: newTasks,
                                                                })
                                                            );
                                                        }}
                                                        className="bg-red-500 text-white rounded-lg hover:bg-red-600"
                                                    >
                                                        <X size={16} />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                        <Button
                                            onClick={handleAddTask}
                                            className="mt-4 bg-[#14F195] text-black font-semibold py-2 px-4 rounded-lg hover:bg-[#14F195]/90 transition-colors"
                                        >
                                            <PlusCircle className="mr-2 h-4 w-4" />{" "}
                                            Add Task
                                        </Button>
                                    </div>
                                    <Button
                                        onClick={handleCreateProject}
                                        className="w-full bg-[#14F195] text-black font-semibold py-3 rounded-lg hover:bg-[#14F195]/90 transition-opacity"
                                    >
                                        Create Project
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                        <WalletMultiButton />
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 min-h-[60vh]">
                    {isLoading ? (
                        <div className="col-span-3 flex flex-col items-center justify-center h-full text-gray-400">
                            <Loader2 size={64} className="mb-4 animate-spin" />
                            <p className="text-xl">Loading projects...</p>
                        </div>
                    ) : projects.length > 0 ? (
                        projects.map((project, index) => (
                            <motion.div
                                key={project.publicKey.toString()}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.5,
                                    delay: index * 0.1,
                                }}
                            >
                                <a
                                    href={`/project/${project.publicKey.toString()}`}
                                >
                                    <Card className="hover:cursor-pointer bg-gray-900 bg-opacity-50 backdrop-filter backdrop-blur-lg border border-gray-800 rounded-xl overflow-hidden group hover:shadow-lg hover:shadow-[#14F195]/20 transition-all duration-300">
                                        <CardHeader className="border-b border-gray-800 pb-4">
                                            <CardTitle className="text-xl font-semibold text-[#14F195] flex justify-between items-center">
                                                {project.name}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-4">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-gray-400">
                                                    Stake:
                                                </span>
                                                <span className="font-medium text-[#14F195]">
                                                    {project.amount /
                                                        LAMPORTS_PER_SOL}{" "}
                                                    SOL
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
                                                            /
                                                            {
                                                                project.tasks
                                                                    .length
                                                            }
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
                                                                    project
                                                                        .tasks
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
                                </a>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-3 flex flex-col items-center justify-center h-full text-gray-400">
                            <Ghost size={64} className="mb-4 stroke-[1.5]" />
                            <p className="text-xl">
                                No projects yet. Create one to get started!
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
