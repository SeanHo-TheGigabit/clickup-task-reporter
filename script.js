document.addEventListener("DOMContentLoaded", () => {
  // Get elements
  const apiKeyInput = document.getElementById("api-key");
  const clickupIdInput = document.getElementById("clickup-id");
  const githubLinkInput = document.getElementById("github-link");
  const outputText = document.getElementById("output-text");
  const copyBtn = document.getElementById("copy-btn");
  const statusMessage = document.getElementById("status-message");

  // Check for saved API key in localStorage
  const savedApiKey = localStorage.getItem("clickup_api_key");
  if (savedApiKey) {
    apiKeyInput.value = savedApiKey;
  }

  // Add input event listeners
  apiKeyInput.addEventListener("input", handleApiKeyInput);
  clickupIdInput.addEventListener("input", validateAndGenerate);
  githubLinkInput.addEventListener("input", validateAndGenerate);

  // Copy to clipboard functionality
  copyBtn.addEventListener("click", copyToClipboard);

  // Save API key to localStorage when changed
  function handleApiKeyInput() {
    localStorage.setItem("clickup_api_key", apiKeyInput.value.trim());
    validateAndGenerate();
  }

  // Function to validate inputs and generate report
  function validateAndGenerate() {
    const apiKey = apiKeyInput.value.trim();
    const clickupId = clickupIdInput.value.trim();
    const githubLink = githubLinkInput.value.trim();

    // Remove error styling
    apiKeyInput.classList.remove("error");
    clickupIdInput.classList.remove("error");
    githubLinkInput.classList.remove("error");
    statusMessage.textContent = "";
    statusMessage.className = "status-message";

    // Check for empty fields and apply error styling
    if (!apiKey) {
      apiKeyInput.classList.add("error");
    }

    if (!clickupId) {
      clickupIdInput.classList.add("error");
    }

    if (!githubLink) {
      githubLinkInput.classList.add("error");
    }

    // Generate report only if all fields have values
    if (apiKey && clickupId && githubLink) {
      fetchTaskDetails(apiKey, clickupId, githubLink);
    } else {
      // Clear output if any field is empty
      outputText.value = "";
    }
  }

  // Function to fetch task details from ClickUp API
  async function fetchTaskDetails(apiKey, taskId, githubLink) {
    try {
      statusMessage.textContent = "Fetching task details...";
      statusMessage.className = "status-message loading";

      const response = await fetch(
        `https://api.clickup.com/api/v2/task/${taskId}`,
        {
          method: "GET",
          headers: {
            Authorization: apiKey,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const taskData = await response.json();
      generateReportWithTaskData(taskId, taskData.name, githubLink);

      statusMessage.textContent = "Task data fetched successfully!";
      statusMessage.className = "status-message success";

      // Clear success message after 3 seconds
      setTimeout(() => {
        if (statusMessage.className === "status-message success") {
          statusMessage.textContent = "";
        }
      }, 3000);
    } catch (error) {
      console.error("Error fetching task data:", error);
      statusMessage.textContent = `Error: ${
        error.message || "Failed to fetch task data"
      }`;
      statusMessage.className = "status-message error";

      // Still generate basic report without task name
      generateReportWithTaskData(taskId, "XXXX", githubLink);
    }
  }

  // Function to generate the report with task data
  function generateReportWithTaskData(taskId, taskName, githubLink) {
    const formattedText = `#${taskId} - ${taskName}
Github - ${githubLink}
ClickUp - https://app.clickup.com/t/${taskId}`;

    // Update output
    outputText.value = formattedText;
  }

  // Function to copy to clipboard
  function copyToClipboard() {
    if (!outputText.value) {
      statusMessage.textContent =
        "Nothing to copy! Please fill in all fields first.";
      statusMessage.className = "status-message error";
      return;
    }

    outputText.select();
    document.execCommand("copy");

    // Visual feedback that text was copied
    copyBtn.textContent = "Copied!";
    statusMessage.textContent = "Text copied to clipboard!";
    statusMessage.className = "status-message success";

    setTimeout(() => {
      copyBtn.textContent = "Copy to Clipboard";

      if (statusMessage.textContent === "Text copied to clipboard!") {
        statusMessage.textContent = "";
      }
    }, 2000);
  }
});
