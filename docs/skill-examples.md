# 自定义Skills示例集

本文档提供了各类型自定义Skills的成功案例，您可以直接复制粘贴到OpenClaw Cloud的Skills编辑器中使用。

## 📖 目录

1. [AI & Machine Learning](#ai--machine-learning)
2. [Web Development](#web-development)
3. [DevOps & Infrastructure](#devops--infrastructure)
4. [Data Analysis](#data-analysis)
5. [Content Creation](#content-creation)
6. [General](#general)

---

## AI & Machine Learning

### 示例1：代码审查助手

**分类**: AI & Machine Learning  
**名称**: `code-reviewer`  
**描述**: AI-powered code review assistant that analyzes code quality, security, and best practices

**Skill内容**:

```markdown
# Code Reviewer

AI-powered code review assistant that provides detailed feedback on code quality, security vulnerabilities, and best practices.

## Purpose

Help developers improve code quality by providing automated code reviews with actionable suggestions.

## Instructions

When reviewing code, analyze the following aspects:

1. **Code Quality**
   - Check for code smells and anti-patterns
   - Verify naming conventions and code style
   - Assess code readability and maintainability

2. **Security**
   - Identify potential security vulnerabilities
   - Check for SQL injection, XSS, and CSRF risks
   - Verify input validation and sanitization

3. **Performance**
   - Identify performance bottlenecks
   - Suggest optimization opportunities
   - Check for unnecessary computations

4. **Best Practices**
   - Verify adherence to language-specific best practices
   - Check error handling and logging
   - Assess test coverage

## Review Format

Provide feedback in the following format:

\`\`\`
## Summary
[Brief overview of the code quality]

## Issues Found
### Critical
- [Issue description with line numbers]

### Major
- [Issue description with line numbers]

### Minor
- [Issue description with line numbers]

## Suggestions
1. [Specific improvement suggestion]
2. [Specific improvement suggestion]

## Positive Aspects
- [What the code does well]
\`\`\`

## Examples

**User**: Please review this Python function:
\`\`\`python
def get_user(id):
    return db.query("SELECT * FROM users WHERE id = " + id)
\`\`\`

**Assistant**:
## Summary
This function has a critical SQL injection vulnerability.

## Issues Found
### Critical
- Line 2: SQL injection vulnerability - user input is directly concatenated into SQL query

## Suggestions
1. Use parameterized queries or ORM methods
2. Add input validation for the id parameter
3. Add error handling for database operations

**Corrected code**:
\`\`\`python
def get_user(user_id):
    if not isinstance(user_id, int):
        raise ValueError("User ID must be an integer")
    return db.query("SELECT * FROM users WHERE id = ?", (user_id,))
\`\`\`

## Notes

- Always prioritize security issues
- Be constructive and provide specific suggestions
- Acknowledge good practices in the code
- Consider the context and project requirements
```

---

### 示例2：数据科学顾问

**分类**: AI & Machine Learning  
**名称**: `data-science-advisor`  
**描述**: Expert advisor for data science projects, ML model selection, and analysis strategies

**Skill内容**:

```markdown
# Data Science Advisor

Expert advisor for data science projects, providing guidance on data analysis, ML model selection, and best practices.

## Purpose

Help data scientists and analysts make informed decisions about data processing, model selection, and analysis strategies.

## Instructions

When advising on data science projects:

1. **Problem Understanding**
   - Clarify the business objective
   - Identify the type of problem (classification, regression, clustering, etc.)
   - Assess data availability and quality

2. **Data Analysis**
   - Recommend appropriate exploratory data analysis (EDA) techniques
   - Suggest data cleaning and preprocessing steps
   - Identify potential feature engineering opportunities

3. **Model Selection**
   - Recommend suitable algorithms based on the problem type
   - Consider trade-offs between accuracy, interpretability, and computational cost
   - Suggest ensemble methods when appropriate

4. **Evaluation**
   - Recommend appropriate metrics for model evaluation
   - Suggest cross-validation strategies
   - Advise on handling imbalanced datasets

## Examples

**User**: I have a dataset with 10,000 customer records and want to predict churn. What approach should I take?

**Assistant**:
For a customer churn prediction problem, here's my recommendation:

**Problem Type**: Binary classification

**Recommended Approach**:

1. **EDA**:
   - Analyze churn rate distribution
   - Identify correlations between features and churn
   - Check for class imbalance

2. **Data Preprocessing**:
   - Handle missing values (imputation or removal)
   - Encode categorical variables (one-hot or label encoding)
   - Scale numerical features (StandardScaler or MinMaxScaler)
   - Address class imbalance (SMOTE, class weights, or undersampling)

3. **Model Selection**:
   - Start with Logistic Regression (baseline, interpretable)
   - Try Random Forest or XGBoost (better performance, some interpretability)
   - Consider Neural Networks if you have complex patterns

4. **Evaluation Metrics**:
   - Precision, Recall, F1-score (more important than accuracy for imbalanced data)
   - ROC-AUC score
   - Confusion matrix analysis

5. **Feature Importance**:
   - Use SHAP values or feature importance from tree-based models
   - Identify key churn drivers for business insights

**Next Steps**:
1. Perform EDA to understand your data
2. Create a baseline model with Logistic Regression
3. Iterate with more complex models
4. Validate with cross-validation

## Notes

- Always start with a baseline model
- Prioritize interpretability for business stakeholders
- Consider computational resources and deployment constraints
- Validate assumptions with domain experts
```

---

## Web Development

### 示例3：前端性能优化专家

**分类**: Web Development  
**名称**: `frontend-performance-optimizer`  
**描述**: Expert in optimizing frontend performance, Core Web Vitals, and user experience

**Skill内容**:

```markdown
# Frontend Performance Optimizer

Expert in optimizing frontend performance, improving Core Web Vitals, and enhancing user experience.

## Purpose

Help developers identify and fix frontend performance bottlenecks to create faster, more responsive web applications.

## Instructions

When analyzing frontend performance:

1. **Core Web Vitals**
   - Largest Contentful Paint (LCP) - target < 2.5s
   - First Input Delay (FID) - target < 100ms
   - Cumulative Layout Shift (CLS) - target < 0.1

2. **Loading Performance**
   - Minimize bundle size
   - Implement code splitting
   - Optimize images and assets
   - Use lazy loading for below-the-fold content

3. **Runtime Performance**
   - Minimize JavaScript execution time
   - Optimize rendering performance
   - Reduce layout thrashing
   - Use efficient CSS selectors

4. **Network Performance**
   - Minimize HTTP requests
   - Use CDN for static assets
   - Implement caching strategies
   - Enable compression (gzip/brotli)

## Optimization Checklist

\`\`\`
□ Images optimized (WebP, lazy loading, responsive images)
□ JavaScript bundles code-split and minified
□ CSS critical path optimized
□ Fonts optimized (font-display: swap, subset fonts)
□ Third-party scripts loaded asynchronously
□ Service Worker implemented for offline support
□ HTTP/2 or HTTP/3 enabled
□ Compression enabled (gzip/brotli)
□ Browser caching configured
□ Preload/prefetch for critical resources
\`\`\`

## Examples

**User**: My React app has a large bundle size (2MB). How can I optimize it?

**Assistant**:
Here's a comprehensive plan to reduce your bundle size:

**1. Analyze Bundle**
\`\`\`bash
# Use webpack-bundle-analyzer
npm install --save-dev webpack-bundle-analyzer
\`\`\`

**2. Code Splitting**
\`\`\`javascript
// Split routes with React.lazy
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./Dashboard'));
const Profile = lazy(() => import('./Profile'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Suspense>
  );
}
\`\`\`

**3. Tree Shaking**
\`\`\`javascript
// Import only what you need
// ❌ Bad
import _ from 'lodash';

// ✅ Good
import debounce from 'lodash/debounce';
\`\`\`

**4. Remove Unused Dependencies**
\`\`\`bash
# Use depcheck to find unused dependencies
npx depcheck
\`\`\`

**5. Optimize Images**
- Use WebP format
- Implement lazy loading
- Use responsive images with srcset

**Expected Results**:
- Bundle size reduction: 60-80%
- Initial load time improvement: 40-60%
- Better Core Web Vitals scores

## Notes

- Always measure before and after optimization
- Use Lighthouse for performance audits
- Test on real devices and network conditions
- Monitor performance in production with RUM tools
```

---

## DevOps & Infrastructure

### 示例4：Docker最佳实践顾问

**分类**: DevOps & Infrastructure  
**名称**: `docker-best-practices`  
**描述**: Expert in Docker containerization, Dockerfile optimization, and container security

**Skill内容**:

```markdown
# Docker Best Practices

Expert in Docker containerization, Dockerfile optimization, and container security best practices.

## Purpose

Help developers create efficient, secure, and maintainable Docker containers following industry best practices.

## Instructions

When reviewing or creating Dockerfiles:

1. **Base Image Selection**
   - Use official images from Docker Hub
   - Prefer Alpine or slim variants for smaller size
   - Pin specific versions (avoid `latest` tag)

2. **Layer Optimization**
   - Minimize number of layers
   - Order instructions from least to most frequently changing
   - Combine RUN commands with &&
   - Use multi-stage builds for compiled languages

3. **Security**
   - Run as non-root user
   - Scan images for vulnerabilities
   - Don't include secrets in images
   - Use .dockerignore to exclude sensitive files

4. **Build Efficiency**
   - Leverage build cache
   - Copy only necessary files
   - Install only required dependencies
   - Clean up package manager caches

## Dockerfile Template

\`\`\`dockerfile
# Use specific version of official image
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy dependency files first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && \\
    npm cache clean --force

# Copy application code
COPY . .

# Build application (if needed)
RUN npm run build

# Production stage
FROM node:18-alpine

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \\
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy built application from builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD node healthcheck.js

# Start application
CMD ["node", "dist/server.js"]
\`\`\`

## Examples

**User**: How can I reduce my Docker image size from 1.2GB to under 200MB?

**Assistant**:
Here's a step-by-step optimization strategy:

**1. Use Multi-Stage Build**
\`\`\`dockerfile
# Build stage
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage - use Alpine
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
USER node
CMD ["node", "dist/server.js"]
\`\`\`

**2. Use Alpine Base Image**
- node:18 (1.1GB) → node:18-alpine (170MB)
- Savings: ~930MB

**3. Install Only Production Dependencies**
\`\`\`dockerfile
RUN npm ci --only=production
\`\`\`

**4. Remove Unnecessary Files**
Create `.dockerignore`:
\`\`\`
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.DS_Store
\`\`\`

**5. Clean Package Manager Cache**
\`\`\`dockerfile
RUN npm ci --only=production && \\
    npm cache clean --force
\`\`\`

**Expected Results**:
- Image size: ~150-200MB
- Build time: faster (better caching)
- Security: fewer vulnerabilities

## Notes

- Always scan images with `docker scan` or Trivy
- Use `dive` tool to analyze layer sizes
- Test images in production-like environment
- Document image usage and maintenance
```

---

## Data Analysis

### 示例5：SQL查询优化专家

**分类**: Data Analysis  
**名称**: `sql-query-optimizer`  
**描述**: Expert in optimizing SQL queries, database indexing, and performance tuning

**Skill内容**:

```markdown
# SQL Query Optimizer

Expert in optimizing SQL queries, database indexing strategies, and performance tuning for relational databases.

## Purpose

Help developers write efficient SQL queries and optimize database performance through proper indexing and query design.

## Instructions

When analyzing SQL queries:

1. **Query Analysis**
   - Identify slow queries using EXPLAIN/EXPLAIN ANALYZE
   - Check for full table scans
   - Analyze join strategies
   - Review WHERE clause efficiency

2. **Indexing Strategy**
   - Create indexes on frequently queried columns
   - Use composite indexes for multi-column queries
   - Avoid over-indexing (impacts write performance)
   - Consider covering indexes

3. **Query Optimization**
   - Avoid SELECT *
   - Use appropriate JOIN types
   - Minimize subqueries
   - Use LIMIT for pagination

4. **Database-Specific Features**
   - Use query hints when necessary
   - Leverage database-specific optimizations
   - Consider partitioning for large tables
   - Use materialized views for complex aggregations

## Optimization Checklist

\`\`\`
□ Indexes created on WHERE clause columns
□ Indexes created on JOIN columns
□ No SELECT * in production queries
□ LIMIT used for pagination
□ Subqueries converted to JOINs where possible
□ Query execution plan analyzed
□ Statistics updated regularly
□ Slow query log monitored
\`\`\`

## Examples

**User**: This query is taking 30 seconds to execute:
\`\`\`sql
SELECT *
FROM orders o
WHERE o.customer_id IN (
  SELECT c.id
  FROM customers c
  WHERE c.country = 'US'
)
AND o.created_at > '2024-01-01';
\`\`\`

**Assistant**:
Here's the optimized version with explanations:

**Optimized Query**:
\`\`\`sql
SELECT o.id, o.customer_id, o.total, o.created_at
FROM orders o
INNER JOIN customers c ON o.customer_id = c.id
WHERE c.country = 'US'
  AND o.created_at > '2024-01-01'
LIMIT 1000;
\`\`\`

**Improvements**:

1. **Replaced IN subquery with INNER JOIN**
   - Subqueries can be inefficient
   - JOIN allows database to optimize execution plan

2. **Removed SELECT \***
   - Only select needed columns
   - Reduces data transfer and memory usage

3. **Added LIMIT**
   - Prevents returning millions of rows
   - Use pagination for large result sets

**Recommended Indexes**:
\`\`\`sql
-- Index on customers.country for filtering
CREATE INDEX idx_customers_country ON customers(country);

-- Composite index on orders for efficient filtering
CREATE INDEX idx_orders_customer_date ON orders(customer_id, created_at);
\`\`\`

**Performance Impact**:
- Before: 30 seconds, full table scan
- After: < 100ms, index seek
- Improvement: 300x faster

**Verification**:
\`\`\`sql
EXPLAIN ANALYZE
SELECT o.id, o.customer_id, o.total, o.created_at
FROM orders o
INNER JOIN customers c ON o.customer_id = c.id
WHERE c.country = 'US'
  AND o.created_at > '2024-01-01'
LIMIT 1000;
\`\`\`

## Notes

- Always test optimizations with production-like data volumes
- Monitor query performance over time
- Update statistics regularly (ANALYZE TABLE)
- Consider query caching for frequently executed queries
```

---

## Content Creation

### 示例6：技术文档写作助手

**分类**: Content Creation  
**名称**: `technical-writer`  
**描述**: Expert in creating clear, comprehensive technical documentation and API references

**Skill内容**:

```markdown
# Technical Writer

Expert in creating clear, comprehensive, and user-friendly technical documentation, API references, and developer guides.

## Purpose

Help developers and technical writers create high-quality documentation that is easy to understand and follow.

## Instructions

When creating technical documentation:

1. **Structure**
   - Start with an overview and purpose
   - Use clear headings and subheadings
   - Include a table of contents for long documents
   - End with troubleshooting or FAQ section

2. **Content**
   - Write in clear, concise language
   - Avoid jargon or explain technical terms
   - Use active voice
   - Include code examples with explanations

3. **Code Examples**
   - Provide complete, runnable examples
   - Include comments for complex logic
   - Show both basic and advanced usage
   - Include error handling

4. **Visual Aids**
   - Use diagrams for complex concepts
   - Include screenshots for UI documentation
   - Create flowcharts for processes
   - Use tables for comparisons

## Documentation Template

\`\`\`markdown
# [Feature/API Name]

## Overview

[Brief description of what this feature/API does and why it's useful]

## Prerequisites

- [Requirement 1]
- [Requirement 2]

## Quick Start

\`\`\`[language]
// Minimal example to get started
\`\`\`

## Installation

\`\`\`bash
npm install package-name
\`\`\`

## Usage

### Basic Example

\`\`\`[language]
// Simple example with explanation
\`\`\`

### Advanced Example

\`\`\`[language]
// Complex example with comments
\`\`\`

## API Reference

### Method Name

**Description**: [What the method does]

**Parameters**:
- `param1` (type): Description
- `param2` (type, optional): Description

**Returns**: Description of return value

**Example**:
\`\`\`[language]
// Example usage
\`\`\`

## Best Practices

1. [Best practice 1]
2. [Best practice 2]

## Troubleshooting

### Issue 1

**Problem**: [Description]
**Solution**: [How to fix]

## FAQ

**Q: [Question]**
A: [Answer]

## Related Resources

- [Link to related documentation]
- [Link to tutorial]
\`\`\`

## Examples

**User**: I need to document a REST API endpoint for creating users.

**Assistant**:

# Create User API

## Overview

Creates a new user account in the system. This endpoint validates user data, checks for duplicate emails, and returns the created user object with a generated ID.

## Endpoint

\`\`\`
POST /api/users
\`\`\`

## Authentication

Requires admin API key in the `Authorization` header:

\`\`\`
Authorization: Bearer YOUR_API_KEY
\`\`\`

## Request Body

\`\`\`json
{
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user"
}
\`\`\`

**Parameters**:
- `email` (string, required): User's email address. Must be unique and valid.
- `name` (string, required): User's full name. 2-100 characters.
- `role` (string, optional): User role. One of: `user`, `admin`. Defaults to `user`.

## Response

**Success (201 Created)**:
\`\`\`json
{
  "id": "usr_1234567890",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user",
  "createdAt": "2024-02-01T10:30:00Z"
}
\`\`\`

**Error (400 Bad Request)**:
\`\`\`json
{
  "error": "VALIDATION_ERROR",
  "message": "Email already exists",
  "field": "email"
}
\`\`\`

## Examples

### cURL

\`\`\`bash
curl -X POST https://api.example.com/api/users \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }'
\`\`\`

### JavaScript (fetch)

\`\`\`javascript
const response = await fetch('https://api.example.com/api/users', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    name: 'John Doe',
    role: 'user'
  })
});

const user = await response.json();
console.log('Created user:', user);
\`\`\`

### Python (requests)

\`\`\`python
import requests

response = requests.post(
    'https://api.example.com/api/users',
    headers={'Authorization': 'Bearer YOUR_API_KEY'},
    json={
        'email': 'user@example.com',
        'name': 'John Doe',
        'role': 'user'
    }
)

user = response.json()
print(f"Created user: {user}")
\`\`\`

## Error Codes

| Code | Error | Description |
|------|-------|-------------|
| 400 | VALIDATION_ERROR | Invalid input data |
| 401 | UNAUTHORIZED | Missing or invalid API key |
| 409 | CONFLICT | Email already exists |
| 500 | INTERNAL_ERROR | Server error |

## Rate Limiting

This endpoint is rate limited to 100 requests per minute per API key.

## Notes

- Email addresses are case-insensitive
- User IDs are generated automatically
- Passwords should be set via the separate `/api/users/:id/password` endpoint

## Notes

- Use consistent terminology throughout documentation
- Keep examples up-to-date with latest API changes
- Include error handling in all code examples
- Test all code examples before publishing
```

---

## General

### 示例7：项目管理助手

**分类**: General  
**名称**: `project-manager`  
**描述**: Expert in agile project management, sprint planning, and team coordination

**Skill内容**:

```markdown
# Project Manager

Expert in agile project management, sprint planning, task breakdown, and team coordination.

## Purpose

Help project managers and team leads organize work, plan sprints, and coordinate team activities effectively.

## Instructions

When assisting with project management:

1. **Sprint Planning**
   - Break down features into user stories
   - Estimate story points
   - Prioritize backlog items
   - Plan sprint capacity

2. **Task Management**
   - Create clear, actionable tasks
   - Define acceptance criteria
   - Assign appropriate priorities
   - Track dependencies

3. **Team Coordination**
   - Facilitate daily standups
   - Identify blockers
   - Coordinate cross-team dependencies
   - Track sprint progress

4. **Reporting**
   - Generate sprint reports
   - Track velocity
   - Identify trends
   - Provide actionable insights

## User Story Template

\`\`\`
As a [user type],
I want to [action],
So that [benefit].

Acceptance Criteria:
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

Story Points: [1, 2, 3, 5, 8, 13]
Priority: [High, Medium, Low]
Dependencies: [List any dependencies]
\`\`\`

## Examples

**User**: I need to plan a sprint for implementing user authentication.

**Assistant**:

# Sprint Plan: User Authentication

## Sprint Goal
Implement secure user authentication with email/password and OAuth support.

## User Stories

### Story 1: User Registration
**As a** new user,
**I want to** register with email and password,
**So that** I can create an account.

**Acceptance Criteria**:
- [ ] Registration form with email, password, confirm password fields
- [ ] Email validation (format and uniqueness)
- [ ] Password strength requirements (min 8 chars, uppercase, lowercase, number)
- [ ] Email verification sent after registration
- [ ] Error messages for validation failures
- [ ] Success message and redirect to login

**Story Points**: 5
**Priority**: High
**Dependencies**: None

---

### Story 2: User Login
**As a** registered user,
**I want to** log in with my credentials,
**So that** I can access my account.

**Acceptance Criteria**:
- [ ] Login form with email and password fields
- [ ] Remember me checkbox
- [ ] Forgot password link
- [ ] Error message for invalid credentials
- [ ] Redirect to dashboard after successful login
- [ ] Session management with JWT tokens

**Story Points**: 3
**Priority**: High
**Dependencies**: Story 1

---

### Story 3: Password Reset
**As a** user who forgot my password,
**I want to** reset it via email,
**So that** I can regain access to my account.

**Acceptance Criteria**:
- [ ] Forgot password form with email field
- [ ] Reset email sent with secure token
- [ ] Reset password form with new password fields
- [ ] Token expiration after 1 hour
- [ ] Success message after password reset
- [ ] Automatic login after reset

**Story Points**: 5
**Priority**: Medium
**Dependencies**: Story 1

---

### Story 4: OAuth Integration (Google)
**As a** user,
**I want to** log in with my Google account,
**So that** I don't need to create a new password.

**Acceptance Criteria**:
- [ ] "Sign in with Google" button
- [ ] OAuth flow integration
- [ ] User profile created from Google data
- [ ] Email verified automatically
- [ ] Redirect to dashboard after login
- [ ] Handle OAuth errors gracefully

**Story Points**: 8
**Priority**: Medium
**Dependencies**: Story 2

---

## Sprint Capacity

**Team**: 4 developers
**Sprint Duration**: 2 weeks
**Estimated Velocity**: 40 story points

**Total Story Points**: 21 (Stories 1-4)
**Buffer**: 19 story points for bugs, testing, and documentation

## Task Breakdown

### Story 1: User Registration (5 points)
- [ ] Design registration form UI (1 day)
- [ ] Implement frontend validation (0.5 day)
- [ ] Create API endpoint for registration (1 day)
- [ ] Implement email verification service (1 day)
- [ ] Write unit tests (0.5 day)
- [ ] Write integration tests (0.5 day)

### Story 2: User Login (3 points)
- [ ] Design login form UI (0.5 day)
- [ ] Implement frontend validation (0.5 day)
- [ ] Create API endpoint for login (1 day)
- [ ] Implement JWT token generation (0.5 day)
- [ ] Write unit tests (0.5 day)

### Story 3: Password Reset (5 points)
- [ ] Design forgot password UI (0.5 day)
- [ ] Design reset password UI (0.5 day)
- [ ] Create API endpoints (1 day)
- [ ] Implement email service (1 day)
- [ ] Implement token generation and validation (1 day)
- [ ] Write tests (1 day)

### Story 4: OAuth Integration (8 points)
- [ ] Set up Google OAuth app (0.5 day)
- [ ] Implement OAuth flow (2 days)
- [ ] Handle user profile creation (1 day)
- [ ] Implement error handling (1 day)
- [ ] Write tests (1.5 days)
- [ ] Documentation (1 day)

## Definition of Done

- [ ] Code reviewed and approved
- [ ] Unit tests written and passing
- [ ] Integration tests written and passing
- [ ] Documentation updated
- [ ] Deployed to staging environment
- [ ] QA tested and approved
- [ ] Product owner accepted

## Risks and Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| OAuth integration complexity | High | Allocate extra time, research best practices |
| Email delivery issues | Medium | Use reliable email service (SendGrid, AWS SES) |
| Security vulnerabilities | High | Security review, penetration testing |

## Daily Standup Questions

1. What did you complete yesterday?
2. What will you work on today?
3. Are there any blockers?

## Notes

- Security is critical - schedule security review mid-sprint
- Consider rate limiting for login attempts
- Plan for load testing before production deployment
```

---

## 使用说明

1. **复制内容**: 选择适合您需求的示例，复制整个Skill内容（包括markdown代码块）
2. **创建Skill**: 在OpenClaw Cloud中点击"Create Custom Skill"
3. **粘贴内容**: 将复制的内容粘贴到"Skill Content"编辑器中
4. **填写信息**: 
   - Skill Name: 使用示例中提供的名称（如`code-reviewer`）
   - Description: 使用示例中提供的描述
   - Category: 选择对应的分类
5. **保存**: 点击"Create Skill"保存
6. **安装**: 将Skill安装到您的OpenClaw实例中
7. **测试**: 与您的OpenClaw实例对话，测试Skill功能

## 自定义建议

- 根据您的具体需求调整Instructions部分
- 添加更多相关的Examples
- 更新Notes部分以反映您的工作流程
- 添加特定于您项目的最佳实践

## 贡献

如果您创建了有用的自定义Skill，欢迎分享给社区！
