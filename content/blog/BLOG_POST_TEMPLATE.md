# Blog Post Creation Prompt Template

Use this prompt to generate new SEO-optimized blog posts for AI Tales.

---

## PROMPT TO USE:

```
Create an SEO-optimized blog post for AI Tales (ai-tales.com), a personalized AI bedtime story app for children ages 2-12.

**Topic:** [INSERT TOPIC HERE]

**Target Keywords:** [INSERT 3-5 KEYWORDS]

**Requirements:**

1. **Format:** MDX file with YAML frontmatter
2. **Length:** 1200-2000 words
3. **Tone:** Friendly, helpful, expert but accessible to parents
4. **Structure:**
   - Hook/intro paragraph
   - 4-6 main sections with H2 headings
   - Subsections with H3 headings where appropriate
   - Bullet points and lists for scannability
   - Tables where data comparison is useful
   - Practical tips and actionable advice
   - Conclusion with subtle CTA to AI Tales

**Frontmatter Template:**
```yaml
---
title: "[SEO-optimized title with primary keyword - 50-60 chars]"
description: "[Compelling meta description - 150-160 chars]"
date: "[YYYY-MM-DD]"
author: "AI Tales Team"
category: "[One of: Parenting, Education Science, Sleep Tips, Child Development, Reading Skills, Technology]"
keywords:
  - "keyword 1"
  - "keyword 2"
  - "keyword 3"
  - "keyword 4"
  - "keyword 5"
image: "/blog/[slug].jpg"
---
```

**Content Guidelines:**
- Start with a relatable question or scenario parents face
- Include research citations where appropriate (year, author)
- Use "you/your" to address parents directly
- Include practical examples parents can use immediately
- Add FAQ section at the end if natural for the topic
- End with a soft CTA mentioning AI Tales (not pushy)
- Avoid jargon; explain technical terms simply
- Include internal links to other blog posts where relevant

**SEO Guidelines:**
- Primary keyword in title, first paragraph, one H2, and conclusion
- Secondary keywords naturally throughout
- Use synonyms and related terms
- Keep paragraphs short (3-4 sentences max)
- Use transition words between sections

**Do NOT:**
- Sound like an advertisement
- Make claims without backing them up
- Be preachy or judgmental about parenting choices
- Use excessive emojis (0-2 max in entire post)
- Include placeholder text or [brackets]
```

---

## EXAMPLE TOPICS FOR FUTURE POSTS:

### High-Priority (Search Volume + Relevance):
1. "Best Bedtime Stories for 5 Year Olds" - bedtime stories, 5 year old stories
2. "How to Get Kids to Sleep Without a Fight" - bedtime struggles, sleep resistance
3. "Benefits of Reading to Your Child Every Night" - reading benefits, nightly reading
4. "Creative Story Ideas for Kids Who Love Dinosaurs" - dinosaur stories, themed stories
5. "How AI is Changing Children's Education" - AI education, technology in learning
6. "Building Emotional Intelligence Through Stories" - emotional intelligence, SEL stories
7. "Why Kids Ask for the Same Story Every Night" - repetitive stories, child development
8. "Bilingual Bedtime Stories: Benefits and Tips" - bilingual stories, language learning
9. "Reducing Bedtime Anxiety in Children" - bedtime anxiety, sleep fears
10. "STEM Stories: Making Science Fun for Kids" - STEM stories, science for kids

### Comparison/Alternative Posts:
11. "Personalized vs Generic Children's Books: Which is Better?" - personalized books
12. "Audiobooks vs Reading Aloud: What's Best for Kids?" - audiobooks, read aloud
13. "Screen Time Alternatives for Bedtime" - screen-free bedtime, alternatives

### Seasonal/Timely:
14. "Summer Reading Ideas to Prevent Learning Loss" - summer reading, learning loss
15. "Holiday Bedtime Stories and Traditions" - holiday stories, family traditions
16. "Back to School: Establishing a New Bedtime Routine" - back to school, routine

---

## FILE NAMING CONVENTION:

`[slug].mdx`

Example: `best-bedtime-stories-for-5-year-olds.mdx`

- Use lowercase
- Separate words with hyphens
- Keep under 50 characters if possible
- Include primary keyword

---

## CATEGORY OPTIONS:

| Category | Use For |
|----------|---------|
| Parenting | General parenting advice, routines, tips |
| Education Science | Research-backed learning strategies |
| Sleep Tips | Bedtime routines, sleep problems |
| Child Development | Developmental stages, milestones |
| Reading Skills | Literacy, vocabulary, comprehension |
| Technology | AI, apps, digital tools for learning |

---

## INTERNAL LINKING:

When relevant, link to these existing posts:
- `/blog/bedtime-routine-guide-for-kids` - Bedtime routines
- `/blog/helping-reluctant-readers` - Reading motivation
- `/blog/educational-screen-time-for-kids` - Screen time balance
- `/blog/age-appropriate-stories-guide` - Age-specific content
- `/blog/personalized-learning-science` - Personalization benefits

**Link format in MDX:**
```markdown
Learn more about [establishing a bedtime routine](/blog/bedtime-routine-guide-for-kids) for your child.
```

---

## QUALITY CHECKLIST:

Before publishing, verify:

- [ ] Title is 50-60 characters with primary keyword
- [ ] Meta description is 150-160 characters
- [ ] Date is in YYYY-MM-DD format
- [ ] Category is from approved list
- [ ] 5 keywords included in frontmatter
- [ ] Word count is 1200-2000
- [ ] H1 (title) appears only once
- [ ] H2s break content into logical sections
- [ ] Lists and formatting improve readability
- [ ] No broken links
- [ ] No placeholder text
- [ ] CTA is subtle and natural
- [ ] Spell check passed
- [ ] Reads well on mobile (short paragraphs)

---

## AFTER CREATING POST:

1. Save file to `content/blog/[slug].mdx`
2. Verify it appears on `/blog` page
3. Check individual post page renders correctly
4. Test on mobile
5. Submit to Google Search Console for indexing
