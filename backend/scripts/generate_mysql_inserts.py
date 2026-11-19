#!/usr/bin/env python3
import json
import os

json_path = os.path.join(os.path.dirname(__file__), "../src/database/seeds/data/coding-comprehensive.json")
with open(json_path, "r", encoding="utf-8") as f:
    problems = json.load(f)

def escape_sql(val):
    if val is None:
        return "NULL"
    if isinstance(val, (dict, list)):
        val = json.dumps(val)
    elif isinstance(val, bool):
        return "1" if val else "0"
    elif isinstance(val, (int, float)):
        return str(val)
    val = str(val).replace("\\", "\\\\").replace("'", "''")
    return f"'{val}'"

sql_lines = []
sql_lines.append("SET NAMES utf8mb4;")
sql_lines.append("SET FOREIGN_KEY_CHECKS = 0;")

for p in problems:
    title = escape_sql(p["title"])
    slug = escape_sql(p["slug"])
    category = escape_sql(p["category"])
    difficulty = escape_sql(p["difficulty"])
    problemStatement = escape_sql(p["problemStatement"])
    inputDescription = escape_sql(p["inputDescription"])
    outputDescription = escape_sql(p["outputDescription"])
    constraints = escape_sql(p["constraints"])
    sampleTestCases = escape_sql(p["sampleTestCases"])
    hiddenTestCases = escape_sql(p["hiddenTestCases"])
    starterCode = escape_sql(p["starterCode"])
    expectedTimeComplexity = escape_sql(p["expectedTimeComplexity"])
    expectedSpaceComplexity = escape_sql(p["expectedSpaceComplexity"])
    hints = escape_sql(p["hints"])
    solutionExplanation = escape_sql(p["solutionExplanation"])
    optimizedSolutions = escape_sql(p["optimizedSolutions"])
    relatedQuestions = escape_sql(p["relatedQuestions"])
    acceptanceRate = escape_sql(p["acceptanceRate"])
    totalSubmissions = escape_sql(p["totalSubmissions"])
    totalAccepted = escape_sql(p["totalAccepted"])
    isPublished = escape_sql(p["isPublished"])

    sql = f"""INSERT INTO coding_problems (
        title, slug, category, difficulty, problemStatement,
        inputDescription, outputDescription, constraints,
        sampleTestCases, hiddenTestCases, starterCode,
        expectedTimeComplexity, expectedSpaceComplexity,
        hints, solutionExplanation, optimizedSolutions,
        relatedQuestions, acceptanceRate, totalSubmissions,
        totalAccepted, isPublished, createdAt, updatedAt
    ) VALUES (
        {title}, {slug}, {category}, {difficulty}, {problemStatement},
        {inputDescription}, {outputDescription}, {constraints},
        {sampleTestCases}, {hiddenTestCases}, {starterCode},
        {expectedTimeComplexity}, {expectedSpaceComplexity},
        {hints}, {solutionExplanation}, {optimizedSolutions},
        {relatedQuestions}, {acceptanceRate}, {totalSubmissions},
        {totalAccepted}, {isPublished}, NOW(), NOW()
    ) ON DUPLICATE KEY UPDATE
        category = VALUES(category),
        difficulty = VALUES(difficulty),
        problemStatement = VALUES(problemStatement),
        updatedAt = NOW();"""
    sql_lines.append(sql)

sql_lines.append("SET FOREIGN_KEY_CHECKS = 1;")

out_path = os.path.join(os.path.dirname(__file__), "data/mysql_coding_sync.sql")
os.makedirs(os.path.dirname(out_path), exist_ok=True)
with open(out_path, "w", encoding="utf-8") as f:
    f.write("\n".join(sql_lines))

print(f"✅ Generated MySQL sync SQL with {len(problems)} problem statements: {out_path}")
