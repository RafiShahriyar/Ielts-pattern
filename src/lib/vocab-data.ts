export interface VocabItem {
  word: string;
  /** Grammar and positioning — the part that actually costs marks. */
  use: string;
  example: string;
}

export interface VocabGroup {
  id: string;
  title: string;
  kind: 'linking' | 'task1';
  blurb: string;
  items: VocabItem[];
}

export const VOCAB_SECTIONS: { kind: VocabGroup['kind']; label: string }[] = [
  { kind: 'linking', label: 'Linking words' },
  { kind: 'task1', label: 'Task 1 vocabulary' },
];

export const VOCAB_GROUPS: VocabGroup[] = [
  {
    id: 'contrast',
    title: 'Contrast',
    kind: 'linking',
    blurb: 'Two facts that pull against each other. Most marks are lost here on punctuation.',
    items: [
      {
        word: 'however',
        use: 'An adverb, not a conjunction. Start a new sentence with it, or follow a semicolon. Joining two clauses with a comma before it is a comma splice.',
        example:
          'Car ownership rose steadily. However, bus use fell across the same period.',
      },
      {
        word: 'whereas',
        use: 'A conjunction, so it joins two contrasting clauses inside one sentence. Nothing else needed.',
        example: 'Exports rose by 12%, whereas imports fell by 4%.',
      },
      {
        word: 'while',
        use: 'Does the same job as whereas, but also means "during". Put the contrast clause first so the meaning is unambiguous.',
        example: 'While men favoured cycling, women preferred swimming.',
      },
      {
        word: 'in contrast / by contrast',
        use: 'Opens a sentence that opposes the previous one. Use "in contrast to + noun" if you want it mid-sentence.',
        example: 'In contrast, spending on housing declined over the same decade.',
      },
      {
        word: 'on the other hand',
        use: 'Properly pairs with "on the one hand". Worth using once in an essay, not three times.',
        example: 'On the other hand, rail travel became markedly cheaper.',
      },
      {
        word: 'conversely',
        use: 'Formal. Only correct when the second fact is genuinely the reverse of the first.',
        example: 'Urban populations grew; conversely, rural numbers shrank.',
      },
    ],
  },
  {
    id: 'concession',
    title: 'Concession',
    kind: 'linking',
    blurb: 'Admitting a point before pushing past it. The trap is what follows the word.',
    items: [
      {
        word: 'although / though / even though',
        use: 'Followed by a full clause with its own subject and verb.',
        example: 'Although the total fell, the share held by cycling grew.',
      },
      {
        word: 'despite / in spite of',
        use: 'Followed by a noun phrase or an -ing form, never a clause. "Despite the fall", not "despite it fell". Add "the fact that" if you need a clause.',
        example: 'Despite the overall decline, table tennis gained participants.',
      },
      {
        word: 'nevertheless / nonetheless',
        use: 'An adverb. Concedes the previous sentence, then reverses it. Own sentence.',
        example: 'The figures are modest. Nevertheless, the trend is consistent.',
      },
    ],
  },
  {
    id: 'cause',
    title: 'Cause',
    kind: 'linking',
    blurb: 'Why something happened. Task 2 only — Task 1 never speculates about causes.',
    items: [
      {
        word: 'because / since / as',
        use: 'Followed by a clause. "Since" and "as" are more formal and slightly weaker.',
        example: 'Numbers grew because tuition was made free.',
      },
      {
        word: 'due to / owing to',
        use: 'Followed by a noun phrase, not a clause. "Due to the closure", not "due to it closed".',
        example: 'The drop was largely due to the closure of two factories.',
      },
      {
        word: 'on account of',
        use: 'Formal, and takes a noun phrase. Interchangeable with "because of".',
        example: 'Attendance fell on account of the rise in ticket prices.',
      },
    ],
  },
  {
    id: 'result',
    title: 'Result',
    kind: 'linking',
    blurb: 'What followed from it.',
    items: [
      {
        word: 'therefore / thus / hence',
        use: 'Adverbs. New sentence, or after a semicolon. "Hence" can take a noun phrase directly: "hence the increase".',
        example: 'Fees were abolished; therefore, enrolment climbed sharply.',
      },
      {
        word: 'consequently / as a result',
        use: 'Opens a sentence. Use "as a result of + noun" for the mid-sentence version.',
        example: 'As a result, the gap between the two groups narrowed.',
      },
      {
        word: 'lead to / result in / bring about',
        use: 'Verbs, so they take an object — handy for varying sentence shape instead of another adverb.',
        example: 'The subsidy led to a marked rise in cycling.',
      },
    ],
  },
  {
    id: 'addition',
    title: 'Addition',
    kind: 'linking',
    blurb: 'Another point in the same direction.',
    items: [
      {
        word: 'furthermore / moreover',
        use: 'Formal adverbs that open a sentence. Adds weight, so use for a genuinely further point rather than a restatement.',
        example: 'Furthermore, the proportion studying abroad more than doubled.',
      },
      {
        word: 'in addition / additionally',
        use: 'Opens a sentence. For mid-sentence use it is "in addition to + noun".',
        example: 'In addition to full-time work, 15% took part-time roles.',
      },
      {
        word: 'also',
        use: 'Sits before the main verb, or after "be". Starting a sentence with "Also" reads informally.',
        example: 'The figure also rose among older participants.',
      },
    ],
  },
  {
    id: 'sequence',
    title: 'Sequence',
    kind: 'linking',
    blurb: 'Ordering stages. The backbone of a Task 1 process description.',
    items: [
      {
        word: 'firstly / to begin with',
        use: 'The first stage. "Firstly" needs a "then/next/finally" later to justify it.',
        example: 'To begin with, the raw clay is dug from the ground.',
      },
      {
        word: 'subsequently / thereafter',
        use: 'Formal alternatives to "then", and useful for avoiding a fourth "then".',
        example: 'The mixture is subsequently poured into moulds.',
      },
      {
        word: 'once / after',
        use: 'Followed by a clause. Pairs naturally with the passive voice a process needs.',
        example: 'Once the bricks have dried, they are moved to the kiln.',
      },
      {
        word: 'prior to',
        use: 'Formal "before", and takes a noun phrase or -ing.',
        example: 'Prior to packaging, each batch is inspected.',
      },
      {
        word: 'meanwhile / at the same time',
        use: 'Two things happening together — not a sequence marker.',
        example: 'Meanwhile, the offcuts are returned to the mixer.',
      },
      {
        word: 'finally',
        use: 'The last stage. Do not use it to mean "in conclusion".',
        example: 'Finally, the finished bricks are loaded for delivery.',
      },
    ],
  },
  {
    id: 'example',
    title: 'Examples',
    kind: 'linking',
    blurb: 'Illustrating a claim. Task 2 body paragraphs live on these.',
    items: [
      {
        word: 'for instance / for example',
        use: 'Opens a sentence, or sits mid-sentence between commas.',
        example: 'Some countries invest heavily in rail; Japan, for instance, spends…',
      },
      {
        word: 'such as',
        use: 'Followed by a noun phrase, with no comma after it. Not "such as that…".',
        example: 'Renewable sources such as wind and solar grew fastest.',
      },
      {
        word: 'namely',
        use: 'Introduces the exact items you just referred to, rather than a sample of them.',
        example: 'Two categories dominated, namely housing and transport.',
      },
    ],
  },
  {
    id: 'similarity',
    title: 'Similarity',
    kind: 'linking',
    blurb: 'Two figures behaving the same way — common in Task 1 comparisons.',
    items: [
      {
        word: 'similarly / likewise',
        use: 'Adverbs opening a sentence. The two things really must behave alike.',
        example: 'Similarly, participation among women rose by nine points.',
      },
      {
        word: 'in the same way',
        use: 'Slightly less formal, and reads well mid-paragraph.',
        example: 'In the same way, spending on leisure held steady.',
      },
      {
        word: 'equally / both … and',
        use: '"Equal proportions of X% each" is the neat Task 1 phrasing for a tie.',
        example: 'Equal proportions of 8% each studied further or travelled.',
      },
    ],
  },
  {
    id: 'emphasis',
    title: 'Emphasis',
    kind: 'linking',
    blurb: 'Marking the point that matters most.',
    items: [
      {
        word: 'notably / particularly / especially',
        use: 'Points at the standout case. Sits next to the thing it emphasises.',
        example: 'Growth was strongest in Asia, particularly in Vietnam.',
      },
      {
        word: 'indeed',
        use: 'Reinforces what you just said, usually with a stronger fact.',
        example: 'The rise was steep; indeed, the figure trebled in five years.',
      },
      {
        word: 'by far',
        use: 'Only when the gap to second place is genuinely wide.',
        example: 'Full-time employment was by far the largest category.',
      },
    ],
  },
  {
    id: 'summary',
    title: 'Summary',
    kind: 'linking',
    blurb: 'Closing language. Task 1 takes an overview, not a conclusion.',
    items: [
      {
        word: 'overall',
        use: 'The Task 1 overview word. Opens the paragraph that gives the big picture with no figures.',
        example: 'Overall, full-time employment dominated every other outcome.',
      },
      {
        word: 'in conclusion / to conclude',
        use: 'Task 2 only. A Task 1 answer has no conclusion to draw.',
        example: 'In conclusion, investment in public transport is the better option.',
      },
      {
        word: 'on balance',
        use: 'Signals a weighed verdict, so it suits advantages/disadvantages essays.',
        example: 'On balance, the benefits outweigh the costs.',
      },
    ],
  },
  {
    id: 'trend-up',
    title: 'Upward movement',
    kind: 'task1',
    blurb: 'These verbs are intransitive: the figure rises, it is not "risen".',
    items: [
      {
        word: 'rise / increase / grow / climb',
        use: 'Neutral. "Rose from X to Y", "rose by Z", "rose to Y" — the preposition carries the meaning.',
        example: 'Ownership rose from 12 million to 28 million.',
      },
      {
        word: 'surge / soar / rocket',
        use: 'Strong. Only for a steep jump, or it overstates the data.',
        example: 'Enrolment surged in the two years after fees were dropped.',
      },
      {
        word: 'peak (at)',
        use: 'The highest point before a fall. Takes "at" plus the figure.',
        example: 'The figure peaked at 28 million in 2015.',
      },
    ],
  },
  {
    id: 'trend-down',
    title: 'Downward movement',
    kind: 'task1',
    blurb: 'Same grammar as the upward verbs.',
    items: [
      {
        word: 'fall / decline / decrease / drop',
        use: 'Neutral. "Decline" also works as a noun: "a decline of 4%".',
        example: 'Imports fell by four percentage points over the decade.',
      },
      {
        word: 'plummet / plunge',
        use: 'Reserve for a very steep collapse.',
        example: 'Coal use plummeted after the plants were closed.',
      },
      {
        word: 'bottom out / hit a low of',
        use: 'The lowest point before a recovery.',
        example: 'Numbers hit a low of 4% in 2009 before recovering.',
      },
    ],
  },
  {
    id: 'stability',
    title: 'Stability and fluctuation',
    kind: 'task1',
    blurb: 'Flat lines and jagged ones both need naming, not skipping.',
    items: [
      {
        word: 'level off / plateau / stabilise',
        use: 'A rise or fall that flattens out. "Levelled off at around 27 million."',
        example: 'The trend levelled off at roughly 27 million after 2015.',
      },
      {
        word: 'remain steady / hold constant',
        use: 'Flat throughout, with no earlier movement to flatten.',
        example: 'Spending on food remained steady at about 12%.',
      },
      {
        word: 'fluctuate',
        use: 'Repeated up-and-down movement. Not a single rise then fall.',
        example: 'Martial arts participation fluctuated between 8% and 14%.',
      },
    ],
  },
  {
    id: 'degree',
    title: 'Degree and speed',
    kind: 'task1',
    blurb: 'Adverbs after the verb, adjectives before the noun: "rose sharply" / "a sharp rise".',
    items: [
      {
        word: 'sharply / steeply / dramatically',
        use: 'Large, fast change. Match the word to the gradient on the graph.',
        example: 'The figure rose sharply between 2010 and 2012.',
      },
      {
        word: 'steadily / gradually',
        use: 'Consistent change with no sudden jumps.',
        example: 'Numbers grew steadily across the whole period.',
      },
      {
        word: 'slightly / marginally',
        use: 'Small change. Stops a one-point shift being described as a surge.',
        example: 'The share dipped slightly, by under one percentage point.',
      },
      {
        word: 'considerably / significantly',
        use: 'Substantial but not necessarily fast.',
        example: 'Rural numbers fell considerably over the two decades.',
      },
    ],
  },
  {
    id: 'proportion',
    title: 'Proportions and figures',
    kind: 'task1',
    blurb: 'Paraphrasing percentages is where Task 1 vocabulary marks are won.',
    items: [
      {
        word: 'a quarter / a third / half / two thirds',
        use: 'Rounds a percentage into words: 52% is "just over half", 24% "roughly a quarter".',
        example: 'Just over half (52%) secured full-time employment.',
      },
      {
        word: 'the majority / a minority',
        use: '"The vast majority" for a large share, "a small minority" for a thin one.',
        example: 'The vast majority of graduates entered paid work.',
      },
      {
        word: 'just over / just under / roughly / approximately',
        use: 'Softens an exact figure so you are not repeating numbers verbatim.',
        example: 'Approximately one in five went on to further study.',
      },
      {
        word: 'account for / make up / represent',
        use: 'Takes a percentage or a share, never a bare verb phrase.',
        example: 'Part-time work accounted for 15% of the total.',
      },
    ],
  },
];
