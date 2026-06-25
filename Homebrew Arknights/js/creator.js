const defaultRaces = [
    {
        name: "Sarkaz",
        str: 2,
        con: 1,
        talent: "Dark Blood"
    },
    {
        name: "Lupo",
        dex: 2,
        cha: 1,
        talent: "Pack Instinct"
    },
    {
        name: "Sankta",
        dex: 1,
        cha: 2,
        talent: "Halo"
    }
];

const defaultFactions = [
    {
        name: "Rhodes Island",
        region: "Mobile landship",
        type: "Pharmaceutical, medical, and paramilitary organization",
        description: "A crisis-response organization focused on Oripathy treatment, conflict mediation, and field operations."
    },
    {
        name: "Laterano",
        region: "Laterano",
        type: "Nation and religious authority",
        description: "The Sankta homeland, famous for law, faith, firearms, and strict social order."
    },
    {
        name: "Kazdel",
        region: "Kazdel",
        type: "Sarkaz homeland",
        description: "A fractured nation shaped by war, mercenary companies, royal claims, and Sarkaz history."
    },
    {
        name: "Lungmen",
        region: "Yan",
        type: "Nomadic city-state",
        description: "A wealthy, guarded city with powerful civil administration, underworld influence, and strategic importance."
    },
    {
        name: "Independent",
        region: "Terra",
        type: "Unaffiliated",
        description: "Operators who work outside formal political, corporate, or national structures."
    }
];

const defaultArts = [
    {
        name: "Elemental Arts",
        ability: "INT",
        description: "Direct manipulation of heat, cold, electricity, pressure, or other battlefield forces."
    },
    {
        name: "Medical Arts",
        ability: "WIS",
        description: "Stabilization, healing support, diagnostics, and biological intervention through Arts practice."
    },
    {
        name: "Control Arts",
        ability: "INT",
        description: "Movement denial, terrain shaping, binding, slowing, and tactical interruption."
    },
    {
        name: "No Formal Arts",
        ability: "None",
        description: "The operator does not rely on Originium Arts as a primary combat method."
    }
];

const roles = [
    {
        name: "Guard",
        primary: "STR",
        bonus: { str: 1, con: 1 },
        feature: "Frontline duelist"
    },
    {
        name: "Defender",
        primary: "CON",
        bonus: { con: 2 },
        feature: "Holds ground under pressure"
    },
    {
        name: "Medic",
        primary: "WIS",
        bonus: { wis: 2 },
        feature: "Restores allies and stabilizes squads"
    },
    {
        name: "Sniper",
        primary: "DEX",
        bonus: { dex: 2 },
        feature: "Long-range precision"
    },
    {
        name: "Caster",
        primary: "INT",
        bonus: { int: 2 },
        feature: "Arts-focused damage and control"
    }
];

const statLabels = {
    str: "Strength",
    dex: "Dexterity",
    con: "Constitution",
    int: "Intelligence",
    wis: "Wisdom",
    cha: "Charisma"
};

const statAbbreviations = {
    str: "STR",
    dex: "DEX",
    con: "CON",
    int: "INT",
    wis: "WIS",
    cha: "CHA"
};

const skillList = [
    { name: "Athletics", stat: "str" },
    { name: "Acrobatics", stat: "dex" },
    { name: "Stealth", stat: "dex" },
    { name: "Investigation", stat: "int" },
    { name: "Medicine", stat: "wis" },
    { name: "Perception", stat: "wis" },
    { name: "Survival", stat: "wis" },
    { name: "Command", stat: "cha" },
    { name: "Deception", stat: "cha" }
];

const baseStats = {
    str: 8,
    dex: 8,
    con: 8,
    int: 8,
    wis: 8,
    cha: 8
};

const pointBuyBudget = 27;
const pointBuyMin = 8;
const pointBuyMax = 15;
const pointBuyCosts = {
    8: 0,
    9: 1,
    10: 2,
    11: 3,
    12: 4,
    13: 5,
    14: 7,
    15: 9
};

const state = {
    races: defaultRaces,
    factions: defaultFactions,
    arts: defaultArts
};

const form = document.getElementById("creator-form");
const raceSelect = document.getElementById("race");
const roleSelect = document.getElementById("role");
const factionSelect = document.getElementById("faction");
const artsSelect = document.getElementById("arts");
const statEditor = document.getElementById("stat-editor");
const pointBuyStatus = document.getElementById("point-buy-status");
const sheet = document.getElementById("sheet");
const sheetTitle = document.getElementById("sheet-title");
const sheetLevel = document.getElementById("sheet-level");
const message = document.getElementById("form-message");
const resetButton = document.getElementById("reset-button");
const finalizeButton = document.getElementById("finalize-button");
const copyJsonButton = document.getElementById("copy-json-button");
const downloadJsonButton = document.getElementById("download-json-button");
const printSheetButton = document.getElementById("print-sheet-button");

async function loadJson(path, fallback) {
    try {
        const response = await fetch(path);

        if (!response.ok) {
            throw new Error(`${path} unavailable`);
        }

        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
            return data;
        }
    } catch (error) {
        return fallback;
    }

    return fallback;
}

async function loadReferenceData() {
    const [races, factions, arts] = await Promise.all([
        loadJson("js/races.json", defaultRaces),
        loadJson("js/factions.json", defaultFactions),
        loadJson("js/arts.json", defaultArts)
    ]);

    state.races = races;
    state.factions = factions;
    state.arts = arts;
}

function populateSelect(select, items) {
    select.replaceChildren();

    items.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.name;
        option.textContent = item.name;
        select.append(option);
    });
}

function createStatControls() {
    statEditor.replaceChildren();

    Object.entries(statLabels).forEach(([key, label]) => {
        const wrapper = document.createElement("label");
        wrapper.className = "stat-control";
        wrapper.setAttribute("for", `stat-${key}`);

        const labelText = document.createElement("span");
        labelText.textContent = label;

        const input = document.createElement("input");
        input.id = `stat-${key}`;
        input.name = key;
        input.type = "number";
        input.min = String(pointBuyMin);
        input.max = String(pointBuyMax);
        input.value = String(baseStats[key]);

        wrapper.append(labelText, input);
        statEditor.append(wrapper);
    });
}

function getSelectedRace() {
    return state.races.find((race) => race.name === raceSelect.value) || state.races[0];
}

function getSelectedRole() {
    return roles.find((role) => role.name === roleSelect.value) || roles[0];
}

function getSelectedFaction() {
    return state.factions.find((faction) => faction.name === factionSelect.value) || state.factions[0];
}

function getSelectedArts() {
    return state.arts.find((arts) => arts.name === artsSelect.value) || state.arts[0];
}

function getBaseStatValues() {
    return Object.keys(statLabels).reduce((stats, key) => {
        const input = document.getElementById(`stat-${key}`);
        const value = Number(input.value);
        stats[key] = Number.isFinite(value) ? value : baseStats[key];
        return stats;
    }, {});
}

function getPointBuyCost(score) {
    return pointBuyCosts[score] ?? Number.POSITIVE_INFINITY;
}

function getPointBuyState(stats) {
    const values = Object.values(stats);
    const spent = values.reduce((total, score) => total + getPointBuyCost(score), 0);
    const invalidStats = Object.entries(stats)
        .filter(([, score]) => !Number.isInteger(score) || score < pointBuyMin || score > pointBuyMax)
        .map(([key]) => statLabels[key]);
    const remaining = pointBuyBudget - spent;

    return {
        spent,
        remaining,
        invalidStats,
        isValid: remaining >= 0 && invalidStats.length === 0
    };
}

function renderPointBuyStatus(pointBuy) {
    pointBuyStatus.replaceChildren();

    const summary = document.createElement("strong");
    summary.textContent = `Points Remaining: ${Number.isFinite(pointBuy.remaining) ? pointBuy.remaining : 0} / ${pointBuyBudget}`;
    pointBuyStatus.append(summary);

    const rule = document.createElement("span");

    if (pointBuy.invalidStats.length > 0) {
        rule.textContent = `Base stats must be ${pointBuyMin}-${pointBuyMax}: ${pointBuy.invalidStats.join(", ")}`;
        pointBuyStatus.className = "point-buy-status invalid";
    } else if (pointBuy.remaining < 0) {
        rule.textContent = `Spent ${pointBuy.spent}; reduce stats by ${Math.abs(pointBuy.remaining)} point(s).`;
        pointBuyStatus.className = "point-buy-status invalid";
    } else {
        rule.textContent = `Point Buy ${pointBuyBudget}; base stats only, before race and role bonuses.`;
        pointBuyStatus.className = "point-buy-status valid";
    }

    pointBuyStatus.append(rule);
    finalizeButton.disabled = !pointBuy.isValid;
}

function applyBonuses(stats, race, role) {
    const total = { ...stats };

    Object.keys(statLabels).forEach((key) => {
        total[key] += Number(race[key] || 0);
        total[key] += Number(role.bonus[key] || 0);
    });

    return total;
}

function getModifier(score) {
    return Math.floor((score - 10) / 2);
}

function formatModifier(score) {
    const modifier = getModifier(score);
    return modifier >= 0 ? `+${modifier}` : String(modifier);
}

function appendText(parent, tagName, text, className) {
    const element = document.createElement(tagName);
    element.textContent = text;

    if (className) {
        element.className = className;
    }

    parent.append(element);
    return element;
}

function appendMetric(parent, label, value) {
    const metric = document.createElement("div");
    metric.className = "metric";
    appendText(metric, "span", label);
    appendText(metric, "strong", value);
    parent.append(metric);
}

function createMetric(label, value, className) {
    const metric = document.createElement("div");
    metric.className = className ? `metric ${className}` : "metric";
    appendText(metric, "span", label);
    appendText(metric, "strong", value);
    return metric;
}

function appendListRow(parent, label, value, tagClass) {
    const row = document.createElement("div");
    row.className = "sheet-row";
    appendText(row, "span", label);
    appendText(row, "strong", value, tagClass);
    parent.append(row);
}

function getProficiencyBonus() {
    return 2;
}

function getPassive(score, proficient = false) {
    return 10 + getModifier(score) + (proficient ? getProficiencyBonus() : 0);
}

function getRoleSaveStats(role) {
    const saves = {
        Guard: ["str", "con"],
        Defender: ["con", "wis"],
        Medic: ["wis", "cha"],
        Sniper: ["dex", "wis"],
        Caster: ["int", "wis"]
    };

    return saves[role.name] || ["con", "wis"];
}

function getRoleSkillProficiencies(role) {
    const skills = {
        Guard: ["Athletics", "Survival"],
        Defender: ["Athletics", "Perception"],
        Medic: ["Medicine", "Perception"],
        Sniper: ["Stealth", "Perception"],
        Caster: ["Investigation", "Command"]
    };

    return skills[role.name] || [];
}

function getAttackBonus(stats, role, arts) {
    const proficiency = getProficiencyBonus();
    const primaryKey = role.primary.toLowerCase();
    const artsKey = arts.ability && arts.ability !== "None" ? arts.ability.toLowerCase() : primaryKey;
    return {
        weapon: getModifier(stats[primaryKey]) + proficiency,
        arts: stats[artsKey] ? getModifier(stats[artsKey]) + proficiency : getModifier(stats[primaryKey]) + proficiency
    };
}

function getOperatorData() {
    const name = document.getElementById("name").value.trim() || "Unnamed Operator";
    const notes = document.getElementById("notes").value.trim();
    const race = getSelectedRace();
    const role = getSelectedRole();
    const faction = getSelectedFaction();
    const arts = getSelectedArts();
    const baseStatValues = getBaseStatValues();
    const finalStats = applyBonuses(baseStatValues, race, role);
    const hp = 12 + finalStats.con + getModifier(finalStats.con);
    const artsPoints = 6 + Math.max(getModifier(finalStats.int), getModifier(finalStats.wis)) + Math.ceil(finalStats.cha / 3);
    const defense = 10 + getModifier(finalStats.dex) + Math.max(0, getModifier(finalStats.con));

    return {
        name,
        level: 1,
        race: race.name,
        role: role.name,
        faction: faction.name,
        originiumArts: arts.name,
        baseStats: baseStatValues,
        finalStats,
        resources: {
            hp,
            artsPoints,
            defense,
            proficiency: getProficiencyBonus()
        },
        features: {
            raceTalent: race.talent || "",
            roleFeature: role.feature,
            artsDescription: arts.description
        },
        notes
    };
}

function renderSheet() {
    const operatorData = getOperatorData();
    const name = operatorData.name;
    const notes = operatorData.notes;
    const race = getSelectedRace();
    const role = getSelectedRole();
    const faction = getSelectedFaction();
    const arts = getSelectedArts();
    const baseStatValues = getBaseStatValues();
    const pointBuy = getPointBuyState(baseStatValues);
    const stats = operatorData.finalStats;
    const hp = operatorData.resources.hp;
    const artsPoints = operatorData.resources.artsPoints;
    const defense = operatorData.resources.defense;
    const proficiency = getProficiencyBonus();
    const saveProficiencies = getRoleSaveStats(role);
    const skillProficiencies = getRoleSkillProficiencies(role);
    const attackBonus = getAttackBonus(stats, role, arts);

    sheetTitle.textContent = name;
    sheetLevel.textContent = "Level 1";
    renderPointBuyStatus(pointBuy);
    sheet.replaceChildren();

    const dashboard = document.createElement("div");
    dashboard.className = "sheet-dashboard";

    const topLine = document.createElement("div");
    topLine.className = "sheet-topline";
    topLine.append(
        createMetric("Race", race.name),
        createMetric("Role", role.name),
        createMetric("Faction", faction.name),
        createMetric("Proficiency", `+${proficiency}`),
        createMetric("Defense", String(defense), "defense-metric"),
        createMetric("HP", `${hp} / ${hp}`, "hp-metric"),
        createMetric("Arts", String(artsPoints), "arts-metric")
    );
    dashboard.append(topLine);

    const statBlock = document.createElement("div");
    statBlock.className = "stat-grid operator-stats";

    Object.entries(statLabels).forEach(([key, label]) => {
        const stat = document.createElement("div");
        stat.className = "stat-card";
        appendText(stat, "span", statAbbreviations[key]);
        appendText(stat, "strong", String(stats[key]));
        appendText(stat, "small", formatModifier(stats[key]));
        appendText(stat, "em", label);
        statBlock.append(stat);
    });

    dashboard.append(statBlock);

    const body = document.createElement("div");
    body.className = "sheet-body-grid";

    const saves = document.createElement("section");
    saves.className = "sheet-module";
    appendText(saves, "h3", "Saving Throws");
    Object.entries(statAbbreviations).forEach(([key, label]) => {
        const proficient = saveProficiencies.includes(key);
        const bonus = getModifier(stats[key]) + (proficient ? proficiency : 0);
        appendListRow(saves, `${label}${proficient ? " •" : ""}`, bonus >= 0 ? `+${bonus}` : String(bonus), proficient ? "tag-good" : "");
    });
    appendText(saves, "p", `Passive Perception ${getPassive(stats.wis, skillProficiencies.includes("Perception"))}`);

    const skills = document.createElement("section");
    skills.className = "sheet-module skill-module";
    appendText(skills, "h3", "Skills");
    skillList.forEach((skill) => {
        const proficient = skillProficiencies.includes(skill.name);
        const bonus = getModifier(stats[skill.stat]) + (proficient ? proficiency : 0);
        appendListRow(skills, `${skill.name} (${statAbbreviations[skill.stat]})${proficient ? " •" : ""}`, bonus >= 0 ? `+${bonus}` : String(bonus), proficient ? "tag-good" : "");
    });

    const combat = document.createElement("section");
    combat.className = "sheet-module combat-module";
    appendText(combat, "h3", "Actions");
    appendListRow(combat, `${role.name} Strike`, `+${attackBonus.weapon}`);
    appendText(combat, "p", `${role.feature}. Damage baseline: 1d8 + ${formatModifier(stats[role.primary.toLowerCase()])}.`);
    appendListRow(combat, arts.name, arts.ability === "None" ? "Utility" : `+${attackBonus.arts}`);
    appendText(combat, "p", arts.description);

    const origin = document.createElement("section");
    origin.className = "sheet-module";
    appendText(origin, "h3", "Origin");
    appendText(origin, "p", `${race.name}: ${race.talent || "No listed race talent"}. ${race.description || ""}`);
    appendText(origin, "p", `${faction.name}: ${faction.description}`);

    const proficiencies = document.createElement("section");
    proficiencies.className = "sheet-module";
    appendText(proficiencies, "h3", "Training");
    appendText(proficiencies, "p", `Armor: ${role.name === "Defender" ? "Heavy armor, shields" : "Light armor, field gear"}`);
    appendText(proficiencies, "p", `Weapons: ${role.name === "Caster" ? "Caster units, sidearms" : "Standard weapons, sidearms"}`);
    appendText(proficiencies, "p", `Languages: Local, Trade Cant, ${faction.region || "Terra"}`);

    const notesBlock = document.createElement("section");
    notesBlock.className = "sheet-module notes-module";
    appendText(notesBlock, "h3", "Notes");
    appendText(notesBlock, "p", notes || "No background notes yet.");

    body.append(saves, skills, combat, origin, proficiencies, notesBlock);
    dashboard.append(body);

    sheet.append(dashboard);
}

function resetCreator() {
    form.reset();

    Object.entries(baseStats).forEach(([key, value]) => {
        document.getElementById(`stat-${key}`).value = String(value);
    });

    message.textContent = "";
    renderSheet();
}

function finalizeOperator(event) {
    event.preventDefault();
    const pointBuy = getPointBuyState(getBaseStatValues());

    if (!pointBuy.isValid) {
        message.textContent = "Adjust base stats before finalizing the operator.";
        renderSheet();
        return;
    }

    const name = document.getElementById("name").value.trim();
    message.textContent = name
        ? `${name} is ready for deployment.`
        : "Operator file saved as an unnamed draft.";

    renderSheet();
}

async function copyOperatorJson() {
    const json = JSON.stringify(getOperatorData(), null, 2);

    try {
        await navigator.clipboard.writeText(json);
        message.textContent = "Operator JSON copied to clipboard.";
    } catch (error) {
        message.textContent = "Clipboard is unavailable; use Download instead.";
    }
}

function downloadOperatorJson() {
    const data = getOperatorData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const filename = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "operator";

    link.href = url;
    link.download = `${filename}.json`;
    link.click();
    URL.revokeObjectURL(url);
    message.textContent = `${data.name} exported as JSON.`;
}

function printOperatorSheet() {
    window.print();
}

async function initCreator() {
    await loadReferenceData();
    populateSelect(raceSelect, state.races);
    populateSelect(roleSelect, roles);
    populateSelect(factionSelect, state.factions);
    populateSelect(artsSelect, state.arts);
    createStatControls();
    renderSheet();

    form.addEventListener("input", renderSheet);
    form.addEventListener("change", renderSheet);
    form.addEventListener("submit", finalizeOperator);
    resetButton.addEventListener("click", resetCreator);
    copyJsonButton.addEventListener("click", copyOperatorJson);
    downloadJsonButton.addEventListener("click", downloadOperatorJson);
    printSheetButton.addEventListener("click", printOperatorSheet);
}

initCreator();
