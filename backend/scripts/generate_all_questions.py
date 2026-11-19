#!/usr/bin/env python3
import json
import os
import re

def slugify(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

DIFFS = ['Beginner', 'Intermediate', 'Advanced', 'Senior / Architect']
EXPS = ['3–5 Years', '5–8 Years', '8–12 Years', '12+ Years']
COMPS = ['₹15–20 LPA', '₹20–25 LPA', '₹25–30 LPA', '₹30–35 LPA', '₹35–40 LPA']

# Category specifications: category, subcategory, codeLanguage, and list of 15-16 questions
from categories_data import CATEGORIES_DATA

questions = []
used_slugs = set()

for cat_info in CATEGORIES_DATA:
    cat = cat_info["category"]
    sub = cat_info["subcategory"]
    lang = cat_info.get("lang", "javascript")
    
    for i, q in enumerate(cat_info["questions"]):
        diff = DIFFS[i % len(DIFFS)]
        exp = EXPS[i % len(EXPS)]
        comp = COMPS[i % len(COMPS)]
        
        title = q["title"]
        slug = slugify(f"{cat}-{title}")
        orig_slug = slug
        c = 1
        while slug in used_slugs:
            slug = f"{orig_slug}-{c}"
            c += 1
        used_slugs.add(slug)
        
        questions.append({
            "title": title,
            "slug": slug,
            "category": cat,
            "subcategory": sub,
            "difficulty": diff,
            "experienceLevel": exp,
            "targetCompensation": comp,
            "shortAnswer": q["shortAnswer"],
            "detailedExplanation": q["detailedExplanation"],
            "realWorldExample": q["realWorldExample"],
            "implementationExample": q["implementationExample"],
            "codeSnippet": q.get("codeSnippet", ""),
            "codeLanguage": lang,
            "commonMistakes": q.get("commonMistakes", [
                "Not considering edge cases and failure modes under high load.",
                "Assuming default configurations are production-ready without tuning.",
                "Neglecting memory overhead and latency trade-offs."
            ]),
            "followUpQuestions": q.get("followUpQuestions", [
                f"How would you monitor and debug {title} in a production Kubernetes environment?",
                f"What are the scaling limitations of this approach at 10x traffic?",
                f"How does this compare with alternative solutions in modern distributed systems?"
            ]),
            "interviewTips": q.get("interviewTips", [
                "Clearly explain both the high-level trade-offs and low-level internal mechanics.",
                "Cite concrete metrics, memory flags, and production best practices."
            ]),
            "tags": [cat, sub, diff, "Interview Ready"]
        })

output_dir = os.path.join(os.path.dirname(__file__), "../src/database/seeds/data")
os.makedirs(output_dir, exist_ok=True)
output_path = os.path.join(output_dir, "questions-comprehensive.json")

with open(output_path, "w", encoding="utf-8") as f:
    json.dump(questions, f, indent=2, ensure_ascii=False)

print(f"✅ Generated {len(questions)} comprehensive subjective interview questions across {len(CATEGORIES_DATA)} categories!")
print(f"📁 Saved to: {output_path}")
