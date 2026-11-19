#!/usr/bin/env python3
import json
import os
import re

def slugify(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

print("Generating comprehensive interview preparation datasets...")
