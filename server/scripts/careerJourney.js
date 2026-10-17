// Career Journey rules (Alumni only):
// University -> Internship -> Job -> Current Role

const STAGES = ["University", "Internship", "Job", "Current Role"];
const MAX_ENTRIES = 10;
const MIN_YEAR = 1950;

const toYear = (value, label, index) => {
  if (value === undefined || value === null || value === "") {
    return { year: null };
  }

  const year = Number(value);
  const maxYear = new Date().getFullYear() + 6;

  if (!Number.isInteger(year) || year < MIN_YEAR || year > maxYear) {
    return {
      error: `Entry ${index + 1}: ${label} must be a year between ${MIN_YEAR} and ${maxYear}`
    };
  }

  return { year };
};

const cleanText = (value, label, index, { required, max }) => {
  if (value === undefined || value === null) value = "";

  if (typeof value !== "string") {
    return { error: `Entry ${index + 1}: ${label} must be text` };
  }

  const text = value.trim();

  if (required && !text) {
    return { error: `Entry ${index + 1}: ${label} is required` };
  }

  if (text.length > max) {
    return {
      error: `Entry ${index + 1}: ${label} must be ${max} characters or fewer`
    };
  }

  return { text };
};

// Returns { entries } with clean, ordered data or { error } with a message
const validateCareerJourney = (input) => {
  if (!Array.isArray(input)) {
    return { error: "Career journey must be a list" };
  }

  if (input.length > MAX_ENTRIES) {
    return { error: `You can add up to ${MAX_ENTRIES} career journey entries` };
  }

  const entries = [];
  let currentRoleCount = 0;

  for (let i = 0; i < input.length; i++) {
    const item = input[i];

    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return { error: `Entry ${i + 1} is invalid` };
    }

    const stage = typeof item.stage === "string" ? item.stage.trim() : "";

    if (!STAGES.includes(stage)) {
      return {
        error: `Entry ${i + 1}: stage must be one of ${STAGES.join(", ")}`
      };
    }

    const organization = cleanText(item.organization, "organization", i, {
      required: true,
      max: 100
    });
    if (organization.error) return { error: organization.error };

    const role = cleanText(item.role, "role", i, { required: true, max: 100 });
    if (role.error) return { error: role.error };

    const description = cleanText(item.description, "description", i, {
      required: false,
      max: 300
    });
    if (description.error) return { error: description.error };

    const start = toYear(item.startYear, "start year", i);
    if (start.error) return { error: start.error };

    const end = toYear(item.endYear, "end year", i);
    if (end.error) return { error: end.error };

    if (start.year && end.year && start.year > end.year) {
      return { error: `Entry ${i + 1}: start year cannot be after end year` };
    }

    if (stage === "Current Role") {
      currentRoleCount += 1;

      if (currentRoleCount > 1) {
        return { error: "Only one Current Role entry is allowed" };
      }
    }

    entries.push({
      stage,
      organization: organization.text,
      role: role.text,
      startYear: start.year,
      endYear: end.year,
      description: description.text
    });
  }

  // Keep the path in order: University -> Internship -> Job -> Current Role
  entries.sort((a, b) => {
    const byStage = STAGES.indexOf(a.stage) - STAGES.indexOf(b.stage);
    if (byStage !== 0) return byStage;

    return (a.startYear ?? 9999) - (b.startYear ?? 9999);
  });

  return { entries };
};

module.exports = { STAGES, MAX_ENTRIES, validateCareerJourney };