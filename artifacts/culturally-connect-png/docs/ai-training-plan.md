# AI Training Plan

For this application, start with retrieval-augmented generation (RAG) before fine-tuning.

## Current Setup

- The AI guide is Tumbuna Man.
- It answers from the app database: provinces, stories, herbs, and villages.
- Public users only expose approved records to the AI.
- Reviewer and admin sessions may expose pending records for moderation context.

## Data To Collect

Use verified records only:

- Province facts: name, region, capital, languages, description.
- Stories: title, elder/source name, language, tags, full content.
- Herbs: local name, description, recorded uses, warnings, preparation notes.
- Villages: name, origin clan, founding story, languages, traditions.
- Review notes: why content was approved or rejected.

## Recommended Stages

1. RAG from the database.
   Keep adding approved cultural records. The AI improves as the database grows.

2. Evaluation questions.
   Create 30-50 test questions with expected answers. Include questions the AI should refuse or answer with uncertainty.

3. Fine-tuning later.
   Fine-tune only after you have many high-quality question/answer examples and clear reviewer rules. Fine-tuning should teach behavior and style, not replace the cultural database.

## Safety Rules

- Do not invent sacred, clan, medicinal, or origin information.
- If a fact is not in the records, the AI should say it does not know.
- Herbs must not be presented as medical advice.
- Pending or rejected records must not be shown to visitors.
