const domains = [
  ".com",
  ".org",
  ".net",
  ".info",
  ".biz",
  ".edu",
  ".gov",
  ".mil",
  ".co",
  ".io",
  ".me",
  ".tv",
  ".app",
  ".dev",
  ".xyz",
  ".shop",
  ".online",
  ".site",
  ".tech",
  ".design",
  ".audio",
  ".store",
  ".nl",
  ".uk",
  ".de",
  ".fr",
  ".jp",
  ".au",
  ".ca",
  ".it",
  ".es",
  ".ru",
  ".br",
  ".in",
  ".cn",
  ".mx",
  ".se",
  ".no",
  ".fi",
  ".dk",
  ".ch",
  ".at",
  ".be",
  ".pl",
  ".hk",
  ".sg",
  ".ae",
  ".za",
  ".tv",
  ".me",
  ".cc",
  ".ws",
  ".mobi",
  ".pro",
  ".name",
  ".tel",
  ".jobs",
  ".aero",
  ".museum",
  ".coop",
  ".int",
];

function checkSum(input) {
  return /^[0-9+\-*/= ]+$/.test(input);
}

async function getWikipediaUrl(searchTerm) {
  const searchUrl = "https://en.wikipedia.org/w/api.php";

  const params = new URLSearchParams({
    action: "query",
    list: "search",
    srsearch: searchTerm,
    format: "json",
    origin: "*",
  });

  try {
    const response = await fetch(`${searchUrl}?${params}`);
    const data = await response.json();

    if (data.query && data.query.search.length > 0) {
      const pageId = data.query.search[0].pageid;
      const url = `https://en.wikipedia.org/?curid=${pageId}`;
      return url;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching data from Wikipedia API:", error);
    return null;
  }
}

function calculate(search) {
  search = search.replace(/\s+/g, '');

  search = search.replace(/\*\*/g, '^');

  while (/\([^()]*\)/.test(search)) {
    search = search.replace(/\([^()]*\)/g, (match) => {
      return calculate(match.slice(1, -1));
    });
  }

  const tokens = search.match(/(\d+(\.\d+)?|\^|[+\-*/])/g);
  
  if (!tokens) {
    throw new Error("Invalid expression");
  }

  let tempResult = [];
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] === '^') {
      const leftOperand = parseFloat(tempResult.pop());
      const rightOperand = parseFloat(tokens[i + 1]);
      tempResult.push(Math.pow(leftOperand, rightOperand));
      i++; 
    } else {
      tempResult.push(tokens[i]);
    }
  }

  // Handle multiplication and division
  let newResult = [];
  for (let i = 0; i < tempResult.length; i++) {
    if (tempResult[i] === '*' || tempResult[i] === '/') {
      const operator = tempResult[i];
      const leftOperand = parseFloat(newResult.pop());
      const rightOperand = parseFloat(tempResult[i + 1]);

      newResult.push(operator === '*' ? leftOperand * rightOperand : leftOperand / rightOperand);
      i++;
    } else {
      newResult.push(tempResult[i]);
    }
  }

  let result = parseFloat(newResult[0]);
  for (let i = 1; i < newResult.length; i += 2) {
    const operator = newResult[i];
    const nextNumber = parseFloat(newResult[i + 1]);

    switch (operator) {
      case '+':
        result += nextNumber;
        break;
      case '-':
        result -= nextNumber;
        break;
    }
  }

  return result;
}

const commands = ["!w", "!y"];
const textbox = document.querySelector("#txtSearch");

document.addEventListener("keydown", () => {
  textbox.focus();
});

document.addEventListener("keydown", (event) => {
  console.log(event);
  if (event.ctrlKey && event.key === "z") {
    textbox.value = "";
  }
})

document.addEventListener("keydown", async (event) => {
  // if not enter return
  if (event.code !== "Enter") return;

  // get value from the text box
  const search = textbox.value;

  // if the search doesnt contain anyting, stop
  if (search === "") return;

  if (checkSum(search) || /[0-9]/.test(search)) {
    if (search.startsWith('=')) {
      search.replace('=', '')
    }

    const result = calculate(search);

    textbox.value = '= ' + result;
  }
  // check if the protocol is https
  else if (search.startsWith("https://")) {
    window.location.href = search;
  }
  // check if the search contains a domain from the array domains
  else if (domains.some((domain) => search.includes(domain))) {
    window.location.href = "https://" + search;
  }
  // check if any of the functions are in the search
  else if (commands.some((command) => search.includes(command))) {
    // wikipedia function
    if (search.includes("!w")) {
      const searchTerm = search.replace("!w", "");
      const url = await getWikipediaUrl(searchTerm);

      window.location.href = url;
    }
    // youtube function
    if (search.includes("!y")) {
      const searchTerm = search.replace("!y", "").replace(" ", "+");

      window.location.href =
        "https://www.youtube.com/results?search_query=" + searchTerm;
    }
  }
  // search with duckduckgo
  else {
    const prefix = "https://duckduckgo.com/?q=";
    window.location.href = prefix + search;
  }
});
