# Plugin Development Guide

This guide explains how to create plugins for OpenClaw Cloud.

## Overview

OpenClaw Cloud features a universal plugin system that allows you to extend its functionality. Plugins are defined by a `plugin.json` manifest file that describes the plugin's metadata, configuration schema, and capabilities.

## Plugin Types

OpenClaw Cloud supports four types of plugins:

1. **Channel Plugins** - Add support for messaging platforms (Matrix, XMPP, ActivityPub, etc.)
2. **Deployment Plugins** - Integrate with deployment platforms (Docker, Kubernetes, cloud providers)
3. **Monitoring Plugins** - Add monitoring and analytics capabilities
4. **Skill Provider Plugins** - Integrate additional skill sources

## Plugin Structure

A plugin consists of:

- `plugin.json` - Plugin manifest file (required)
- Implementation code (optional, can be external)
- Assets and resources (optional)

### plugin.json Schema

```json
{
  "name": "plugin-name",
  "displayName": "Plugin Display Name",
  "type": "channel|deployment|monitoring|skill-provider",
  "version": "1.0.0",
  "description": "Plugin description",
  "author": "Author Name",
  "configSchema": {
    "type": "object",
    "properties": {
      "property1": {
        "type": "string",
        "title": "Property Title",
        "description": "Property description"
      }
    },
    "required": ["property1"]
  }
}
```

### Configuration Schema

The `configSchema` field defines the configuration options for your plugin. It uses JSON Schema format and supports the following features:

- **Dynamic Form Generation** - The UI automatically generates a configuration form based on the schema
- **Validation** - Input validation based on schema rules
- **Type Safety** - Strong typing for configuration values

Supported field types:

- `string` - Text input
- `number` - Numeric input
- `boolean` - Checkbox
- `array` - List of values
- `object` - Nested configuration

Special formats:

- `password` - Password input (hidden)
- `url` - URL input with validation
- `email` - Email input with validation

Example:

```json
{
  "configSchema": {
    "type": "object",
    "properties": {
      "apiKey": {
        "type": "string",
        "title": "API Key",
        "description": "Your API key",
        "format": "password"
      },
      "endpoint": {
        "type": "string",
        "title": "API Endpoint",
        "description": "API endpoint URL",
        "format": "url",
        "default": "https://api.example.com"
      },
      "enabled": {
        "type": "boolean",
        "title": "Enable Feature",
        "default": true
      },
      "maxRetries": {
        "type": "number",
        "title": "Max Retries",
        "minimum": 0,
        "maximum": 10,
        "default": 3
      }
    },
    "required": ["apiKey", "endpoint"]
  }
}
```

## Creating a Channel Plugin

Channel plugins add support for messaging platforms. Here's an example Matrix channel plugin:

### 1. Create plugin.json

```json
{
  "name": "matrix-channel",
  "displayName": "Matrix Channel",
  "type": "channel",
  "version": "1.0.0",
  "description": "Matrix protocol support for OpenClaw",
  "author": "Your Name",
  "configSchema": {
    "type": "object",
    "properties": {
      "homeserverUrl": {
        "type": "string",
        "title": "Homeserver URL",
        "description": "Matrix homeserver URL (e.g., https://matrix.org)",
        "format": "url"
      },
      "accessToken": {
        "type": "string",
        "title": "Access Token",
        "description": "Matrix access token for authentication",
        "format": "password"
      },
      "userId": {
        "type": "string",
        "title": "User ID",
        "description": "Matrix user ID (e.g., @user:matrix.org)"
      },
      "autoJoinRooms": {
        "type": "boolean",
        "title": "Auto Join Rooms",
        "description": "Automatically join rooms when invited",
        "default": true
      }
    },
    "required": ["homeserverUrl", "accessToken", "userId"]
  }
}
```

### 2. Register the Plugin

Use the OpenClaw Cloud API to register your plugin:

```typescript
import { trpc } from "@/lib/trpc";

const createPlugin = trpc.plugins.create.useMutation();

createPlugin.mutate({
  name: "matrix-channel",
  displayName: "Matrix Channel",
  type: "channel",
  version: "1.0.0",
  description: "Matrix protocol support for OpenClaw",
  author: "Your Name",
  configSchema: {
    // ... schema from plugin.json
  },
});
```

## Creating a Deployment Plugin

Deployment plugins integrate with deployment platforms. Example Docker deployment plugin:

```json
{
  "name": "docker-deployment",
  "displayName": "Docker Deployment",
  "type": "deployment",
  "version": "1.0.0",
  "description": "Deploy OpenClaw instances using Docker",
  "author": "Your Name",
  "configSchema": {
    "type": "object",
    "properties": {
      "dockerHost": {
        "type": "string",
        "title": "Docker Host",
        "description": "Docker daemon socket (e.g., unix:///var/run/docker.sock)",
        "default": "unix:///var/run/docker.sock"
      },
      "image": {
        "type": "string",
        "title": "Docker Image",
        "description": "OpenClaw Docker image",
        "default": "openclaw/openclaw:latest"
      },
      "network": {
        "type": "string",
        "title": "Docker Network",
        "description": "Docker network to use",
        "default": "bridge"
      },
      "volumes": {
        "type": "array",
        "title": "Volumes",
        "description": "Volume mounts",
        "items": {
          "type": "string"
        }
      }
    },
    "required": ["dockerHost", "image"]
  }
}
```

## Creating a Monitoring Plugin

Monitoring plugins add monitoring and analytics capabilities. Example Prometheus monitoring plugin:

```json
{
  "name": "prometheus-monitoring",
  "displayName": "Prometheus Monitoring",
  "type": "monitoring",
  "version": "1.0.0",
  "description": "Monitor OpenClaw instances with Prometheus",
  "author": "Your Name",
  "configSchema": {
    "type": "object",
    "properties": {
      "prometheusUrl": {
        "type": "string",
        "title": "Prometheus URL",
        "description": "Prometheus server URL",
        "format": "url"
      },
      "scrapeInterval": {
        "type": "number",
        "title": "Scrape Interval",
        "description": "Metrics scrape interval in seconds",
        "minimum": 5,
        "maximum": 300,
        "default": 15
      },
      "enableAlerts": {
        "type": "boolean",
        "title": "Enable Alerts",
        "description": "Enable alerting",
        "default": true
      }
    },
    "required": ["prometheusUrl"]
  }
}
```

## Creating a Skill Provider Plugin

Skill provider plugins integrate additional skill sources. Example custom skill provider:

```json
{
  "name": "custom-skill-provider",
  "displayName": "Custom Skill Provider",
  "type": "skill-provider",
  "version": "1.0.0",
  "description": "Provide skills from a custom source",
  "author": "Your Name",
  "configSchema": {
    "type": "object",
    "properties": {
      "apiUrl": {
        "type": "string",
        "title": "API URL",
        "description": "Skill provider API URL",
        "format": "url"
      },
      "apiKey": {
        "type": "string",
        "title": "API Key",
        "description": "API authentication key",
        "format": "password"
      },
      "syncInterval": {
        "type": "number",
        "title": "Sync Interval",
        "description": "Skill sync interval in hours",
        "minimum": 1,
        "maximum": 168,
        "default": 24
      }
    },
    "required": ["apiUrl"]
  }
}
```

## Best Practices

1. **Clear Naming** - Use descriptive names for your plugin and configuration properties
2. **Comprehensive Descriptions** - Provide clear descriptions for all configuration options
3. **Sensible Defaults** - Set reasonable default values where possible
4. **Validation** - Use JSON Schema validation to ensure correct configuration
5. **Error Handling** - Handle errors gracefully and provide meaningful error messages
6. **Documentation** - Document your plugin's features and configuration options
7. **Testing** - Test your plugin thoroughly before publishing

## Publishing Your Plugin

To share your plugin with the community:

1. Create a GitHub repository for your plugin
2. Include the `plugin.json` file in the repository
3. Add a README with installation and usage instructions
4. Submit a pull request to the OpenClaw Cloud plugins registry

## Example Plugins

Check out these example plugins for reference:

- [Matrix Channel Plugin](https://github.com/openclaw-cloud/plugin-matrix-channel)
- [Docker Deployment Plugin](https://github.com/openclaw-cloud/plugin-docker-deployment)
- [Prometheus Monitoring Plugin](https://github.com/openclaw-cloud/plugin-prometheus-monitoring)

## Support

If you need help developing plugins:

- Read the [API Documentation](./api.md)
- Join our [Discord community](https://discord.gg/openclaw)
- Open an issue on [GitHub](https://github.com/yourusername/openclaw-cloud/issues)
