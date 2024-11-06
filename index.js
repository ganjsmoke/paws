const axios = require('axios');
const fs = require('fs');
const path = require('path');

const PAWS_API_URL = 'https://api.paws.community/v1';
const AUTH_URL = `${PAWS_API_URL}/user/auth`;
const QUEST_LIST_URL = `${PAWS_API_URL}/quests/list`;
const COMPLETE_TASK_URL = `${PAWS_API_URL}/quests/completed`;
const CLAIM_TASK_URL = `${PAWS_API_URL}/quests/claim`;

// Function to read and parse each line of hash.txt
function loadQueryIds() {
    const filePath = path.join(__dirname, 'hash.txt');
    const lines = fs.readFileSync(filePath, 'utf8').trim().split('\n');
    
    return lines.map(line => {
        try {
            return JSON.parse(line); // Parse if JSON
        } catch {
            return line.trim(); // Use line directly if not JSON
        }
    });
}

const queryIds = loadQueryIds();
const userAgents = fs.readFileSync(path.join(__dirname, 'user-agent.txt'), 'utf8').trim().split('\n');

// Function to get a random user-agent
function getRandomUserAgent() {
    return userAgents[Math.floor(Math.random() * userAgents.length)];
}

// Function to pause execution for a random duration (mimics human delay)
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to create headers with a random user-agent
function createHeaders(userAgent) {
    return {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
    };
}

// Function to authenticate and retrieve access token, username, and balance from gameData
async function authenticate(query_id, headers) {
    const authPayload = {
        data: query_id
    };

    try {
        const response = await axios.post(AUTH_URL, authPayload, { headers });
        if (response.data.success) {
            const token = response.data.data[0];
            const user = response.data.data[1];
            const balance = user.gameData.balance;
            console.log(`\n🔹 Account: ${user.userData.username}`);
            console.log(`   Initial Balance: ${balance}`);
            return { token, username: user.userData.username, balance };
        }
    } catch (error) {
        console.error("Authentication failed:", error.response ? error.response.data : error.message);
        throw error;
    }
}

// Function to get the list of quests
async function getQuestList(token, headers) {
    try {
        const response = await axios.get(QUEST_LIST_URL, {
            headers: {
                ...headers,
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.data;
    } catch (error) {
        console.error("Failed to get quest list:", error);
        throw error;
    }
}

// Function to complete a quest task
async function completeTask(token, questId, headers) {
    try {
        const response = await axios.post(COMPLETE_TASK_URL, { questId }, {
            headers: {
                ...headers,
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.success;
    } catch (error) {
        console.error(`Failed to complete task ${questId}:`, error);
        throw error;
    }
}

// Function to claim a quest task
async function claimTask(token, questId, headers) {
    try {
        const response = await axios.post(CLAIM_TASK_URL, { questId }, {
            headers: {
                ...headers,
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.success;
    } catch (error) {
        console.error(`Failed to claim task ${questId}:`, error);
        throw error;
    }
}

// Main function to execute the quest flow for all query_ids
async function executeQuestsForAllUsers() {
    let totalBalance = 0; // Initialize total balance to zero

    console.log(`\n=========== STARTING QUEST EXECUTION FOR ALL ACCOUNTS ===========\n`);

    for (const query_id of queryIds) {
        const userAgent = getRandomUserAgent();
        const headers = createHeaders(userAgent);

        try {
            // Authenticate and get token for the current query_id
            const { token, username, balance } = await authenticate(query_id, headers);
            totalBalance += balance; // Add the initial balance to the total

            // Get the quest list
            const quests = await getQuestList(token, headers);

            // Process each quest based on its status
            console.log(`   📋 Quest List for ${username}:`);
            for (const quest of quests) {
                const { _id, title, rewards, progress } = quest;
                const rewardAmount = rewards[0].amount;

                if (!progress.claimed && progress.status === "start") {
                    console.log(`      ➖ Completing Task: ${title}`);
                    await completeTask(token, _id, headers);
                    await claimTask(token, _id, headers);
                    console.log(`      ✔️ Claimed Reward: ${rewardAmount}`);
                } else if (!progress.claimed && progress.status === "claimable") {
                    console.log(`      ➖ Claiming Task: ${title}`);
                    await claimTask(token, _id, headers);
                    console.log(`      ✔️ Claimed Reward: ${rewardAmount}`);
                } else if (progress.claimed && progress.status === "finished") {
                    console.log(`      🔹 Task ${title} is already completed and claimed.`);
                }

                // Add a slight delay between tasks to mimic human behavior
                await delay(Math.floor(Math.random() * 2000) + 1000); // 1-3 seconds
            }

            // Delay before fetching updated balance data
            console.log("   ⏳ Waiting 30 seconds before fetching updated balance...");
            await delay(30000); // 30 seconds

            // Re-authenticate to get the updated balance after completing quests
            const updatedBalanceData = await authenticate(query_id, headers);
            const updatedBalance = updatedBalanceData.balance;
            totalBalance += updatedBalance - balance; // Add the difference to the total balance
            console.log(`   🔹 Updated Balance for ${username}: ${updatedBalance}`);

            console.log(`\n-------------------------------------------------------------\n`);

        } catch (error) {
            console.error(`❌ Error processing user with query_id ${query_id}:`, error);
        }

        // Add a delay before processing the next user to mimic human behavior
        await delay(Math.floor(Math.random() * 5000) + 2000); // 2-7 seconds
    }

    // Print the total balance of all users at the end
    console.log(`\n=========== TOTAL BALANCE ACROSS ALL USERS ===========`);
    console.log(`   💰 Total Balance: ${totalBalance}\n`);
}
function printHeader() {
  const line = "=".repeat(50);
  const title = "Auto Clear Task Paws";
  const createdBy = "Bot created by: https://t.me/airdropwithmeh";

  const totalWidth = 50;
  const titlePadding = Math.floor((totalWidth - title.length) / 2);
  const createdByPadding = Math.floor((totalWidth - createdBy.length) / 2);

  const centeredTitle = title.padStart(titlePadding + title.length).padEnd(totalWidth);
  const centeredCreatedBy = createdBy.padStart(createdByPadding + createdBy.length).padEnd(totalWidth);

  console.log(line);
  console.log(centeredTitle);
  console.log(centeredCreatedBy);
  console.log(line);
}
// Initial execution
printHeader();
executeQuestsForAllUsers(); 

// Schedule to run every 24 hours
setInterval(() => {
    console.log("\n🌟 Running executeQuestsForAllUsers at:", new Date().toLocaleString());
    executeQuestsForAllUsers();
}, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
