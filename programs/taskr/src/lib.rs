use anchor_lang::prelude::*;

declare_id!("Fo8rfUMhKbc3FQaVWcrVzX9f49bhYZgf1gsdSPuoNsqF");

#[program]
pub mod taskr {
    use anchor_lang::{solana_program::native_token::LAMPORTS_PER_SOL, system_program};

    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!(
            "👋 Greetings from: Taskr, Contract Address: {:?}",
            ctx.program_id
        );
        Ok(())
    }

    pub fn create_project(
        ctx: Context<CreateProject>,
        name: String,
        tasks: Vec<String>,
        amount: u64,
    ) -> Result<()> {
        let project = &mut ctx.accounts.project;
        project.name = name;
        project.tasks = tasks
            .into_iter()
            .map(|t| Task {
                name: t,
                completed: false,
            })
            .collect();
        project.amount = amount;

        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.signer.to_account_info(),
                    to: ctx.accounts.project.to_account_info(),
                },
            ),
            amount * LAMPORTS_PER_SOL,
        )?;

        Ok(())
    }

    pub fn complete_task(ctx: Context<CompleteTask>, task_index: u64) -> Result<()> {
        let project = &mut ctx.accounts.project;
        let task = &mut project.tasks[task_index as usize];
        task.completed = true;
        let amount = (project.amount * LAMPORTS_PER_SOL) / project.tasks.len() as u64;
        ctx.accounts.project.sub_lamports(amount)?;
        ctx.accounts.signer.add_lamports(amount)?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

#[derive(Accounts)]
pub struct CreateProject<'info> {
    #[account(init, payer = signer, seeds = [signer.key().as_ref()], bump, space = 8 + Project::INIT_SPACE)]
    pub project: Account<'info, Project>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Project {
    #[max_len(30)]
    tasks: Vec<Task>,
    #[max_len(30)]
    name: String,
    amount: u64,
}

#[account]
#[derive(InitSpace)]
pub struct Task {
    #[max_len(30)]
    name: String,
    completed: bool,
}

#[derive(Accounts)]
pub struct CompleteTask<'info> {
    #[account(mut, seeds = [signer.key().as_ref()], bump)]
    pub project: Account<'info, Project>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}
