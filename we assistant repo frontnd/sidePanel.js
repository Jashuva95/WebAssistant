document.addEventListener('DOMContentLoaded', () => {
    // Get saved research notes from chrome storage and populate the textarea
    chrome.storage.local.get(['webNotes'], function(result) {
        if (result.webNotes) {
            document.getElementById('notes').value = result.webNotes;
        }
    });

    // Event listeners for the buttons
    document.getElementById('summarizeBtn').addEventListener('click', summarizeText);
    document.getElementById('suggestBtn').addEventListener('click', suggestRelatedTopics);
    document.getElementById('askQuestionBtn').addEventListener('click', toggleQuestionSection);
    document.getElementById('submitQuestionBtn').addEventListener('click', askQuestion);
    document.getElementById('saveNotesBtn').addEventListener('click', saveNotesBtn);
});

function toggleQuestionSection() {
    const questionSection = document.getElementById('questionSection');
    
    // Toggle visibility of the question section (input panel)
    if (questionSection.style.display === 'block') {
        questionSection.style.display = 'none';
    } else {
        questionSection.style.display = 'block';
    }
}

async function askQuestion() {
    try {
        const question = document.getElementById('questionInput').value.trim();
        const notes = document.getElementById('notes').value.trim();

        if (!question || !notes) {
            showResult('Please enter both a question and some notes.');
            return;
        }

        // Make API call to ask the question
        const response = await fetch('http://localhost:8080/api/research/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: notes, operation: 'questions', question: question })
        });

        // Handle the response from the API
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const answer = await response.text();
        showResult(answer.replace(/\n/g, '<br>')); // Show the answer with line breaks
    } catch (error) {
        showResult('Error: ' + error.message); // Show any errors
    }
}

async function summarizeText() {
    try {
        // Get the active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        // Fetch the selected text from the active tab
        const [{ result }] = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => window.getSelection().toString()
        });

        // If no text is selected, show a message
        if (!result) {
            showResult('Please select some text first');
            return;
        }

        // Make API call to summarize the selected text
        const response = await fetch('http://localhost:8080/api/research/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: result, operation: 'summarize' })
        });

        // Handle the response from the API
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const text = await response.text();
        showResult(text.replace(/\n/g, '<br>')); // Show the summary with line breaks
        // Save the summarized text to localStorage or chrome storage
        chrome.storage.local.set({ 'summarizedText': text });
    } catch (error) {
        showResult('Error: ' + error.message); // Show any errors
    }
}

async function suggestRelatedTopics() {
    try {
        const notes = document.getElementById('notes').value.trim();

        if (!notes) {
            showResult('Please enter some notes first.');
            return;
        }

        // Make API call to suggest related topics
        const response = await fetch('http://localhost:8080/api/research/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: notes, operation: 'suggest' })
        });

        // Handle the response from the API
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const suggestions = await response.text();
        showResult(suggestions.replace(/\n/g, '<br>')); // Show the suggestions with line breaks
    } catch (error) {
        showResult('Error: ' + error.message); // Show any errors
    }
}

async function saveNotesBtn() {
    const notes = document.getElementById('notes').value;

    // Save the notes to chrome storage
    chrome.storage.local.set({ 'webNotes': notes }, function() {
        alert('Notes saved successfully');
    });
}

// Function to delete saved summarized text
async function deleteSummarizedText() {
    chrome.storage.local.remove('summarizedText', function() {
        alert('Summarized text deleted successfully');
    });
}

// Display the result in the results div
function showResult(content) {
    document.getElementById('results').innerHTML = `<div class="result-item"><div class="result-content">${content}</div></div>`;
}
