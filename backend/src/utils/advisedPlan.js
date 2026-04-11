/**
 * Parse optional multi-term plan suffix from Class Advisor replies.
 * Model adds: PLANNED_TERMS_JSON:{...} at end (see prompts).
 */

function normalizeAdvisedTerms(obj) {
  if (!obj || !Array.isArray(obj.terms)) return null;
  const terms = obj.terms
    .map((t) => {
      const label = String(t.label || '').trim();
      const ids = Array.isArray(t.course_ids)
        ? t.course_ids.map(String)
        : Array.isArray(t.courses)
          ? t.courses.map(String)
          : [];
      return { label: label || 'Term', course_ids: ids };
    })
    .filter((t) => t.label && t.course_ids.length > 0);
  return terms.length > 0 ? { terms } : null;
}

/**
 * @param {string} text
 * @returns {{ reply: string, advised_plan: { terms: { label: string, course_ids: string[] }[] } | null }}
 */
function extractPlannedTermsFromCoachReply(text) {
  if (!text || typeof text !== 'string') {
    return { reply: typeof text === 'string' ? text.trimEnd() : text, advised_plan: null };
  }
  const re = /\n?PLANNED_TERMS_JSON:\s*(\{[\s\S]*\})\s*$/;
  const m = text.match(re);
  if (!m) {
    return { reply: text.trimEnd(), advised_plan: null };
  }
  try {
    const obj = JSON.parse(m[1]);
    const advised_plan = normalizeAdvisedTerms(obj);
    if (!advised_plan) {
      return { reply: text.trimEnd(), advised_plan: null };
    }
    const reply = text.replace(re, '').trimEnd();
    return { reply, advised_plan };
  } catch (err) {
    console.warn('[advisedPlan] Failed to parse PLANNED_TERMS_JSON', err.message);
    return { reply: text.trimEnd(), advised_plan: null };
  }
}

function extractKnownCatalogIds(text, catalogIdSet) {
  const re = /\b([A-Z]{2,4})\s*[-]?\s*(\d{3})\b/gi;
  const out = [];
  const seen = new Set();
  let m;
  while ((m = re.exec(text)) !== null) {
    const id = `${m[1].toUpperCase()}-${m[2]}`;
    if (catalogIdSet.has(id) && !seen.has(id)) {
      seen.add(id);
      out.push(id);
    }
  }
  return out;
}

function shouldSkipSentenceForPlan(s) {
  const lower = s.toLowerCase();
  const hasCatalogCodes = /\b[A-Z]{2,4}\s*[-]?\s*\d{3}\b/.test(s);
  if (
    /\b(verify|degree audit|official (?:iit )?catalog|registrar)\b/i.test(s) &&
    !hasCatalogCodes
  ) {
    return true;
  }
  if (/\bkeep an eye on\b/i.test(lower) && !hasCatalogCodes) return true;
  if (/\bprerequisites for advanced\b/i.test(lower) && !hasCatalogCodes) return true;
  if (/\bensure you\b/.test(lower) && /\btrack\b/.test(lower) && !hasCatalogCodes) return true;
  return false;
}

function splitIntoPlanningSegments(text) {
  const normalized = text.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];

  const breakAlternation = [
    '(?:^|\\n)\\s*[-*•]\\s*',
    '\\n{2,}',
    '(?<=[.!?])\\s+',
    '\\s+(?=(?:In|For|During)\\s+your\\s+(?:first|second)\\s+year\\b)',
    '\\s+(?=In\\s+the\\s+(?:first|second)\\s+semester\\b)',
    '\\s+(?=(?:In|During)\\s+(?:the\\s+)?spring\\b)',
    '\\s+(?=(?:In|During)\\s+(?:the\\s+)?fall\\b)',
    '\\s+(?=Follow\\s+these(?:\\s+with)?\\b)',
    '\\s+(?=(?:Next|Then),?\\s+)',
    '\\s+(?=Sophomore\\s+year\\b)',
    '\\s+(?=Junior\\s+year\\b)'
  ].join('|');

  const re = new RegExp(breakAlternation, 'gi');
  const rough = normalized
    .split(re)
    .map((s) => s.trim())
    .filter((s) => s.length > 4);

  const out = [];
  for (const chunk of rough.length ? rough : [normalized]) {
    const subs = chunk
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 4);
    out.push(...(subs.length ? subs : [chunk]));
  }
  return out.length ? out : [normalized];
}

/**
 * @param {string} text
 * @param {Array<{ id: string }>} courses
 * @returns {{ terms: { label: string, course_ids: string[] }[] } | null}
 */
function inferAdvisedPlanFromProse(text, courses, userHint = '') {
  if (!text || typeof text !== 'string' || !Array.isArray(courses) || courses.length === 0) {
    return null;
  }
  const catalogIdSet = new Set(courses.map((c) => c.id).filter(Boolean));
  const hintBlob = `${text}\n${userHint || ''}`;

  const sentences = splitIntoPlanningSegments(text).filter((s) => s.length > 4);

  const terms = [];
  let rollingLabel = null;
  let lastYearMention = 1;

  const labelFromSentence = (s, yearCtx) => {
    const lower = s.toLowerCase();
    const cal = s.match(/\b(fall|spring|summer)\s+(20\d{2})\b/i);
    if (cal) {
      const season = cal[1].charAt(0).toUpperCase() + cal[1].slice(1).toLowerCase();
      return `${season} ${cal[2]}`;
    }
    if (/\bfollow these (?:with|up)\b/i.test(lower)) return 'Year 2 — Spring';

    const y1 = /\bfirst year\b|\bfreshman year\b|\bfreshman\b/i.test(lower);
    const y2 = /\bsecond year\b|\bsophomore year\b|\bsophomore\b/i.test(lower);

    if (y1 && /\bspring\b/i.test(lower) && !/\bfall\s+and\s+spring\b/i.test(lower)) return 'Year 1 — Spring';
    if (y2 && /\bspring\b/i.test(lower)) return 'Year 2 — Spring';
    if (y1 && /\bfall\b/i.test(lower)) return 'Year 1 — Fall';
    if (y2 && /\bfall\b/i.test(lower)) return 'Year 2 — Fall';

    if (/\bsecond semester\b/i.test(lower) || /\bin the second semester\b/i.test(lower)) {
      if (y2) return 'Year 2 — Spring';
      if (y1) return 'Year 1 — Spring';
      return `Year ${yearCtx} — Spring`;
    }
    if (/\bfirst semester\b/i.test(lower) || /\bin the first semester\b/i.test(lower)) {
      if (y2) return 'Year 2 — Fall';
      if (y1) return 'Year 1 — Fall';
      return `Year ${yearCtx} — Fall`;
    }

    if (/\bspring semester\b/i.test(lower) || /\bin (?:the )?spring\b/i.test(lower) || /\bfor (?:the )?spring\b/i.test(lower)) {
      if (y2) return 'Year 2 — Spring';
      if (y1) return 'Year 1 — Spring';
      return `Year ${yearCtx} — Spring`;
    }
    if (/\bfall semester\b/i.test(lower) || /\bin (?:the )?fall\b/i.test(lower) || /\bfor (?:the )?fall\b/i.test(lower)) {
      if (y2) return 'Year 2 — Fall';
      if (y1) return 'Year 1 — Fall';
      return `Year ${yearCtx} — Fall`;
    }

    if (/\bin your second year\b/i.test(lower) || /\bsecond year,?\s+(take|focus|consider|complete)\b/i.test(lower)) {
      return 'Year 2 — Fall';
    }
    if (/\bthird year\b/i.test(lower)) return 'Year 3 — Fall';
    if (/\bfourth year\b/i.test(lower) || /\bsenior year\b/i.test(lower)) return 'Year 4 — Fall';
    if (/\bfirst year\b/i.test(lower) || /\bfreshman year\b/i.test(lower)) return 'Year 1 — Fall';

    if (/\bspring\b/i.test(lower) && !/\bspringboard\b/i.test(lower)) {
      return `Year ${yearCtx} — Spring`;
    }
    if (/\bfall\b/i.test(lower) && !/\bfallback\b/i.test(lower)) {
      return `Year ${yearCtx} — Fall`;
    }

    return null;
  };

  for (const s of sentences) {
    if (shouldSkipSentenceForPlan(s)) continue;

    const lower = s.toLowerCase();
    if (/\bfirst year\b|\bfreshman year\b|\bfreshman\b/i.test(lower)) lastYearMention = 1;
    if (/\bsecond year\b|\bsophomore year\b|\bsophomore\b/i.test(lower)) lastYearMention = 2;

    const nextLabel = labelFromSentence(s, lastYearMention);
    if (nextLabel) rollingLabel = nextLabel;

    const ids = extractKnownCatalogIds(s, catalogIdSet);
    if (ids.length === 0) continue;
    if (!rollingLabel) {
      rollingLabel = 'Planned courses';
    }

    const last = terms[terms.length - 1];
    if (last && last.label === rollingLabel) {
      const seen = new Set(last.course_ids);
      ids.forEach((id) => {
        if (!seen.has(id)) {
          seen.add(id);
          last.course_ids.push(id);
        }
      });
    } else {
      terms.push({ label: rollingLabel, course_ids: [...ids] });
    }
  }

  const nonEmpty = terms.filter((t) => t.course_ids.length > 0);
  if (nonEmpty.length >= 2) return { terms: nonEmpty };

  const twoYearHint =
    /\b(?:two|2)\s*-?\s*years?\b|\bover\s+(?:two|2)\s+years?\b|\bnext\s+(?:two|2)\s+years?\b|\bfour\s+semesters?\b/i.test(
      hintBlob
    );
  if (nonEmpty.length === 1 && nonEmpty[0].course_ids.length >= 5 && twoYearHint) {
    const ids = [...nonEmpty[0].course_ids];
    const labels = ['Year 1 — Fall', 'Year 1 — Spring', 'Year 2 — Fall', 'Year 2 — Spring'];
    const n = ids.length;
    const base = Math.floor(n / 4);
    let rem = n % 4;
    const sizes = [0, 1, 2, 3].map(() => {
      const s = base + (rem > 0 ? 1 : 0);
      rem -= 1;
      return s;
    });
    let offset = 0;
    const split = labels
      .map((label, i) => {
        const sz = sizes[i];
        const slice = ids.slice(offset, offset + sz);
        offset += sz;
        return { label, course_ids: slice };
      })
      .filter((t) => t.course_ids.length > 0);
    if (split.length >= 2) return { terms: split };
  }

  return null;
}

function courseIdSetFromPlan(plan) {
  if (!plan?.terms?.length) return null;
  const s = new Set();
  for (const t of plan.terms) {
    for (const id of t.course_ids || []) s.add(String(id));
  }
  return s;
}

function sameCourseIdSet(a, b) {
  if (!a || !b || a.size !== b.size) return false;
  for (const id of a) if (!b.has(id)) return false;
  return true;
}

function apiIdsSubsetOfProse(apiIds, proseIds) {
  if (!apiIds?.size || !proseIds?.size) return false;
  for (const id of apiIds) if (!proseIds.has(id)) return false;
  return true;
}

function preferProsePartitionIfSameCourses(apiPlan, prosePlan) {
  if (!prosePlan?.terms || prosePlan.terms.length < 2) return apiPlan || null;
  if (!apiPlan?.terms?.length) return prosePlan;
  const apiIds = courseIdSetFromPlan(apiPlan);
  const proseIds = courseIdSetFromPlan(prosePlan);
  if (prosePlan.terms.length <= apiPlan.terms.length) return apiPlan;

  const sameSet = sameCourseIdSet(apiIds, proseIds);
  const apiInsideProse = apiIdsSubsetOfProse(apiIds, proseIds);
  if (sameSet || apiInsideProse) {
    return prosePlan;
  }
  return apiPlan;
}

module.exports = {
  extractPlannedTermsFromCoachReply,
  normalizeAdvisedTerms,
  inferAdvisedPlanFromProse,
  preferProsePartitionIfSameCourses
};
