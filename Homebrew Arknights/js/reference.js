const fallbackData = {
    races: [],
    factions: [],
    arts: []
};

async function loadJson(path) {
    try {
        const response = await fetch(path);

        if (!response.ok) {
            throw new Error(`${path} unavailable`);
        }

        return await response.json();
    } catch (error) {
        return [];
    }
}

function appendText(parent, tagName, text) {
    const element = document.createElement(tagName);
    element.textContent = text;
    parent.append(element);
    return element;
}

function formatBonus(item) {
    const keys = ["str", "dex", "con", "int", "wis", "cha"];
    const parts = keys
        .filter((key) => item[key])
        .map((key) => `${key.toUpperCase()} +${item[key]}`);

    return parts.length > 0 ? parts.join(", ") : "No bonus";
}

function createRaceCard(item) {
    const card = document.createElement("article");
    card.className = "content-item";
    appendText(card, "h2", item.name);
    appendText(card, "p", item.description || "No description listed.");
    appendText(card, "p", `${formatBonus(item)}. Talent: ${item.talent || "None"}.`);
    return card;
}

function createFactionCard(item) {
    const card = document.createElement("article");
    card.className = "content-item";
    appendText(card, "h2", item.name);
    appendText(card, "p", `${item.type || "Faction"} - ${item.region || "Terra"}`);
    appendText(card, "p", item.description || "No description listed.");
    return card;
}

function createArtsCard(item) {
    const card = document.createElement("article");
    card.className = "content-item";
    appendText(card, "h2", item.name);
    appendText(card, "p", `Key ability: ${item.ability || "Varies"}`);
    appendText(card, "p", item.description || "No description listed.");
    return card;
}

async function initReferencePage() {
    const grid = document.querySelector("[data-reference-grid]");

    if (!grid) {
        return;
    }

    const type = grid.dataset.referenceGrid;
    const data = await loadJson(`js/${type}.json`);
    const items = data.length > 0 ? data : fallbackData[type] || [];
    const cardFactory = {
        races: createRaceCard,
        factions: createFactionCard,
        arts: createArtsCard
    }[type] || createFactionCard;

    grid.replaceChildren(...items.map(cardFactory));
}

initReferencePage();
