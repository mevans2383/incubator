exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const profile = JSON.parse(event.body);

  const prompt = `You are an expert college football recruiting analyst with 20 years of experience evaluating prospects at every level.

Analyze this athlete's profile and return school recommendations as JSON:

ATHLETE PROFILE:
- Name: ${profile.firstName} ${profile.lastName}
- Position: ${profile.position}
- Graduation Year: ${profile.gradYear}
- Height: ${profile.height}
- Weight: ${profile.weight} lbs
- 40-Yard Dash: ${profile.forty || 'Not provided'} seconds
- Bench Press: ${profile.bench || 'Not provided'} lbs
- GPA (unweighted): ${profile.gpa}
- SAT: ${profile.sat || 'Not provided'}
- ACT: ${profile.act || 'Not provided'}
- Home State: ${profile.state}
- High School: ${profile.highSchool || 'Not provided'}
- Intended Major: ${profile.major || 'Undecided'}
- Highlight Film: ${profile.film ? 'Provided' : 'Not provided'}

FOOTBALL CAREER SUMMARY:
${profile.career || 'Not provided'}

PREFERENCES:
- Geographic Preference: ${profile.region || 'No preference'}
- Distance Preference: ${profile.distance || 'Anywhere'}
- School Size Preference: ${profile.schoolSize || 'No preference'}
- What Matters Most (ranked #1 = most important): ${profile.priorities || 'Not specified'}

INSTRUCTIONS:
Evaluate this athlete honestly and realistically. A 6'4" WR with a 4.4 40 should be D1. A 5'8" LB with a 5.1 40 should be D3. Be accurate — parents are counting on this to make real decisions.

Consider ALL of the following factors:
- Size and speed relative to position norms at each level
- GPA for academic eligibility (NCAA D1/D2 requires 2.3+ core GPA, D3/NAIA more flexible)
- Position-specific measurables
- HIGH SCHOOL PRESTIGE: A player from a nationally recognized powerhouse (Mater Dei, St. Thomas Aquinas, IMG Academy, etc.) gets a significant boost in division fit vs. a player from a small rural program, even with identical measurables. Use your knowledge of high school football programs.
- CAREER PRODUCTION: Heavily weight the career summary. All-state honors, high stat production, and playing against D1-caliber competition are strong signals. A backup with minimal stats at any level should be matched lower than a decorated starter.
- GRADUATION YEAR / RECRUITING STAGE: This is critical. The current year is 2026. Evaluate career stats relative to class year: a Class of 2026 senior with only 1 year starting and modest stats has a fully known ceiling — evaluate them as-is. A Class of 2027 junior with 1 year starting still has a full senior season ahead — give appropriate credit for development potential and upside. A Class of 2028 sophomore with limited stats should be evaluated heavily on athleticism, measurables, and trajectory — their ceiling is unknown. A Class of 2029 freshman's stats mean almost nothing yet — focus purely on physical projection and position fit. Do not punish younger athletes for having less production when they've simply had fewer opportunities.
- PRIORITIES WEIGHTING: The athlete ranked what matters most to them. When selecting and ordering the 8 schools, meaningfully factor in their priority list. If Academics ranks #1, favor schools with strong academic reputations at the appropriate division. If Social Life ranks high, favor larger schools with vibrant campus cultures. If Athletics ranks #1, prioritize programs with winning records and strong coaching at the right level.
- GEOGRAPHY: If the athlete specified geographic preferences, weight schools in those regions more heavily. Use the high school location (or home state if not provided) as the origin point for distance calculations.

Return ONLY a valid JSON object in exactly this format, no other text:
{
  "divisions": {
    "FBS (D1)": <0-100>,
    "FCS (D1-AA)": <0-100>,
    "Division II": <0-100>,
    "Division III": <0-100>,
    "NAIA": <0-100>,
    "JUCO": <0-100>
  },
  "topDivision": "<the single best fit division label>",
  "insight": "<2-3 sentence honest personal scouting report written directly to the athlete using 'you/your' — e.g. 'Your size and speed put you squarely in the D2 range...' Be honest and specific about their realistic level and what they should focus on.>",
  "schools": [
    {
      "name": "<real college name>",
      "abbr": "<2-4 letter abbreviation>",
      "division": "<D1/FCS/D2/D3/NAIA/JUCO>",
      "conference": "<conference name>",
      "location": "<City, ST>",
      "state": "<2-letter state code>",
      "distance": "<estimated drive time from ${profile.state || 'home state'}>",
      "fitScore": <60-99>,
      "enrollment": "<number>",
      "avgGpa": "<number>",
      "coachName": "<realistic coach name for this program>",
      "coachEmail": "<realistic recruiting email like recruiting@school.edu>",
      "emailDate": "<a specific date in 2026, 2-4 weeks from now>",
      "campName": "<realistic camp name for this school>",
      "campDate": "<a specific date in summer 2026>",
      "followDate": "<a specific date in 2026, 1-2 weeks after emailDate>",
      "primaryColor": "<EXACT official primary hex color for this school — must be accurate. Examples: Alabama #9E1B32, Michigan #00274C, Ohio State #BB0000, Penn State #001E44, Notre Dame #0C2340, Amherst College #3F1F69, Williams College #512888, Ferris State #8B0000, Grand Valley State #0065A4, Slippery Rock #006837. Look up the real colors — do not guess.>",
      "secondaryColor": "<EXACT official secondary hex color — Examples: Alabama #FFFFFF, Michigan #FFCB05, Ohio State #FFFFFF, Penn State #FFFFFF, Notre Dame #C99700, Amherst College #FFFFFF, Ferris State #C8A951, Grand Valley State #000000, Slippery Rock #C8B400.>",
      "fitReason": "<1 sentence on why this school is a good fit for this specific athlete — reference their measurables, academic profile, or preferences>",
      "concern": "<1 sentence on one honest potential challenge or thing to be aware of — competition for roster spots, distance, academic requirements, etc.>"
    }
  ]
}

Return exactly 8 schools that are realistic matches given the athlete's profile, state, and preferences. Prioritize schools in or near their preferred region. Use real school names, real conferences, and realistic coach emails. Order them by fitScore descending.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();

    // Log full response for debugging
    console.log('API response:', JSON.stringify(data));

    if (!data.content || !data.content[0]) {
      throw new Error('No content in API response: ' + JSON.stringify(data));
    }

    const text = data.content[0].text;
    console.log('Raw text:', text);

    // Strip markdown code blocks if present (e.g. ```json ... ```)
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();

    const result = JSON.parse(cleaned);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    };
  } catch (err) {
    console.log('Error:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
