// i cant get it linked up so its chilling here for now

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

export function checkSum(input) {
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

export function calculate(search) {
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