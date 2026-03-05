# Product Overview

## What We're Building

A shared TypeScript library for ClickUp API integration, distributed as a git submodule. Provides types, OAuth, API functions, and transformers used across 6+ projects in the workspace.

## Target Users

Internal projects that integrate with ClickUp — SvelteKit apps (save-to-clickup, clickup-to-blog, client-glance), Next.js apps (upsys-app), and Google Apps Script projects (clickup-to-sheets, upsys-consulting).

## Key Features

- Pure TypeScript types covering ClickUp API v2 & v3 (tasks, hierarchy, custom fields, docs, chat, time tracking, views)
- Framework-agnostic OAuth 2.0 protocol (token exchange, auth URL building)
- Hierarchy API (workspaces, spaces, folders, lists with full traversal)
- Transformers converting API responses to simplified storage format (`Stored*` types)
- Auto-generated SDK from OpenAPI specs for full endpoint coverage
- SvelteKit integration (OAuth callback handler, Supabase token storage)
- Next.js integration (OAuth callback handler, token storage TBD)
