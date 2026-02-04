# Building OpenClaw Docker Image with Aider

This guide explains how to build the OpenClaw Docker image with Aider pre-installed.

## Prerequisites

- Docker installed on your system
- At least 4GB of free disk space
- Internet connection for downloading dependencies

## Build the Image

From the project root directory, run:

```bash
docker build -f Dockerfile.openclaw -t openclaw:local .
```

This will:
1. Clone the OpenClaw repository
2. Install all Node.js dependencies
3. Build OpenClaw from source
4. Install Python 3 and pip
5. Install Aider AI coding assistant
6. Verify the installation

The build process takes approximately 10-15 minutes depending on your internet speed and system performance.

## Verify the Build

Check that the image was created successfully:

```bash
docker images | grep openclaw
```

You should see:
```
openclaw    local    <image-id>    <timestamp>    <size>
```

## Test Aider Installation

Run a container and verify aider is available:

```bash
docker run --rm openclaw:local aider --version
```

You should see the aider version number.

## Using the Image

The OpenClaw Cloud platform automatically uses the `openclaw:local` image when creating instances. No additional configuration is needed.

When you create a new instance:
1. The platform creates a container from `openclaw:local`
2. Git repository is automatically initialized in the workspace
3. LLM API keys are injected as environment variables
4. Aider is ready to use immediately

## Rebuilding the Image

To update to the latest OpenClaw version or rebuild with changes:

```bash
# Remove old image
docker rmi openclaw:local

# Rebuild
docker build -f Dockerfile.openclaw -t openclaw:local .
```

## Troubleshooting

### Build fails with "pip install" error

If the aider installation fails, try:

```bash
# Build without cache
docker build --no-cache -f Dockerfile.openclaw -t openclaw:local .
```

### Image size is too large

The image includes:
- Node.js runtime (~200MB)
- OpenClaw source and dependencies (~500MB)
- Python 3 and Aider (~300MB)

Total size: approximately 1GB

This is normal for a development image with AI tools.

### Aider not found in container

Verify the build completed successfully:

```bash
docker run --rm openclaw:local which aider
```

Should output: `/usr/local/bin/aider`

## Alternative: Pull Pre-built Image

If available, you can pull a pre-built image instead of building:

```bash
docker pull openclaw/openclaw:latest-aider
docker tag openclaw/openclaw:latest-aider openclaw:local
```

## Next Steps

After building the image:
1. Create a new OpenClaw instance in the platform
2. Configure LLM API keys in the instance settings
3. Install the "Aider Coding Assistant" skill
4. Start using AI-powered coding in your OpenClaw agent

## Support

For issues with:
- **OpenClaw build**: See https://docs.openclaw.ai/install/docker
- **Aider installation**: See https://aider.chat/docs/install.html
- **OpenClaw Cloud platform**: Contact platform support
