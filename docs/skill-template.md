# Custom Skill Template

This template helps you create custom skills for OpenClaw. Follow the structure below to define your skill.

---

## Skill Metadata

```yaml
name: your-skill-name
version: 1.0.0
author: Your Name
description: A brief description of what this skill does
category: general|coding|data|content|automation
tags: [tag1, tag2, tag3]
```

---

## Skill Description

Write a detailed description of your skill here. Explain:
- What problem it solves
- When to use it
- Key capabilities

---

## Usage Instructions

### When to Use This Skill

Describe the scenarios where OpenClaw should use this skill:
- Scenario 1: When the user asks to...
- Scenario 2: When the task involves...

### How to Use

Provide step-by-step instructions for OpenClaw:

1. **Step 1**: Identify the task requirements
2. **Step 2**: Gather necessary information
3. **Step 3**: Execute the main action
4. **Step 4**: Validate and return results

---

## Tool Integration

If your skill requires specific tools, list them here:

### Required Tools

- `exec_tool` - For running shell commands
- `read_file` - For reading file contents
- `write_file` - For creating/modifying files

### Tool Usage Examples

```bash
# Example 1: Run a command
exec_tool("ls -la /path/to/directory")

# Example 2: Read a file
content = read_file("/path/to/file.txt")

# Example 3: Write a file
write_file("/path/to/output.txt", "content here")
```

---

## Examples

### Example 1: Basic Usage

**User Request:**
```
Please analyze the code quality of main.py
```

**OpenClaw Response:**
```
I'll analyze the code quality using the code-review skill:

1. Reading main.py...
2. Checking for code smells...
3. Analyzing complexity...
4. Generating report...

Results:
- Code quality score: 8.5/10
- Issues found: 3
- Suggestions: ...
```

### Example 2: Advanced Usage

**User Request:**
```
Refactor the authentication module to use JWT
```

**OpenClaw Response:**
```
I'll refactor the authentication module:

1. Analyzing current implementation...
2. Designing JWT integration...
3. Implementing changes...
4. Testing the new implementation...

Completed! The authentication module now uses JWT tokens.
```

---

## Best Practices

1. **Be Specific**: Clearly define when and how to use this skill
2. **Provide Examples**: Include real-world usage scenarios
3. **Document Tools**: List all required tools and their usage
4. **Error Handling**: Explain how to handle common errors
5. **Testing**: Describe how to verify the skill works correctly

---

## Common Pitfalls

- **Pitfall 1**: Not checking if required files exist before reading
  - **Solution**: Always verify file existence first
  
- **Pitfall 2**: Assuming tool availability without checking
  - **Solution**: Check tool availability before use

---

## Related Skills

If this skill works well with other skills, list them here:
- `skill-name-1` - For complementary functionality
- `skill-name-2` - For extended capabilities

---

## Changelog

### v1.0.0 (2026-02-02)
- Initial release
- Basic functionality implemented

---

## Notes

Add any additional notes, warnings, or tips here.
