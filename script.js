document.addEventListener("DOMContentLoaded", () => {
  const decisionContainer = document.getElementById("decisionContainer");
  const addDecisionButton = document.getElementById("addDecision");
  const createGameButton = document.getElementById("createGame");

  // Load progress from localStorage
  loadProgress();

  // Add a new decision
  addDecisionButton.addEventListener("click", () => {
    const decisionHTML = createDecisionBlock();
    decisionContainer.insertAdjacentHTML("beforeend", decisionHTML);
    attachHandlers();
    saveProgress();
  });

  // Generate the game code
  createGameButton.addEventListener("click", () => {
    const gameTitle = document.getElementById("gameTitle").value;
    const gameDescription = document.getElementById("gameDescription").value;
    const decisions = Array.from(document.querySelectorAll(".decision")).map(decision => {
      const scenario = decision.querySelector(".scenario").value;
      const options = Array.from(decision.querySelectorAll(".option")).map(option => ({
        text: option.querySelector(".option-text").value,
        outcome: option.querySelector(".option-outcome").value
      }));
      return { scenario, options };
    });

    const gameHTML = generateGameCode(gameTitle, gameDescription, decisions);
    document.getElementById("outputCode").value = gameHTML;
    document.getElementById("outputSection").style.display = "block";
  });

  // Attach handlers for add/remove options and remove decisions
  function attachHandlers() {
    document.querySelectorAll(".addOptionButton").forEach(button => {
      button.addEventListener("click", function () {
        const optionContainer = this.previousElementSibling;
        optionContainer.insertAdjacentHTML("beforeend", createOptionBlock());
        saveProgress();
      });
    });

    document.querySelectorAll(".removeOptionButton").forEach(button => {
      button.addEventListener("click", function () {
        this.parentElement.remove();
        saveProgress();
      });
    });

    document.querySelectorAll(".removeDecisionButton").forEach(button => {
      button.addEventListener("click", function () {
        this.parentElement.remove();
        saveProgress();
      });
    });
  }

  // Save progress to localStorage
  function saveProgress() {
    const gameData = {
      title: document.getElementById("gameTitle").value,
      description: document.getElementById("gameDescription").value,
      decisions: Array.from(document.querySelectorAll(".decision")).map(decision => ({
        scenario: decision.querySelector(".scenario").value,
        options: Array.from(decision.querySelectorAll(".option")).map(option => ({
          text: option.querySelector(".option-text").value,
          outcome: option.querySelector(".option-outcome").value
        }))
      }))
    };
    localStorage.setItem("gameDesignData", JSON.stringify(gameData));
  }

  // Load progress from localStorage
  function loadProgress() {
    const gameData = JSON.parse(localStorage.getItem("gameDesignData"));
    if (!gameData) return;

    document.getElementById("gameTitle").value = gameData.title;
    document.getElementById("gameDescription").value = gameData.description;

    gameData.decisions.forEach(decision => {
      const decisionHTML = createDecisionBlock(decision.scenario, decision.options);
      decisionContainer.insertAdjacentHTML("beforeend", decisionHTML);
    });

    attachHandlers();
  }

  // Create decision block
  function createDecisionBlock(scenario = "", options = [{ text: "", outcome: "" }, { text: "", outcome: "" }]) {
    const optionsHTML = options.map(option => createOptionBlock(option.text, option.outcome)).join("");
    return `
      <div class="decision">
        <textarea class="scenario" placeholder="Enter the scenario...">${scenario}</textarea>
        <div class="option-container">
          ${optionsHTML}
        </div>
        <button type="button" class="addOptionButton">Add Another Option</button>
        <button type="button" class="removeDecisionButton">Remove Decision</button>
      </div>
    `;
  }

  // Create option block
  function createOptionBlock(text = "", outcome = "") {
    return `
      <div class="option">
        <input class="option-text" type="text" placeholder="Option Text" value="${text}">
        <textarea class="option-outcome" placeholder="Option Outcome">${outcome}</textarea>
        <button type="button" class="removeOptionButton">Remove Option</button>
      </div>
    `;
  }

  // Generate game code
  function generateGameCode(title, description, decisions) {
    const decisionsJSON = JSON.stringify(decisions);
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
    button { margin: 5px; padding: 10px 20px; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p>${description}</p>
  <div id="gameContent"></div>
  <div id="navigationButtons" style="margin-top: 20px;"></div>
  <script>
    const decisions = ${decisionsJSON};
    let step = 0;
    const history = []; // Track the history of steps

    function renderStep() {
      const content = document.getElementById("gameContent");
      const navButtons = document.getElementById("navigationButtons");

      if (step >= decisions.length) {
        content.innerHTML = "<p>The End.</p>";
        navButtons.innerHTML = step > 0 ? '<button onclick="goBack()">Go Back</button>' : '';
        return;
      }

      const decision = decisions[step];
      content.innerHTML = \`
        <p>\${decision.scenario}</p>
        \${decision.options.map((opt, i) => \`<button onclick="choose(\${i})">\${opt.text}</button>\`).join("")}
      \`;

      // Add navigation buttons
      navButtons.innerHTML = step > 0 ? '<button onclick="goBack()">Go Back</button>' : '';
    }

    function choose(index) {
      const decision = decisions[step];
      history.push(step); // Save the current step to history
      document.getElementById("gameContent").innerHTML = \`<p>\${decision.options[index].outcome}</p>\`;
      step++;
      setTimeout(renderStep, 5000);
    }

    function goBack() {
      if (history.length > 0) {
        step = history.pop(); // Retrieve the last step from history
        renderStep();
      }
    }

    renderStep();
  </script>
</body>
</html>
    `;
  }
});
