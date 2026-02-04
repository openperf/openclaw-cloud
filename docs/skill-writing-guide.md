# OpenClaw Skill Writing Guide

This comprehensive guide will help you create effective custom skills for OpenClaw instances.

## Table of Contents

1. [What is a Skill?](#what-is-a-skill)
2. [Skill Structure](#skill-structure)
3. [Writing Guidelines](#writing-guidelines)
4. [Skill Categories](#skill-categories)
5. [Best Practices](#best-practices)
6. [Example Skills](#example-skills)
7. [Testing Your Skill](#testing-your-skill)
8. [Advanced Features](#advanced-features)

---

## What is a Skill?

A **Skill** is a markdown file that provides instructions, context, and best practices to the AI agent. Skills help the agent:

- Understand specific workflows and processes
- Follow domain-specific best practices
- Access specialized knowledge
- Execute complex tasks with proper guidance

Think of skills as **specialized knowledge modules** that enhance the agent's capabilities in specific domains.

---

## Skill Structure

Every skill should follow this markdown structure:

```markdown
# Skill Name

Brief description of the skill (1-2 sentences).

## Purpose

Explain what this skill helps the agent accomplish. Be specific about:
- The problem it solves
- When to use this skill
- Expected outcomes

## Instructions

Provide step-by-step instructions for the agent:

1. First step with clear action
2. Second step with specific details
3. Continue with numbered steps
4. Include decision points and conditions

## Examples

Provide concrete examples of how to use this skill.

## Best Practices

List important guidelines and best practices.

## Common Pitfalls

Warn about common mistakes and how to avoid them.

## Notes

Additional information, version notes, or limitations.
```

### Required Sections

- **Title (H1)**: The skill name
- **Description**: Brief overview (right after title)
- **Purpose**: Why this skill exists
- **Instructions**: How to use the skill

### Optional Sections

- **Examples**: Concrete usage examples (highly recommended)
- **Best Practices**: Guidelines for optimal use
- **Common Pitfalls**: Mistakes to avoid
- **Tools and Resources**: External tools or documentation
- **Notes**: Additional context or limitations

---

## Writing Guidelines

### 1. Be Clear and Specific

✅ **Good:**
```markdown
## Instructions

1. Read the entire file before making changes
2. Identify functions that exceed 50 lines
3. Extract complex logic into separate functions
4. Ensure each function has a single responsibility
```

❌ **Bad:**
```markdown
## Instructions

1. Look at the code
2. Make it better
3. Fix any issues
```

### 2. Use Actionable Language

Use imperative verbs that tell the agent exactly what to do:

- ✅ "Validate input parameters"
- ✅ "Check for null values"
- ✅ "Return error if validation fails"
- ❌ "Input should be validated"
- ❌ "It's good to check for nulls"

### 3. Provide Context

Explain **why** certain approaches are recommended:

```markdown
## Best Practices

- **Always hash passwords before storage**
  - Reason: Plain-text passwords are a critical security vulnerability
  - Use bcrypt, argon2, or scrypt for hashing
  - Never use MD5 or SHA1 for passwords
```

### 4. Include Code Examples

Show, don't just tell:

```markdown
## Examples

### Correct Error Handling

\`\`\`python
try:
    result = process_data(input_data)
    return {"success": True, "data": result}
except ValueError as e:
    return {"success": False, "error": str(e)}
except Exception as e:
    log_error(e)
    return {"success": False, "error": "Internal error"}
\`\`\`
```

### 5. Structure for Scannability

Use headings, lists, and formatting to make content easy to scan:

- Use **bold** for emphasis
- Use `code` for technical terms
- Use > blockquotes for important warnings
- Use tables for comparisons

---

## Skill Categories

Choose the appropriate category for your skill:

| Category | Description | Examples |
|----------|-------------|----------|
| **general** | General-purpose skills | task planning, problem solving |
| **development** | Software development | code review, refactoring, debugging |
| **data** | Data analysis and processing | data cleaning, visualization, SQL queries |
| **automation** | Task automation | workflow automation, scripting |
| **communication** | Communication and collaboration | email writing, documentation |
| **security** | Security and privacy | security audits, vulnerability scanning |
| **devops** | DevOps and infrastructure | deployment, monitoring, CI/CD |
| **testing** | Testing and quality assurance | unit testing, integration testing |
| **documentation** | Documentation and writing | API docs, user guides, technical writing |

---

## Best Practices

### 1. Start with a Strong Purpose Statement

```markdown
## Purpose

This skill helps the agent perform comprehensive code reviews that:
- Identify security vulnerabilities and performance issues
- Ensure code follows project style guidelines
- Suggest improvements with specific examples
- Maintain high code quality standards
```

### 2. Use Numbered Lists for Sequential Steps

```markdown
## Instructions

1. **Analyze requirements**: Read the user's request carefully
2. **Gather context**: Check existing code and documentation
3. **Plan approach**: Outline the implementation strategy
4. **Execute**: Implement the solution step by step
5. **Validate**: Test the implementation thoroughly
6. **Document**: Add comments and update documentation
```

### 3. Provide Decision-Making Criteria

```markdown
## Instructions

### Choosing the Right Approach

**Use Approach A if:**
- The dataset is small (< 10,000 rows)
- Real-time processing is not required
- Simplicity is prioritized

**Use Approach B if:**
- The dataset is large (> 10,000 rows)
- Performance is critical
- Scalability is required
```

### 4. Include Troubleshooting Guidance

```markdown
## Common Pitfalls

### Issue: Import Error

**Symptom:**
```
ModuleNotFoundError: No module named 'requests'
```

**Solution:**
```bash
pip install requests
```

**Prevention:**
Always check dependencies before running the script.
```

### 5. Link to External Resources

```markdown
## Tools and Resources

- **Official Documentation**: [Python Requests Library](https://requests.readthedocs.io/)
- **Tutorial**: [Real Python - Requests Guide](https://realpython.com/python-requests/)
- **Related Skill**: `api-integration` - For advanced API usage
```

---

## Example Skills

### Example 1: Code Review Skill

```markdown
# Code Review

Perform thorough code reviews following industry best practices.

## Purpose

This skill helps the agent conduct comprehensive code reviews that catch bugs, improve code quality, and ensure consistency with project standards.

## Instructions

1. **Read the entire code change** before commenting
   - Understand the context and purpose
   - Identify the scope of changes

2. **Check for common issues**:
   - Security vulnerabilities (SQL injection, XSS, etc.)
   - Performance problems (N+1 queries, inefficient algorithms)
   - Code style violations (naming, formatting)
   - Missing error handling
   - Lack of input validation

3. **Verify tests** are included and comprehensive
   - Unit tests for new functions
   - Integration tests for new features
   - Edge cases are covered

4. **Suggest improvements** with specific examples
   - Show both the problem and the solution
   - Explain why the change improves the code

5. **Approve or request changes** with clear reasoning
   - Be constructive and respectful
   - Prioritize critical issues

## Examples

### Security Issue

❌ **Problem:**
\`\`\`python
query = f"SELECT * FROM users WHERE id = {user_id}"
cursor.execute(query)
\`\`\`

✅ **Solution:**
\`\`\`python
query = "SELECT * FROM users WHERE id = %s"
cursor.execute(query, (user_id,))
\`\`\`

**Reasoning:** Parameterized queries prevent SQL injection attacks.

### Performance Issue

❌ **Problem:**
\`\`\`python
for user in users:
    user.posts = Post.query.filter_by(user_id=user.id).all()
\`\`\`

✅ **Solution:**
\`\`\`python
users_with_posts = User.query.options(
    joinedload(User.posts)
).all()
\`\`\`

**Reasoning:** Eager loading prevents N+1 query problems.

## Best Practices

- Be constructive and respectful in feedback
- Prioritize security and correctness over style
- Suggest alternatives, don't just point out problems
- Acknowledge good practices when you see them
- Focus on teaching, not just correcting

## Common Pitfalls

- **Being too nitpicky**: Focus on important issues first
- **Ignoring context**: Consider the project's constraints and goals
- **Not explaining reasoning**: Always explain why a change is needed
- **Blocking on style**: Use automated tools for style enforcement

## Notes

- Adjust review depth based on code criticality
- For large changes, consider reviewing in multiple passes
- Use automated tools (linters, security scanners) to catch basic issues
```

### Example 2: API Design Skill

```markdown
# RESTful API Design

Design RESTful APIs following modern best practices.

## Purpose

Guide the agent in creating well-designed, maintainable, and user-friendly APIs that follow REST principles and industry standards.

## Instructions

### 1. Use Proper HTTP Methods

- **GET**: Retrieve resources (idempotent, safe)
- **POST**: Create new resources
- **PUT**: Replace entire resource (idempotent)
- **PATCH**: Partially update resource
- **DELETE**: Remove resource (idempotent)

### 2. Design Clear Resource Paths

Follow these rules:
- Use nouns, not verbs: `/users` not `/getUsers`
- Use plural forms: `/users/123` not `/user/123`
- Nest resources logically: `/users/123/posts`
- Keep URLs short and readable
- Use hyphens for multi-word resources: `/user-profiles`

### 3. Return Appropriate Status Codes

| Code | Meaning | When to Use |
|------|---------|-------------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing/invalid authentication |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource conflict (e.g., duplicate) |
| 500 | Internal Server Error | Server-side error |

### 4. Design Consistent Response Format

\`\`\`json
{
  "data": {
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "meta": {
    "timestamp": "2026-02-02T10:30:00Z"
  }
}
\`\`\`

### 5. Include Proper Error Responses

\`\`\`json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Email address is required",
    "field": "email",
    "details": {
      "expected": "string",
      "received": "null"
    }
  }
}
\`\`\`

### 6. Version Your API

Use URL versioning: `/v1/users`, `/v2/users`

## Examples

### Good API Design

\`\`\`
GET    /v1/users              # List all users
POST   /v1/users              # Create new user
GET    /v1/users/123          # Get specific user
PUT    /v1/users/123          # Replace user
PATCH  /v1/users/123          # Update user fields
DELETE /v1/users/123          # Delete user
GET    /v1/users/123/posts    # Get user's posts
\`\`\`

### Bad API Design

\`\`\`
GET  /v1/getUsers             # Don't use verbs
POST /v1/user                 # Use plural
GET  /v1/users/123/getPosts   # Don't use verbs in nested resources
GET  /v1/users_posts          # Use proper nesting instead
\`\`\`

### Pagination Example

\`\`\`
GET /v1/users?page=2&limit=20

Response:
{
  "data": [...],
  "meta": {
    "page": 2,
    "limit": 20,
    "total": 150,
    "pages": 8
  },
  "links": {
    "first": "/v1/users?page=1&limit=20",
    "prev": "/v1/users?page=1&limit=20",
    "next": "/v1/users?page=3&limit=20",
    "last": "/v1/users?page=8&limit=20"
  }
}
\`\`\`

## Best Practices

- **Use JSON** for request/response bodies
- **Implement pagination** for list endpoints (default: 20 items)
- **Support filtering**: `/users?role=admin&status=active`
- **Support sorting**: `/users?sort=-created_at` (- for descending)
- **Support field selection**: `/users?fields=id,name,email`
- **Document all endpoints** with examples
- **Use authentication tokens** (JWT, OAuth 2.0)
- **Rate limit** to prevent abuse (e.g., 100 requests/minute)
- **Use HTTPS** in production
- **Validate all input** on the server side

## Common Pitfalls

- **Inconsistent naming**: Stick to one convention (camelCase or snake_case)
- **Ignoring idempotency**: GET, PUT, DELETE should be idempotent
- **Overly nested resources**: Limit nesting to 2 levels
- **Not handling errors properly**: Always return meaningful error messages
- **Exposing internal IDs**: Consider using UUIDs instead of sequential IDs
- **Not versioning**: Always version your API from the start

## Tools and Resources

- **OpenAPI/Swagger**: For API documentation
- **Postman**: For API testing
- **REST Client**: VS Code extension for testing
- **JSON Schema**: For request/response validation

## Notes

- Consider GraphQL for complex data requirements
- Use webhooks for event notifications
- Implement HATEOAS for truly RESTful APIs (optional)
- Monitor API usage and performance
- Deprecate old versions gradually with clear timelines
```

### Example 3: Database Query Optimization

```markdown
# Database Query Optimization

Optimize database queries for better performance and scalability.

## Purpose

This skill helps the agent identify and fix slow database queries, reduce database load, and improve application performance.

## Instructions

### 1. Identify Slow Queries

- Check application logs for slow query warnings
- Use database profiling tools (e.g., `EXPLAIN` in SQL)
- Monitor query execution time in production

### 2. Analyze Query Performance

Run `EXPLAIN` or `EXPLAIN ANALYZE`:

\`\`\`sql
EXPLAIN ANALYZE
SELECT u.name, COUNT(p.id) as post_count
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
GROUP BY u.id;
\`\`\`

Look for:
- **Seq Scan** (table scan) - usually bad for large tables
- **Index Scan** - good
- **Nested Loop** - can be slow for large datasets
- **Hash Join** - usually faster for large datasets

### 3. Apply Optimization Techniques

#### Add Indexes

\`\`\`sql
-- Add index on foreign key
CREATE INDEX idx_posts_user_id ON posts(user_id);

-- Add composite index
CREATE INDEX idx_posts_user_status ON posts(user_id, status);

-- Add partial index
CREATE INDEX idx_active_users ON users(id) WHERE status = 'active';
\`\`\`

#### Optimize Joins

❌ **Bad:**
\`\`\`sql
SELECT * FROM users u, posts p WHERE u.id = p.user_id;
\`\`\`

✅ **Good:**
\`\`\`sql
SELECT u.id, u.name, p.title
FROM users u
INNER JOIN posts p ON u.id = p.user_id;
\`\`\`

#### Avoid N+1 Queries

❌ **Bad (N+1):**
\`\`\`python
users = User.query.all()
for user in users:
    posts = Post.query.filter_by(user_id=user.id).all()
\`\`\`

✅ **Good (Eager Loading):**
\`\`\`python
users = User.query.options(joinedload(User.posts)).all()
\`\`\`

#### Use Pagination

❌ **Bad:**
\`\`\`sql
SELECT * FROM posts ORDER BY created_at DESC;
\`\`\`

✅ **Good:**
\`\`\`sql
SELECT * FROM posts
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;
\`\`\`

#### Select Only Needed Columns

❌ **Bad:**
\`\`\`sql
SELECT * FROM users WHERE id = 123;
\`\`\`

✅ **Good:**
\`\`\`sql
SELECT id, name, email FROM users WHERE id = 123;
\`\`\`

### 4. Verify Improvements

- Re-run `EXPLAIN ANALYZE` after optimization
- Compare execution time before and after
- Monitor database load in production

## Examples

### Example 1: Adding Index

**Before:**
\`\`\`sql
EXPLAIN ANALYZE
SELECT * FROM orders WHERE customer_id = 123;

-- Seq Scan on orders (cost=0.00..1234.56 rows=100 width=128)
-- Execution time: 245.3 ms
\`\`\`

**After:**
\`\`\`sql
CREATE INDEX idx_orders_customer_id ON orders(customer_id);

EXPLAIN ANALYZE
SELECT * FROM orders WHERE customer_id = 123;

-- Index Scan using idx_orders_customer_id (cost=0.29..12.45 rows=100 width=128)
-- Execution time: 2.1 ms
\`\`\`

**Result:** 100x faster!

### Example 2: Optimizing Complex Query

**Before:**
\`\`\`sql
SELECT u.name, COUNT(p.id) as post_count
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
WHERE u.status = 'active'
GROUP BY u.id
ORDER BY post_count DESC;

-- Execution time: 1234 ms
\`\`\`

**Optimizations:**
1. Add index on `users.status`
2. Add index on `posts.user_id`
3. Use materialized view for frequently accessed aggregates

**After:**
\`\`\`sql
-- Create indexes
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_posts_user_id ON posts(user_id);

-- Same query now runs faster
-- Execution time: 45 ms
\`\`\`

## Best Practices

- **Index foreign keys**: Always index columns used in JOINs
- **Index WHERE clauses**: Index columns frequently used in WHERE
- **Don't over-index**: Too many indexes slow down INSERT/UPDATE
- **Use composite indexes**: For queries filtering on multiple columns
- **Monitor index usage**: Remove unused indexes
- **Use connection pooling**: Reuse database connections
- **Cache frequently accessed data**: Use Redis or Memcached
- **Denormalize when necessary**: For read-heavy workloads

## Common Pitfalls

- **Indexing everything**: Indexes have overhead, use them wisely
- **Not using EXPLAIN**: Always analyze queries before optimizing
- **Premature optimization**: Optimize when you have real performance data
- **Ignoring database statistics**: Keep statistics up to date
- **Not considering data growth**: Test with production-sized datasets

## Tools and Resources

- **EXPLAIN**: Built-in query analyzer
- **pg_stat_statements**: PostgreSQL query statistics
- **MySQL Slow Query Log**: Track slow queries
- **Database monitoring tools**: DataDog, New Relic, Prometheus

## Notes

- Different databases have different optimization strategies
- Always test optimizations in a staging environment first
- Monitor query performance continuously
- Consider read replicas for read-heavy workloads
- Use database-specific features (e.g., PostgreSQL's partial indexes)
```

---

## Testing Your Skill

Before deploying a custom skill to production:

### 1. Install to Test Instance

1. Create the skill in OpenClaw Cloud
2. Install it to a test instance
3. Verify the skill appears in the instance's skills directory

### 2. Test with Real Tasks

Try tasks that should trigger the skill:

```
# For a "code-review" skill
"Please review this Python function for security issues"

# For an "api-design" skill
"Design a REST API for a blog platform"
```

### 3. Verify Agent Understanding

Check if the agent:
- Follows the instructions correctly
- Applies best practices from the skill
- Provides output consistent with examples
- Handles edge cases appropriately

### 4. Iterate Based on Results

- Add clarifications where the agent misunderstood
- Include more examples for complex scenarios
- Refine instructions based on actual usage
- Update common pitfalls based on observed errors

### 5. Document Limitations

Be honest about what the skill can and cannot do:

```markdown
## Notes

**Limitations:**
- This skill focuses on Python code review
- Does not cover framework-specific issues (Django, Flask)
- Requires code to be syntactically correct
- Best suited for functions under 100 lines

**Future Improvements:**
- Add support for more languages
- Include framework-specific checks
- Add automated testing integration
```

---

## Advanced Features

### Conditional Instructions

Provide different instructions based on context:

```markdown
## Instructions

### For Backend Development

1. Focus on API design and database optimization
2. Check for security vulnerabilities
3. Ensure proper error handling
4. Validate input thoroughly

### For Frontend Development

1. Focus on component structure and state management
2. Check for accessibility issues
3. Ensure responsive design
4. Optimize for performance (bundle size, lazy loading)
```

### Tool Integration

Reference specific tools the agent should use:

```markdown
## Required Tools

This skill requires the following tools to be available:

### Aider

- **Purpose**: AI-assisted coding and refactoring
- **Installation**: Pre-installed in OpenClaw instances
- **Usage**: `aider --model gpt-4 <files>`
- **When to use**: Complex refactoring, feature implementation

### Git

- **Purpose**: Version control
- **Commands**:
  - `git status`: Check working directory status
  - `git diff`: View changes
  - `git commit -m "message"`: Commit changes
- **Best practices**:
  - Always commit after significant changes
  - Use descriptive commit messages
  - Create feature branches for new work
```

### Environment-Specific Instructions

```markdown
## Environment Configuration

### Development Environment

- Use `.env.development` for configuration
- Enable debug logging: `DEBUG=true`
- Use test database: `DB_NAME=myapp_test`
- Disable external API calls (use mocks)

### Staging Environment

- Use `.env.staging` for configuration
- Enable info-level logging: `LOG_LEVEL=info`
- Use staging database: `DB_NAME=myapp_staging`
- Use sandbox API keys for external services

### Production Environment

- Use `.env.production` for configuration
- Enable error-level logging only: `LOG_LEVEL=error`
- Use production database with connection pooling
- Use production API keys
- Enable monitoring and alerting
```

### Multi-Language Support

```markdown
## Language-Specific Guidelines

### Python

- Follow PEP 8 style guide
- Use type hints: `def func(x: int) -> str:`
- Use f-strings for formatting: `f"Hello {name}"`
- Prefer list comprehensions over map/filter

### JavaScript/TypeScript

- Follow Airbnb style guide
- Use TypeScript for type safety
- Prefer `const` over `let`, never use `var`
- Use async/await over promises

### Go

- Follow Go conventions (gofmt)
- Use error handling: `if err != nil { return err }`
- Keep functions short and focused
- Use interfaces for abstraction
```

---

## Conclusion

Creating effective skills takes practice and iteration. Start simple, test thoroughly, and refine based on real-world usage. A well-written skill can dramatically improve an AI agent's performance on specific tasks.

**Key Takeaways:**

1. **Be specific and actionable** in your instructions
2. **Provide concrete examples** to illustrate concepts
3. **Include context and reasoning** for recommendations
4. **Test thoroughly** before deploying to production
5. **Iterate and improve** based on actual usage

For more examples and inspiration, explore the built-in skills in the OpenClaw Cloud marketplace.

Happy skill writing! 🚀
