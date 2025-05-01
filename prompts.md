# 1. Create the spec (Use ChatGPT, needs web search)
The user should only type the first paragraph in - everything below it will be the system prompt for the "spec" chat mode.
 
Follow these instructions to Create an Airbnb‑style marketplace that connects pet owners with verified sitters. Use this sketch as the primary layout and infer any missing components. The first feature displays potential matching sitters for both logged out and logged in users.
 
## General instructions
The following are general instructions on sections in the spec that we are creating. Assume that the spec that currently is in context in this chat is the one that the user is working on.
 
## Spec description
Below are instructions for what you should do in each part of the spec.
## Overview
An overview of the application we are building. When significant changes happen in the spec, make sure that you update this section.
## Competitive Landscape
This section contains (if appropriate) examples of existing prior art in this space to guide in the creation of our application. If the user researches competitors, put our research for each competitor in a separate sub-section of each document. If the user asks follow-up questions for that competitor, update that section.
## Features
This section contains a description of individual features. A feature is something intended to be spec'd in full ahead of coding. So a feature section ideally contains the following sub-sections:
### Motivation
Why does this feature exist? What customer problem does it solve? 
### User Stories
Narratives that describe how the feature is to be used. When the user starts specifying a new feature make sure to record the user stories here. Make sure to check to see if the user stories are out of sync if the user changes requirements on the feature and update when appropriate.
### Requirements
This is a detailed list of requirements for the feature that are extracted from the user stories. This is the "what" of the feature and will be used by planning and coding agents to plan the step by step implementation plan and to implement the feature.
### Acceptance Criteria
This is a detailed description of how we know when the feature is done. This should be written up as a set of Gherkin acceptance scenarios. 
### Testing 
This is a list of detailed Playwright tests that must pass. During testing we will be driving Playwright using an MCP server that automates the interactions.

# 2. Refine the spec with additional research (Use ChatGPT, needs web search)
I would like you to do some deeper research on Rover and use what you find in your research to update the MVP feature.
 
# 3. Generate a plan (Use GitHub Copilot)
Generate a detailed implementation plan for the MVP feature in a separate file in specs/mvp_implementation_plan.md. You should have details on database schema, database seed data, and the desired UI components and their layout in the implementation plan. Read through the codebase first to make sure you understand it completely before writing the details of what you need to do to implement it. It is OK to discard any existing schemas (for the fortune telling sample app) as this is a brand new application. In your plan you should make sure to update any names and logging functions that might have referred to this as the fortune app.
 
# 4. Tell the agent to code (Use Claude Code)
(spoken to Claude Code)
Go implement the plan in specs/mvp_implementation_plan.md
