use anchor_lang::prelude::*;

declare_id!("tRdyXV9gBC74XFVxLJAbePcupThmd72rNvr9qonx9gX");

#[program]
pub mod taskr {
    use super::*;
    use anchor_lang::system_program;

    pub fn ping(ctx: Context<Ping>) -> Result<()> {
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
        let lookup = &mut ctx.accounts.lookup;
        project.name = name;
        project.tasks = tasks
            .into_iter()
            .map(|t| Task {
                name: t,
                completed: false,
                pow: None,
            })
            .collect();
        project.amount = amount;
        lookup.projects.push(project.key());
        project.owner = *ctx.accounts.signer.key;
        project.creation_time = Clock::get()?.unix_timestamp;

        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.signer.to_account_info(),
                    to: ctx.accounts.project.to_account_info(),
                },
            ),
            amount,
        )?;

        Ok(())
    }

    pub fn complete_task(ctx: Context<CompleteTask>, task_index: u64) -> Result<()> {
        let project = &mut ctx.accounts.project;
        let task = &mut project.tasks[task_index as usize];
        task.completed = true;
        let amount = (project.amount) / project.tasks.len() as u64;
        ctx.accounts.project.sub_lamports(amount)?;
        ctx.accounts.signer.add_lamports(amount)?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Ping {}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateProject<'info> {
    #[account(init, payer = signer, seeds = [name.as_bytes(), signer.key().as_ref()], bump, space = 8 + Project::INIT_SPACE)]
    pub project: Account<'info, Project>,

    #[account(init_if_needed, payer = signer, seeds = [b"lookup", signer.key().as_ref()], bump, space = 8 + Lookup::INIT_SPACE)]
    pub lookup: Account<'info, Lookup>,

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
    owner: Pubkey,
    creation_time: i64,
}

#[account]
#[derive(InitSpace)]
pub struct Task {
    #[max_len(30)]
    name: String,
    completed: bool,
    #[max_len(30)]
    pow: Option<String>,
}

#[derive(Accounts)]
pub struct CompleteTask<'info> {
    #[account(mut, seeds = [signer.key().as_ref()], bump)]
    pub project: Account<'info, Project>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Lookup {
    #[max_len(30)]
    pub projects: Vec<Pubkey>,
}
