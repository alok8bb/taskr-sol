import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Taskr } from "../target/types/taskr";

describe("taskr", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.Taskr as Program<Taskr>;

    const getBalance = async (pubKey: anchor.web3.PublicKey) => {
        return await provider.connection.getBalance(pubKey);
    };

    const logBalances = async (message: string) => {
        console.log(message);
        console.log(
            "Project account balance:",
            (await getBalance(projectPda)) / anchor.web3.LAMPORTS_PER_SOL,
            "SOL"
        );
        console.log(
            "Wallet balance:",
            (await getBalance(provider.wallet.publicKey)) /
                anchor.web3.LAMPORTS_PER_SOL,
            "SOL\n"
        );
    };

    const [projectPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [provider.wallet.publicKey.toBuffer()],
        program.programId
    );

    it("Is initialized!", async () => {
        const tx = await program.methods.initialize().rpc();
        console.log("Initialization transaction signature", tx);
    });

    it("creates a project", async () => {
        const tx = await program.methods
            .createProject(
                "Yearly Goals",
                ["Get a new job", "Save $10,000", "Learn to code"],
                new anchor.BN(1)
            )
            .rpc();

        console.log("Create project transaction signature", tx);
        await logBalances("After Project Creation:");
    });

    it("completes tasks", async () => {
        await logBalances("Before Task Completion:");

        for (let i = 0; i < 2; i++) {
            const tx = await program.methods
                .completeTask(new anchor.BN(i))
                .rpc();
            console.log(`Complete task ${i + 1} transaction signature`, tx);

            const account = await program.account.project.fetch(projectPda);
            console.log(`Tasks after completing task ${i + 1}:`, account.tasks);

            await logBalances(`After Completing Task ${i + 1}:`);
        }
    });
});
