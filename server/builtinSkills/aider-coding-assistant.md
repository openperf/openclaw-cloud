---
name: aider-coding-assistant
description: Use aider AI pair programming tool to write and modify code
metadata:
  openclaw:
    requires:
      bins: ["aider"]
---

# Aider Coding Assistant

Use the `exec_tool` to run aider commands for AI-powered code generation and modification.

## When to use Aider

Use aider when the user requests:
- Writing new code files
- Modifying existing code
- Adding features to a project
- Fixing bugs in code
- Refactoring code
- Adding tests or documentation

## Installation

**Aider is pre-installed in OpenClaw containers.** No manual installation needed.

If you're using a custom Docker image without aider, install it with:

```bash
pip install aider-chat
```

## Model Configuration

**The LLM model is automatically configured from the instance settings.**

When you create an OpenClaw instance, you configure:
- LLM Provider (OpenAI, Anthropic, DeepSeek, etc.)
- Model name (gpt-4o, claude-sonnet-4, deepseek-chat, etc.)
- API Key

These are automatically injected as environment variables:
- `OPENAI_API_KEY` for OpenAI models
- `ANTHROPIC_API_KEY` for Anthropic models
- `DEEPSEEK_API_KEY` for DeepSeek models

Aider will automatically detect and use these environment variables.

## Usage Patterns

### Pattern 1: Edit specific files

When the user wants to modify specific files:

```bash
# Aider will use the model configured in instance settings
aider --yes-always --message "<user request>" <file1> <file2>
```

**Example:**
```bash
aider --yes-always --message "Add error handling to the API endpoints" src/api.py
```

**If you need to specify a different model:**
```bash
aider --model gpt-4o --yes-always --message "Complex refactoring task" src/api.py
```

### Pattern 2: Create new files

When the user wants to create new files:

```bash
aider --yes-always --message "Create a new <description>" <new-file>
```

**Example:**
```bash
aider --yes-always --message "Create a REST API server with user authentication" server.py
```

### Pattern 3: Architect mode (for complex features)

When the user wants to add complex features that need planning:

```bash
aider --yes-always --architect --message "<feature description>"
```

**Example:**
```bash
aider --yes-always --architect --message "Design and implement a payment processing system with Stripe integration"
```

### Pattern 4: Work on entire project

When the user wants to work on the whole codebase without specifying files:

```bash
cd /path/to/project
aider --model deepseek --yes-always --message "<task description>"
```

Aider will automatically detect relevant files based on the task.

## Model Selection

**By default, aider uses the model configured in your instance settings.**

If you need to override for specific tasks, you can specify `--model` explicitly:

- **Simple edits** (bug fixes, small changes): `deepseek-chat` - Fast and cost-effective
- **Complex features** (new functionality): `claude-sonnet-4` - Better reasoning  
- **Architecture planning** (system design): `gpt-4o` with `--architect` flag

**Example:**
```bash
# Use instance default model
aider --yes-always --message "Fix the login bug"

# Override to use a specific model
aider --model gpt-4o --yes-always --architect --message "Design the entire system architecture"
```

## Command Line Options

Key aider options:

- `--model MODEL` - Specify the LLM model to use
- `--yes-always` - Automatically accept all changes without confirmation
- `--message "TEXT"` - Provide a single message and exit (non-interactive mode)
- `--architect` - Use architect mode for planning before implementation
- `--api-key PROVIDER=KEY` - Provide API key for the LLM provider

## Best Practices

1. **Be specific** - Provide clear, detailed instructions in your message
2. **One task at a time** - Don't combine multiple unrelated tasks in one command
3. **Specify files when possible** - Tell aider which files to edit for better results
4. **Use architect mode for complex tasks** - Let aider plan before implementing
5. **Review changes** - Always check the git diff after aider runs
6. **Commit before running** - Ensure your work is committed so you can easily undo

## Example Workflows

### Example 1: Add a new API endpoint

**User request:** "Add a new endpoint to get user profile"

**Assistant response:**
```bash
exec_tool: aider --model deepseek --yes-always --message "Add a GET /api/user/profile endpoint that returns the authenticated user's profile information including name, email, and avatar" src/api.py
```

### Example 2: Fix a bug

**User request:** "There's a bug in the login function, it doesn't handle empty passwords"

**Assistant response:**
```bash
exec_tool: aider --model deepseek --yes-always --message "Fix the login function to properly validate and handle empty password inputs. Return appropriate error message when password is empty." src/auth.py
```

### Example 3: Create a new feature

**User request:** "Create a task management system with CRUD operations"

**Assistant response:**
```bash
exec_tool: aider --model deepseek --yes-always --architect --message "Design and implement a task management system with the following features: 1) Create, read, update, and delete tasks, 2) Task model with title, description, status, and due date, 3) REST API endpoints, 4) Basic validation and error handling"
```

### Example 4: Add tests

**User request:** "Add unit tests for the user service"

**Assistant response:**
```bash
exec_tool: aider --model deepseek --yes-always --message "Create comprehensive unit tests for all functions in the user service. Include tests for: 1) User creation, 2) User retrieval, 3) User update, 4) User deletion, 5) Edge cases and error handling" tests/test_user_service.py src/user_service.py
```

### Example 5: Refactor code

**User request:** "Refactor the database connection code to use a connection pool"

**Assistant response:**
```bash
exec_tool: aider --model deepseek --yes-always --message "Refactor the database connection code to use a connection pool. Implement connection pooling with configurable pool size, handle connection errors gracefully, and add connection timeout settings" src/database.py
```

## Error Handling

If aider fails, check:

1. **Aider installation** - Verify aider is installed: `which aider`
2. **API keys** - Ensure the LLM API key is set in environment variables
3. **Git repository** - Aider requires the project to be a git repository
4. **File permissions** - Check that aider has write access to the files
5. **Model availability** - Verify the specified model is accessible

## Limitations

- Aider requires a git repository to track changes
- Large codebases may take longer to process
- Some models may have token limits that affect large files
- Requires internet connection for cloud-based models
- The `--yes-always` flag bypasses confirmation, so review changes carefully

## Tips for Users

- Always commit your work before using aider
- Review aider's changes with `git diff` before committing
- Use `git reset --hard HEAD` to undo if needed
- Start with small, specific tasks to get familiar with aider
- Provide context about your project structure when needed
- Use descriptive commit messages after aider makes changes

## API Key Configuration

**Automatic Configuration (Recommended):**

When creating an OpenClaw instance in OpenClaw Cloud:
1. Select your LLM provider (DeepSeek, OpenAI, or Anthropic)
2. Enter your API key in the instance configuration
3. The API key is automatically injected as an environment variable:
   - DeepSeek → `DEEPSEEK_API_KEY`
   - OpenAI → `OPENAI_API_KEY`
   - Anthropic → `ANTHROPIC_API_KEY`

No manual configuration needed! Just install this skill and start using aider.

**Manual Configuration:**

If you need to set API keys manually in the container:

```bash
export DEEPSEEK_API_KEY="your_api_key_here"
export OPENAI_API_KEY="your_api_key_here"
export ANTHROPIC_API_KEY="your_api_key_here"
```

Or add them to the instance configuration in OpenClaw Cloud's management interface.

## Additional Resources

- Aider documentation: https://aider.chat/docs/
- Aider GitHub: https://github.com/Aider-AI/aider
- Model comparison: https://aider.chat/docs/leaderboards/
