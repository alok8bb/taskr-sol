import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Taskr } from "../target/types/taskr";

describe("taskr", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.Taskr as Program<Taskr>;

    it("Is initialized!", async () => {
        const tx = await program.methods.initialize().rpc();
        console.log("Your transaction signature", tx);
    });

    const [projectPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("project"), provider.wallet.publicKey.toBuffer()],
        program.programId
    );
    it("creates a project", async () => {
        const tx = await program.methods
            .createProject(
                "Test Project",
                ["Test Task 1", "Test Task 2"],
                new anchor.BN(1)
            )
            .rpc();

        const account = await program.account.project.fetch(projectPda);
        const balance = await provider.connection.getBalance(projectPda);
        console.log(
            "Project account balance:",
            balance / anchor.web3.LAMPORTS_PER_SOL,
            "SOL"
        );
        console.log("Your transaction signature", tx);
        console.log(account.name);
        console.log(account.tasks);
    });
});
