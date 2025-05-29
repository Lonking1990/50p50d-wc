#!/bin/bash

# Prompt for Component Name
read -p "Enter the name for the new component (e.g., my-new-widget): " component_name

# Validation: Check if component_name is empty
if [ -z "$component_name" ]; then
  echo "Error: Component name cannot be empty."
  exit 1
fi

# Validation: Check if directory already exists
if [ -d "$component_name" ]; then
  echo "Error: Directory '$component_name' already exists."
  exit 1
fi

# Prompt for Component Title
read -p "Enter the title for the new component (e.g., My New Widget): " component_title

# If component_title is empty, set it to component_name
if [ -z "$component_title" ]; then
  component_title="$component_name"
fi

# Generate PascalCase name
component_pascal_case_name=$(echo "$component_name" | sed -e 's/-/ /g' -e 's/\b\(.\)/\u\1/g' -e 's/ //g')

# Create Component Directory
echo "Creating component directory..."
cp -r 0-template "$component_name"
if [ $? -ne 0 ]; then
  echo "Error: Failed to copy template directory."
  exit 1
fi

# Replace Placeholders
echo "Replacing placeholders..."
# Use find to get all files in the new directory
find "$component_name" -type f -print0 | while IFS= read -r -d $'\0' file; do
  # Replace {{COMPONENT_NAME}}
  sed -i "s/{{COMPONENT_NAME}}/$component_name/g" "$file"
  # Replace {{COMPONENT_TITLE}}
  sed -i "s/{{COMPONENT_TITLE}}/$component_title/g" "$file"
  # Replace {{COMPONENT_PASCAL_CASE_NAME}}
  sed -i "s/{{COMPONENT_PASCAL_CASE_NAME}}/$component_pascal_case_name/g" "$file"
done

# Update Main index.html
echo "Updating main index.html..."
new_link="<li><a href=\"./$component_name/\">$component_title</a></li>"

# Safely insert the new link using a temporary file to avoid issues with sed -i and special characters
awk -v new_link="$new_link" '
  /<!--template-->/ {
    print new_link
  }
  {
    print
  }
' index.html > index.html.tmp && mv index.html.tmp index.html

if [ $? -ne 0 ]; then
  echo "Error: Failed to update main index.html."
  # Optional: Clean up created directory if index.html update fails
  # rm -rf "$component_name"
  exit 1
fi

# Make the script executable
chmod +x create.sh

# Success Message
echo "Component '$component_name' created successfully!"
