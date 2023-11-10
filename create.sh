#!/bin/bash

read -p "Enter the name of the new directory: " new_directory_name
cp -r "0-template" "$new_directory_name"
sed -i s/\<\!--template--\>/\<li\>\<a\ href\=\"\.\\/$new_directory_name\"\>$new_directory_name\<\\/a\>\<\\/li\>\\n\\t\\t\<\!--template--\>/ index.html
echo "Directory created and index.html updated successfully."