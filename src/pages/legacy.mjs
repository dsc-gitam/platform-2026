import { pageHero, ctaBand } from '../lib.mjs';
import { legacyStory, legacyMilestones, legacyGallery, legacyAchievements, legacyStories, lightbox } from '../sections/legacy.mjs';

const body = `
${pageHero({ eyebrow: 'Legacy', title: 'A club worth <span class="hl">bringing back</span>.', lead: 'Before the quiet years, this community filled rooms, won challenges and changed careers. This page is the proof, and the reason we are rebuilding.', color: 'red' })}

${legacyStory(false)}
${legacyMilestones(true)}
${legacyAchievements(false)}
${legacyGallery(true)}
${legacyStories(false)}

${ctaBand({ title: 'Help write the next chapter.', text: 'The legacy is not a museum. It is what the next batch builds on.', primary: ['index.html#find-your-place', 'Find your place'], secondary: ['events.html', 'Upcoming events'] })}

${lightbox}
`;

export default {
  path: 'legacy.html', nav: 'legacy', title: 'Legacy, Gallery & Stories',
  description: 'Relive the legacy of GDG on Campus GITAM: our history, event photos, member achievements and stories of students who grew through the club.',
  body
};
