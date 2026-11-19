#!/usr/bin/env python3
import json
import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), "../data/devinterview.sqlite")
json_path = os.path.join(os.path.dirname(__file__), "../src/database/seeds/data/coding-comprehensive.json")

with open(json_path, "r", encoding="utf-8") as f:
    problems = json.load(f)

conn = sqlite3.connect(db_path)
cur = conn.cursor()

# Get existing slugs
cur.execute("SELECT slug FROM coding_problems")
existing_slugs = {row[0] for row in cur.fetchall()}

inserted = 0
for p in problems:
    if p["slug"] in existing_slugs:
        continue
    
    cur.execute("""
        INSERT INTO coding_problems (
            title, slug, category, difficulty, problemStatement,
            inputDescription, outputDescription, constraints,
            sampleTestCases, hiddenTestCases, starterCode,
            expectedTimeComplexity, expectedSpaceComplexity,
            hints, solutionExplanation, optimizedSolutions,
            relatedQuestions, acceptanceRate, totalSubmissions,
            totalAccepted, isPublished, createdAt, updatedAt
        ) VALUES (
            ?, ?, ?, ?, ?,
            ?, ?, ?,
            ?, ?, ?,
            ?, ?,
            ?, ?, ?,
            ?, ?, ?,
            ?, ?, datetime('now'), datetime('now')
        )
    """, (
        p["title"],
        p["slug"],
        p["category"],
        p["difficulty"],
        p["problemStatement"],
        p["inputDescription"],
        p["outputDescription"],
        json.dumps(p["constraints"]),
        json.dumps(p["sampleTestCases"]),
        json.dumps(p["hiddenTestCases"]),
        json.dumps(p["starterCode"]),
        p["expectedTimeComplexity"],
        p["expectedSpaceComplexity"],
        json.dumps(p["hints"]),
        p["solutionExplanation"],
        json.dumps(p["optimizedSolutions"]),
        json.dumps(p["relatedQuestions"]),
        p["acceptanceRate"],
        p["totalSubmissions"],
        p["totalAccepted"],
        1 if p["isPublished"] else 0
    ))
    inserted += 1

conn.commit()
cur.execute("SELECT COUNT(*) FROM coding_problems")
total_count = cur.fetchone()[0]
conn.close()

print(f"✅ Inserted {inserted} new coding problems into SQLite.")
print(f"📊 Total coding problems in SQLite: {total_count}")
