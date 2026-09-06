export interface QuestionType {
  name: string;
  /** How the task is typically worded in the paper. */
  prompt: string;
  /** What the examiner is actually looking for. */
  focus: string;
  /** A model sentence or opening for that type. */
  example: string;
}

export interface WritingSection {
  id: string;
  title: string;
  meta: string;
  blurb: string;
  types: QuestionType[];
}

export interface StructureFormat {
  id: string;
  title: string;
  note: string;
  steps: { label: string; detail: string }[];
}

export const WRITING_SECTIONS: WritingSection[] = [
  {
    id: 'task1',
    title: 'Task 1 — Academic',
    meta: '20 minutes · at least 150 words · one third of the Writing mark',
    blurb:
      'You describe visual information in your own words. No opinions, no reasons, no invented causes — only what the data shows.',
    types: [
      {
        name: 'Bar chart',
        prompt:
          'The chart below shows [data] in [place/period]. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
        focus:
          'Group the bars rather than listing every one. Lead with the tallest and shortest, then the notable gaps.',
        example:
          'The chart compares the proportion of graduates entering five destinations, with full-time employment accounting for 52% — more than triple any other outcome.',
      },
      {
        name: 'Line graph',
        prompt:
          'The graph below shows [data] between [year] and [year]. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
        focus:
          'Trends over time: rises, falls, peaks, troughs and crossover points. Use past tense for finished periods, future forms for projections.',
        example:
          'Car ownership rose steadily from 12 million in 1990 to a peak of 28 million in 2015, before levelling off at around 27 million.',
      },
      {
        name: 'Pie chart',
        prompt:
          'The pie charts below show [proportions]. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
        focus:
          'Proportions of a whole. With two or more pies, compare the same slice across charts rather than describing each pie separately.',
        example:
          'Housing made up the largest share of spending in both years, though it fell from 38% to 29% over the period.',
      },
      {
        name: 'Table',
        prompt:
          'The table below gives information about [data]. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
        focus:
          'Tables hide the story in rows of numbers. Find the highest, the lowest and the biggest change, and ignore the rest.',
        example:
          'Japan recorded the highest figure in every category, while Brazil showed the sharpest increase, more than doubling from 4% to 9%.',
      },
      {
        name: 'Process diagram',
        prompt:
          'The diagram below shows the process of [process]. Summarise the information by selecting and reporting the main features.',
        focus:
          'Stages in order, not numbers. Note whether the process is linear or cyclical, and how many stages there are. Passive voice and sequencers do the work.',
        example:
          'The process comprises seven stages, beginning with the collection of raw clay and ending once the finished bricks have been packaged for delivery.',
      },
      {
        name: 'Map',
        prompt:
          'The maps below show [place] in [year] and [year]. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
        focus:
          'Changes to a place over time, or two proposed sites. Use compass directions and the language of construction, demolition, expansion and conversion.',
        example:
          'The most striking change is that the woodland in the north-east was cleared to make way for a residential estate.',
      },
      {
        name: 'Mixed charts',
        prompt:
          'The charts below show [data A] and [data B]. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
        focus:
          'Two visuals, one answer. Give each its own body paragraph and only link them if the data genuinely connects.',
        example:
          'While the bar chart breaks spending down by category, the line graph tracks how total expenditure changed across the same period.',
      },
    ],
  },
  {
    id: 'task2',
    title: 'Task 2 — Essay',
    meta: '40 minutes · at least 250 words · two thirds of the Writing mark',
    blurb:
      'A formal essay responding to a statement or question. Answering every part of the question is what separates a band 7 from a band 6.',
    types: [
      {
        name: 'Opinion (agree or disagree)',
        prompt: '[Statement]. To what extent do you agree or disagree?',
        focus:
          'Pick a clear position in the introduction and hold it throughout. A partial position is fine, but it must be stated, not implied.',
        example:
          'While there are clear arguments on both sides, I would strongly agree that governments should fund public transport ahead of new roads.',
      },
      {
        name: 'Discussion (both views)',
        prompt:
          'Some people think [view A], while others believe [view B]. Discuss both these views and give your own opinion.',
        focus:
          'Three jobs, not two: explain view A, explain view B, and state your own. Missing the third is the most common way this task is under-answered.',
        example:
          'This essay will consider the case for both approaches before arguing that a combination of the two is most likely to succeed.',
      },
      {
        name: 'Advantages and disadvantages',
        prompt: '[Situation]. Do the advantages of this outweigh the disadvantages?',
        focus:
          'The question asks you to weigh, not to list. Say which side is heavier in the introduction and justify the verdict in the conclusion.',
        example:
          'Although studying abroad carries a significant financial cost, the career benefits it brings clearly outweigh this drawback.',
      },
      {
        name: 'Problem and solution',
        prompt:
          '[Situation]. What problems does this cause, and what measures could be taken to solve them?',
        focus:
          'Two questions, so two body paragraphs. Each solution should answer a problem you actually raised.',
        example:
          'The most pressing consequence is overcrowding in city centres, which could be eased by relocating government offices to smaller towns.',
      },
      {
        name: 'Two-part question',
        prompt: '[Statement]. Why is this the case? What can be done about it?',
        focus:
          'Answer both parts explicitly and give them roughly equal space. Neither half can be left as a passing mention.',
        example:
          'The main reason for this shift is the rising cost of housing; addressing it will require sustained investment in affordable homes.',
      },
    ],
  },
  {
    id: 'task1-gt',
    title: 'Task 1 — General Training',
    meta: '20 minutes · at least 150 words · letter writing',
    blurb:
      'The General Training paper replaces the data task with a letter. The three bullet points in the prompt are effectively the marking scheme.',
    types: [
      {
        name: 'Formal letter',
        prompt:
          'Write a letter to [an official / a company]. In your letter: [bullet 1], [bullet 2], [bullet 3].',
        focus:
          'To a stranger or an institution. No contractions, no first names. Open with Dear Sir or Madam and close with Yours faithfully.',
        example:
          'I am writing to express my dissatisfaction with the service I received at your branch on 14 March.',
      },
      {
        name: 'Semi-formal letter',
        prompt: 'Write a letter to your [landlord / manager / neighbour]. In your letter: ...',
        focus:
          'To someone you know in a professional capacity. Use their surname, keep the register polite, and close with Yours sincerely.',
        example:
          'I am writing to ask whether it would be possible to bring forward the date of the inspection.',
      },
      {
        name: 'Informal letter',
        prompt: 'Write a letter to a friend. In your letter: ...',
        focus:
          'To a friend or family member. Contractions, questions and warmth are all expected here — a stiff register costs marks.',
        example:
          'It has been far too long since we caught up, and I have some news I have been waiting to share.',
      },
    ],
  },
];

export const STRUCTURES: StructureFormat[] = [
  {
    id: 'task1-structure',
    title: 'Task 1 — four paragraphs',
    note: 'The overview is the single highest-value paragraph. Never leave it out.',
    steps: [
      {
        label: 'Introduction',
        detail:
          'One sentence paraphrasing the question — what is shown, where, and over what period. Change the wording, not the meaning.',
      },
      {
        label: 'Overview',
        detail:
          'Two or three sentences on the biggest features: the largest and smallest, the overall direction of travel. No specific figures here.',
      },
      {
        label: 'Body 1',
        detail:
          'The dominant category, or the first half of the period, supported with exact figures.',
      },
      {
        label: 'Body 2',
        detail: 'The remaining data, with comparisons back to what you covered in body 1.',
      },
    ],
  },
  {
    id: 'task2-opinion',
    title: 'Task 2 — opinion essay',
    note: 'Position stated in the introduction, defended in the body, restated in the conclusion.',
    steps: [
      {
        label: 'Introduction',
        detail: 'Paraphrase the statement, then give your position in a clear thesis sentence.',
      },
      {
        label: 'Body 1',
        detail: 'Your strongest reason, explained and then illustrated with a specific example.',
      },
      {
        label: 'Body 2',
        detail: 'A second reason, or the opposing view followed by your rebuttal of it.',
      },
      {
        label: 'Conclusion',
        detail: 'Restate the position in different words. Introduce nothing new.',
      },
    ],
  },
  {
    id: 'task2-discussion',
    title: 'Task 2 — discussion essay',
    note: 'The one type where forgetting your own opinion caps the whole answer.',
    steps: [
      { label: 'Introduction', detail: 'Paraphrase both views, then signal which one you favour.' },
      { label: 'Body 1', detail: 'Explain why some people hold view A, with an example.' },
      {
        label: 'Body 2',
        detail: 'Explain view B, then say which you find more convincing and why.',
      },
      {
        label: 'Conclusion',
        detail: 'Summarise both sides in one clause and confirm your position.',
      },
    ],
  },
];
