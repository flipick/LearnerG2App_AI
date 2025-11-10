#!/bin/bash

# Script to automatically replace references to the old Chatbot with the new AiAssistant
echo "Starting to fix references to old Chatbot component..."

# Step 1: Find all TypeScript files referencing the old chatbot and back them up
echo "Finding and backing up files that reference the old chatbot..."
mkdir -p backups
for file in $(grep -l -r "import.*from './chatbot/chatbot'" --include="*.ts" src/)
do
  cp "$file" "backups/$(basename $file).bak"
  echo "Backed up $file"
done

# Step 2: Replace imports in TypeScript files
echo "Replacing import statements..."
find src/ -type f -name "*.ts" -exec sed -i "s/import { Chatbot } from '.\/chatbot\/chatbot';/import { AiAssistant } from '.\/ai-assistant\/ai-assistant';/g" {} \;

# Step 3: Replace component references in routes
echo "Updating route configurations..."
find src/ -type f -name "*.ts" -exec sed -i "s/component: Chatbot/component: AiAssistant/g" {} \;

# Step 4: Replace module imports if needed
echo "Updating module imports..."
find src/ -type f -name "*.ts" -exec sed -i "s/import { ChatbotModule } from '.\/chatbot\/chatbot.module';/import { AiAssistantModule } from '.\/ai-assistant\/ai-assistant.module';/g" {} \;

# Step 5: Replace component tags in HTML files
echo "Updating HTML component tags..."
find src/ -type f -name "*.html" -exec sed -i "s/<app-chatbot>/<app-ai-assistant>/g" {} \;
find src/ -type f -name "*.html" -exec sed -i "s/<app-chatbot /<app-ai-assistant /g" {} \;
find src/ -type f -name "*.html" -exec sed -i "s/<\/app-chatbot>/<\/app-ai-assistant>/g" {} \;

echo "Fix completed! Please check the files to make sure the replacements were done correctly."
echo "Backups of modified files can be found in the 'backups' directory."